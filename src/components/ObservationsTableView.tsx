import React, { useState } from 'react';
import { 
  Search, Filter, Plus, Printer, FileSpreadsheet, 
  Download, Upload, Eye, Edit, Trash2, Camera, 
  MapPin, CheckSquare, Square, Layers, ArrowUpDown,
  CheckCircle2, Clock, Wrench, UserCheck, AlertTriangle,
  SlidersHorizontal, EyeOff
} from 'lucide-react';
import { Discipline, Observation, ObservationPriority, ObservationStatus, ProjectMetadata, ColumnVisibility } from '../types';
import { getPriorityBadge, getStatusLabel } from '../utils/helpers';

interface ObservationsTableViewProps {
  project: ProjectMetadata;
  observations: Observation[];
  disciplines: Discipline[];
  selectedDisciplineFilter?: string;
  onSelectObservation: (obs: Observation) => void;
  onEditObservation: (obs: Observation) => void;
  onDeleteObservation: (obsId: string) => void;
  onQuickStatusChange: (obsId: string, newStatus: ObservationStatus) => void;
  onOpenNewObservation: () => void;
  onOpenPrintModal: () => void;
  onExportCSV: () => void;
  onExportJSON: () => void;
  onImportJSON: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onOpenDisciplineManager: () => void;
  language?: 'ar' | 'en';
}

