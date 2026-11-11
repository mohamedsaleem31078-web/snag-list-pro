import React, { useState } from 'react';
import { 
  Camera, Plus, Trash2, Printer, Image as ImageIcon, 
  Sparkles, RefreshCw, Layers, Edit3, ArrowUp, ArrowDown,
  Upload, CheckCircle, FileText, ChevronRight, Download
} from 'lucide-react';
import { PhotoReportDocument, PhotoReportCard, DailyPhoto, ProjectMetadata, Discipline } from '../types';
import { compressImage } from '../utils/imageCompressor';
import { ImageMarkupModal } from './ImageMarkupModal';

interface PhotoReportStudioProps {
  project: ProjectMetadata;
  disciplines: Discipline[];
  dailyPhotos: DailyPhoto[];
  language: 'ar' | 'en';
}

const DEFAULT_REPORT: PhotoReportDocument = {
  id: 'rep-gem-001',
  titleAr: 'تقرير الملاحظات المصور الميداني - المتحف المصري الكبير',
  titleEn: 'Field Photographic Inspection Report - Grand Egyptian Museum',
  reportNumber: 'GEM-PIR-2026-084',
  date: '2026-11-10',
  zone: 'Piazza / Main Atrium (الساحة الرئيسية والبهو العظيم)',
  drawingRef: 'GEMIII-PL-CS-LP-BD-DWG-ES-920635',
  inspectorName: 'Eng. Consultant Quality Team (فريق جودة الاستشاري)',
  contractorName: 'BESIX - ORASCOM JV',
  layoutType: '4-grid',
  headerNote: 'ملاحظات جودة التشطيبات والأعمال المعمارية والكهروميكانيكية التي تتطلب استكمال وتصحيح فوري وفقاً للمواصفات القياسية لمشروع المتحف المصري الكبير.',
  cards: [
    {
      id: 'card-1',
      photoUrl: '/assets/aistudio/______e3f46fda.jfif',
      title: 'فروق مناسيب بلاطات الرخام والأرضيات الخارجية',
      description: 'تم رصد عدم استواء في مناسيب تركيب رخام التيراس الخارجي بفرق يتجاوز 3 مم مما يسبب تجمع مياه وتشويه المسار.',
      location: 'Grand Piazza - Grid P14-P18',
      contractor: 'BESIX - ORASCOM JV',
      status: 'open',
      priority: 'high',
      actionRequired: 'إعادة فك وإعادة ضبط مناسيب البلاطات وملء العراميس بمادة غير قابلة للانكماش ومعتمدة هندسياً.',
    },
    {
      id: 'card-2',
      photoUrl: '/assets/aistudio/______e3f46fda.jfif',
      title: 'مسارات كابلات الإنارة الديكورية غير المحمية',
      description: 'كابلات التغذية لإنارة الجدران المثلثية مكشوفة عند الفواصل الإنشائية بدون خراطيم حماية مرنة مرخصة.',
      location: 'Atrium Glass Wall Base - Level 0',
      contractor: 'BESIX - ORASCOM JV',
      status: 'in_progress',
      priority: 'critical',
      actionRequired: 'تركيب مجاري كابلات مرنة معتمدة ومطابقة لكود مكافحة الحريق والإنهاء خلال 48 ساعة.',
    },
    {
      id: 'card-3',
      photoUrl: '/assets/aistudio/______e3f46fda.jfif',
      title: 'تلف دهانات وتجريح في الكتل المعدنية المقاومة للحريق',
      description: 'خدوش في الدهان المقاوم للحريق (Intumescent Coating) في الأعمدة الفولاذية بعد أعمال التركيبات الثانوية.',
      location: 'Zone D - Structural Columns S-12',
      contractor: 'BESIX - ORASCOM JV',
      status: 'open',
      priority: 'medium',
      actionRequired: 'صنفرة وإعادة دهان طبقة الحماية وتطبيق فحص السماكة الجافة (DFT Test) بحضور استشاري الطرف الثالث.',
    },
    {
      id: 'card-4',
      photoUrl: '/assets/aistudio/______e3f46fda.jfif',
      title: 'فواصل التمدد المطاطية بحاجة إلى استكمال السيلانت',
      description: 'فراغات في سيلانت السيليكون المقاوم للعوامل الجوية بين واجهات الزجاج وحوائط الحجر الجيري المنحوت.',
      location: 'South Facade - Joint J-09',
      contractor: 'BESIX - ORASCOM JV',
      status: 'verified',
      priority: 'high',
      actionRequired: 'تنظيف الفاصل بالهواء المضغوط ووضع الباكر رود وصب السيلانت المعتمد مع إنهاء ناعم.',
    }
  ]
};

