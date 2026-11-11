import React, { useState } from 'react';
import { 
  Camera, Upload, Calendar, MapPin, Tag, Plus, 
  Trash2, Edit3, Download, ExternalLink, Image as ImageIcon, 
  Search, Check, Filter, ArrowRight, ArrowLeft 
} from 'lucide-react';
import { DailyPhoto, Discipline, ProjectMetadata } from '../types';
import { compressImage } from '../utils/imageCompressor';
import { ImageMarkupModal } from './ImageMarkupModal';

interface DailyPhotoGalleryProps {
  photos: DailyPhoto[];
  onAddPhotos: (newPhotos: DailyPhoto[]) => void;
  onUpdatePhoto: (photo: DailyPhoto) => void;
  onDeletePhoto: (id: string) => void;
  disciplines: Discipline[];
  project: ProjectMetadata;
  language: 'ar' | 'en';
  onCreateSnagFromPhoto: (photo: DailyPhoto) => void;
  onAddToPhotoReport: (photo: DailyPhoto) => void;
}

export const DailyPhotoGallery: React.FC<DailyPhotoGalleryProps> = ({
  photos,
  onAddPhotos,
  onUpdatePhoto,
  onDeletePhoto,
  disciplines,
  project,
  language,
  onCreateSnagFromPhoto,
  onAddToPhotoReport,
}) => {
  const isAr = language === 'ar';
  const [selectedDate, setSelectedDate] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [filterZone, setFilterZone] = useState<string>('all');
  const [isUploading, setIsUploading] = useState<boolean>(false);

  // Markup modal state
  const [markupPhoto, setMarkupPhoto] = useState<DailyPhoto | null>(null);

  // Group photos by date
  const uniqueDates = Array.from(new Set(photos.map(p => p.date))).sort().reverse();
  const uniqueZones = Array.from(new Set(photos.map(p => p.zone).filter(Boolean)));

  // Filter photos
  const filtered = photos.filter(p => {
    if (selectedDate !== 'all' && p.date !== selectedDate) return false;
    if (filterZone !== 'all' && p.zone !== filterZone) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchCaption = (p.caption || '').toLowerCase().includes(q);
      const matchZone = (p.zone || '').toLowerCase().includes(q);
      if (!matchCaption && !matchZone) return false;
    }
    return true;
  });

  // Handle Multi-file Upload with Automatic Heavy-Duty Compression & Auto Date
  const handleFilesUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);
    const now = new Date();
    const todayStr = now.toISOString().slice(0, 10);
    const timeStr = now.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' });

    const newItems: DailyPhoto[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      try {
        // High efficiency image compression (prevents browser lag with 10MB phone pictures)
        const compressedUrl = await compressImage(file, 1600, 1600, 0.82);
        
        newItems.push({
          id: `photo-${Date.now()}-${i}`,
          url: compressedUrl,
          date: todayStr,
          time: timeStr,
          zone: 'Piazza',
          caption: file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' '),
        });
      } catch (err) {
        console.error('Failed to compress image:', err);
      }
    }

    onAddPhotos(newItems);
    setIsUploading(false);
    e.target.value = '';
  };

  const handleSaveMarkup = (annotatedUrl: string, captionText: string) => {
    if (!markupPhoto) return;
    onUpdatePhoto({
      ...markupPhoto,
      annotatedUrl,
      caption: captionText || markupPhoto.caption,
    });
    setMarkupPhoto(null);
  };

  return (
    <div className="space-y-4 text-slate-800">
      
      {/* 1. Top Header & Action Controls */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Camera className="w-5 h-5 text-amber-600" />
            <span>{isAr ? 'معرض الصور الميداني اليومي' : 'Daily Field Photo Gallery'}</span>
            <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-300">
              {photos.length} {isAr ? 'صورة موثقة' : 'Photos'}
            </span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            {isAr 
              ? 'التقاط وحفظ صور الموقع اليومية بالتاريخ والوقت مع إمكانية إدراجها مباشرة في الملاحظات والتقارير المصورة'
              : 'Capture and archive daily field site photos auto-tagged with date & time for snags and photo reports'}
          </p>
        </div>

        {/* Upload Button */}
        <label className="cursor-pointer px-4 py-2.5 rounded-lg bg-[#b47728] hover:bg-[#996521] text-white font-bold text-xs flex items-center gap-2 shadow-sm transition-all">
          <Upload className="w-4 h-4" />
          <span>{isUploading ? (isAr ? 'جاري ضغط وحفظ الصور...' : 'Compressing & saving...') : (isAr ? 'رفع صور جديدة من الكاميرا / الجهاز +' : 'Upload New Field Photos +')}</span>
          <input
            type="file"
            accept="image/*"
            multiple
            onChange={handleFilesUpload}
            className="hidden"
            disabled={isUploading}
          />
        </label>
      </div>

      {/* 2. Filters Strip */}
      <div className="bg-white border border-slate-200 rounded-xl p-3 shadow-sm flex flex-wrap items-center justify-between gap-3 text-xs">
        
        {/* Search */}
        <div className="relative flex-1 min-w-[200px]">
          <Search className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder={isAr ? 'بحث في تعليقات الصور أو المواقع...' : 'Search photo captions or zones...'}
            className="w-full bg-slate-50 border border-slate-300 rounded-lg pr-9 pl-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-amber-600"
          />
        </div>

        {/* Date Filter */}
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-slate-500" />
          <select
            value={selectedDate}
            onChange={e => setSelectedDate(e.target.value)}
            className="bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs font-medium focus:outline-none"
          >
            <option value="all">{isAr ? 'كافة التواريخ' : 'All Dates'}</option>
            {uniqueDates.map(d => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>
        </div>

        {/* Zone Filter */}
        {uniqueZones.length > 0 && (
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-slate-500" />
            <select
              value={filterZone}
              onChange={e => setFilterZone(e.target.value)}
              className="bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs font-medium focus:outline-none"
            >
              <option value="all">{isAr ? 'كافة المناطق' : 'All Zones'}</option>
              {uniqueZones.map(z => (
                <option key={z} value={z}>{z}</option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* 3. Photo Cards Grid */}
      {filtered.length === 0 ? (
        <div className="bg-white border-2 border-dashed border-slate-300 rounded-2xl p-12 text-center">
          <ImageIcon className="w-12 h-12 text-slate-400 mx-auto mb-3" />
          <h3 className="font-bold text-sm text-slate-800">
            {isAr ? 'لا توجد صور في المعرض لهذا التاريخ' : 'No photos found for selected filter'}
          </h3>
          <p className="text-xs text-slate-500 mt-1">
            {isAr ? 'اضغط على زر "رفع صور جديدة" لإضافة وتوثيق صور الجولة الميدانية فوراً' : 'Click "Upload New Field Photos" to capture or upload images'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filtered.map(photo => {
            const displayUrl = photo.annotatedUrl || photo.url;
            return (
              <div
                key={photo.id}
                className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
              >
                {/* Photo Image & Badge */}
                <div className="relative group bg-slate-900 h-48 overflow-hidden flex items-center justify-center">
                  <img
                    src={displayUrl}
                    alt={photo.caption || 'Site Photo'}
                    className="max-h-full max-w-full object-contain group-hover:scale-102 transition-transform duration-300"
                  />

                  {/* Date & Time Stamp */}
                  <div className="absolute top-2 right-2 bg-black/75 text-white text-[10px] font-mono px-2 py-0.5 rounded shadow-sm">
                    {photo.date} · {photo.time}
                  </div>

                  {/* Markup Indicator */}
                  {photo.annotatedUrl && (
                    <div className="absolute top-2 left-2 bg-emerald-600 text-white text-[10px] font-bold px-2 py-0.5 rounded shadow-sm">
                      ✓ {isAr ? 'محددة هندسياً' : 'Annotated'}
                    </div>
                  )}

                  {/* Quick Action Overlay on Hover */}
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center gap-2 transition-opacity">
                    <button
                      onClick={() => setMarkupPhoto(photo)}
                      className="p-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow"
                      title={isAr ? 'تحديد وتعليم بالأسهم' : 'Markup / Annotate'}
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => onDeletePhoto(photo.id)}
                      className="p-2 rounded-lg bg-red-600 hover:bg-red-500 text-white text-xs shadow"
                      title={isAr ? 'حذف' : 'Delete'}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Photo Details & Actions */}
                <div className="p-3 space-y-2 flex-1 flex flex-col justify-between text-xs">
                  <div>
                    <input
                      type="text"
                      value={photo.caption || ''}
                      onChange={e => onUpdatePhoto({ ...photo, caption: e.target.value })}
                      placeholder={isAr ? 'تعليق أو وصف الصورة...' : 'Caption or note...'}
                      className="w-full font-semibold text-slate-800 bg-slate-50 border border-slate-200 rounded px-2 py-1 text-xs focus:bg-white focus:border-amber-600"
                    />

                    <div className="flex items-center justify-between text-[11px] text-slate-500 mt-2">
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-amber-600" />
                        <span>{photo.zone || 'Piazza'}</span>
                      </span>
                      <span className="font-mono text-[10px] text-slate-400">
                        {photo.time}
                      </span>
                    </div>
                  </div>

                  {/* Quick Import Buttons (Requested in User Prompt) */}
                  <div className="pt-2 border-t border-slate-100 flex items-center gap-1.5">
                    <button
                      onClick={() => onCreateSnagFromPhoto(photo)}
                      className="flex-1 py-1.5 rounded bg-amber-50 hover:bg-amber-100 border border-amber-300 text-amber-900 font-bold text-[10px] flex items-center justify-center gap-1 transition-colors"
                      title={isAr ? 'إنشاء ملاحظة جديدة على المخطط بهذه الصورة' : 'Create Snag with this Photo'}
                    >
                      <Plus className="w-3 h-3 text-amber-700" />
                      <span>{isAr ? 'إدراج بملاحظة' : 'To Snag'}</span>
                    </button>

                    <button
                      onClick={() => onAddToPhotoReport(photo)}
                      className="flex-1 py-1.5 rounded bg-blue-50 hover:bg-blue-100 border border-blue-300 text-blue-900 font-bold text-[10px] flex items-center justify-center gap-1 transition-colors"
                      title={isAr ? 'إدراج في التقرير المصور' : 'Insert into Photo Report'}
                    >
                      <ExternalLink className="w-3 h-3 text-blue-700" />
                      <span>{isAr ? 'للتقرير المصور' : 'To Report'}</span>
                    </button>
                  </div>
                </div>

              </div>
            );
          })}
        </div>
      )}

      {/* Image Markup Modal */}
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

    </div>
  );
};