export const ObservationsTableView: React.FC<ObservationsTableViewProps> = ({
  project,
  observations,
  disciplines,
  selectedDisciplineFilter = 'all',
  onSelectObservation,
  onEditObservation,
  onDeleteObservation,
  onQuickStatusChange,
  onOpenNewObservation,
  onOpenPrintModal,
  onExportCSV,
  onExportJSON,
  onImportJSON,
  onOpenDisciplineManager,
  language = 'ar',
}) => {
  const isAr = language === 'ar';
  const [searchQuery, setSearchQuery] = useState('');
  const [disciplineFilter, setDisciplineFilter] = useState<string>(selectedDisciplineFilter);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [contractorFilter, setContractorFilter] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // Column Visibility (Requested by user: ability to hide Contractor and any unwanted columns)
  const [showColumnDropdown, setShowColumnDropdown] = useState(false);
  const [cols, setCols] = useState<ColumnVisibility>({
    serial: true,
    discipline: true,
    location: true,
    description: true,
    contractor: true, // User requested hide feature!
    photos: true,
    priority: true,
    status: true,
    dueDate: true,
    inspector: true,
    actions: true,
  });

  const discMap = new Map(disciplines.map(d => [d.id, d]));
  const contractors = Array.from(new Set(observations.map(o => o.contractor).filter(Boolean)));

  // Filter observations
  const filtered = observations.filter(obs => {
    if (disciplineFilter !== 'all' && obs.disciplineId !== disciplineFilter) return false;
    if (statusFilter !== 'all' && obs.status !== statusFilter) return false;
    if (priorityFilter !== 'all' && obs.priority !== priorityFilter) return false;
    if (contractorFilter !== 'all' && obs.contractor !== contractorFilter) return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchSerial = obs.serialNumber.toLowerCase().includes(q);
      const matchTitle = obs.title.toLowerCase().includes(q);
      const matchDesc = (obs.description || '').toLowerCase().includes(q);
      const matchZone = (obs.locationZone || '').toLowerCase().includes(q);
      const matchContractor = (obs.contractor || '').toLowerCase().includes(q);
      const matchInspector = (obs.inspectorName || '').toLowerCase().includes(q);
      if (!matchSerial && !matchTitle && !matchDesc && !matchZone && !matchContractor && !matchInspector) {
        return false;
      }
    }
    return true;
  });

  const toggleSelectAll = () => {
    if (selectedIds.length === filtered.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filtered.map(o => o.id));
    }
  };

  const toggleSelectOne = (id: string) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const handleBulkStatusChange = (newStatus: ObservationStatus) => {
    if (selectedIds.length === 0) return;
    selectedIds.forEach(id => onQuickStatusChange(id, newStatus));
    setSelectedIds([]);
  };

  return (
    <div className="space-y-4 text-slate-800">
      
      {/* 1. Header & Actions Strip */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm flex flex-col lg:flex-row items-start lg:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">
              {isAr ? 'Snags / سجل وحصر الملاحظات الهندسية' : 'Snags / Master Observation Punch List'}
            </h2>
            <span className="px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 font-mono text-xs font-bold border border-slate-300">
              {filtered.length} {isAr ? 'من' : 'of'} {observations.length}
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            {isAr 
              ? 'متابعة دقيقة لكافة الملاحظات الهندسية مع إمكانية إخفاء أي أعمدة (مثل المقاول) وتصدير وطباعة البيانات'
              : 'Enterprise inspection log with column customization, Excel export, and status tracking'}
          </p>
        </div>

        {/* Buttons Group */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Column Visibility Dropdown Toggle */}
          <div className="relative">
            <button
              onClick={() => setShowColumnDropdown(prev => !prev)}
              className="px-3 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 border border-slate-300 text-slate-800 font-bold text-xs flex items-center gap-1.5 transition-colors"
              title={isAr ? 'تحديد وإخفاء الأعمدة' : 'Customize Columns'}
            >
              <SlidersHorizontal className="w-3.5 h-3.5 text-slate-600" />
              <span>{isAr ? 'إظهار/إخفاء الأعمدة' : 'Columns'}</span>
              {!cols.contractor && (
                <span className="w-2 h-2 rounded-full bg-red-500" title="المقاول مخفي" />
              )}
            </button>

            {showColumnDropdown && (
              <div className="absolute right-0 top-full mt-1 w-56 bg-white border border-slate-300 rounded-xl shadow-xl p-3 z-30 text-xs space-y-2">
                <div className="font-bold text-slate-900 border-b pb-1.5 mb-1.5 flex items-center justify-between">
                  <span>{isAr ? 'أعمدة الجدول والطباعة:' : 'Columns Visibility:'}</span>
                  <button onClick={() => setShowColumnDropdown(false)} className="text-slate-400 hover:text-slate-800">✕</button>
                </div>

                <label className="flex items-center gap-2 cursor-pointer hover:bg-slate-50 p-1 rounded">
                  <input
                    type="checkbox"
                    checked={cols.contractor}
                    onChange={e => setCols(prev => ({ ...prev, contractor: e.target.checked }))}
                    className="accent-amber-600"
                  />
                  <span className="font-semibold text-slate-800">{isAr ? 'المقاول المنفذ (Contractor)' : 'Contractor'}</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer hover:bg-slate-50 p-1 rounded">
                  <input
                    type="checkbox"
                    checked={cols.location}
                    onChange={e => setCols(prev => ({ ...prev, location: e.target.checked }))}
                    className="accent-amber-600"
                  />
                  <span>{isAr ? 'الموقع / Location Zone' : 'Location Zone'}</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer hover:bg-slate-50 p-1 rounded">
                  <input
                    type="checkbox"
                    checked={cols.photos}
                    onChange={e => setCols(prev => ({ ...prev, photos: e.target.checked }))}
                    className="accent-amber-600"
                  />
                  <span>{isAr ? 'عمود الصور المعاينة' : 'Photos'}</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer hover:bg-slate-50 p-1 rounded">
                  <input
                    type="checkbox"
                    checked={cols.priority}
                    onChange={e => setCols(prev => ({ ...prev, priority: e.target.checked }))}
                    className="accent-amber-600"
                  />
                  <span>{isAr ? 'درجة الخطورة (Priority)' : 'Priority'}</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer hover:bg-slate-50 p-1 rounded">
                  <input
                    type="checkbox"
                    checked={cols.status}
                    onChange={e => setCols(prev => ({ ...prev, status: e.target.checked }))}
                    className="accent-amber-600"
                  />
                  <span>{isAr ? 'الحالة (Status)' : 'Status'}</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer hover:bg-slate-50 p-1 rounded">
                  <input
                    type="checkbox"
                    checked={cols.dueDate}
                    onChange={e => setCols(prev => ({ ...prev, dueDate: e.target.checked }))}
                    className="accent-amber-600"
                  />
                  <span>{isAr ? 'تاريخ الاستحقاق' : 'Due Date'}</span>
                </label>
              </div>
            )}
          </div>

          <button
            onClick={onOpenNewObservation}
            className="px-4 py-2 rounded-lg bg-[#b47728] hover:bg-[#996521] text-white font-bold text-xs flex items-center gap-1.5 shadow-sm transition-all"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>{isAr ? 'إضافة ملاحظة جديدة +' : 'Add Observation +'}</span>
          </button>

          <button
            onClick={onOpenPrintModal}
            className="px-3.5 py-2 rounded-lg bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 font-bold text-xs flex items-center gap-1.5 shadow-sm transition-all"
          >
            <Printer className="w-3.5 h-3.5 text-slate-600" />
            <span>{isAr ? 'طباعة السجل' : 'Print Punch List'}</span>
          </button>

          <button
            onClick={onExportCSV}
            className="px-3.5 py-2 rounded-lg bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 font-bold text-xs flex items-center gap-1.5 shadow-sm transition-all"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
            <span>{isAr ? 'تصدير Excel' : 'Export Excel'}</span>
          </button>

          <button
            onClick={onExportJSON}
            className="px-3 py-2 rounded-lg bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 font-medium text-xs flex items-center gap-1.5 shadow-sm transition-all"
            title="تحميل نسخة محمولة"
          >
            <Download className="w-3.5 h-3.5 text-amber-600" />
            <span className="hidden sm:inline">{isAr ? 'نسخة محمولة' : 'Portable Backup'}</span>
          </button>

          <label className="cursor-pointer px-3 py-2 rounded-lg bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 font-medium text-xs flex items-center gap-1.5 shadow-sm transition-all">
            <Upload className="w-3.5 h-3.5 text-blue-600" />
            <span className="hidden sm:inline">{isAr ? 'استيراد' : 'Import'}</span>
            <input
              type="file"
              accept=".gemdata,.json"
              onChange={onImportJSON}
              className="hidden"
            />
          </label>
        </div>
      </div>

      {/* 2. Filter Strip */}
      <div className="bg-white border border-slate-200 rounded-xl p-3 shadow-sm flex flex-wrap items-center justify-between gap-3 text-xs">
        
        {/* Search */}
        <div className="relative flex-1 min-w-[200px]">
          <Search className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder={isAr ? 'بحث برقم السيريال، الوصف، الموقع، المهندس...' : 'Search serial, title, zone, inspector...'}
            className="w-full bg-slate-50 border border-slate-300 rounded-lg pr-9 pl-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-amber-600"
          />
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Discipline */}
          <select
            value={disciplineFilter}
            onChange={e => setDisciplineFilter(e.target.value)}
            className="bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs font-medium focus:outline-none"
          >
            <option value="all">{isAr ? 'كل التخصصات' : 'All Disciplines'}</option>
            {disciplines.map(d => (
              <option key={d.id} value={d.id}>
                {d.code} - {isAr ? d.nameAr : d.nameEn}
              </option>
            ))}
          </select>

          {/* Status */}
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs font-medium focus:outline-none"
          >
            <option value="all">{isAr ? 'كل الحالات' : 'All Statuses'}</option>
            <option value="open">OPEN / مفتوحة</option>
            <option value="in_progress">IN PROGRESS / قيد التنفيذ</option>
            <option value="verified">VERIFIED / تم التحقق</option>
            <option value="reopened">REOPENED / أُعيد فتحها</option>
            <option value="closed">CLOSED / مغلقة</option>
            <option value="disputed">DISPUTED / متنازع عليها</option>
          </select>

          {/* Priority */}
          <select
            value={priorityFilter}
            onChange={e => setPriorityFilter(e.target.value)}
            className="bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs font-medium focus:outline-none"
          >
            <option value="all">{isAr ? 'كل درجات الأولوية' : 'All Priorities'}</option>
            <option value="critical">حرجة جداً / Critical</option>
            <option value="high">عالية / High</option>
            <option value="medium">متوسطة / Medium</option>
            <option value="low">منخفضة / Low</option>
          </select>

          {/* Contractor Filter */}
          {cols.contractor && (
            <select
              value={contractorFilter}
              onChange={e => setContractorFilter(e.target.value)}
              className="bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs font-medium focus:outline-none"
            >
              <option value="all">{isAr ? 'كل المقاولين' : 'All Contractors'}</option>
              {contractors.map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          )}

          {/* View mode */}
          <div className="flex items-center bg-slate-100 rounded-lg p-0.5 border border-slate-200">
            <button
              onClick={() => setViewMode('table')}
              className={`px-3 py-1 rounded text-xs font-bold transition-colors ${
                viewMode === 'table' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {isAr ? 'جدول' : 'Table'}
            </button>
            <button
              onClick={() => setViewMode('cards')}
              className={`px-3 py-1 rounded text-xs font-bold transition-colors ${
                viewMode === 'cards' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {isAr ? 'بطاقات' : 'Cards'}
            </button>
          </div>
        </div>

      </div>

      {/* Bulk actions */}
      {selectedIds.length > 0 && (
        <div className="bg-amber-50 border border-amber-300 rounded-xl p-3 flex flex-wrap items-center justify-between gap-3 text-xs text-amber-900">
          <div className="flex items-center gap-2">
            <span className="font-bold">{selectedIds.length} {isAr ? 'ملاحظة محددة' : 'Selected'}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-slate-700 font-medium">{isAr ? 'تحديث الحالة إلى:' : 'Update status to:'}</span>
            <button
              onClick={() => handleBulkStatusChange('in_progress')}
              className="px-2.5 py-1 rounded bg-orange-600 text-white font-bold"
            >
              قيد التنفيذ
            </button>
            <button
              onClick={() => handleBulkStatusChange('verified')}
              className="px-2.5 py-1 rounded bg-teal-600 text-white font-bold"
            >
              تم التحقق
            </button>
            <button
              onClick={() => handleBulkStatusChange('closed')}
              className="px-2.5 py-1 rounded bg-emerald-600 text-white font-bold"
            >
              مغلقة
            </button>
            <button
              onClick={() => setSelectedIds([])}
              className="px-2.5 py-1 rounded bg-slate-200 hover:bg-slate-300 text-slate-700 font-medium"
            >
              إلغاء التحديد
            </button>
          </div>
        </div>
      )}

      {/* 3. Table View with Dynamic Column Visibility */}
      {viewMode === 'table' ? (
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs">
              <thead className="bg-[#0f2237] text-white text-[11px] font-bold select-none">
                <tr>
                  <th className="py-2.5 px-3 w-8 text-center">
                    <button onClick={toggleSelectAll} className="text-slate-300 hover:text-white">
                      {selectedIds.length === filtered.length && filtered.length > 0 ? (
                        <CheckSquare className="w-4 h-4 text-amber-400" />
                      ) : (
                        <Square className="w-4 h-4" />
                      )}
                    </button>
                  </th>
                  {cols.serial && <th className="py-2.5 px-3">ID / الرقم</th>}
                  {cols.discipline && <th className="py-2.5 px-3">البند والتخصص</th>}
                  {cols.location && <th className="py-2.5 px-3">الموقع / LOCATION</th>}
                  {cols.description && <th className="py-2.5 px-3">الوصف الفني للملاحظة</th>}
                  {cols.contractor && <th className="py-2.5 px-3">المقاول</th>}
                  {cols.photos && <th className="py-2.5 px-3">الصور</th>}
                  {cols.priority && <th className="py-2.5 px-3">الخطورة</th>}
                  {cols.status && <th className="py-2.5 px-3 text-center">STATUS / الحالة</th>}
                  {cols.actions && <th className="py-2.5 px-3 text-center">إجراءات</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={10} className="py-12 text-center text-slate-500">
                      {isAr ? 'لا توجد ملاحظات مطابقة لمعايير البحث' : 'No observations found matching filter'}
                    </td>
                  </tr>
                ) : (
                  filtered.map(obs => {
                    const disc = discMap.get(obs.disciplineId);
                    const statusInfo = getStatusLabel(obs.status);
                    const priorityInfo = getPriorityBadge(obs.priority);
                    const isSelected = selectedIds.includes(obs.id);

                    return (
                      <tr
                        key={obs.id}
                        className={`hover:bg-slate-50 transition-colors ${
                          isSelected ? 'bg-amber-50/60' : ''
                        }`}
                      >
                        <td className="py-2.5 px-3 text-center">
                          <button
                            onClick={() => toggleSelectOne(obs.id)}
                            className="text-slate-400 hover:text-slate-700"
                          >
                            {isSelected ? (
                              <CheckSquare className="w-4 h-4 text-amber-600" />
                            ) : (
                              <Square className="w-4 h-4" />
                            )}
                          </button>
                        </td>

                        {cols.serial && (
                          <td className="py-2.5 px-3 font-mono font-bold text-slate-900 whitespace-nowrap">
                            <span
                              onClick={() => onSelectObservation(obs)}
                              className="cursor-pointer hover:text-amber-700 transition-colors"
                            >
                              {obs.serialNumber}
                            </span>
                          </td>
                        )}

                        {cols.discipline && (
                          <td className="py-2.5 px-3 whitespace-nowrap">
                            <span 
                              className="inline-block px-2 py-0.5 rounded text-[10px] font-bold text-white shadow-xs"
                              style={{ backgroundColor: disc?.color || '#0284c7' }}
                            >
                              {isAr ? disc?.nameAr : disc?.nameEn}
                            </span>
                          </td>
                        )}

                        {cols.location && (
                          <td className="py-2.5 px-3 text-slate-600 font-medium whitespace-nowrap">
                            {obs.locationZone}
                          </td>
                        )}

                        {cols.description && (
                          <td className="py-2.5 px-3 max-w-sm">
                            <div 
                              onClick={() => onSelectObservation(obs)}
                              className="font-bold text-slate-900 hover:text-amber-700 cursor-pointer truncate"
                            >
                              {obs.title}
                            </div>
                          </td>
                        )}

                        {cols.contractor && (
                          <td className="py-2.5 px-3 text-slate-600 truncate max-w-[140px]">
                            {obs.contractor}
                          </td>
                        )}

                        {cols.photos && (
                          <td className="py-2.5 px-3 whitespace-nowrap">
                            {obs.photos?.length > 0 ? (
                              <span className="font-mono text-[11px] text-slate-600 flex items-center gap-1">
                                <Camera className="w-3.5 h-3.5 text-amber-600" />
                                <span>{obs.photos.length}</span>
                              </span>
                            ) : (
                              <span className="text-slate-400 text-[10px]">-</span>
                            )}
                          </td>
                        )}

                        {cols.priority && (
                          <td className="py-2.5 px-3 whitespace-nowrap">
                            <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${priorityInfo.badge}`}>
                              {isAr ? priorityInfo.textAr : priorityInfo.textEn}
                            </span>
                          </td>
                        )}

                        {cols.status && (
                          <td className="py-2.5 px-3 text-center whitespace-nowrap">
                            <select
                              value={obs.status}
                              onChange={e => onQuickStatusChange(obs.id, e.target.value as ObservationStatus)}
                              className={`border text-[10px] font-bold rounded-full px-2.5 py-0.5 cursor-pointer shadow-xs focus:outline-none ${statusInfo.pillBg} ${statusInfo.pillText}`}
                            >
                              <option value="open">OPEN / مفتوحة</option>
                              <option value="in_progress">IN PROGRESS / قيد التنفيذ</option>
                              <option value="verified">VERIFIED / تم التحقق</option>
                              <option value="reopened">REOPENED / أُعيد فتحها</option>
                              <option value="closed">CLOSED / مغلقة</option>
                              <option value="disputed">DISPUTED / متنازع عليها</option>
                              <option value="distributed">DISTRIBUTED / تم التوزيع</option>
                            </select>
                          </td>
                        )}

                        {cols.actions && (
                          <td className="py-2.5 px-3 text-center whitespace-nowrap">
                            <div className="flex items-center justify-center gap-1">
                              <button
                                onClick={() => onSelectObservation(obs)}
                                className="p-1 rounded text-slate-600 hover:text-amber-700 hover:bg-slate-100"
                                title="عرض التفاصيل"
                              >
                                <Eye className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => onEditObservation(obs)}
                                className="p-1 rounded text-slate-600 hover:text-blue-700 hover:bg-slate-100"
                                title="تعديل"
                              >
                                <Edit className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => {
                                  if (window.confirm(isAr ? `هل أنت متأكد من حذف الملاحظة ${obs.serialNumber}؟` : `Delete observation ${obs.serialNumber}?`)) {
                                    onDeleteObservation(obs.id);
                                  }
                                }}
                                className="p-1 rounded text-slate-400 hover:text-red-600 hover:bg-slate-100"
                                title="حذف"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        )}
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* Cards View */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {filtered.map(obs => {
            const disc = discMap.get(obs.disciplineId);
            const statusInfo = getStatusLabel(obs.status);
            const priorityInfo = getPriorityBadge(obs.priority);

            return (
              <div
                key={obs.id}
                className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm flex flex-col justify-between hover:shadow-md transition-all"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-mono font-bold text-xs bg-[#0f2237] text-white px-2 py-0.5 rounded">
                      {obs.serialNumber}
                    </span>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${statusInfo.pillBg} ${statusInfo.pillText}`}>
                      {statusInfo.textAr} / {statusInfo.textEn}
                    </span>
                  </div>

                  <h3
                    onClick={() => onSelectObservation(obs)}
                    className="font-bold text-sm text-slate-900 hover:text-amber-700 cursor-pointer line-clamp-2"
                  >
                    {obs.title}
                  </h3>

                  <div className="text-xs text-slate-500 mt-2 flex items-center justify-between">
                    <span>الموقع: {obs.locationZone}</span>
                    {cols.contractor && <span>{obs.contractor}</span>}
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                  <span className={`text-[10px] px-2 py-0.5 rounded font-bold ${priorityInfo.badge}`}>
                    {priorityInfo.textAr}
                  </span>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => onSelectObservation(obs)}
                      className="p-1.5 rounded bg-slate-100 hover:bg-slate-200 text-slate-700"
                    >
                      <Eye className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => onEditObservation(obs)}
                      className="p-1.5 rounded bg-slate-100 hover:bg-slate-200 text-slate-700"
                    >
                      <Edit className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => onDeleteObservation(obs.id)}
                      className="p-1.5 rounded bg-slate-100 hover:bg-red-50 text-red-600"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

    </div>
  );
};
