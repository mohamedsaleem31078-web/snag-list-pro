import React from 'react';
import { 
  X, Printer, Edit, MapPin, Calendar, User, 
  FileText, Camera, CheckCircle2, AlertTriangle, 
  Clock, Share2, Building2, Download 
} from 'lucide-react';
import { Discipline, Observation, ProjectMetadata } from '../types';
import { getPriorityBadge, getStatusLabel } from '../utils/helpers';

interface ObservationDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  observation: Observation | null;
  disciplines: Discipline[];
  project: ProjectMetadata;
  onEdit: (obs: Observation) => void;
  onPrintSingle: (obs: Observation) => void;
}

export const ObservationDetailModal: React.FC<ObservationDetailModalProps> = ({
  isOpen,
  onClose,
  observation,
  disciplines,
  project,
  onEdit,
  onPrintSingle,
}) => {
  if (!isOpen || !observation) return null;

  const disc = disciplines.find(d => d.id === observation.disciplineId);
  const statusInfo = getStatusLabel(observation.status);
  const priorityInfo = getPriorityBadge(observation.priority);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-3 md:p-6 overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-4xl shadow-2xl overflow-hidden text-slate-100 max-h-[94vh] flex flex-col my-auto">
        
        {/* Header Bar */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-950 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <span
              className="px-3 py-1 rounded-xl text-sm font-mono font-bold text-white shadow"
              style={{ backgroundColor: disc?.color || '#f59e0b' }}
            >
              {observation.serialNumber}
            </span>
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                إشعار ملاحظة موقع رسمية (Site Observation Notice - SON)
              </h2>
              <p className="text-xs text-slate-400">
                {project.projectNameAr} | استشاري إيهاب EHAF
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onPrintSingle(observation)}
              className="px-3.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow transition-all"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>طباعة الإشعار</span>
            </button>
            <button
              onClick={() => {
                onClose();
                onEdit(observation);
              }}
              className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition-colors"
            >
              <Edit className="w-3.5 h-3.5" />
              <span>تعديل</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          
          {/* Top Info Banner */}
          <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className={`text-xs px-2.5 py-0.5 rounded-full font-semibold border ${statusInfo.bg} ${statusInfo.color}`}>
                  {statusInfo.textAr}
                </span>
                <span className={`text-xs px-2.5 py-0.5 rounded-full font-semibold ${priorityInfo.badge}`}>
                  {priorityInfo.textAr}
                </span>
                <span className="text-xs text-slate-400 font-mono">
                  البند: {disc?.nameAr} ({disc?.code})
                </span>
              </div>
              <h3 className="text-xl font-bold text-white mt-1">
                {observation.title}
              </h3>
            </div>

            <div className="flex flex-col items-end text-xs text-slate-400 font-mono">
              <span>تاريخ الرصد: {observation.createdAt}</span>
              <span className="text-amber-400 font-semibold">تاريخ الاستحقاق: {observation.dueDate}</span>
            </div>
          </div>

          {/* Engineering Metadata Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-slate-950/60 p-4 rounded-xl border border-slate-800 text-xs">
            <div>
              <span className="text-slate-400 block mb-0.5">الموقع والمنطقة بالمخطط:</span>
              <span className="font-semibold text-slate-200 flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-amber-500" />
                {observation.locationZone}
              </span>
            </div>

            <div>
              <span className="text-slate-400 block mb-0.5">المخطط الهندسي المعتمد:</span>
              <span className="font-mono font-bold text-amber-400">
                {observation.drawingReference}
              </span>
            </div>

            <div>
              <span className="text-slate-400 block mb-0.5">المقاول المسؤول:</span>
              <span className="font-semibold text-slate-200">
                {observation.contractor}
              </span>
            </div>

            <div>
              <span className="text-slate-400 block mb-0.5">المهندس الاستشاري الراصد:</span>
              <span className="font-semibold text-slate-200 flex items-center gap-1">
                <User className="w-3.5 h-3.5 text-blue-400" />
                {observation.inspectorName}
              </span>
            </div>

            <div>
              <span className="text-slate-400 block mb-0.5">موقع الدبوس على المخطط:</span>
              <span className="font-mono text-slate-300">
                X: {observation.pin.x.toFixed(1)}% | Y: {observation.pin.y.toFixed(1)}%
              </span>
            </div>

            <div>
              <span className="text-slate-400 block mb-0.5">أثر التكلفة / الضمان:</span>
              <span className="text-slate-300">
                {observation.costImpact || 'ضمن التزامات المقاول التعاقدية'}
              </span>
            </div>
          </div>

          {/* Technical Description & Instructions */}
          <div className="space-y-4">
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
              <h4 className="text-xs font-bold text-amber-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <FileText className="w-4 h-4" />
                <span>الوصف الفني للملاحظة وعدم المطابقة للمواصفات:</span>
              </h4>
              <p className="text-sm text-slate-200 leading-relaxed whitespace-pre-line">
                {observation.description || 'لم يتم إدخال تفاصيل إضافية'}
              </p>
            </div>

            {observation.inspectorNotes && (
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
                <h4 className="text-xs font-bold text-cyan-400 uppercase tracking-wider mb-1">
                  توصيات وتعليمات مهندس الموقع (Site Instructions):
                </h4>
                <p className="text-sm text-slate-300">
                  {observation.inspectorNotes}
                </p>
              </div>
            )}

            {observation.contractorResponse && (
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
                <h4 className="text-xs font-bold text-emerald-400 uppercase tracking-wider mb-1">
                  رد وإجراءات المقاول المنفذ (Contractor Response):
                </h4>
                <p className="text-sm text-slate-300">
                  {observation.contractorResponse}
                </p>
              </div>
            )}
          </div>

          {/* Photo Gallery with Captions and Annotations */}
          <div>
            <h4 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
              <Camera className="w-4 h-4 text-amber-500" />
              <span>الصور الميدانية المرفقة مع التحديد الهندسي والتعليقات:</span>
            </h4>

            {observation.photos && observation.photos.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {observation.photos.map((photo, idx) => {
                  const displayUrl = photo.annotatedUrl || photo.originalUrl;
                  const hasAnnotation = Boolean(photo.annotatedUrl);

                  return (
                    <div
                      key={photo.id}
                      className="bg-slate-950 border border-slate-800 rounded-xl overflow-hidden p-3 flex flex-col gap-2"
                    >
                      <div className="relative rounded-lg overflow-hidden border border-slate-800 bg-black/50 h-52 flex items-center justify-center">
                        <img
                          src={displayUrl}
                          alt={`Observation Photo ${idx + 1}`}
                          className="max-h-full max-w-full object-contain"
                        />
                        {hasAnnotation && (
                          <span className="absolute top-2 right-2 bg-emerald-500/90 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow">
                            ✓ مع التحديد الهندسي والأسهم
                          </span>
                        )}
                      </div>

                      {/* Caption box */}
                      {photo.caption && (
                        <div className="bg-slate-900 p-2.5 rounded-lg border border-slate-800 text-xs text-slate-300">
                          <span className="font-semibold text-amber-400 block mb-0.5">تعليق الصورة #{idx + 1}:</span>
                          <span>{photo.caption}</span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-xs text-slate-500 italic">لا توجد صور مرفقة لهذه الملاحظة</p>
            )}
          </div>

          {/* Official Signature Box for Inspection Form */}
          <div className="border-t border-slate-800 pt-5 mt-6">
            <h4 className="text-xs font-bold text-slate-400 mb-4 text-center">
              اعتمادات وضوابط الاستلام الرسمية (Official Approvals & Signatures)
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center text-xs">
              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                <span className="text-slate-400 block mb-6">مهندس الاستشاري المشرف (EHAF)</span>
                <div className="border-t border-dashed border-slate-700 pt-2 font-mono text-slate-300">
                  التوقيع والختم
                </div>
              </div>

              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                <span className="text-slate-400 block mb-6">مدير موقع المقاول (BESIX - ORASCOM)</span>
                <div className="border-t border-dashed border-slate-700 pt-2 font-mono text-slate-300">
                  التوقيع والختم
                </div>
              </div>

              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                <span className="text-slate-400 block mb-6">مدير المشروع (Hill International)</span>
                <div className="border-t border-dashed border-slate-700 pt-2 font-mono text-slate-300">
                  الاعتماد النهائي
                </div>
              </div>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
