import React, { useState, useEffect } from 'react';
import { 
  X, Check, Camera, Image as ImageIcon, MapPin, 
  AlertTriangle, Calendar, User, FileText, Plus, 
  Trash2, Edit3, ShieldAlert, Sparkles 
} from 'lucide-react';
import { Discipline, Observation, ObservationPriority, ObservationStatus, PhotoAnnotation } from '../types';
import { generateNextSerial } from '../utils/helpers';
import { ImageMarkupModal } from './ImageMarkupModal';
import { createSampleInspectionImage } from '../data/initialData';

interface ObservationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (observation: Observation) => void;
  disciplines: Discipline[];
  allObservations: Observation[];
  editObservation?: Observation | null;
  initialPinCoords?: { x: number; y: number } | null;
}

export const ObservationModal: React.FC<ObservationModalProps> = ({
  isOpen,
  onClose,
  onSave,
  disciplines,
  allObservations,
  editObservation,
  initialPinCoords,
}) => {
  const [selectedDisciplineId, setSelectedDisciplineId] = useState<string>(
    disciplines[0]?.id || 'arch'
  );
  const [serialNumber, setSerialNumber] = useState<string>('');
  const [title, setTitle] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [locationZone, setLocationZone] = useState<string>('Piazza WF-P19A - صالة التذاكر');
  const [drawingReference, setDrawingReference] = useState<string>('GEMIII-PL-CS-LP-BD-DWG-ES-920635');
  const [contractor, setContractor] = useState<string>('أوراسكوم وبيسيكس (BESIX - ORASCOM JV)');
  const [priority, setPriority] = useState<ObservationPriority>('high');
  const [status, setStatus] = useState<ObservationStatus>('open');
  const [dueDate, setDueDate] = useState<string>('');
  const [inspectorName, setInspectorName] = useState<string>('م. مهندس الموقع (استشاري إيهاب EHAF)');
  const [inspectorNotes, setInspectorNotes] = useState<string>('');
  const [pinCoords, setPinCoords] = useState<{ x: number; y: number }>({ x: 50, y: 50 });
  const [photos, setPhotos] = useState<PhotoAnnotation[]>([]);

  // State for image markup sub-modal
  const [markupPhoto, setMarkupPhoto] = useState<{ id: string; url: string; caption?: string } | null>(null);
  const [isPolishing, setIsPolishing] = useState(false);

  const handleAiPolishDescription = async () => {
    if (!description.trim() && !title.trim()) return;
    setIsPolishing(true);
    try {
      const res = await fetch('/api/gemini/assist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          task: 'formalize_snag',
          text: `Title: ${title}\nDescription: ${description}\nDiscipline: ${selectedDisciplineId}\nLocation: ${locationZone}`,
          context: 'Grand Egyptian Museum (GEM) Quality Inspection. Consultant: EHAF / Hill International.'
        })
      });
      const data = await res.json();
      if (data?.result) {
        setDescription(data.result);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsPolishing(false);
    }
  };

  // Initialize or reset form
  useEffect(() => {
    if (!isOpen) return;

    if (editObservation) {
      setSelectedDisciplineId(editObservation.disciplineId);
      setSerialNumber(editObservation.serialNumber);
      setTitle(editObservation.title);
      setDescription(editObservation.description);
      setLocationZone(editObservation.locationZone);
      setDrawingReference(editObservation.drawingReference);
      setContractor(editObservation.contractor);
      setPriority(editObservation.priority);
      setStatus(editObservation.status);
      setDueDate(editObservation.dueDate);
      setInspectorName(editObservation.inspectorName);
      setInspectorNotes(editObservation.inspectorNotes || '');
      setPinCoords(editObservation.pin);
      setPhotos(editObservation.photos || []);
    } else {
      // New Observation
      const defaultDisc = disciplines[0];
      const initialDiscId = defaultDisc?.id || 'arch';
      setSelectedDisciplineId(initialDiscId);
      const generated = generateNextSerial(defaultDisc?.code || 'ARCH', allObservations);
      setSerialNumber(generated);
      setTitle('');
      setDescription('');
      setLocationZone('Piazza WF-P19A - ساحة المتحف الكبير');
      setDrawingReference('GEMIII-PL-CS-LP-BD-DWG-ES-920635');
      setContractor('تحالف أوراسكوم وبيسيكس (BESIX-ORASCOM JV)');
      setPriority('high');
      setStatus('open');
      
      const future = new Date();
      future.setDate(future.getDate() + 7);
      setDueDate(future.toISOString().slice(0, 10));

      setInspectorName('م. مهندس الموقع (استشاري إيهاب EHAF)');
      setInspectorNotes('');
      setPinCoords(initialPinCoords || { x: 50, y: 50 });
      setPhotos([]);
    }
  }, [isOpen, editObservation, initialPinCoords]);

  // Recalculate Serial Number whenever Discipline changes (if creating new)
  const handleDisciplineChange = (newDiscId: string) => {
    setSelectedDisciplineId(newDiscId);
    if (!editObservation) {
      const disc = disciplines.find(d => d.id === newDiscId);
      if (disc) {
        const next = generateNextSerial(disc.code, allObservations);
        setSerialNumber(next);
      }
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    Array.from(files).forEach((file, idx) => {
      const reader = new FileReader();
      reader.onload = () => {
        const resultUrl = reader.result as string;
        const newPhoto: PhotoAnnotation = {
          id: `photo-${Date.now()}-${idx}`,
          originalUrl: resultUrl,
          caption: '',
          uploadedAt: new Date().toLocaleString('ar-EG'),
        };
        setPhotos(prev => [...prev, newPhoto]);
      };
      reader.readAsDataURL(file);
    });

    e.target.value = '';
  };

  const handleAddSamplePhoto = () => {
    const currentDisc = disciplines.find(d => d.id === selectedDisciplineId);
    const sampleUrl = createSampleInspectionImage(
      title || 'توثيق ملاحظة ميدانية بالمتحف المصري',
      serialNumber,
      currentDisc?.color || '#f59e0b'
    );
    const newPhoto: PhotoAnnotation = {
      id: `photo-${Date.now()}`,
      originalUrl: sampleUrl,
      caption: 'صورة توثيقية تم التقاطها أثناء جولة المعاينة الميدانية',
      uploadedAt: new Date().toLocaleString('ar-EG'),
    };
    setPhotos(prev => [...prev, newPhoto]);
  };

  const handleUpdateCaption = (photoId: string, captionText: string) => {
    setPhotos(prev =>
      prev.map(p => (p.id === photoId ? { ...p, caption: captionText } : p))
    );
  };

  const handleDeletePhoto = (photoId: string) => {
    setPhotos(prev => prev.filter(p => p.id !== photoId));
  };

  const handleSaveMarkup = (annotatedDataUrl: string, updatedCaption: string) => {
    if (!markupPhoto) return;
    setPhotos(prev =>
      prev.map(p =>
        p.id === markupPhoto.id
          ? { ...p, annotatedUrl: annotatedDataUrl, caption: updatedCaption }
          : p
      )
    );
    setMarkupPhoto(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      alert('يرجى إدخال عنوان الملاحظة');
      return;
    }

    const obs: Observation = {
      id: editObservation ? editObservation.id : `obs-${Date.now()}`,
      serialNumber,
      disciplineId: selectedDisciplineId,
      title: title.trim(),
      description: description.trim(),
      locationZone,
      drawingReference,
      pin: pinCoords,
      contractor,
      status,
      priority,
      photos,
      createdAt: editObservation ? editObservation.createdAt : new Date().toISOString().slice(0, 10),
      dueDate: dueDate || new Date().toISOString().slice(0, 10),
      inspectorName,
      inspectorNotes,
    };

    onSave(obs);
    onClose();
  };

  if (!isOpen) return null;

  const currentDisc = disciplines.find(d => d.id === selectedDisciplineId);

  return (
    <>
      <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/75 backdrop-blur-sm p-3 md:p-6 overflow-y-auto">
        <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-4xl shadow-2xl overflow-hidden text-slate-100 max-h-[92vh] flex flex-col my-auto">
          
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 bg-slate-950 border-b border-slate-800">
            <div className="flex items-center gap-3">
              <div 
                className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-white shadow-md"
                style={{ backgroundColor: currentDisc?.color || '#f59e0b' }}
              >
                {currentDisc?.code || 'GEM'}
              </div>
              <div>
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  {editObservation ? 'تعديل بيانات الملاحظة' : 'إضافة ملاحظة هندسية جديدة على المخطط'}
                  <span className="font-mono text-xs px-2.5 py-0.5 rounded-lg bg-amber-500/20 text-amber-300 border border-amber-500/40">
                    {serialNumber}
                  </span>
                </h2>
                <p className="text-xs text-slate-400">
                  المخطط المعتمد: {drawingReference} | مشروع المتحف المصري الكبير
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Form Body */}
          <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-6 flex-1">
            
            {/* Discipline Selection Bar */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-2">
                1. اختيار البند والتخصص الهندسي (لكل تخصص سيريال ورقم منفصل تلقائي):
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2">
                {disciplines.map(d => {
                  const isSelected = d.id === selectedDisciplineId;
                  return (
                    <button
                      type="button"
                      key={d.id}
                      onClick={() => handleDisciplineChange(d.id)}
                      className={`flex flex-col items-center justify-center p-3 rounded-xl border text-center transition-all ${
                        isSelected
                          ? 'border-amber-400 bg-amber-500/10 shadow-lg shadow-amber-500/10'
                          : 'border-slate-800 bg-slate-950 hover:border-slate-700 text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      <span 
                        className="w-3.5 h-3.5 rounded-full mb-1.5"
                        style={{ backgroundColor: d.color }}
                      />
                      <span className="font-mono text-xs font-bold text-white">{d.code}</span>
                      <span className="text-[11px] font-medium leading-tight mt-0.5 line-clamp-1">{d.nameAr}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Serial & Key Metadata Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-slate-950/70 p-4 rounded-xl border border-slate-800">
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">
                  الرقم التسلسلي المنفصل (Unique Serial No.):
                </label>
                <input
                  type="text"
                  value={serialNumber}
                  onChange={e => setSerialNumber(e.target.value)}
                  className="w-full bg-slate-900 border border-amber-500/50 rounded-xl px-3 py-2 text-sm font-mono font-bold text-amber-400 focus:outline-none focus:border-amber-400"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">
                  درجة الأهمية والخطورة (Priority):
                </label>
                <select
                  value={priority}
                  onChange={e => setPriority(e.target.value as ObservationPriority)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500"
                >
                  <option value="critical">🔴 حرجة وعاجلة جداً (Critical)</option>
                  <option value="high">🟠 عالية الأهمية (High)</option>
                  <option value="medium">🟡 متوسطة (Medium)</option>
                  <option value="low">⚪ منخفضة / عادية (Low)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">
                  حالة الملاحظة (Status):
                </label>
                <select
                  value={status}
                  onChange={e => setStatus(e.target.value as ObservationStatus)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500"
                >
                  <option value="open">⏳ مفتوحة (قيد المراجعة)</option>
                  <option value="in_progress">⚙️ قيد المعالجة والتنفيذ</option>
                  <option value="pending_approval">🔍 بانتظار اعتماد الاستشاري</option>
                  <option value="closed">✅ مغلقة ومطابقة للمواصفات</option>
                </select>
              </div>
            </div>

            {/* Title & Description */}
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  عنوان الملاحظة الفنية (Subject / Snag Title) *
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  placeholder="مثال: عدم استواء بلاطات رخام صالة التذاكر D13 أو تسريب في خط التغذية..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-amber-500"
                  required
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-semibold text-slate-300">
                    الوصف التفصيلي وأسباب الخلل والإجراء التصحيحي المطلوب:
                  </label>
                  <button
                    type="button"
                    onClick={handleAiPolishDescription}
                    disabled={isPolishing}
                    className="flex items-center gap-1 px-2.5 py-0.5 rounded-lg bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-300 border border-indigo-500/40 text-[11px] font-bold transition-colors"
                    title="تحسين وصياغة الوصف هندسياً بالذكاء الاصطناعي"
                  >
                    <Sparkles className="w-3 h-3 text-amber-400" />
                    <span>{isPolishing ? 'جاري الصياغة...' : '✨ تحسين الصياغة بالذكاء الاصطناعي'}</span>
                  </button>
                </div>
                <textarea
                  rows={3}
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  placeholder="اكتب هنا الوصف الهندسي الدقيق للعيوب المكتشفة، المراجع التصميمية، والحل المطلوب من المقاول..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>

            {/* Contractor, Location, and Due Date */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  المنطقة والموقع على المخطط (Location / Zone):
                </label>
                <input
                  type="text"
                  value={locationZone}
                  onChange={e => setLocationZone(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  المقاول المسؤول (Contractor / JV):
                </label>
                <input
                  type="text"
                  value={contractor}
                  onChange={e => setContractor(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  تاريخ الاستحقاق وإغلاق الملاحظة (Due Date):
                </label>
                <input
                  type="date"
                  value={dueDate}
                  onChange={e => setDueDate(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>

            {/* Pin Location on Plan Details */}
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <MapPin className="w-5 h-5 text-amber-500" />
                <div>
                  <h4 className="text-sm font-semibold text-white">إحداثيات الدبوس على المخطط الرئيسي (Layout Pin):</h4>
                  <p className="text-xs text-slate-400">
                    تم التثبيت عند X: {pinCoords.x.toFixed(1)}% | Y: {pinCoords.y.toFixed(1)}% (يمكنك النقر على أي مكان بالمخطط لتغيير الموقع)
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-400">X%:</span>
                <input
                  type="number"
                  min="0"
                  max="100"
                  step="0.5"
                  value={pinCoords.x}
                  onChange={e => setPinCoords(prev => ({ ...prev, x: parseFloat(e.target.value) || 0 }))}
                  className="w-16 bg-slate-900 border border-slate-700 rounded-lg px-2 py-1 text-xs text-center text-white"
                />
                <span className="text-xs text-slate-400">Y%:</span>
                <input
                  type="number"
                  min="0"
                  max="100"
                  step="0.5"
                  value={pinCoords.y}
                  onChange={e => setPinCoords(prev => ({ ...prev, y: parseFloat(e.target.value) || 0 }))}
                  className="w-16 bg-slate-900 border border-slate-700 rounded-lg px-2 py-1 text-xs text-center text-white"
                />
              </div>
            </div>

            {/* Photos & Image Markup Section (Requested in User Prompt) */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-bold text-white flex items-center gap-2">
                    <Camera className="w-4 h-4 text-amber-500" />
                    <span>توثيق الصور والملاحظات المرئية مع إمكانية التحديد والتعليق:</span>
                  </h4>
                  <p className="text-xs text-slate-400">
                    أضف صور الموقع، اكتب تعليقاً أسفل كل صورة، واستخدم أداة التحديد الهندسية لوضع أسهم ودوائر على موضع العيب
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <label className="cursor-pointer px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition-colors">
                    <Plus className="w-3.5 h-3.5" />
                    <span>رفع صورة من الجهاز</span>
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                  </label>
                  <button
                    type="button"
                    onClick={handleAddSamplePhoto}
                    className="px-3 py-1.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-semibold flex items-center gap-1.5 transition-colors"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                    <span>صورة توثيق موقع افتراضية</span>
                  </button>
                </div>
              </div>

              {/* Photo Cards Grid */}
              {photos.length === 0 ? (
                <div className="border-2 border-dashed border-slate-800 rounded-2xl p-8 text-center bg-slate-950/50">
                  <ImageIcon className="w-10 h-10 text-slate-600 mx-auto mb-2" />
                  <p className="text-sm text-slate-400 font-medium">لم يتم إرفاق صور لهذه الملاحظة بعد</p>
                  <p className="text-xs text-slate-500 mt-1">
                    انقر على "رفع صورة من الجهاز" أو "صورة توثيق موقع افتراضية" للبدء بالتعليم ووضع الأسهم والتعليقات
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {photos.map((photo, index) => {
                    const displayUrl = photo.annotatedUrl || photo.originalUrl;
                    const hasMarkup = Boolean(photo.annotatedUrl);

                    return (
                      <div
                        key={photo.id}
                        className="bg-slate-950 rounded-xl border border-slate-800 overflow-hidden flex flex-col p-3 gap-2"
                      >
                        {/* Image Preview & Actions */}
                        <div className="relative group rounded-lg overflow-hidden border border-slate-800 bg-black/40 h-44 flex items-center justify-center">
                          <img
                            src={displayUrl}
                            alt={`Photo ${index + 1}`}
                            className="max-h-full max-w-full object-contain"
                          />

                          {/* Markup Status Tag */}
                          {hasMarkup && (
                            <span className="absolute top-2 right-2 bg-emerald-500/90 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow">
                              ✓ محددة هندسياً
                            </span>
                          )}

                          {/* Overlay Buttons */}
                          <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center gap-2 transition-opacity">
                            <button
                              type="button"
                              onClick={() => setMarkupPhoto({ id: photo.id, url: photo.originalUrl, caption: photo.caption })}
                              className="px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-lg flex items-center gap-1 shadow-lg"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                              <span>{hasMarkup ? 'تعديل التحديد' : 'تحديد وتعليم بالأسهم'}</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeletePhoto(photo.id)}
                              className="p-1.5 bg-red-600 hover:bg-red-500 text-white rounded-lg shadow-lg"
                              title="حذف الصورة"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>

                        {/* Caption input underneath photo (User Request) */}
                        <div>
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-[11px] font-semibold text-slate-400">
                              التعليق المكتوب تحت الصورة #{index + 1}:
                            </span>
                            <button
                              type="button"
                              onClick={() => setMarkupPhoto({ id: photo.id, url: photo.originalUrl, caption: photo.caption })}
                              className="text-[11px] text-amber-400 hover:text-amber-300 underline font-medium"
                            >
                              ✏️ فتح محرر التحديد
                            </button>
                          </div>
                          <input
                            type="text"
                            value={photo.caption || ''}
                            onChange={e => handleUpdateCaption(photo.id, e.target.value)}
                            placeholder="اكتب هنا تعليقاً على الصورة يوضح تفاصيل العيب..."
                            className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Inspector Notes & Sign-off */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-950/70 p-4 rounded-xl border border-slate-800">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  اسم المهندس الراصد (استشاري إيهاب / المشرف):
                </label>
                <input
                  type="text"
                  value={inspectorName}
                  onChange={e => setInspectorName(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  توصيات الاستشاري الميدانية (Site Instructions):
                </label>
                <input
                  type="text"
                  value={inspectorNotes}
                  onChange={e => setInspectorNotes(e.target.value)}
                  placeholder="مثال: يمنع الاستمرار قبل تسليم العينة المعتمدة"
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>

            {/* Footer Buttons */}
            <div className="flex items-center justify-between pt-4 border-t border-slate-800">
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm font-semibold transition-colors"
              >
                إلغاء
              </button>

              <button
                type="submit"
                className="px-7 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-sm flex items-center gap-2 shadow-lg shadow-amber-500/20 transition-all"
              >
                <Check className="w-4 h-4" />
                <span>{editObservation ? 'حفظ التعديلات' : 'إدراج الملاحظة وإسقاط الدبوس'}</span>
              </button>
            </div>
          </form>

        </div>
      </div>

      {/* Sub-modal: Image Markup / Annotation Tool */}
      {markupPhoto && (
        <ImageMarkupModal
          isOpen={Boolean(markupPhoto)}
          onClose={() => setMarkupPhoto(null)}
          imageUrl={markupPhoto.url}
          photoId={markupPhoto.id}
          initialCaption={markupPhoto.caption}
          onSave={handleSaveMarkup}
        />
      )}
    </>
  );
};