export const PhotoReportStudio: React.FC<PhotoReportStudioProps> = ({
  project,
  disciplines,
  dailyPhotos,
  language,
}) => {
  const isAr = language === 'ar';
  const [report, setReport] = useState<PhotoReportDocument>(DEFAULT_REPORT);
  const [selectedCardForGallery, setSelectedCardForGallery] = useState<string | null>(null);
  const [markupCardId, setMarkupCardId] = useState<string | null>(null);
  const [isAiLoading, setIsAiLoading] = useState(false);

  // Update a card
  const handleUpdateCard = (id: string, updates: Partial<PhotoReportCard>) => {
    setReport(prev => ({
      ...prev,
      cards: prev.cards.map(c => c.id === id ? { ...c, ...updates } : c)
    }));
  };

  // Add new blank card
  const handleAddCard = () => {
    const newCard: PhotoReportCard = {
      id: `card-${Date.now()}`,
      photoUrl: dailyPhotos[0]?.url || '/assets/aistudio/______e3f46fda.jfif',
      title: isAr ? 'ملاحظة فحص جديدة' : 'New Inspection Observation',
      description: isAr ? 'يرجى كتابة تفاصيل الملاحظة وتوصيف الخلل الفني بدقة...' : 'Enter defect description and engineering notes...',
      location: 'Zone Piazza',
      contractor: report.contractorName,
      status: 'open',
      priority: 'medium',
      actionRequired: isAr ? 'الإجراء التصحيحي المطلوب من المقاول...' : 'Required corrective action by contractor...',
    };
    setReport(prev => ({ ...prev, cards: [...prev.cards, newCard] }));
  };

  // Remove card
  const handleRemoveCard = (id: string) => {
    setReport(prev => ({
      ...prev,
      cards: prev.cards.filter(c => c.id !== id)
    }));
  };

  // Reorder card up
  const handleMoveUp = (index: number) => {
    if (index === 0) return;
    setReport(prev => {
      const copy = [...prev.cards];
      const temp = copy[index - 1];
      copy[index - 1] = copy[index];
      copy[index] = temp;
      return { ...prev, cards: copy };
    });
  };

  // Reorder card down
  const handleMoveDown = (index: number) => {
    if (index === report.cards.length - 1) return;
    setReport(prev => {
      const copy = [...prev.cards];
      const temp = copy[index + 1];
      copy[index + 1] = copy[index];
      copy[index] = temp;
      return { ...prev, cards: copy };
    });
  };

  // Upload image for a card with compression
  const handleUploadCardImage = async (cardId: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const compressed = await compressImage(file, 1600, 1600, 0.82);
      handleUpdateCard(cardId, { photoUrl: compressed });
    } catch (err) {
      console.error(err);
    }
    e.target.value = '';
  };

  // Pick photo from Daily Gallery
  const handlePickFromGallery = (cardId: string, photoUrl: string) => {
    handleUpdateCard(cardId, { photoUrl });
    setSelectedCardForGallery(null);
  };

  // AI Assistant: Polish report intro and summary
  const handleAiPolishReport = async () => {
    setIsAiLoading(true);
    try {
      const prompt = `أنت مهندس جودة واستشاري في مشروع المتحف المصري الكبير (The Grand Egyptian Museum). 
قم بصياغة مقدمة هندسية تنفيذية رسمية بأسلوب EHAF & Hill International لتقرير فحص موقع رقم ${report.reportNumber} للمنطقة ${report.zone}.
التقرير يحتوي على ${report.cards.length} ملاحظات تخص المقاول ${report.contractorName}.
اكتب فقرة ملخص رسمي باللغتين العربية والإنجليزية مع إبراز ضرورة الالتزام بالمواصفات الفنية المعتمدة وتسليم الأعمال بدون تأخير.`;

      const res = await fetch('/api/gemini/assist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          task: 'engineering_summary',
          text: prompt,
          context: `Project: GEM, Zone: ${report.zone}, Items: ${report.cards.length}`
        })
      });
      const data = await res.json();
      if (data?.result) {
        setReport(prev => ({
          ...prev,
          headerNote: data.result
        }));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsAiLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const cardForMarkup = report.cards.find(c => c.id === markupCardId);

  return (
    <div className="space-y-6">
      
      {/* 1. Control Bar & Layout Switcher (Hidden in Print) */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm flex flex-wrap items-center justify-between gap-3 no-print">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-amber-500/15 text-amber-800 border border-amber-300">
            <FileText className="w-5 h-5 text-amber-700" />
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
              <span>{isAr ? 'استوديو التقارير المصورة الرسمية' : 'Photographic Report Studio'}</span>
              <span className="text-[10px] bg-slate-100 text-slate-700 font-mono px-2 py-0.5 rounded-full border border-slate-300">
                GEM Official Standard
              </span>
            </h2>
            <p className="text-xs text-slate-500">
              {isAr 
                ? 'لوجو وثوابت المتحف المصري الكبير والاستشاري ثابتة تلقائياً — عدل النصوص والصور بالشكل المطلوب' 
                : 'Approved GEM, Hill & EHAF headers are locked — customize defects, photos & layout freely'}
            </p>
          </div>
        </div>

        {/* Layout Selector & Actions */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Layout Buttons */}
          <div className="flex items-center bg-slate-100 rounded-lg p-1 border border-slate-200 text-xs">
            <button
              onClick={() => setReport(prev => ({ ...prev, layoutType: '1-large' }))}
              className={`px-2.5 py-1 rounded font-semibold transition-all ${
                report.layoutType === '1-large' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              1 {isAr ? 'كبيرة' : 'Large'}
            </button>
            <button
              onClick={() => setReport(prev => ({ ...prev, layoutType: '2-side' }))}
              className={`px-2.5 py-1 rounded font-semibold transition-all ${
                report.layoutType === '2-side' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              2 {isAr ? 'مزدوج' : 'Side-by-Side'}
            </button>
            <button
              onClick={() => setReport(prev => ({ ...prev, layoutType: '4-grid' }))}
              className={`px-2.5 py-1 rounded font-semibold transition-all ${
                report.layoutType === '4-grid' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              4 {isAr ? 'شبكة ربعية' : '4-Grid'}
            </button>
            <button
              onClick={() => setReport(prev => ({ ...prev, layoutType: '6-grid' }))}
              className={`px-2.5 py-1 rounded font-semibold transition-all ${
                report.layoutType === '6-grid' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              6 {isAr ? 'شبكة سداسية' : '6-Grid'}
            </button>
          </div>

          {/* AI Polish */}
          <button
            onClick={handleAiPolishReport}
            disabled={isAiLoading}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 text-indigo-900 font-bold text-xs shadow-xs transition-colors"
            title="تحسين وصياغة الملخص بالذكاء الاصطناعي"
          >
            <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
            <span>{isAiLoading ? (isAr ? 'جاري الصياغة...' : 'Polishing...') : (isAr ? '✨ صياغة هندسية بالذكاء الاصطناعي' : '✨ AI Polish')}</span>
          </button>

          {/* Add Card */}
          <button
            onClick={handleAddCard}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs shadow-xs transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>{isAr ? 'إضافة صورة وملاحظة +' : 'Add Photo Item +'}</span>
          </button>

          {/* Print Button */}
          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-xs transition-colors"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>{isAr ? 'طباعة التقرير / PDF' : 'Print / Export PDF'}</span>
          </button>
        </div>
      </div>

      {/* 2. Editable Report Document (What You See Is What You Print) */}
      <div className="bg-white border border-slate-300 rounded-2xl shadow-lg p-6 sm:p-8 max-w-[1400px] mx-auto text-slate-900 print:border-none print:shadow-none print:p-0">
        
        {/* Approved GEM Header Banner with Hill and EHAF */}
        <div className="border-b-2 border-slate-900 pb-4 mb-6">
          <div className="flex items-center justify-between gap-4">
            
            {/* Left: GEM Official Logo */}
            <div className="flex items-center shrink-0">
              <img
                src="/assets/aistudio/gem_official_logo.jpg"
                alt="Grand Egyptian Museum"
                className="h-12 sm:h-14 w-auto object-contain"
              />
            </div>

            {/* Center: Title & Document Type */}
            <div className="text-center flex-1 max-w-lg">
              <input
                type="text"
                value={report.titleAr}
                onChange={e => setReport(prev => ({ ...prev, titleAr: e.target.value }))}
                className="font-black text-sm sm:text-lg text-slate-900 text-center w-full bg-transparent border-b border-transparent hover:border-slate-300 focus:border-amber-600 focus:outline-none"
              />
              <input
                type="text"
                value={report.titleEn}
                onChange={e => setReport(prev => ({ ...prev, titleEn: e.target.value }))}
                className="font-bold text-xs sm:text-sm text-slate-600 text-center uppercase tracking-wide w-full bg-transparent border-b border-transparent hover:border-slate-300 focus:border-amber-600 focus:outline-none"
              />
            </div>

            {/* Right: Official Hill International & EHAF Logo */}
            <div className="flex items-center shrink-0">
              <img
                src="/assets/aistudio/hill_ehaf_official_logo.jpg"
                alt="Hill International - EHAF Consulting Engineers"
                className="h-8 sm:h-10 w-auto object-contain"
              />
            </div>

          </div>

          {/* Report Metadata Strip */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-4 pt-3 border-t border-slate-200 text-xs">
            <div className="bg-slate-50 p-2 rounded border border-slate-200">
              <span className="text-slate-500 font-semibold block text-[10px]">{isAr ? 'رقم التقرير' : 'Report No.'}:</span>
              <input
                type="text"
                value={report.reportNumber}
                onChange={e => setReport(prev => ({ ...prev, reportNumber: e.target.value }))}
                className="font-bold font-mono text-slate-900 w-full bg-transparent focus:outline-none"
              />
            </div>
            <div className="bg-slate-50 p-2 rounded border border-slate-200">
              <span className="text-slate-500 font-semibold block text-[10px]">{isAr ? 'تاريخ المعاينة' : 'Inspection Date'}:</span>
              <input
                type="date"
                value={report.date}
                onChange={e => setReport(prev => ({ ...prev, date: e.target.value }))}
                className="font-bold text-slate-900 w-full bg-transparent focus:outline-none"
              />
            </div>
            <div className="bg-slate-50 p-2 rounded border border-slate-200">
              <span className="text-slate-500 font-semibold block text-[10px]">{isAr ? 'المنطقة / الموقع' : 'Location Zone'}:</span>
              <input
                type="text"
                value={report.zone}
                onChange={e => setReport(prev => ({ ...prev, zone: e.target.value }))}
                className="font-bold text-slate-900 w-full bg-transparent focus:outline-none"
              />
            </div>
            <div className="bg-slate-50 p-2 rounded border border-slate-200">
              <span className="text-slate-500 font-semibold block text-[10px]">{isAr ? 'المقاول المنفذ' : 'Contractor'}:</span>
              <input
                type="text"
                value={report.contractorName}
                onChange={e => setReport(prev => ({ ...prev, contractorName: e.target.value }))}
                className="font-bold text-slate-900 w-full bg-transparent focus:outline-none"
              />
            </div>
          </div>

          {/* Header Note / Engineering Executive Summary */}
          <div className="mt-3">
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
              {isAr ? 'ملاحظة وموجز استشاري الجودة التنفيذي (EHAF / Hill International):' : 'Executive Inspection Summary:'}
            </label>
            <textarea
              rows={2}
              value={report.headerNote}
              onChange={e => setReport(prev => ({ ...prev, headerNote: e.target.value }))}
              className="w-full text-xs font-medium text-slate-800 bg-amber-50/40 border border-amber-200 rounded p-2 focus:outline-none focus:border-amber-600"
            />
          </div>
        </div>

        {/* 3. Cards Grid Layout */}
        <div className={`grid gap-6 ${
          report.layoutType === '1-large' ? 'grid-cols-1' :
          report.layoutType === '2-side' ? 'grid-cols-1 md:grid-cols-2' :
          report.layoutType === '4-grid' ? 'grid-cols-1 md:grid-cols-2' :
          'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'
        }`}>
          {report.cards.map((card, idx) => (
            <div
              key={card.id}
              className="border-2 border-slate-200 rounded-xl overflow-hidden flex flex-col justify-between bg-white relative hover:border-amber-500 transition-colors group"
            >
              
              {/* Card Header & Controls (Controls hidden on print) */}
              <div className="bg-slate-100 px-3 py-1.5 flex items-center justify-between border-b border-slate-200 text-xs">
                <span className="font-extrabold text-slate-800 font-mono">
                  #{idx + 1}
                </span>

                {/* Edit & Reorder buttons (no-print) */}
                <div className="flex items-center gap-1 no-print">
                  <button
                    onClick={() => handleMoveUp(idx)}
                    disabled={idx === 0}
                    className="p-1 rounded hover:bg-slate-200 disabled:opacity-30 text-slate-600"
                    title="تحريك لأعلى"
                  >
                    <ArrowUp className="w-3 h-3" />
                  </button>
                  <button
                    onClick={() => handleMoveDown(idx)}
                    disabled={idx === report.cards.length - 1}
                    className="p-1 rounded hover:bg-slate-200 disabled:opacity-30 text-slate-600"
                    title="تحريك لأسفل"
                  >
                    <ArrowDown className="w-3 h-3" />
                  </button>
                  <button
                    onClick={() => setMarkupCardId(card.id)}
                    className="p-1 rounded bg-amber-100 hover:bg-amber-200 text-amber-900"
                    title="تحديد وتعليم بالأسهم"
                  >
                    <Edit3 className="w-3 h-3" />
                  </button>
                  <button
                    onClick={() => handleRemoveCard(card.id)}
                    className="p-1 rounded hover:bg-red-100 text-red-600"
                    title="حذف البطاقة"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              </div>

              {/* Card Photo */}
              <div className="relative bg-slate-950 flex items-center justify-center overflow-hidden min-h-[220px] max-h-[340px]">
                <img
                  src={card.photoUrl}
                  alt={card.title}
                  className="max-h-[340px] w-auto max-w-full object-contain"
                />

                {/* Photo Action Overlay (no-print) */}
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center gap-2 transition-opacity no-print">
                  <button
                    onClick={() => setSelectedCardForGallery(card.id)}
                    className="px-2.5 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center gap-1 shadow"
                  >
                    <ImageIcon className="w-3.5 h-3.5" />
                    <span>{isAr ? 'من المعرض اليومي' : 'From Gallery'}</span>
                  </button>
                  <label className="cursor-pointer px-2.5 py-1.5 rounded-lg bg-white hover:bg-slate-100 text-slate-950 font-bold text-xs flex items-center gap-1 shadow">
                    <Upload className="w-3.5 h-3.5" />
                    <span>{isAr ? 'رفع صورة' : 'Upload'}</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={e => handleUploadCardImage(card.id, e)}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>

              {/* Card Content Form / Display */}
              <div className="p-3.5 space-y-2.5 flex-1 flex flex-col justify-between text-xs">
                <div>
                  {/* Title */}
                  <input
                    type="text"
                    value={card.title}
                    onChange={e => handleUpdateCard(card.id, { title: e.target.value })}
                    placeholder={isAr ? 'عنوان الملاحظة...' : 'Issue title...'}
                    className="w-full font-bold text-sm text-slate-900 border-b border-slate-200 focus:border-amber-600 focus:outline-none pb-1"
                  />

                  {/* Location & Status Row */}
                  <div className="flex items-center justify-between gap-2 mt-2">
                    <input
                      type="text"
                      value={card.location}
                      onChange={e => handleUpdateCard(card.id, { location: e.target.value })}
                      placeholder={isAr ? 'الموقع الدقيق / المحور' : 'Grid / Location'}
                      className="text-xs text-slate-600 bg-slate-50 px-2 py-0.5 rounded border border-slate-200 flex-1 focus:outline-none"
                    />
                    <select
                      value={card.status}
                      onChange={e => handleUpdateCard(card.id, { status: e.target.value as any })}
                      className="text-[11px] font-bold rounded px-2 py-0.5 border border-slate-300 bg-white"
                    >
                      <option value="open">مفتوحة / OPEN</option>
                      <option value="in_progress">قيد التنفيذ / IN PROGRESS</option>
                      <option value="verified">تم التحقق / VERIFIED</option>
                      <option value="closed">مغلقة / CLOSED</option>
                    </select>
                  </div>

                  {/* Description */}
                  <div className="mt-2">
                    <label className="text-[10px] font-bold text-slate-400 block mb-0.5">
                      {isAr ? 'توصيف الملاحظة الهندسية:' : 'Defect Description:'}
                    </label>
                    <textarea
                      rows={2}
                      value={card.description}
                      onChange={e => handleUpdateCard(card.id, { description: e.target.value })}
                      className="w-full text-xs text-slate-700 bg-slate-50/70 p-1.5 rounded border border-slate-200 focus:outline-none focus:border-amber-600"
                    />
                  </div>

                  {/* Action Required */}
                  <div className="mt-1">
                    <label className="text-[10px] font-bold text-amber-700 block mb-0.5">
                      {isAr ? 'الإجراء التصحيحي المطلوب:' : 'Required Corrective Action:'}
                    </label>
                    <textarea
                      rows={2}
                      value={card.actionRequired}
                      onChange={e => handleUpdateCard(card.id, { actionRequired: e.target.value })}
                      className="w-full text-xs font-semibold text-slate-900 bg-amber-50/40 p-1.5 rounded border border-amber-200 focus:outline-none focus:border-amber-600"
                    />
                  </div>
                </div>

                {/* Footer Signature Box per Card */}
                <div className="pt-2 border-t border-slate-200 flex items-center justify-between text-[10px] text-slate-500">
                  <span>EHAF Quality Engineer: ____________</span>
                  <span>Contractor Ack: ____________</span>
                </div>
              </div>

            </div>
          ))}
        </div>

        {/* 4. Official Report Sign-off Stamp Block at Bottom */}
        <div className="mt-8 pt-6 border-t-2 border-slate-900 grid grid-cols-3 gap-6 text-center text-xs">
          <div className="border border-slate-300 rounded-lg p-3">
            <span className="font-bold text-slate-800 block text-[11px] mb-6">
              مهندس استشاري الإشراف (EHAF)
            </span>
            <div className="border-b border-dashed border-slate-400 pb-1">التوقيع والاعتماد</div>
          </div>
          <div className="border border-slate-300 rounded-lg p-3">
            <span className="font-bold text-slate-800 block text-[11px] mb-6">
              مدير مشروع هيل إنترناشونال (Hill International)
            </span>
            <div className="border-b border-dashed border-slate-400 pb-1">التوقيع والاعتماد</div>
          </div>
          <div className="border border-slate-300 rounded-lg p-3">
            <span className="font-bold text-slate-800 block text-[11px] mb-6">
              مدير جودة المقاول المنفذ (BESIX - ORASCOM JV)
            </span>
            <div className="border-b border-dashed border-slate-400 pb-1">استلام وتعهد بالمعالجة</div>
          </div>
        </div>

      </div>

      {/* Gallery Picker Modal */}
      {selectedCardForGallery && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-5 max-h-[85vh] flex flex-col">
            <h3 className="font-bold text-base text-slate-900 mb-3 flex items-center gap-2">
              <Camera className="w-5 h-5 text-amber-600" />
              <span>{isAr ? 'اختر صورة من معرض الموقع اليومي' : 'Select Photo from Daily Gallery'}</span>
            </h3>

            {dailyPhotos.length === 0 ? (
              <p className="text-sm text-slate-500 my-8 text-center">
                {isAr ? 'لا توجد صور في المعرض بعد. يمكنك رفع صورة مباشرة أو إضافة صور من تبويب المعرض.' : 'No photos in gallery yet.'}
              </p>
            ) : (
              <div className="grid grid-cols-3 gap-3 overflow-y-auto flex-1 p-1">
                {dailyPhotos.map(p => (
                  <div
                    key={p.id}
                    onClick={() => handlePickFromGallery(selectedCardForGallery, p.annotatedUrl || p.url)}
                    className="cursor-pointer border-2 border-slate-200 hover:border-amber-500 rounded-lg overflow-hidden group relative"
                  >
                    <img src={p.annotatedUrl || p.url} alt="" className="h-28 w-full object-cover" />
                    <div className="p-1 bg-slate-900/80 text-white text-[9px] truncate">
                      {p.date} · {p.caption || 'Site Photo'}
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="flex justify-end gap-2 mt-4 pt-3 border-t">
              <button
                onClick={() => setSelectedCardForGallery(null)}
                className="px-4 py-2 rounded-lg bg-slate-100 text-slate-700 font-bold text-xs"
              >
                {isAr ? 'إلغاء' : 'Cancel'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Image Markup Modal */}
      {cardForMarkup && (
        <ImageMarkupModal
          isOpen={Boolean(cardForMarkup)}
          onClose={() => setMarkupCardId(null)}
          imageUrl={cardForMarkup.photoUrl}
          photoId={cardForMarkup.id}
          initialCaption={cardForMarkup.title}
          onSave={(annotatedUrl) => {
            handleUpdateCard(cardForMarkup.id, { photoUrl: annotatedUrl });
            setMarkupCardId(null);
          }}
        />
      )}

    </div>
  );
};
