import React, { useState } from 'react';
import { X, Plus, Check, Layers, Trash2, Edit2, Sparkles, Tag } from 'lucide-react';
import { Discipline, Observation } from '../types';

interface DisciplineManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  disciplines: Discipline[];
  observations: Observation[];
  onAddDiscipline: (newDisc: Discipline) => void;
  onUpdateDiscipline: (updatedDisc: Discipline) => void;
  onDeleteDiscipline: (discId: string) => void;
}

const PRESET_COLORS = [
  '#f59e0b', // Amber
  '#3b82f6', // Blue
  '#06b6d4', // Cyan
  '#8b5cf6', // Violet
  '#10b981', // Emerald
  '#ef4444', // Red
  '#ec4899', // Pink
  '#f97316', // Orange
  '#14b8a6', // Teal
  '#6366f1', // Indigo
  '#84cc16', // Lime
  '#64748b', // Slate
];

const PRESET_SUGGESTIONS = [
  { code: 'QAQC', nameAr: 'ضبط وتوكيد الجودة', nameEn: 'Quality Assurance & QC', color: '#ec4899' },
  { code: 'FAC', nameAr: 'الواجهات والزجاج والألمنيوم', nameEn: 'Façades & Glazing', color: '#06b6d4' },
  { code: 'WATER', nameAr: 'العزل المائي والحراري', nameEn: 'Waterproofing & Insulation', color: '#3b82f6' },
  { code: 'FIRE', nameAr: 'أنظمة إنذار ومكافحة الحريق', nameEn: 'Fire Fighting & Alarm', color: '#ef4444' },
  { code: 'IRRIG', nameAr: 'شبكات الري والمضخات', nameEn: 'Irrigation & Drainage', color: '#10b981' },
  { code: 'MARB', nameAr: 'أعمال الرخام والجرانيت الخاص', nameEn: 'Marble & Granite Finishes', color: '#f59e0b' },
];

