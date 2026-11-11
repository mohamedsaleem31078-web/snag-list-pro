import React, { useState } from 'react';
import { 
  X, Printer, FileSpreadsheet, Download, FileText, 
  Check, Settings, Eye, Image as ImageIcon, Map, 
  CheckSquare, Square, Share2, Copy, Sparkles 
} from 'lucide-react';
import { Discipline, Observation, PrintSettings, ProjectMetadata } from '../types';

interface PrintAndExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  project: ProjectMetadata;
  observations: Observation[];
  disciplines: Discipline[];
  printSettings: PrintSettings;
  onUpdatePrintSettings: (settings: Partial<PrintSettings>) => void;
  onExecutePrint: () => void;
  onExportCSV: () => void;
  onExportJSON: () => void;
  onExportPlanImage: () => void;
}

export const PrintAndExportModal: React.FC<PrintAndExportModalProps> = ({
  isOpen,
  onClose,
  project,
  observations,
  disciplines,
  printSettings,
  onUpdatePrintSettings,
  onExecutePrint,
  onExportCSV,
  onExportJSON,
  onExportPlanImage,
}) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  // Filter count preview
  const filteredCount = observations.filter(o => {
    if (printSettings.selectedDisciplineId !== 'all' && o.disciplineId !== printSettings.selectedDisciplineId) return false;
    if (printSettings.selectedStatus !== 'all' && o.status !== printSettings.selectedStatus) return false;
    return true;
  }).length;

  const handleCopySummary = () => {
    const text = `
مشروع: ${project.projectNameAr} (${project.drawingNumber})
استشاري المشروع: ${project.consultant}
المقاول: ${project.contractor}
إجمالي الملاحظات المرصودة: ${observations.length}
ملاحظات قيد المعالجة والمراجعة: ${observations.filter(o => o.status !== 'closed').length}
ملاحظات معتمدة ومغلقة: ${observations.filter(o => o.status === 'closed').length}
نسبة الإنجاز: ${Math.round((observations.filter(o => o.status === 'closed').length / (observations.length || 1)) * 100)}%
تاريخ التقرير: ${new Date().toLocaleDateString('ar-EG')}
    `.trim();

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-3xl shadow-2xl overflow-hidden text-slate-100 max-h-[92vh] flex flex-col">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-950 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-500">
              <Printer className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                مركز تظبيط وإعدادات الطباعة وتصدير المستندات
                <span className="text-xs px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-mono">
                  Print & Export Hub
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                إعداد تقارير رسمية جاهزة للطباعة، PDF، وملفات Excel، وحفظ نسخ احتياطية
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
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-xs">
          
          {/* 1. Report Type Selection */}
          <div>
            <label className="block text-xs font-bold text-slate-200 mb-2">
              1. نوع التقرير والمستند المراد طباعته أو تصديره:
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[
                {
                  id: 'punch_list',
                  title: 'سجل حصر الملاحظات الشامل (Punch List Register)',
                  desc: 'جدول تفصيلي بكافة البنود، السيريال، الصور المصغرة، وحالات التنفيذ',
                  icon: <FileSpreadsheet className="w-4 h-4 text-cyan-400" />,
                },
                {
                  id: 'single_notice',
                  title: 'إشعار ملاحظة موقع رسمية (Site Observation Notice - SON)',
                  desc: 'نموذج رسمي منفرد بملاحظة معينة مع صور التحديد الهندسية واعتمادات الاستشاري',
                  icon: <FileText className="w-4 h-4 text-amber-400" />,
                },
                {
                  id: 'summary_report',
                  title: 'تقرير ملخص التخصصات والنسب (Executive Summary)',
                  desc: 'ملخص رسومي وإحصائي لتوزيع الملاحظات ومعدلات إغلاق المقاولين',
                  icon: <Sparkles className="w-4 h-4 text-emerald-400" />,
                },
                {
                  id: 'plan_sheet',
                  title: 'مخطط اللوحة الهندسية مع فهرس الدبابيس (Plan & Pins Index)',
                  desc: 'المخطط الرئيسي مع مواقع الدبابيس وجدول إحداثيات المشاكل',
                  icon: <Map className="w-4 h-4 text-purple-400" />,
                },
              ].map(opt => {
                const isSelected = printSettings.reportType === opt.id;
                return (
                  <div
                    key={opt.id}
                    onClick={() => onUpdatePrintSettings({ reportType: opt.id as any })}
                    className={`p-3 rounded-xl border cursor-pointer transition-all ${
                      isSelected
                        ? 'border-amber-400 bg-amber-500/10 shadow-md'
                        : 'border-slate-800 bg-slate-950 hover:border-slate-700 text-slate-400'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      {opt.icon}
                      <span className={`font-bold text-xs ${isSelected ? 'text-white' : 'text-slate-300'}`}>
                        {opt.title}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 leading-relaxed">{opt.desc}</p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 2. Paper Size and Orientation Settings */}
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-4">
            <h4 className="font-bold text-slate-200 flex items-center gap-2">
              <Settings className="w-4 h-4 text-amber-500" />
              <span>2. تظبيط مقاس الورقة واتجاه الصفحة (Paper Layout):</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-slate-400 mb-1.5">مقاس الورقة الهندسي:</label>
                <div className="flex items-center gap-2">
                  {[
                    { id: 'a4', label: 'A4 قياسي' },
                    { id: 'a3', label: 'A3 مخططات كبيرة' },
                    { id: 'letter', label: 'Letter' },
                  ].map(s => (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => onUpdatePrintSettings({ paperSize: s.id as any })}
                      className={`flex-1 py-1.5 rounded-lg border text-center transition-colors ${
                        printSettings.paperSize === s.id
                          ? 'border-amber-400 bg-amber-500 text-slate-950 font-bold'
                          : 'border-slate-700 bg-slate-900 text-slate-300'
                      }`}
                    >
                      {s.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-slate-400 mb-1.5">اتجاه الصفحة:</label>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => onUpdatePrintSettings({ orientation: 'portrait' })}
                    className={`flex-1 py-1.5 rounded-lg border text-center transition-colors ${
                      printSettings.orientation === 'portrait'
                        ? 'border-amber-400 bg-amber-500 text-slate-950 font-bold'
                        : 'border-slate-700 bg-slate-900 text-slate-300'
                    }`}
                  >
                    عمودي (Portrait)
                  </button>
                  <button
                    type="button"
                    onClick={() => onUpdatePrintSettings({ orientation: 'landscape' })}
                    className={`flex-1 py-1.5 rounded-lg border text-center transition-colors ${
                      printSettings.orientation === 'landscape'
                        ? 'border-amber-400 bg-amber-500 text-slate-950 font-bold'
                        : 'border-slate-700 bg-slate-900 text-slate-300'
                    }`}
                  >
                    أفقي (Landscape)
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* 3. Filter Scope */}
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3">
            <h4 className="font-bold text-slate-200">
              3. نطاق وتصفية الملاحظات المراد إدراجها بالتقرير:
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-400 mb-1">حسب التخصص الهندسي:</label>
                <select
                  value={printSettings.selectedDisciplineId}
                  onChange={e => onUpdatePrintSettings({ selectedDisciplineId: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-white focus:outline-none"
                >
                  <option value="all">كافة التخصصات ({disciplines.length})</option>
                  {disciplines.map(d => (
                    <option key={d.id} value={d.id}>{d.code} - {d.nameAr}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-400 mb-1">حسب الحالة التنفيذية:</label>
                <select
                  value={printSettings.selectedStatus}
                  onChange={e => onUpdatePrintSettings({ selectedStatus: e.target.value as any })}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-white focus:outline-none"
                >
                  <option value="all">كل الحالات</option>
                  <option value="open">المفتوحة فقط</option>
                  <option value="in_progress">قيد المعالجة فقط</option>
                  <option value="pending_approval">بانتظار الاعتماد فقط</option>
                  <option value="closed">المغلقة والمعتمدة فقط</option>
                </select>
              </div>
            </div>
            <div className="text-[11px] text-amber-400">
              عدد الملاحظات التي سيتم إدراجها في التقرير: <strong>{filteredCount} ملاحظة</strong>
            </div>
          </div>

          {/* 4. Inclusion Checkboxes */}
          <div>
            <label className="block text-xs font-bold text-slate-200 mb-2">
              4. عناصر التقرير المراد تضمينها:
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {[
                { key: 'includePhotos', label: 'تضمين الصور الميدانية وعلامات التحديد والأسهم' },
                { key: 'includeComments', label: 'تضمين التعليقات وتوصيات مهندس الموقع' },
                { key: 'includeSignatures', label: 'إدراج مربعات توقيع واعتماد الاستشاري والمقاول' },
                { key: 'includeDrawingRef', label: 'تضمين ترويسة المخطط ورقم اللوحة الهندسية' },
                { key: 'includeQrCode', label: 'إدراج ختم التحقق الرقمي والباركود' },
              ].map(item => {
                const checked = Boolean((printSettings as any)[item.key]);
                return (
                  <button
                    key={item.key}
                    type="button"
                    onClick={() => onUpdatePrintSettings({ [item.key]: !checked })}
                    className="flex items-center gap-2.5 p-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-300 hover:border-slate-700 text-right transition-colors"
                  >
                    {checked ? (
                      <CheckSquare className="w-4 h-4 text-amber-400 flex-shrink-0" />
                    ) : (
                      <Square className="w-4 h-4 text-slate-500 flex-shrink-0" />
                    )}
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 5. Direct Export Action Buttons */}
          <div className="border-t border-slate-800 pt-4">
            <span className="text-xs font-bold text-slate-300 block mb-2">
              خيارات التصدير السريع إلى امتدادات أخرى:
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <button
                type="button"
                onClick={onExportCSV}
                className="p-2.5 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-800 hover:border-cyan-500/50 text-slate-200 flex flex-col items-center justify-center gap-1 transition-all"
              >
                <FileSpreadsheet className="w-5 h-5 text-cyan-400" />
                <span className="font-bold text-[11px]">Excel / CSV</span>
                <span className="text-[10px] text-slate-400">جدول بالعربية</span>
              </button>

              <button
                type="button"
                onClick={onExportPlanImage}
                className="p-2.5 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-800 hover:border-amber-500/50 text-slate-200 flex flex-col items-center justify-center gap-1 transition-all"
              >
                <ImageIcon className="w-5 h-5 text-amber-400" />
                <span className="font-bold text-[11px]">صورة المخطط</span>
                <span className="text-[10px] text-slate-400">PNG بالدبابيس</span>
              </button>

              <button
                type="button"
                onClick={onExportJSON}
                className="p-2.5 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-800 hover:border-purple-500/50 text-slate-200 flex flex-col items-center justify-center gap-1 transition-all"
              >
                <Download className="w-5 h-5 text-purple-400" />
                <span className="font-bold text-[11px]">نسخة JSON</span>
                <span className="text-[10px] text-slate-400">حفظ قاعدة البيانات</span>
              </button>

              <button
                type="button"
                onClick={handleCopySummary}
                className="p-2.5 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-800 hover:border-emerald-500/50 text-slate-200 flex flex-col items-center justify-center gap-1 transition-all"
              >
                <Copy className="w-5 h-5 text-emerald-400" />
                <span className="font-bold text-[11px]">{copied ? 'تم النسخ!' : 'نسخ الملخص'}</span>
                <span className="text-[10px] text-slate-400">إلى الحافظة</span>
              </button>
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-slate-950 border-t border-slate-800 flex items-center justify-between">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold"
          >
            إلغاء
          </button>

          <button
            onClick={() => {
              onClose();
              onExecutePrint();
            }}
            className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold flex items-center gap-2 shadow-lg shadow-amber-500/20 transition-all"
          >
            <Printer className="w-4 h-4" />
            <span>بدء الطباعة الآن / حفظ كـ PDF</span>
          </button>
        </div>

      </div>
    </div>
  );
};
