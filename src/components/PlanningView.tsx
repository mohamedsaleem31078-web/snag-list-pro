import React, { useState } from 'react';
import { 
  Calendar, Plus, CheckCircle2, Clock, AlertTriangle, 
  Layers, Search, Filter, Edit, Trash2, ArrowUpDown, 
  Upload, Download, FileSpreadsheet, RefreshCw 
} from 'lucide-react';
import { Discipline, PlanningActivity, ProjectMetadata } from '../types';

interface PlanningViewProps {
  project: ProjectMetadata;
  activities: PlanningActivity[];
  disciplines: Discipline[];
  onAddActivity: (activity: PlanningActivity) => void;
  onUpdateActivity: (activity: PlanningActivity) => void;
  onDeleteActivity: (id: string) => void;
  onBulkImportActivities?: (imported: PlanningActivity[]) => void;
  language?: 'ar' | 'en';
}

export const PlanningView: React.FC<PlanningViewProps> = ({
  project,
  activities,
  disciplines,
  onAddActivity,
  onUpdateActivity,
  onDeleteActivity,
  onBulkImportActivities,
  language = 'ar',
}) => {
  const isAr = language === 'ar';
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [disciplineFilter, setDisciplineFilter] = useState('all');

  // New activity form modal
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingActivity, setEditingActivity] = useState<PlanningActivity | null>(null);

  const [code, setCode] = useState('');
  const [nameAr, setNameAr] = useState('');
  const [nameEn, setNameEn] = useState('');
  const [disciplineId, setDisciplineId] = useState(disciplines[0]?.id || 'arch');
  const [plannedStartDate, setPlannedStartDate] = useState('');
  const [plannedEndDate, setPlannedEndDate] = useState('');
  const [actualProgress, setActualProgress] = useState(50);
  const [status, setStatus] = useState<PlanningActivity['status']>('on_track');
  const [contractor, setContractor] = useState(project.contractor);
  const [zone, setZone] = useState('Piazza');

  const discMap = new Map(disciplines.map(d => [d.id, d]));

  const filtered = activities.filter(a => {
    if (statusFilter !== 'all' && a.status !== statusFilter) return false;
    if (disciplineFilter !== 'all' && a.disciplineId !== disciplineFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      if (!a.nameAr.toLowerCase().includes(q) && !a.nameEn.toLowerCase().includes(q) && !a.code.toLowerCase().includes(q)) {
        return false;
      }
    }
    return true;
  });

  const handleOpenAdd = () => {
    setEditingActivity(null);
    setCode(`ACT-${disciplines[0]?.code || 'GEN'}-${activities.length + 1}`);
    setNameAr('');
    setNameEn('');
    setDisciplineId(disciplines[0]?.id || 'arch');
    setPlannedStartDate(new Date().toISOString().slice(0, 10));
    const fut = new Date();
    fut.setDate(fut.getDate() + 30);
    setPlannedEndDate(fut.toISOString().slice(0, 10));
    setActualProgress(0);
    setStatus('on_track');
    setZone('Piazza');
    setShowAddModal(true);
  };

  const handleEdit = (act: PlanningActivity) => {
    setEditingActivity(act);
    setCode(act.code);
    setNameAr(act.nameAr);
    setNameEn(act.nameEn);
    setDisciplineId(act.disciplineId);
    setPlannedStartDate(act.plannedStartDate);
    setPlannedEndDate(act.plannedEndDate);
    setActualProgress(act.actualProgress);
    setStatus(act.status);
    setZone(act.zone);
    setContractor(act.contractor);
    setShowAddModal(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nameAr.trim()) return;

    const activityData: PlanningActivity = {
      id: editingActivity ? editingActivity.id : `act-${Date.now()}`,
      code: code || `ACT-${Date.now()}`,
      nameAr: nameAr.trim(),
      nameEn: nameEn.trim() || nameAr.trim(),
      disciplineId,
      plannedStartDate,
      plannedEndDate,
      actualProgress,
      status,
      contractor,
      zone,
    };

    if (editingActivity) {
      onUpdateActivity(activityData);
    } else {
      onAddActivity(activityData);
    }
    setShowAddModal(false);
  };

  // Quick Inline Progress Increment / Decrement
  const handleQuickProgressUpdate = (act: PlanningActivity, newProgress: number) => {
    const clamped = Math.max(0, Math.min(100, newProgress));
    let newStatus: PlanningActivity['status'] = act.status;
    if (clamped >= 100) newStatus = 'completed';
    else if (clamped < 50 && act.status === 'completed') newStatus = 'on_track';
    onUpdateActivity({
      ...act,
      actualProgress: clamped,
      status: newStatus,
    });
  };

  // 1. Download Standard Excel / CSV Template
  const handleDownloadExcelTemplate = () => {
    const headers = [
      'Activity_Code',
      'Name_AR',
      'Name_EN',
      'Discipline_Code',
      'Start_Date',
      'End_Date',
      'Actual_Progress_Pct',
      'Status',
      'Zone',
      'Contractor'
    ];

    const sampleRows = [
      ['ACT-ARC-01', 'توريد وتركيب رخام تريفيلا للساحة الرئيسية', 'Supply & Install Trevi Marble at Grand Piazza', 'ARC', '2026-01-15', '2026-06-30', '65', 'on_track', 'Piazza', 'BESIX - ORASCOM JV'],
      ['ACT-CIV-02', 'أعمال الخرسانات المسلحة لغرف المحولات والخدمات', 'Reinforced Concrete for Substation Rooms', 'CIV', '2026-02-01', '2026-05-15', '100', 'completed', 'Energy Center', 'BESIX - ORASCOM JV'],
      ['ACT-MEC-03', 'تركيب شبكة الإطفاء ومضخات الرش الآلي للمرحلة 3', 'Firefighting Sprinklers Installation Phase 3', 'MEC', '2026-03-01', '2026-08-30', '40', 'delayed', 'Galleries', 'BESIX - ORASCOM JV'],
    ];

    const csvContent = '\uFEFF' + [headers.join(','), ...sampleRows.map(r => r.map(c => `"${c}"`).join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `GEM_Time_Schedule_Template_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // 2. Import Excel / CSV Schedule
  const handleImportExcelSchedule = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        const lines = text.split(/\r?\n/).filter(line => line.trim().length > 0);
        if (lines.length < 2) {
          alert(isAr ? 'الملف لا يحتوي على صفوف بيانات كافية' : 'File does not contain valid data rows');
          return;
        }

        const newActivities: PlanningActivity[] = [];
        // Skip header
        for (let i = 1; i < lines.length; i++) {
          const row = lines[i].split(',').map(cell => cell.replace(/^"(.*)"$/, '$1').trim());
          if (row.length >= 3 && row[0]) {
            const code = row[0];
            const nameAr = row[1] || code;
            const nameEn = row[2] || nameAr;
            const discCode = (row[3] || 'ARC').toUpperCase();
            const matchedDisc = disciplines.find(d => d.code.toUpperCase() === discCode) || disciplines[0];
            const start = row[4] || new Date().toISOString().slice(0, 10);
            const end = row[5] || new Date().toISOString().slice(0, 10);
            const progress = parseInt(row[6], 10) || 0;
            const statusRaw = (row[7] || 'on_track').toLowerCase();
            const validStatus = ['on_track', 'delayed', 'completed', 'not_started'].includes(statusRaw)
              ? (statusRaw as any)
              : progress >= 100 ? 'completed' : 'on_track';
            const zone = row[8] || 'Piazza';
            const contractor = row[9] || project.contractor;

            newActivities.push({
              id: `imported-${Date.now()}-${i}`,
              code,
              nameAr,
              nameEn,
              disciplineId: matchedDisc?.id || 'arch',
              plannedStartDate: start,
              plannedEndDate: end,
              actualProgress: Math.min(100, Math.max(0, progress)),
              status: validStatus,
              zone,
              contractor,
            });
          }
        }

        if (newActivities.length > 0) {
          newActivities.forEach(act => onAddActivity(act));
          alert(isAr ? `تم بنجاح استيراد ${newActivities.length} نشاطاً من ملف الإكسيل!` : `Successfully imported ${newActivities.length} schedule activities!`);
        }
      } catch (err) {
        alert(isAr ? 'حدث خطأ في قراءة ملف الإكسيل/CSV' : 'Error parsing Excel/CSV file');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  // 3. Export Current Schedule to CSV
  const handleExportCurrentSchedule = () => {
    const headers = ['Code', 'Name_AR', 'Name_EN', 'Discipline', 'Zone', 'Progress_Pct', 'Planned_Start', 'Planned_End', 'Status', 'Contractor'];
    const rows = activities.map(a => [
      a.code,
      a.nameAr,
      a.nameEn,
      discMap.get(a.disciplineId)?.code || '',
      a.zone,
      a.actualProgress,
      a.plannedStartDate,
      a.plannedEndDate,
      a.status,
      a.contractor
    ]);
    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map(r => r.map(c => `"${c}"`).join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `GEM_Live_Schedule_Export_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-4 text-slate-800">
      
      {/* Top Banner with Action Controls */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Calendar className="w-5 h-5 text-amber-600" />
            <span>{isAr ? 'Planning / التخطيط وجدول الأعمال التنفيذية' : 'Planning / Master Schedule & Progress'}</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            {isAr 
              ? 'إدخال وتحديث البرامج الزمنية من الإكسيل (Primavera / Excel) ومطابقة نسب الإنجاز الفعلي بالموقع' 
              : 'Import, manage, and update construction schedules with live actual progress and slip monitoring'}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Download Template */}
          <button
            onClick={handleDownloadExcelTemplate}
            className="px-3 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs flex items-center gap-1.5 transition-colors border border-slate-300"
            title={isAr ? 'تحميل نموذج إكسيل فارغ لتعبئة الأنشطة' : 'Download Excel schedule template'}
          >
            <Download className="w-3.5 h-3.5 text-slate-600" />
            <span>{isAr ? 'نموذج إكسيل (Template)' : 'Excel Template'}</span>
          </button>

          {/* Import Schedule */}
          <label className="cursor-pointer px-3 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm transition-colors">
            <FileSpreadsheet className="w-3.5 h-3.5" />
            <span>{isAr ? 'استيراد برنامج زمني (Excel/CSV)' : 'Import Excel Schedule'}</span>
            <input
              type="file"
              accept=".csv,.txt"
              onChange={handleImportExcelSchedule}
              className="hidden"
            />
          </label>

          {/* Export Schedule */}
          <button
            onClick={handleExportCurrentSchedule}
            className="px-3 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center gap-1.5 transition-colors"
            title={isAr ? 'تصدير الجدول الحالي' : 'Export Schedule'}
          >
            <Download className="w-3.5 h-3.5 text-amber-400" />
            <span>{isAr ? 'تصدير إكسيل' : 'Export Excel'}</span>
          </button>

          {/* Add Activity */}
          <button
            onClick={handleOpenAdd}
            className="px-4 py-2 rounded-lg bg-[#b47728] hover:bg-[#996521] text-white font-bold text-xs flex items-center gap-1.5 shadow-sm transition-all"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>{isAr ? 'إضافة نشاط جديد +' : 'Add Activity +'}</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white border border-slate-200 rounded-xl p-3 shadow-sm flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder={isAr ? 'بحث في الأنشطة أو الكود...' : 'Search activities or codes...'}
            className="w-full bg-slate-50 border border-slate-300 rounded-lg pr-9 pl-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-amber-600"
          />
        </div>

        <div className="flex items-center gap-2">
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs font-medium focus:outline-none"
          >
            <option value="all">{isAr ? 'كل الحالات' : 'All Statuses'}</option>
            <option value="on_track">{isAr ? 'مطابق للجدول (On Track)' : 'On Track'}</option>
            <option value="delayed">{isAr ? 'متأخر (Delayed)' : 'Delayed'}</option>
            <option value="completed">{isAr ? 'مكتمل (Completed)' : 'Completed'}</option>
          </select>

          <select
            value={disciplineFilter}
            onChange={e => setDisciplineFilter(e.target.value)}
            className="bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs font-medium focus:outline-none"
          >
            <option value="all">{isAr ? 'كل التخصصات' : 'All Disciplines'}</option>
            {disciplines.map(d => (
              <option key={d.id} value={d.id}>{isAr ? d.nameAr : d.nameEn}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Activities Table with Live Inline Progress Sliders */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-right text-xs">
            <thead className="bg-[#0f2237] text-white text-[11px] font-bold select-none">
              <tr>
                <th className="py-2.5 px-3">{isAr ? 'كود النشاط' : 'Code'}</th>
                <th className="py-2.5 px-3">{isAr ? 'النشاط الهندسي / الوصف' : 'Activity Description'}</th>
                <th className="py-2.5 px-3">{isAr ? 'البند والتخصص' : 'Discipline'}</th>
                <th className="py-2.5 px-3">{isAr ? 'الموقع / Zone' : 'Location Zone'}</th>
                <th className="py-2.5 px-3 min-w-[200px]">{isAr ? 'نسبة الإنجاز الفعلي (تحديث مباشر)' : 'Actual Progress (Live)'}</th>
                <th className="py-2.5 px-3">{isAr ? 'الفترة المخططة' : 'Planned Dates'}</th>
                <th className="py-2.5 px-3 text-center">{isAr ? 'الحالة' : 'Status'}</th>
                <th className="py-2.5 px-3 text-center">{isAr ? 'إجراءات' : 'Actions'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map(act => {
                const disc = discMap.get(act.disciplineId);
                return (
                  <tr key={act.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3 px-3 font-mono font-bold text-slate-800">
                      {act.code}
                    </td>
                    <td className="py-3 px-3">
                      <div className="font-bold text-slate-900">{isAr ? act.nameAr : act.nameEn}</div>
                      <div className="text-[10px] text-slate-500 font-sans">{isAr ? act.nameEn : act.nameAr}</div>
                    </td>
                    <td className="py-3 px-3">
                      <span 
                        className="inline-block px-2 py-0.5 rounded text-[10px] font-bold text-white shadow-xs"
                        style={{ backgroundColor: disc?.color || '#0284c7' }}
                      >
                        {isAr ? disc?.nameAr : disc?.nameEn}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-slate-700 font-medium">
                      {act.zone}
                    </td>
                    
                    {/* Live Progress Adjustment Column */}
                    <td className="py-3 px-3">
                      <div className="flex items-center justify-between text-[11px] mb-1 font-bold">
                        <span className="text-slate-800">{act.actualProgress}%</span>
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => handleQuickProgressUpdate(act, act.actualProgress - 5)}
                            className="px-1.5 py-0.5 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 text-[10px] font-bold"
                            title="-5%"
                          >
                            -5%
                          </button>
                          <button
                            onClick={() => handleQuickProgressUpdate(act, act.actualProgress + 5)}
                            className="px-1.5 py-0.5 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 text-[10px] font-bold"
                            title="+5%"
                          >
                            +5%
                          </button>
                        </div>
                      </div>
                      
                      {/* Interactive Progress Slider */}
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={act.actualProgress}
                        onChange={e => handleQuickProgressUpdate(act, parseInt(e.target.value, 10))}
                        className="w-full accent-amber-600 h-1.5 cursor-pointer"
                      />
                    </td>

                    <td className="py-3 px-3 font-mono text-[11px] text-slate-600 whitespace-nowrap">
                      {act.plannedStartDate} → {act.plannedEndDate}
                    </td>
                    <td className="py-3 px-3 text-center">
                      <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                        act.status === 'completed' 
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' 
                          : act.status === 'delayed'
                          ? 'bg-red-100 text-red-800 border border-red-300'
                          : 'bg-blue-100 text-blue-800 border border-blue-300'
                      }`}>
                        {act.status === 'completed' 
                          ? (isAr ? 'مكتمل' : 'Completed') 
                          : act.status === 'delayed' 
                          ? (isAr ? 'متأخر' : 'Delayed') 
                          : (isAr ? 'مطابق للجدول' : 'On Track')}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          onClick={() => handleEdit(act)}
                          className="p-1 rounded text-slate-600 hover:text-amber-700 hover:bg-slate-100"
                          title={isAr ? 'تعديل' : 'Edit'}
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => {
                            if (window.confirm(isAr ? `هل تريد حذف النشاط ${act.code}؟` : `Delete activity ${act.code}?`)) {
                              onDeleteActivity(act.id);
                            }
                          }}
                          className="p-1 rounded text-slate-400 hover:text-red-600 hover:bg-slate-100"
                          title={isAr ? 'حذف' : 'Delete'}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Activity Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl border border-slate-300 w-full max-w-lg p-5 shadow-2xl text-xs space-y-4">
            <h3 className="font-bold text-sm text-slate-900 border-b pb-2">
              {editingActivity ? (isAr ? 'تعديل نشاط التخطيط' : 'Edit Planning Activity') : (isAr ? 'إضافة نشاط تخطيطي جديد' : 'Add Planning Activity')}
            </h3>

            <form onSubmit={handleSubmit} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-600 mb-1">{isAr ? 'كود النشاط:' : 'Code:'}</label>
                  <input
                    type="text"
                    value={code}
                    onChange={e => setCode(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded px-2.5 py-1.5 font-mono"
                    required
                  />
                </div>
                <div>
                  <label className="block text-slate-600 mb-1">{isAr ? 'البند والتخصص:' : 'Discipline:'}</label>
                  <select
                    value={disciplineId}
                    onChange={e => setDisciplineId(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded px-2.5 py-1.5"
                  >
                    {disciplines.map(d => (
                      <option key={d.id} value={d.id}>{isAr ? d.nameAr : d.nameEn}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-600 mb-1">{isAr ? 'اسم النشاط بالعربية:' : 'Activity Name (Arabic):'}</label>
                <input
                  type="text"
                  value={nameAr}
                  onChange={e => setNameAr(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded px-2.5 py-1.5"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-600 mb-1">{isAr ? 'اسم النشاط بالإنجليزية:' : 'Activity Name (English):'}</label>
                <input
                  type="text"
                  value={nameEn}
                  onChange={e => setNameEn(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded px-2.5 py-1.5"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-600 mb-1">{isAr ? 'الموقع / Zone:' : 'Location Zone:'}</label>
                  <input
                    type="text"
                    value={zone}
                    onChange={e => setZone(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded px-2.5 py-1.5"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 mb-1">{isAr ? 'المقاول المنفذ:' : 'Contractor:'}</label>
                  <input
                    type="text"
                    value={contractor}
                    onChange={e => setContractor(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded px-2.5 py-1.5"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-600 mb-1">{isAr ? 'تاريخ البدء المخطط:' : 'Planned Start:'}</label>
                  <input
                    type="date"
                    value={plannedStartDate}
                    onChange={e => setPlannedStartDate(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded px-2.5 py-1.5"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 mb-1">{isAr ? 'تاريخ الانتهاء المخطط:' : 'Planned End:'}</label>
                  <input
                    type="date"
                    value={plannedEndDate}
                    onChange={e => setPlannedEndDate(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded px-2.5 py-1.5"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-600 mb-1">{isAr ? 'نسبة الإنجاز الفعلي (%):' : 'Actual Progress (%):'}</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={actualProgress}
                    onChange={e => setActualProgress(parseInt(e.target.value, 10) || 0)}
                    className="w-full bg-slate-50 border border-slate-300 rounded px-2.5 py-1.5"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 mb-1">{isAr ? 'حالة النشاط:' : 'Status:'}</label>
                  <select
                    value={status}
                    onChange={e => setStatus(e.target.value as any)}
                    className="w-full bg-slate-50 border border-slate-300 rounded px-2.5 py-1.5"
                  >
                    <option value="on_track">{isAr ? 'مطابق للجدول' : 'On Track'}</option>
                    <option value="delayed">{isAr ? 'متأخر' : 'Delayed'}</option>
                    <option value="completed">{isAr ? 'مكتمل' : 'Completed'}</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold"
                >
                  {isAr ? 'إلغاء' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold"
                >
                  {editingActivity ? (isAr ? 'حفظ التعديلات' : 'Save Changes') : (isAr ? 'إضافة النشاط' : 'Add Activity')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