export const DisciplineManagerModal: React.FC<DisciplineManagerModalProps> = ({
  isOpen,
  onClose,
  disciplines,
  observations,
  onAddDiscipline,
  onUpdateDiscipline,
  onDeleteDiscipline,
}) => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [nameAr, setNameAr] = useState('');
  const [nameEn, setNameEn] = useState('');
  const [code, setCode] = useState('');
  const [color, setColor] = useState('#ec4899');

  if (!isOpen) return null;

  const handleApplyPreset = (preset: typeof PRESET_SUGGESTIONS[0]) => {
    setCode(preset.code);
    setNameAr(preset.nameAr);
    setNameEn(preset.nameEn);
    setColor(preset.color);
    setShowAddForm(true);
  };

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nameAr.trim() || !code.trim()) {
      alert('يرجى إدخال اسم البند والكود التسلسلي');
      return;
    }

    const cleanCode = code.toUpperCase().trim().replace(/[^A-Z0-9]/g, '');
    const newDisc: Discipline = {
      id: `disc-${cleanCode.toLowerCase()}-${Date.now()}`,
      code: cleanCode,
      nameAr: nameAr.trim(),
      nameEn: nameEn.trim() || cleanCode,
      color,
      bgLight: `${color}20`,
      border: color,
      icon: 'Layers',
      currentSequence: 0,
    };

    onAddDiscipline(newDisc);
    setNameAr('');
    setNameEn('');
    setCode('');
    setShowAddForm(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden text-slate-100 max-h-[90vh] flex flex-col">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-950 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-500">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">
                إدارة البنود والتخصصات الهندسية (Disciplines Manager)
              </h2>
              <p className="text-xs text-slate-400">
                خصص بنود المشروع وألوان الدبابيس والكود التسلسلي المنفصل لكل تخصص
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

        {/* Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          
          {/* Quick presets recommendation */}
          <div>
            <span className="text-xs font-semibold text-slate-300 block mb-2 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>إضافة سريعة لبنود شائعة في مشاريع المتاحف والإنشاءات الكبرى:</span>
            </span>
            <div className="flex flex-wrap gap-2">
              {PRESET_SUGGESTIONS.map(p => (
                <button
                  key={p.code}
                  onClick={() => handleApplyPreset(p)}
                  className="px-2.5 py-1 rounded-lg bg-slate-950 hover:bg-slate-800 border border-slate-800 hover:border-amber-500/50 text-xs text-slate-300 flex items-center gap-1.5 transition-colors"
                >
                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: p.color }} />
                  <span className="font-mono font-bold text-white">{p.code}:</span>
                  <span>{p.nameAr}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Add New Discipline Form */}
          {showAddForm ? (
            <form onSubmit={handleCreate} className="bg-slate-950 p-4 rounded-xl border border-amber-500/40 space-y-4">
              <h3 className="font-bold text-sm text-amber-400 flex items-center gap-2">
                <Plus className="w-4 h-4" />
                <span>إدخال بيانات البند والتخصص الجديد</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="block text-slate-400 mb-1">اسم البند بالعربية (مثال: عزل مائي، أعمال الواجهات):</label>
                  <input
                    type="text"
                    value={nameAr}
                    onChange={e => setNameAr(e.target.value)}
                    placeholder="اسم البند"
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-amber-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-slate-400 mb-1">الكود التسلسلي المختصر (مثال: WATER, FAC, FIRE):</label>
                  <input
                    type="text"
                    value={code}
                    onChange={e => setCode(e.target.value)}
                    placeholder="PREFIX (e.g. WATER)"
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white font-mono uppercase focus:outline-none focus:border-amber-500"
                    required
                  />
                </div>
              </div>

              {/* Color picker */}
              <div>
                <label className="block text-xs text-slate-400 mb-1.5">لون الدبوس والشارة على المخطط:</label>
                <div className="flex items-center gap-2 flex-wrap">
                  {PRESET_COLORS.map(c => (
                    <button
                      type="button"
                      key={c}
                      onClick={() => setColor(c)}
                      className={`w-7 h-7 rounded-full transition-transform ${
                        color === c ? 'scale-125 ring-2 ring-white border-2 border-slate-900' : 'hover:scale-110'
                      }`}
                      style={{ backgroundColor: c }}
                    />
                  ))}
                  <input
                    type="color"
                    value={color}
                    onChange={e => setColor(e.target.value)}
                    className="w-8 h-8 rounded cursor-pointer bg-transparent border-0"
                    title="اختر لوناً مخصصاً"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs text-slate-300"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center gap-1.5"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>حفظ وإضافة البند</span>
                </button>
              </div>
            </form>
          ) : (
            <button
              onClick={() => setShowAddForm(true)}
              className="w-full py-3 rounded-xl border-2 border-dashed border-slate-800 hover:border-amber-500/50 hover:bg-slate-950/60 text-slate-300 hover:text-amber-400 text-xs font-bold flex items-center justify-center gap-2 transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>إضافة بند / تخصص جديد الآن</span>
            </button>
          )}

          {/* Current Disciplines List */}
          <div className="space-y-2">
            <h4 className="text-xs font-semibold text-slate-400">البنود والتخصصات الحالية بالمشروع:</h4>
            <div className="space-y-2">
              {disciplines.map(d => {
                const count = observations.filter(o => o.disciplineId === d.id).length;
                return (
                  <div
                    key={d.id}
                    className="bg-slate-950 p-3 rounded-xl border border-slate-800 flex items-center justify-between gap-3 text-xs"
                  >
                    <div className="flex items-center gap-3">
                      <span
                        className="w-8 h-8 rounded-lg flex items-center justify-center font-mono font-bold text-white shadow"
                        style={{ backgroundColor: d.color }}
                      >
                        {d.code}
                      </span>
                      <div>
                        <span className="font-bold text-white block">{d.nameAr}</span>
                        <span className="text-slate-400 font-mono text-[11px]">{d.nameEn}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="font-mono px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-300">
                        {count} ملاحظة
                      </span>
                      <span className="text-[11px] text-amber-400 font-mono">
                        نمط السيريال: {d.code}-0001
                      </span>
                      {disciplines.length > 3 && (
                        <button
                          onClick={() => {
                            if (count > 0) {
                              alert(`لا يمكن حذف البند لوجود ${count} ملاحظة مرتبطة به`);
                              return;
                            }
                            if (window.confirm(`هل أنت متأكد من حذف بند ${d.nameAr}؟`)) {
                              onDeleteDiscipline(d.id);
                            }
                          }}
                          className="p-1 rounded text-slate-500 hover:text-red-400"
                          title="حذف البند"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-slate-950 border-t border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
          >
            إغلاق
          </button>
        </div>

      </div>
    </div>
  );
};
