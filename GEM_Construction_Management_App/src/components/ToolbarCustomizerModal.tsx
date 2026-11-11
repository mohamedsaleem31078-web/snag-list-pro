import React from 'react';
import { 
  X, Check, Eye, EyeOff, ArrowUp, ArrowDown, 
  RotateCcw, Sliders, CheckSquare, Plus, Printer, 
  Download, Camera, Sparkles, Undo2 
} from 'lucide-react';
import { ToolbarConfig } from '../types';

interface ToolbarCustomizerModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: ToolbarConfig;
  onUpdateConfig: (newConfig: ToolbarConfig) => void;
  language: 'ar' | 'en';
}

const BUTTON_DEFINITIONS: Record<string, { labelAr: string; labelEn: string; icon: any }> = {
  new_snag: { labelAr: 'ملاحظة جديدة (+)', labelEn: 'New Observation (+)', icon: Plus },
  print: { labelAr: 'طباعة وتصدير', labelEn: 'Print & Export', icon: Printer },
  gallery: { labelAr: 'معرض الصور اليومي', labelEn: 'Daily Field Gallery', icon: Camera },
  ai: { labelAr: 'المساعد الذكي (AI)', labelEn: 'AI Assistant', icon: Sparkles },
  download: { labelAr: 'تحميل وتثبيت البرنامج', labelEn: 'Download / Install App', icon: Download },
  undo: { labelAr: 'التراجع والإعادة', labelEn: 'Undo / Redo', icon: Undo2 },
};

export const ToolbarCustomizerModal: React.FC<ToolbarCustomizerModalProps> = ({
  isOpen,
  onClose,
  config,
  onUpdateConfig,
  language,
}) => {
  const isAr = language === 'ar';
  if (!isOpen) return null;

  const safeConfig: ToolbarConfig = config || {
    showNewSnag: true,
    showPrint: true,
    showExcel: true,
    showGallery: true,
    showAiAssistant: true,
    showDownload: true,
    showUndo: true,
    buttonOrder: ['new_snag', 'print', 'gallery', 'ai', 'download', 'undo'],
  };

  const currentOrder = safeConfig.buttonOrder || ['new_snag', 'print', 'gallery', 'ai', 'download', 'undo'];

  const handleToggleVisibility = (key: string) => {
    switch (key) {
      case 'new_snag':
        onUpdateConfig({ ...safeConfig, showNewSnag: !safeConfig.showNewSnag });
        break;
      case 'print':
        onUpdateConfig({ ...safeConfig, showPrint: !safeConfig.showPrint });
        break;
      case 'gallery':
        onUpdateConfig({ ...safeConfig, showGallery: !safeConfig.showGallery });
        break;
      case 'ai':
        onUpdateConfig({ ...safeConfig, showAiAssistant: !safeConfig.showAiAssistant });
        break;
      case 'download':
        onUpdateConfig({ ...safeConfig, showDownload: !safeConfig.showDownload });
        break;
      case 'undo':
        onUpdateConfig({ ...safeConfig, showUndo: !safeConfig.showUndo });
        break;
    }
  };

  const isVisible = (key: string) => {
    switch (key) {
      case 'new_snag': return safeConfig.showNewSnag;
      case 'print': return safeConfig.showPrint;
      case 'gallery': return safeConfig.showGallery;
      case 'ai': return safeConfig.showAiAssistant;
      case 'download': return safeConfig.showDownload;
      case 'undo': return safeConfig.showUndo;
      default: return true;
    }
  };

  const handleMove = (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= currentOrder.length) return;

    const copy = [...currentOrder];
    const temp = copy[index];
    copy[index] = copy[targetIndex];
    copy[targetIndex] = temp;

    onUpdateConfig({
      ...config,
      buttonOrder: copy,
    });
  };

  const handleResetDefaults = () => {
    onUpdateConfig({
      showNewSnag: true,
      showPrint: true,
      showExcel: true,
      showGallery: true,
      showAiAssistant: true,
      showDownload: true,
      showUndo: true,
      buttonOrder: ['new_snag', 'print', 'gallery', 'ai', 'download', 'undo'],
    });
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-slate-300 overflow-hidden flex flex-col font-sans">
        
        {/* Header */}
        <div className="p-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sliders className="w-5 h-5 text-amber-400" />
            <div>
              <h3 className="font-bold text-sm">
                {isAr ? 'تخصيص وترتيب أزرار شريط التحكم' : 'Customize Toolbar Buttons'}
              </h3>
              <p className="text-[10px] text-slate-400">
                {isAr ? 'إظهار أو إخفاء أي زر وإعادة ترتيب مكانه لمنع زحمة الشاشة' : 'Show, hide or reorder buttons to avoid clutter'}
              </p>
            </div>
          </div>

          <button onClick={onClose} className="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* List of Buttons */}
        <div className="p-4 space-y-2.5 max-h-[60vh] overflow-y-auto">
          {currentOrder.map((btnKey, idx) => {
            const def = BUTTON_DEFINITIONS[btnKey] || { labelAr: btnKey, labelEn: btnKey, icon: CheckSquare };
            const visible = isVisible(btnKey);
            const Icon = def.icon;

            return (
              <div
                key={btnKey}
                className={`flex items-center justify-between p-3 rounded-xl border transition-all ${
                  visible
                    ? 'bg-slate-50 border-slate-200 text-slate-900'
                    : 'bg-slate-100/60 border-slate-200/60 text-slate-400 line-through'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="w-6 h-6 rounded-full bg-slate-200 text-slate-700 text-xs font-mono font-bold flex items-center justify-center">
                    {idx + 1}
                  </span>
                  <Icon className={`w-4 h-4 ${visible ? 'text-amber-600' : 'text-slate-400'}`} />
                  <span className="font-semibold text-xs">
                    {isAr ? def.labelAr : def.labelEn}
                  </span>
                </div>

                <div className="flex items-center gap-1.5">
                  {/* Up */}
                  <button
                    onClick={() => handleMove(idx, 'up')}
                    disabled={idx === 0}
                    className="p-1.5 rounded hover:bg-slate-200 disabled:opacity-20 text-slate-600"
                    title={isAr ? 'تحريك لأعلى' : 'Move Up'}
                  >
                    <ArrowUp className="w-3.5 h-3.5" />
                  </button>

                  {/* Down */}
                  <button
                    onClick={() => handleMove(idx, 'down')}
                    disabled={idx === currentOrder.length - 1}
                    className="p-1.5 rounded hover:bg-slate-200 disabled:opacity-20 text-slate-600"
                    title={isAr ? 'تحريك لأسفل' : 'Move Down'}
                  >
                    <ArrowDown className="w-3.5 h-3.5" />
                  </button>

                  {/* Visibility Toggle */}
                  <button
                    onClick={() => handleToggleVisibility(btnKey)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold flex items-center gap-1 transition-colors ${
                      visible
                        ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                        : 'bg-slate-200 text-slate-600 hover:bg-slate-300'
                    }`}
                  >
                    {visible ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                    <span>{visible ? (isAr ? 'ظاهر' : 'Visible') : (isAr ? 'مخفي' : 'Hidden')}</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer Actions */}
        <div className="p-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs">
          <button
            onClick={handleResetDefaults}
            className="text-slate-500 hover:text-slate-800 font-medium flex items-center gap-1"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>{isAr ? 'استعادة الترتيب الافتراضي' : 'Reset Defaults'}</span>
          </button>

          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs shadow-xs"
          >
            {isAr ? 'حفظ وتطبيق' : 'Save & Apply'}
          </button>
        </div>

      </div>
    </div>
  );
};
