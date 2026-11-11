import React, { useState } from 'react';
import { 
  FileText, Printer, FileSpreadsheet, Download, 
  Filter, Calendar, CheckSquare, Layers, Eye, 
  MapPin, CheckCircle2, Clock, AlertTriangle 
} from 'lucide-react';
import { Discipline, Observation, ObservationStatus, ProjectMetadata } from '../types';
import { getPriorityBadge, getStatusLabel, exportToCSV } from '../utils/helpers';

interface ReportsViewProps {
  project: ProjectMetadata;
  observations: Observation[];
  disciplines: Discipline[];
  onTriggerPrint: () => void;
  onSelectObservation: (obs: Observation) => void;
}

export const ReportsView: React.FC<ReportsViewProps> = ({
  project,
  observations,
  disciplines,
  onTriggerPrint,
  onSelectObservation,
}) => {
  const [reportType, setReportType] = useState<'punch_list' | 'executive' | 'contractor' | 'aged' | 'son_cards'>('punch_list');
  const [filterDiscipline, setFilterDiscipline] = useState('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterContractor, setFilterContractor] = useState('all');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  const discMap = new Map(disciplines.map(d => [d.id, d]));
  const contractors = Array.from(new Set(observations.map(o => o.contractor).filter(Boolean)));

  // Filtered observations for reports
  const filtered = observations.filter(obs => {
    if (filterDiscipline !== 'all' && obs.disciplineId !== filterDiscipline) return false;
    if (filterStatus !== 'all' && obs.status !== filterStatus) return false;
    if (filterContractor !== 'all' && obs.contractor !== filterContractor) return false;
    if (dateFrom && obs.createdAt < dateFrom) return false;
    if (dateTo && obs.createdAt > dateTo) return false;
    return true;
  });

  const closedCount = filtered.filter(o => o.status === 'closed').length;
  const resolutionRate = filtered.length > 0 ? Math.round((closedCount / filtered.length) * 100) : 0;

  return (
    <div className="space-y-4 text-slate-800">
      
      {/* 1. Top Controls Bar */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <FileText className="w-5 h-5 text-amber-600" />
            <span>Reports / مركز تقارير المشروع والطباعة الرسمية</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            توليد وطباعة تقارير هندسية معتمدة بشعارات المتحف المصري الكبير واستشاري إيهاب EHAF وHill International
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => exportToCSV(filtered, disciplines, `GEM-Report-${reportType}.csv`)}
            className="px-3.5 py-2 rounded-lg bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 font-bold text-xs flex items-center gap-1.5 shadow-sm transition-all"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
            <span>تصدير إلى Excel</span>
          </button>

          <button
            onClick={onTriggerPrint}
            className="px-4 py-2 rounded-lg bg-[#b47728] hover:bg-[#996521] text-white font-bold text-xs flex items-center gap-1.5 shadow-sm transition-all"
          >
            <Printer className="w-4 h-4" />
            <span>طباعة التقرير / تصدير PDF</span>
          </button>
        </div>
      </div>

      {/* 2. Report Type Tabs & Filter Strip */}
      <div className="bg-white border border-slate-200 rounded-xl p-3 shadow-sm space-y-3">
        
        {/* Report Types */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 border-b border-slate-100">
          {[
            { id: 'punch_list', label: '1. سجل الحصر الشامل (Punch List Register)' },
            { id: 'son_cards', label: '2. إخطارات المعاينة الرسمية (SON Notices with Photos)' },
            { id: 'executive', label: '3. التقرير التنفيذي للتخصصات (Discipline KPI Report)' },
            { id: 'contractor', label: '4. تقرير أداء المقاولين (Contractor Scorecard)' },
            { id: 'aged', label: '5. الملاحظات المتأخرة والحرجة (Aged Issues)' },
          ].map(t => (
            <button
              key={t.id}
              onClick={() => setReportType(t.id as any)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all ${
                reportType === t.id
                  ? 'bg-[#0f2237] text-white shadow-xs'
                  : 'bg-slate-50 text-slate-600 hover:bg-slate-100 hover:text-slate-900 border border-slate-200'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Filters */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2 text-xs">
          <div>
            <label className="block text-slate-500 text-[10px] mb-1 font-semibold">التخصص:</label>
            <select
              value={filterDiscipline}
              onChange={e => setFilterDiscipline(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 rounded px-2.5 py-1.5 font-medium"
            >
              <option value="all">كافة التخصصات ({disciplines.length})</option>
              {disciplines.map(d => (
                <option key={d.id} value={d.id}>{d.nameAr} - {d.nameEn}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-slate-500 text-[10px] mb-1 font-semibold">الحالة:</label>
            <select
              value={filterStatus}
              onChange={e => setFilterStatus(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 rounded px-2.5 py-1.5 font-medium"
            >
              <option value="all">كل الحالات</option>
              <option value="open">OPEN / مفتوحة</option>
              <option value="in_progress">IN PROGRESS / قيد التنفيذ</option>
              <option value="verified">VERIFIED / تم التحقق</option>
              <option value="reopened">REOPENED / أُعيد فتحها</option>
              <option value="closed">CLOSED / مغلقة</option>
              <option value="disputed">DISPUTED / متنازع عليها</option>
              <option value="distributed">DISTRIBUTED / تم التوزيع</option>
            </select>
          </div>

          <div>
            <label className="block text-slate-500 text-[10px] mb-1 font-semibold">المقاول:</label>
            <select
              value={filterContractor}
              onChange={e => setFilterContractor(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 rounded px-2.5 py-1.5 font-medium"
            >
              <option value="all">كل المقاولين ({contractors.length})</option>
              {contractors.map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-slate-500 text-[10px] mb-1 font-semibold">الفترة:</label>
            <div className="flex items-center gap-1">
              <input
                type="date"
                value={dateFrom}
                onChange={e => setDateFrom(e.target.value)}
                className="w-1/2 bg-slate-50 border border-slate-300 rounded px-1.5 py-1 font-mono text-[10px]"
                title="من تاريخ"
              />
              <span className="text-slate-400">→</span>
              <input
                type="date"
                value={dateTo}
                onChange={e => setDateTo(e.target.value)}
                className="w-1/2 bg-slate-50 border border-slate-300 rounded px-1.5 py-1 font-mono text-[10px]"
                title="إلى تاريخ"
              />
            </div>
          </div>
        </div>

      </div>

      {/* 3. Official Report Document Container with Logos (What appears on screen and print) */}
      <div className="bg-white border border-slate-300 rounded-xl shadow-md p-6 space-y-6">
        
        {/* Official Header with the uploaded logos matching screenshot */}
        <div className="border-b-2 border-slate-900 pb-4">
          <div className="flex items-center justify-between">
            {/* Left GEM Logo */}
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded bg-amber-500 flex items-center justify-center text-white shadow-sm p-1.5">
                <svg viewBox="0 0 24 24" fill="currentColor" className="w-full h-full">
                  <polygon points="12,2 2,22 22,22" />
                  <polygon points="12,7 6,19 18,19" fill="#ffffff" />
                  <polygon points="12,11 8,18 16,18" fill="#ea580c" />
                </svg>
              </div>
              <div className="leading-tight text-right">
                <span className="font-black text-sm text-slate-900 block">
                  المتحف المصري الكبير
                </span>
                <span className="text-[10px] text-amber-600 font-bold uppercase tracking-wider block font-sans">
                  GRAND EGYPTIAN MUSEUM
                </span>
              </div>
            </div>

            {/* Center Project Title */}
            <div className="text-center">
              <span className="text-base font-extrabold text-slate-900 uppercase tracking-tight block">
                GEM Construction Management
              </span>
              <span className="text-xs font-bold text-amber-700 block">
                {reportType === 'punch_list' && 'سجل حصر الملاحظات الشامل - PUNCH LIST REGISTER'}
                {reportType === 'son_cards' && 'نماذج إخطارات المعاينة الميدانية الرسمية (SON)'}
                {reportType === 'executive' && 'التقرير التنفيذي والإحصائي للتخصصات الهندسية'}
                {reportType === 'contractor' && 'تقرير أداء ومتابعة استجابة المقاولين'}
                {reportType === 'aged' && 'تقرير الملاحظات المتأخرة والحرجة بالموقع'}
              </span>
              <span className="text-[10px] text-slate-500 font-mono">
                DWG: {project.drawingNumber} · {project.drawingTitle}
              </span>
            </div>

            {/* Right Hill & EHAF Logos */}
            <div className="flex items-center gap-2 bg-slate-50 px-3 py-1 rounded border border-slate-200 text-left">
              <div className="border-l border-slate-300 pl-2 ml-1">
                <span className="text-xs font-black text-red-700 block tracking-wider uppercase font-sans">
                  HILL
                </span>
                <span className="text-[9px] text-slate-700 font-bold block uppercase -mt-1">
                  Hill International
                </span>
              </div>
              <div>
                <span className="text-xs font-black text-sky-700 block tracking-wider uppercase font-sans">
                  EHAF
                </span>
                <span className="text-[9px] text-slate-600 font-bold block -mt-1 uppercase">
                  CONSULTING ENGINEERS
                </span>
              </div>
            </div>
          </div>

          {/* Report Meta Row */}
          <div className="mt-4 pt-2 border-t border-slate-200 grid grid-cols-4 gap-2 text-[11px] text-slate-600 bg-slate-50 p-2 rounded">
            <div><strong>تاريخ التقرير:</strong> {new Date().toLocaleDateString('ar-EG')}</div>
            <div><strong>إجمالي البنود:</strong> {filtered.length} ملاحظة</div>
            <div><strong>مغلقة ومعتمدة:</strong> {closedCount} ({resolutionRate}%)</div>
            <div><strong>الاستشاري المشرف:</strong> EHAF إيهاب</div>
          </div>
        </div>

        {/* Content according to Report Type */}
        {reportType === 'punch_list' && (
          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs border border-slate-300">
              <thead className="bg-[#0f2237] text-white text-[11px] font-bold">
                <tr>
                  <th className="p-2 border border-slate-300">ID / الرقم</th>
                  <th className="p-2 border border-slate-300">البند / التخصص</th>
                  <th className="p-2 border border-slate-300">الموقع</th>
                  <th className="p-2 border border-slate-300">وصف الملاحظة وعدم المطابقة</th>
                  <th className="p-2 border border-slate-300">المقاول</th>
                  <th className="p-2 border border-slate-300">الخطورة</th>
                  <th className="p-2 border border-slate-300">الحالة الراهنة</th>
                  <th className="p-2 border border-slate-300">الاستحقاق</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {filtered.map(obs => {
                  const disc = discMap.get(obs.disciplineId);
                  const statusInfo = getStatusLabel(obs.status);
                  const priorityInfo = getPriorityBadge(obs.priority);

                  return (
                    <tr 
                      key={obs.id}
                      onClick={() => onSelectObservation(obs)}
                      className="hover:bg-slate-50 cursor-pointer"
                    >
                      <td className="p-2 font-mono font-bold text-slate-900 border border-slate-200 whitespace-nowrap">
                        {obs.serialNumber}
                      </td>
                      <td className="p-2 border border-slate-200 whitespace-nowrap">
                        {disc?.nameAr}
                      </td>
                      <td className="p-2 border border-slate-200 text-slate-600 whitespace-nowrap">
                        {obs.locationZone}
                      </td>
                      <td className="p-2 border border-slate-200 font-medium text-slate-800">
                        {obs.title}
                      </td>
                      <td className="p-2 border border-slate-200 text-slate-600 whitespace-nowrap">
                        {obs.contractor}
                      </td>
                      <td className="p-2 border border-slate-200 whitespace-nowrap">
                        <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${priorityInfo.badge}`}>
                          {priorityInfo.textAr}
                        </span>
                      </td>
                      <td className="p-2 border border-slate-200 whitespace-nowrap">
                        <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold ${statusInfo.pillBg} ${statusInfo.pillText}`}>
                          {statusInfo.textAr} / {statusInfo.textEn}
                        </span>
                      </td>
                      <td className="p-2 border border-slate-200 font-mono text-[11px] text-slate-500 whitespace-nowrap">
                        {obs.dueDate}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {reportType === 'son_cards' && (
          <div className="space-y-6">
            {filtered.map(obs => {
              const disc = discMap.get(obs.disciplineId);
              const statusInfo = getStatusLabel(obs.status);

              return (
                <div key={obs.id} className="border-2 border-slate-300 rounded-xl p-4 bg-slate-50/50 space-y-3">
                  <div className="flex items-center justify-between border-b pb-2">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-sm bg-[#0f2237] text-white px-2.5 py-1 rounded">
                        {obs.serialNumber}
                      </span>
                      <span className="font-bold text-sm text-slate-800">
                        {obs.title}
                      </span>
                    </div>
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${statusInfo.pillBg} ${statusInfo.pillText}`}>
                      {statusInfo.combined}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs bg-white p-2.5 rounded border border-slate-200">
                    <div><strong>الموقع:</strong> {obs.locationZone}</div>
                    <div><strong>المقاول:</strong> {obs.contractor}</div>
                    <div><strong>المهندس الراصد:</strong> {obs.inspectorName}</div>
                    <div><strong>تاريخ الاستحقاق:</strong> {obs.dueDate}</div>
                  </div>

                  <p className="text-xs text-slate-700 bg-white p-3 rounded border border-slate-200 leading-relaxed">
                    <strong>الوصف الفني:</strong> {obs.description}
                  </p>

                  {obs.photos && obs.photos.length > 0 && (
                    <div className="grid grid-cols-2 gap-3 pt-2">
                      {obs.photos.map((p, idx) => (
                        <div key={p.id} className="border rounded bg-white p-2 text-center">
                          <img
                            src={p.annotatedUrl || p.originalUrl}
                            alt="photo"
                            className="max-h-56 mx-auto object-contain border mb-1"
                          />
                          {p.caption && (
                            <span className="text-[11px] font-semibold text-slate-700 block">
                              صورة #{idx + 1}: {p.caption}
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Official Approvals Stamps at bottom of every printed report */}
        <div className="pt-8 border-t-2 border-slate-800 grid grid-cols-3 gap-6 text-center text-xs">
          <div className="border border-slate-300 p-3 rounded bg-slate-50">
            <strong className="block text-slate-900 mb-8">استشاري المشروع: EHAF Consulting Engineers</strong>
            <div className="border-t border-slate-400 pt-1 text-slate-600">التوقيع والاعتماد الهندسي</div>
          </div>
          <div className="border border-slate-300 p-3 rounded bg-slate-50">
            <strong className="block text-slate-900 mb-8">تحالف المقاولين: BESIX - ORASCOM JV</strong>
            <div className="border-t border-slate-400 pt-1 text-slate-600">توقيع مدير الموقع والاستلام</div>
          </div>
          <div className="border border-slate-300 p-3 rounded bg-slate-50">
            <strong className="block text-slate-900 mb-8">إدارة المشروع: Hill International</strong>
            <div className="border-t border-slate-400 pt-1 text-slate-600">الختم والاعتماد النهائي</div>
          </div>
        </div>

      </div>

    </div>
  );
};
