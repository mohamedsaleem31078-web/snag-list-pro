import React from 'react';
import { Discipline, Observation, PrintSettings, ProjectMetadata } from '../types';
import { getPriorityBadge, getStatusLabel } from '../utils/helpers';

interface PrintableDocumentProps {
  project: ProjectMetadata;
  observations: Observation[];
  disciplines: Discipline[];
  printSettings: PrintSettings;
  singleObservation?: Observation | null;
}

export const PrintableDocument: React.FC<PrintableDocumentProps> = ({
  project,
  observations,
  disciplines,
  printSettings,
  singleObservation,
}) => {
  const discMap = new Map(disciplines.map(d => [d.id, d]));

  const activeObservations = singleObservation
    ? [singleObservation]
    : observations.filter(o => {
        if (printSettings.selectedDisciplineId !== 'all' && o.disciplineId !== printSettings.selectedDisciplineId) return false;
        if (printSettings.selectedStatus !== 'all' && o.status !== printSettings.selectedStatus) return false;
        if (printSettings.dateFrom && o.createdAt < printSettings.dateFrom) return false;
        if (printSettings.dateTo && o.createdAt > printSettings.dateTo) return false;
        return true;
      });

  return (
    <div className="print-only p-4 bg-white text-slate-900 font-sans text-xs" dir="rtl">
      
      {/* 1. Official Header with Logos (User Request: "يكون اللوجو المرفق موجود فى كل ورق ويظهر فى الطباعة") */}
      <div className="border-2 border-slate-900 p-3 mb-4 rounded-md">
        <div className="flex items-center justify-between border-b-2 border-slate-900 pb-3 mb-2">
          
          {/* Left: Official Grand Egyptian Museum Logo */}
          <div className="flex items-center text-right">
            <img
              src="/assets/aistudio/gem_official_logo.jpg"
              alt="Grand Egyptian Museum"
              className="h-12 w-auto object-contain"
            />
          </div>

          {/* Center: Title */}
          <div className="text-center px-4 py-1 border border-slate-300 rounded bg-slate-50">
            <span className="text-[10px] font-mono tracking-widest text-slate-500 uppercase block font-bold">
              GEM Construction Management
            </span>
            <span className="text-sm font-extrabold text-slate-900 block">
              {singleObservation ? 'إخطار ملاحظة موقع رسمية (SON)' : 'سجل حصر الملاحظات والاستلامات الميدانية (Punch List)'}
            </span>
            <span className="text-[9px] text-slate-600 font-mono">
              DWG: {project.drawingNumber}
            </span>
          </div>

          {/* Right: Official Hill International & EHAF Consulting Engineers Logo */}
          <div className="flex items-center text-left">
            <img
              src="/assets/aistudio/hill_ehaf_official_logo.jpg"
              alt="Hill International - EHAF Consulting Engineers"
              className="h-9 w-auto object-contain"
            />
          </div>
        </div>

        {/* Metadata Bar */}
        <div className="grid grid-cols-4 gap-2 text-[10px] bg-slate-100 p-2 rounded font-mono">
          <div><strong>المخطط المعتمد:</strong> {project.drawingNumber}</div>
          <div><strong>عنوان اللوحة:</strong> {project.drawingTitle}</div>
          <div><strong>تاريخ الطباعة:</strong> {new Date().toLocaleDateString('ar-EG')}</div>
          <div><strong>عدد الملاحظات:</strong> {activeObservations.length} بند</div>
        </div>
      </div>

      {/* 2. Content */}
      {singleObservation || printSettings.reportType === 'single_notice' ? (
        activeObservations.map(obs => {
          const disc = discMap.get(obs.disciplineId);
          const statusInfo = getStatusLabel(obs.status);
          const priorityInfo = getPriorityBadge(obs.priority);

          return (
            <div key={obs.id} className="border border-slate-800 p-4 rounded-md space-y-4 page-break-after">
              
              {/* Header Box */}
              <div className="flex items-center justify-between border-b pb-2">
                <div className="flex items-center gap-2">
                  <span className="text-base font-mono font-bold px-3 py-1 bg-slate-900 text-white rounded">
                    {obs.serialNumber}
                  </span>
                  <span className="font-bold text-sm text-slate-900">
                    {obs.title}
                  </span>
                </div>
                <div className="text-left font-mono text-[11px]">
                  <span className="font-bold">{statusInfo.combined}</span>
                  <span className="mx-2">|</span>
                  <span>الاستحقاق: {obs.dueDate}</span>
                </div>
              </div>

              {/* Data Table */}
              <table className="w-full text-right text-[11px] border border-slate-300">
                <tbody>
                  <tr className="border-b">
                    <td className="p-2 bg-slate-100 font-bold w-36 border-l">البند والتخصص:</td>
                    <td className="p-2 font-bold">{disc?.nameAr} ({disc?.code})</td>
                    <td className="p-2 bg-slate-100 font-bold w-36 border-l">درجة الأهمية:</td>
                    <td className="p-2">{priorityInfo.textAr}</td>
                  </tr>
                  <tr className="border-b">
                    <td className="p-2 bg-slate-100 font-bold border-l">الموقع والمنطقة:</td>
                    <td className="p-2">{obs.locationZone}</td>
                    <td className="p-2 bg-slate-100 font-bold border-l">المقاول المسؤول:</td>
                    <td className="p-2">{obs.contractor}</td>
                  </tr>
                  <tr className="border-b">
                    <td className="p-2 bg-slate-100 font-bold border-l">إحداثيات الدبوس:</td>
                    <td className="p-2 font-mono" colSpan={3}>
                      X: {obs.pin.x}% | Y: {obs.pin.y}% (على مخطط {project.drawingNumber})
                    </td>
                  </tr>
                  <tr className="border-b">
                    <td className="p-2 bg-slate-100 font-bold border-l">الوصف الفني التفصيلي:</td>
                    <td className="p-2 leading-relaxed" colSpan={3}>{obs.description}</td>
                  </tr>
                  {obs.inspectorNotes && (
                    <tr className="border-b">
                      <td className="p-2 bg-slate-100 font-bold border-l">توجيهات الاستشاري:</td>
                      <td className="p-2" colSpan={3}>{obs.inspectorNotes}</td>
                    </tr>
                  )}
                  {obs.contractorResponse && (
                    <tr>
                      <td className="p-2 bg-slate-100 font-bold border-l">رد المقاول المنفذ:</td>
                      <td className="p-2" colSpan={3}>{obs.contractorResponse}</td>
                    </tr>
                  )}
                </tbody>
              </table>

              {/* Photos Gallery */}
              {obs.photos && obs.photos.length > 0 && (
                <div className="space-y-2">
                  <h4 className="font-bold text-xs border-b pb-1">
                    الصور الميدانية المرفقة مع علامات التحديد الهندسية والتعليقات:
                  </h4>
                  <div className="grid grid-cols-2 gap-3">
                    {obs.photos.map((p, idx) => (
                      <div key={p.id} className="border p-2 rounded bg-slate-50 text-center">
                        <img
                          src={p.annotatedUrl || p.originalUrl}
                          alt="Inspection"
                          className="max-h-56 mx-auto object-contain border mb-1"
                        />
                        {p.caption && (
                          <p className="text-[10px] text-slate-800 font-semibold">
                            صورة #{idx + 1}: {p.caption}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Signature Blocks */}
              <div className="pt-6 border-t-2 border-slate-900 grid grid-cols-3 gap-4 text-center text-[10px]">
                <div className="border border-slate-300 p-2.5 rounded bg-slate-50">
                  <strong className="block mb-6">مهندس الاستشاري المشرف (EHAF)</strong>
                  <div className="border-t border-dotted pt-1">التوقيع / التاريخ</div>
                </div>
                <div className="border border-slate-300 p-2.5 rounded bg-slate-50">
                  <strong className="block mb-6">مدير موقع المقاول (BESIX - ORASCOM)</strong>
                  <div className="border-t border-dotted pt-1">التوقيع / التاريخ</div>
                </div>
                <div className="border border-slate-300 p-2.5 rounded bg-slate-50">
                  <strong className="block mb-6">إدارة المشروع (Hill International)</strong>
                  <div className="border-t border-dotted pt-1">الختم والاعتماد</div>
                </div>
              </div>

            </div>
          );
        })
      ) : (
        /* Full Punch List Table */
        <div className="space-y-4">
          <table className="w-full text-right text-[10px] border-collapse border border-slate-900">
            <thead>
              <tr className="bg-slate-200 text-slate-900 border-b-2 border-slate-900">
                <th className="p-2 border border-slate-900">م</th>
                <th className="p-2 border border-slate-900">الرقم (ID)</th>
                <th className="p-2 border border-slate-900">البند</th>
                <th className="p-2 border border-slate-900">الموقع</th>
                <th className="p-2 border border-slate-900">الوصف الفني</th>
                <th className="p-2 border border-slate-900">المقاول</th>
                <th className="p-2 border border-slate-900">الخطورة</th>
                <th className="p-2 border border-slate-900">الحالة</th>
                <th className="p-2 border border-slate-900">الاستحقاق</th>
              </tr>
            </thead>
            <tbody>
              {activeObservations.map((obs, idx) => {
                const disc = discMap.get(obs.disciplineId);
                return (
                  <tr key={obs.id} className="border-b border-slate-400 page-break-inside-avoid">
                    <td className="p-1.5 border border-slate-400 text-center font-bold">{idx + 1}</td>
                    <td className="p-1.5 border border-slate-400 font-mono font-bold whitespace-nowrap">{obs.serialNumber}</td>
                    <td className="p-1.5 border border-slate-400 whitespace-nowrap">{disc?.nameAr}</td>
                    <td className="p-1.5 border border-slate-400 whitespace-nowrap">{obs.locationZone}</td>
                    <td className="p-1.5 border border-slate-400">{obs.title}</td>
                    <td className="p-1.5 border border-slate-400 whitespace-nowrap">{obs.contractor}</td>
                    <td className="p-1.5 border border-slate-400 whitespace-nowrap">{getPriorityBadge(obs.priority).textAr}</td>
                    <td className="p-1.5 border border-slate-400 whitespace-nowrap font-bold">{getStatusLabel(obs.status).combined}</td>
                    <td className="p-1.5 border border-slate-400 font-mono whitespace-nowrap">{obs.dueDate}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {/* Signatures */}
          <div className="pt-6 grid grid-cols-3 gap-6 text-center text-[10px] page-break-inside-avoid">
            <div className="border border-slate-300 p-3 rounded bg-slate-50">
              <strong className="block mb-8">استشاري المشروع EHAF Consulting Engineers</strong>
              <div className="border-t border-slate-400 pt-1">التوقيع والاعتماد</div>
            </div>
            <div className="border border-slate-300 p-3 rounded bg-slate-50">
              <strong className="block mb-8">تحالف المقاولين BESIX - ORASCOM JV</strong>
              <div className="border-t border-slate-400 pt-1">التوقيع واستلام الملاحظات</div>
            </div>
            <div className="border border-slate-300 p-3 rounded bg-slate-50">
              <strong className="block mb-8">إدارة المشروع Hill International</strong>
              <div className="border-t border-slate-400 pt-1">الاعتماد والتأكيد</div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
