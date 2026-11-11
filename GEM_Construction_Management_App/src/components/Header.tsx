import React from 'react';
import { 
  LayoutDashboard, Map, CheckSquare, Calendar, 
  FileText, Settings, Download, Camera, 
  Sparkles, Undo2, Redo2, Sliders, Globe, Layers
} from 'lucide-react';
import { ProjectMetadata, ToolbarConfig } from '../types';

interface HeaderProps {
  project: ProjectMetadata;
  activeTab: 'dashboard' | 'plan' | 'table' | 'planning' | 'reports' | 'photo_studio' | 'gallery' | 'settings';
  setActiveTab: (tab: 'dashboard' | 'plan' | 'table' | 'planning' | 'reports' | 'photo_studio' | 'gallery' | 'settings') => void;
  onOpenNewObservation: () => void;
  onOpenPrintModal: () => void;
  onOpenDownloadModal: () => void;
  onOpenAiDrawer: () => void;
  onOpenToolbarCustomizer: () => void;
  toolbarConfig?: ToolbarConfig;
  language: 'ar' | 'en';
  onToggleLanguage: () => void;
  canUndo?: boolean;
  canRedo?: boolean;
  onUndo?: () => void;
  onRedo?: () => void;
  isSaved?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  project,
  activeTab,
  setActiveTab,
  onOpenNewObservation,
  onOpenPrintModal,
  onOpenDownloadModal,
  onOpenAiDrawer,
  onOpenToolbarCustomizer,
  toolbarConfig,
  language,
  onToggleLanguage,
  canUndo = false,
  canRedo = false,
  onUndo,
  onRedo,
  isSaved = true,
}) => {
  const isAr = language === 'ar';
  const safeToolbar: ToolbarConfig = toolbarConfig || {
    showNewSnag: true,
    showPrint: true,
    showExcel: true,
    showGallery: true,
    showAiAssistant: true,
    showDownload: true,
    showUndo: true,
    buttonOrder: ['new_snag', 'print', 'gallery', 'ai', 'download', 'undo'],
  };

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-40 shadow-sm no-print">
      
      {/* 1. Official Letterhead Row: Pure Logo & Title Area (NO buttons here as requested) */}
      <div className="px-4 sm:px-8 py-2.5 flex items-center justify-between border-b border-slate-200 bg-white">
        
        {/* Left: Official Grand Egyptian Museum Logo (From user attachment) */}
        <div className="flex items-center shrink-0">
          <img
            src="/assets/aistudio/gem_official_logo.jpg"
            alt="المتحف المصري الكبير - Grand Egyptian Museum"
            className="h-11 sm:h-13 w-auto object-contain"
          />
        </div>

        {/* Center: Official Title */}
        <div className="text-center px-2">
          <h1 className="text-base sm:text-xl font-extrabold text-slate-900 tracking-tight">
            GEM Construction Management
          </h1>
          <span className="text-[11px] font-semibold text-amber-700 block">
            مشروع المتحف المصري الكبير · الجيزة - مصر
          </span>
        </div>

        {/* Right: Official Hill International & EHAF Consulting Engineers Logo (From user attachment) */}
        <div className="flex items-center shrink-0">
          <img
            src="/assets/aistudio/hill_ehaf_official_logo.jpg"
            alt="Hill International - EHAF Consulting Engineers"
            className="h-8 sm:h-10 w-auto object-contain"
          />
        </div>

      </div>

      {/* 2. Dark Navy Navigation Tab Bar & Neatly Spaced Control Action Buttons (No interference or overlap) */}
      <div className="bg-[#0f2237] px-3 sm:px-6 lg:px-8 flex flex-col md:flex-row items-stretch md:items-center justify-between text-xs select-none gap-2 py-1.5">
        
        {/* Navigation Tabs */}
        <nav className="flex items-center gap-1.5 overflow-x-auto py-1 scrollbar-none">
          
          {/* Tab 1: Dashboard */}
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold text-xs whitespace-nowrap transition-all shrink-0 ${
              activeTab === 'dashboard'
                ? 'bg-amber-700/80 text-amber-200 border border-amber-500/50 shadow-inner'
                : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <LayoutDashboard className="w-3.5 h-3.5 text-amber-400" />
            <span>Dashboard / {isAr ? 'لوحة التحكم' : 'Dashboard'}</span>
          </button>

          {/* Tab 2: Drawings & Location */}
          <button
            onClick={() => setActiveTab('plan')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold text-xs whitespace-nowrap transition-all shrink-0 ${
              activeTab === 'plan'
                ? 'bg-amber-700/80 text-amber-200 border border-amber-500/50 shadow-inner'
                : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Map className="w-3.5 h-3.5 text-amber-400" />
            <span>Drawings / {isAr ? 'المخططات والمواقع' : 'Drawings'}</span>
          </button>

          {/* Tab 3: Snags */}
          <button
            onClick={() => setActiveTab('table')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold text-xs whitespace-nowrap transition-all shrink-0 ${
              activeTab === 'table'
                ? 'bg-amber-700/80 text-amber-200 border border-amber-500/50 shadow-inner'
                : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <CheckSquare className="w-3.5 h-3.5 text-amber-400" />
            <span>Snags / {isAr ? 'الملاحظات' : 'Snags'}</span>
          </button>

          {/* Tab 4: Planning */}
          <button
            onClick={() => setActiveTab('planning')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold text-xs whitespace-nowrap transition-all shrink-0 ${
              activeTab === 'planning'
                ? 'bg-amber-700/80 text-amber-200 border border-amber-500/50 shadow-inner'
                : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Calendar className="w-3.5 h-3.5 text-amber-400" />
            <span>Planning / {isAr ? 'التخطيط' : 'Planning'}</span>
          </button>

          {/* Tab 5: Photo Report Studio */}
          <button
            onClick={() => setActiveTab('photo_studio')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold text-xs whitespace-nowrap transition-all shrink-0 ${
              activeTab === 'photo_studio'
                ? 'bg-amber-700/80 text-amber-200 border border-amber-500/50 shadow-inner'
                : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <FileText className="w-3.5 h-3.5 text-amber-400" />
            <span>{isAr ? 'استوديو التقارير المصورة' : 'Photo Report Studio'}</span>
          </button>

          {/* Tab 6: Daily Field Gallery */}
          <button
            onClick={() => setActiveTab('gallery')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold text-xs whitespace-nowrap transition-all shrink-0 ${
              activeTab === 'gallery'
                ? 'bg-amber-700/80 text-amber-200 border border-amber-500/50 shadow-inner'
                : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Camera className="w-3.5 h-3.5 text-amber-400" />
            <span>{isAr ? 'معرض الصور اليومي' : 'Field Gallery'}</span>
          </button>

          {/* Tab 7: Reports */}
          <button
            onClick={() => setActiveTab('reports')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold text-xs whitespace-nowrap transition-all shrink-0 ${
              activeTab === 'reports'
                ? 'bg-amber-700/80 text-amber-200 border border-amber-500/50 shadow-inner'
                : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Layers className="w-3.5 h-3.5 text-amber-400" />
            <span>Reports / {isAr ? 'التقارير' : 'Reports'}</span>
          </button>

          {/* Tab 8: Settings */}
          <button
            onClick={() => setActiveTab('settings')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold text-xs whitespace-nowrap transition-all shrink-0 ${
              activeTab === 'settings'
                ? 'bg-amber-700/80 text-amber-200 border border-amber-500/50 shadow-inner'
                : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Settings className="w-3.5 h-3.5 text-amber-400" />
            <span>Settings / {isAr ? 'الإعدادات' : 'Settings'}</span>
          </button>

        </nav>

        {/* Clean, Non-Overlapping Action Control Strip */}
        <div className="flex items-center justify-end gap-2 shrink-0 py-1 border-t md:border-t-0 border-slate-800/80">
          
          {/* Universal Undo / Redo */}
          {safeToolbar.showUndo && (
            <div className="flex items-center bg-slate-900/90 rounded-lg p-0.5 border border-slate-700/80 shrink-0">
              <button
                onClick={onUndo}
                disabled={!canUndo}
                className="p-1.5 text-slate-300 hover:text-white disabled:opacity-30 rounded hover:bg-slate-800 transition-colors"
                title={isAr ? 'تراجع (Ctrl+Z)' : 'Undo (Ctrl+Z)'}
              >
                <Undo2 className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={onRedo}
                disabled={!canRedo}
                className="p-1.5 text-slate-300 hover:text-white disabled:opacity-30 rounded hover:bg-slate-800 transition-colors"
                title={isAr ? 'إعادة (Ctrl+Y)' : 'Redo (Ctrl+Y)'}
              >
                <Redo2 className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* AI Assistant Drawer Toggle */}
          {safeToolbar.showAiAssistant && (
            <button
              onClick={onOpenAiDrawer}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-xs transition-colors shrink-0"
              title="المساعد الهندسي الذكي"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>AI</span>
            </button>
          )}

          {/* Language Switcher */}
          <button
            onClick={onToggleLanguage}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-bold text-xs transition-colors shrink-0"
            title="تبديل اللغة / Toggle Language"
          >
            <Globe className="w-3.5 h-3.5 text-amber-400" />
            <span>{isAr ? 'English' : 'العربية'}</span>
          </button>

          {/* Toolbar Customizer */}
          <button
            onClick={onOpenToolbarCustomizer}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition-colors shrink-0"
            title={isAr ? 'تخصيص وترتيب الأزرار' : 'Customize Toolbar'}
          >
            <Sliders className="w-3.5 h-3.5" />
          </button>

          {/* Download App Button */}
          {safeToolbar.showDownload && (
            <button
              onClick={onOpenDownloadModal}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#b47728] hover:bg-[#996521] text-white font-bold text-xs shadow-sm transition-all shrink-0"
              title="تحميل وتثبيت البرنامج"
            >
              <Download className="w-3.5 h-3.5 text-white" />
              <span>{isAr ? 'تحميل البرنامج' : 'Install App'}</span>
            </button>
          )}

        </div>

      </div>

    </header>
  );
};
