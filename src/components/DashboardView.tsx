import React from 'react';
import { 
  Plus, Printer, ArrowUpRight, ChevronRight, 
  ChevronLeft, AlertCircle, Clock, MapPin, CheckCircle, Download 
} from 'lucide-react';
import { Discipline, Observation, ObservationStatus, ProjectMetadata } from '../types';
import { getStatusLabel } from '../utils/helpers';

interface DashboardViewProps {
  project: ProjectMetadata;
  observations: Observation[];
  disciplines: Discipline[];
  onNavigateToPlan: () => void;
  onNavigateToTable: (statusFilter?: ObservationStatus | 'all', disciplineFilter?: string) => void;
  onOpenNewObservation: () => void;
  onSelectObservation: (obs: Observation) => void;
  onOpenPrintModal: () => void;
  onOpenDownloadModal?: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  project,
  observations,
  disciplines,
  onNavigateToPlan,
  onNavigateToTable,
  onOpenNewObservation,
  onSelectObservation,
  onOpenPrintModal,
  onOpenDownloadModal,
}) => {
  // Counts
  const totalCount = observations.length;
  const openCount = observations.filter(o => o.status === 'open').length;
  const inProgressCount = observations.filter(o => o.status === 'in_progress').length;
  const verifiedCount = observations.filter(o => o.status === 'verified').length;
  const reopenedCount = observations.filter(o => o.status === 'reopened').length;
  const closedCount = observations.filter(o => o.status === 'closed').length;
  const disputedCount = observations.filter(o => o.status === 'disputed').length;
  const distributedCount = observations.filter(o => o.status === 'distributed').length;

  const closureRate = totalCount > 0 ? Math.round((closedCount / totalCount) * 100) : 0;
  const agedIssuesCount = observations.filter(o => (o.ageDays || 0) >= 14 && o.status !== 'closed').length;
  const withoutPinsCount = observations.filter(o => !o.pin || (o.pin.x === 0 && o.pin.y === 0)).length;

  return (
    <div className="space-y-4 text-slate-800">
      
      {/* 1. Header Row matching screenshot */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pt-1">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">
            Dashboard / لوحة التحكم
          </h2>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-xs font-mono text-slate-500 font-medium hidden md:inline">
            Project overview · {project.date || '2026-11-10'}
          </span>

          {/* Golden Button: + New Issue / ملاحظة جديدة */}
          <button
            onClick={onOpenNewObservation}
            className="px-4 py-2 rounded-lg bg-[#b47728] hover:bg-[#996521] text-white font-bold text-xs flex items-center gap-1.5 shadow-sm transition-all"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New Issue / ملاحظة جديدة +</span>
          </button>

          {/* White Button: Print / طباعة */}
          <button
            onClick={onOpenPrintModal}
            className="px-3.5 py-2 rounded-lg bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 font-bold text-xs flex items-center gap-1.5 shadow-sm transition-all"
          >
            <Printer className="w-3.5 h-3.5 text-slate-600" />
            <span>طباعة / Print</span>
          </button>
        </div>
      </div>

      {/* 2. Top 8 KPI Metric Cards with colored top borders matching screenshot */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
        
        {/* 1. TOTAL */}
        <div 
          onClick={() => onNavigateToTable('all')}
          className="bg-white border border-slate-200 rounded-xl p-3 shadow-sm border-t-4 border-t-blue-600 hover:shadow-md transition-all cursor-pointer flex flex-col justify-between"
        >
          <div>
            <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-sans">
              {totalCount}
            </div>
            <div className="text-[11px] font-bold text-slate-700 mt-1 uppercase leading-tight">
              TOTAL / إجمالي الملاحظات
            </div>
            <div className="text-[10px] text-slate-500 font-mono">
              SNAGS
            </div>
          </div>
          <div className="text-[10px] text-slate-400 hover:text-blue-600 mt-3 flex items-center gap-0.5">
            <span>Open filtered issues ›</span>
          </div>
        </div>

        {/* 2. OPEN */}
        <div 
          onClick={() => onNavigateToTable('open')}
          className="bg-white border border-slate-200 rounded-xl p-3 shadow-sm border-t-4 border-t-red-500 hover:shadow-md transition-all cursor-pointer flex flex-col justify-between"
        >
          <div>
            <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-sans">
              {openCount}
            </div>
            <div className="text-[11px] font-bold text-slate-700 mt-1 uppercase leading-tight">
              OPEN / مفتوحة
            </div>
          </div>
          <div className="text-[10px] text-slate-400 hover:text-red-600 mt-3 flex items-center gap-0.5">
            <span>Open filtered issues ›</span>
          </div>
        </div>

        {/* 3. IN PROGRESS */}
        <div 
          onClick={() => onNavigateToTable('in_progress')}
          className="bg-white border border-slate-200 rounded-xl p-3 shadow-sm border-t-4 border-t-orange-500 hover:shadow-md transition-all cursor-pointer flex flex-col justify-between"
        >
          <div>
            <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-sans">
              {inProgressCount}
            </div>
            <div className="text-[11px] font-bold text-slate-700 mt-1 uppercase leading-tight">
              IN PROGRESS / قيد التنفيذ
            </div>
          </div>
          <div className="text-[10px] text-slate-400 hover:text-orange-600 mt-3 flex items-center gap-0.5">
            <span>Open filtered issues ›</span>
          </div>
        </div>

        {/* 4. VERIFIED */}
        <div 
          onClick={() => onNavigateToTable('verified')}
          className="bg-white border border-slate-200 rounded-xl p-3 shadow-sm border-t-4 border-t-teal-500 hover:shadow-md transition-all cursor-pointer flex flex-col justify-between"
        >
          <div>
            <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-sans">
              {verifiedCount}
            </div>
            <div className="text-[11px] font-bold text-slate-700 mt-1 uppercase leading-tight">
              VERIFIED / تم التحقق
            </div>
          </div>
          <div className="text-[10px] text-slate-400 hover:text-teal-600 mt-3 flex items-center gap-0.5">
            <span>Open filtered issues ›</span>
          </div>
        </div>

        {/* 5. REOPENED */}
        <div 
          onClick={() => onNavigateToTable('reopened')}
          className="bg-white border border-slate-200 rounded-xl p-3 shadow-sm border-t-4 border-t-purple-600 hover:shadow-md transition-all cursor-pointer flex flex-col justify-between"
        >
          <div>
            <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-sans">
              {reopenedCount}
            </div>
            <div className="text-[11px] font-bold text-slate-700 mt-1 uppercase leading-tight">
              REOPENED / أُعيد فتحها
            </div>
          </div>
          <div className="text-[10px] text-slate-400 hover:text-purple-600 mt-3 flex items-center gap-0.5">
            <span>Open filtered issues ›</span>
          </div>
        </div>

        {/* 6. CLOSED */}
        <div 
          onClick={() => onNavigateToTable('closed')}
          className="bg-white border border-slate-200 rounded-xl p-3 shadow-sm border-t-4 border-t-emerald-600 hover:shadow-md transition-all cursor-pointer flex flex-col justify-between"
        >
          <div>
            <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-sans">
              {closedCount}
            </div>
            <div className="text-[11px] font-bold text-slate-700 mt-1 uppercase leading-tight">
              CLOSED / مغلقة
            </div>
          </div>
          <div className="text-[10px] text-slate-400 hover:text-emerald-600 mt-3 flex items-center gap-0.5">
            <span>Open filtered issues ›</span>
          </div>
        </div>

        {/* 7. DISPUTED */}
        <div 
          onClick={() => onNavigateToTable('disputed')}
          className="bg-white border border-slate-200 rounded-xl p-3 shadow-sm border-t-4 border-t-rose-800 hover:shadow-md transition-all cursor-pointer flex flex-col justify-between"
        >
          <div>
            <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-sans">
              {disputedCount}
            </div>
            <div className="text-[11px] font-bold text-slate-700 mt-1 uppercase leading-tight">
              DISPUTED / متنازع عليها
            </div>
          </div>
          <div className="text-[10px] text-slate-400 hover:text-rose-800 mt-3 flex items-center gap-0.5">
            <span>Open filtered issues ›</span>
          </div>
        </div>

        {/* 8. DISTRIBUTED */}
        <div 
          onClick={() => onNavigateToTable('distributed')}
          className="bg-white border border-slate-200 rounded-xl p-3 shadow-sm border-t-4 border-t-blue-500 hover:shadow-md transition-all cursor-pointer flex flex-col justify-between"
        >
          <div>
            <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-sans">
              {distributedCount}
            </div>
            <div className="text-[11px] font-bold text-slate-700 mt-1 uppercase leading-tight">
              DISTRIBUTED / تم التوزيع
            </div>
          </div>
          <div className="text-[10px] text-slate-400 hover:text-blue-600 mt-3 flex items-center gap-0.5">
            <span>Open filtered issues ›</span>
          </div>
        </div>

      </div>

      {/* 3. Secondary Metrics Row matching screenshot */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        
        {/* Issue closure progress */}
        <div className="bg-white border border-slate-200 rounded-xl p-3.5 shadow-sm">
          <div className="flex items-center justify-between text-xs font-bold text-slate-900 mb-1">
            <span>Issue closure</span>
            <span className="font-mono text-slate-600">{closedCount} / {totalCount} closed</span>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-2 my-2 overflow-hidden border border-slate-200">
            <div 
              className="bg-emerald-500 h-full rounded-full transition-all duration-500"
              style={{ width: `${closureRate}%` }}
            />
          </div>
          <div className="text-[11px] text-slate-600 flex items-center gap-1">
            <span className="font-bold text-slate-900">{closureRate}%</span>
            <span>Issue closure rate, not construction progress</span>
          </div>
        </div>

        {/* Planning data coverage */}
        <div className="bg-white border border-slate-200 rounded-xl p-3.5 shadow-sm">
          <div className="flex items-center justify-between text-xs font-bold text-slate-900 mb-1">
            <span>Planning data coverage</span>
            <span className="font-mono text-slate-600">12 / 79 activities updated</span>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-2 my-2 overflow-hidden border border-slate-200">
            <div 
              className="bg-blue-500 h-full rounded-full"
              style={{ width: `15%` }}
            />
          </div>
          <div className="text-[11px] text-slate-600 flex items-center gap-1">
            <span className="font-bold text-slate-900">15%</span>
            <span>Updates recorded · not actual progress</span>
          </div>
        </div>

        {/* Aged open issues */}
        <div 
          onClick={() => onNavigateToTable('open')}
          className="bg-white border border-slate-200 rounded-xl p-3.5 shadow-sm flex items-center justify-between cursor-pointer hover:border-slate-300 transition-colors"
        >
          <div>
            <div className="text-2xl font-extrabold text-slate-900 font-sans">
              {agedIssuesCount}
            </div>
            <div className="text-xs font-bold text-slate-800">
              Aged open issues
            </div>
            <div className="text-[10px] text-slate-500">
              14+ days · open list ›
            </div>
          </div>
          <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 border border-slate-200">
            <Clock className="w-5 h-5 text-amber-600" />
          </div>
        </div>

        {/* Issues without pins */}
        <div 
          onClick={onNavigateToPlan}
          className="bg-white border border-slate-200 rounded-xl p-3.5 shadow-sm flex items-center justify-between cursor-pointer hover:border-slate-300 transition-colors"
        >
          <div>
            <div className="text-2xl font-extrabold text-slate-900 font-sans">
              {withoutPinsCount}
            </div>
            <div className="text-xs font-bold text-slate-800">
              Issues without pins
            </div>
            <div className="text-[10px] text-slate-500">
              Review locations ›
            </div>
          </div>
          <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 border border-slate-200">
            <MapPin className="w-5 h-5 text-slate-500" />
          </div>
        </div>

      </div>

      {/* 4. Bottom Two Columns: By Discipline & Latest Observations matching screenshot */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        
        {/* Left Column: By discipline / حسب التخصص (5 Cols) */}
        <div className="lg:col-span-5 bg-white border border-slate-200 rounded-xl p-4 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
              <h3 className="font-bold text-sm text-slate-900">
                By discipline / حسب التخصص
              </h3>
              <button
                onClick={() => onNavigateToTable('all')}
                className="text-xs text-slate-500 hover:text-amber-700 flex items-center gap-0.5 font-medium"
              >
                <span>Open snag log ›</span>
              </button>
            </div>

            {/* List of Disciplines with colored bars matching the screenshot */}
            <div className="space-y-4 my-2">
              {disciplines.map(d => {
                const discObs = observations.filter(o => o.disciplineId === d.id);
                const count = discObs.length;
                const percentage = totalCount > 0 ? (count / totalCount) * 100 : 0;

                return (
                  <div 
                    key={d.id} 
                    onClick={() => onNavigateToTable('all', d.id)}
                    className="cursor-pointer group"
                  >
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="font-bold text-slate-800 group-hover:text-amber-600 transition-colors">
                        {d.nameAr} / {d.nameEn}
                      </span>
                      <span className="font-mono font-bold text-slate-800 text-sm">
                        {count}
                      </span>
                    </div>

                    {/* Colored Progress Bar */}
                    <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-300"
                        style={{
                          width: `${Math.max(percentage, count > 0 ? 8 : 0)}%`,
                          backgroundColor: d.color,
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 mt-4 text-[11px] text-slate-500 text-left">
            Total active disciplines: {disciplines.length}
          </div>
        </div>

        {/* Right Column: Latest observations Table matching screenshot (7 Cols) */}
        <div className="lg:col-span-7 bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden flex flex-col">
          
          <div className="flex items-center justify-between p-3.5 border-b border-slate-100">
            <h3 className="font-bold text-sm text-slate-900">
              Latest observations
            </h3>
            <button
              onClick={() => onNavigateToTable('all')}
              className="text-xs text-slate-500 hover:text-amber-700 flex items-center gap-0.5 font-medium"
            >
              <span>View all ›</span>
            </button>
          </div>

          {/* Dark Navy Table Header like in screenshot */}
          <div className="overflow-x-auto flex-1">
            <table className="w-full text-right text-xs">
              <thead className="bg-[#0f2237] text-white text-[11px] font-bold select-none">
                <tr>
                  <th className="py-2.5 px-3">ID / الرقم</th>
                  <th className="py-2.5 px-3">LOCATION / الموقع</th>
                  <th className="py-2.5 px-3">DESCRIPTION / الوصف</th>
                  <th className="py-2.5 px-3 text-center">STATUS / الحالة</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {observations.slice(0, 6).map(obs => {
                  const statusInfo = getStatusLabel(obs.status);
                  return (
                    <tr
                      key={obs.id}
                      onClick={() => onSelectObservation(obs)}
                      className="hover:bg-slate-50 transition-colors cursor-pointer"
                    >
                      <td className="py-2.5 px-3 font-mono font-bold text-slate-900 whitespace-nowrap">
                        {obs.serialNumber}
                      </td>
                      <td className="py-2.5 px-3 text-slate-600 font-medium whitespace-nowrap">
                        {obs.locationZone}
                      </td>
                      <td className="py-2.5 px-3 text-slate-800 max-w-xs truncate font-medium">
                        {obs.title}
                      </td>
                      <td className="py-2.5 px-3 text-center whitespace-nowrap">
                        <span 
                          className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold shadow-xs ${statusInfo.pillBg} ${statusInfo.pillText}`}
                        >
                          {statusInfo.textAr} / {statusInfo.textEn}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

        </div>

      </div>

    </div>
  );
};
