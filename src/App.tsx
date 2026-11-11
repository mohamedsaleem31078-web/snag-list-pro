import React, { useState, useEffect, useCallback } from 'react';
import { Header } from './components/Header';
import { DashboardView } from './components/DashboardView';
import { InteractivePlanView } from './components/InteractivePlanView';
import { ObservationsTableView } from './components/ObservationsTableView';
import { PlanningView } from './components/PlanningView';
import { ReportsView } from './components/ReportsView';
import { SettingsView } from './components/SettingsView';
import { PhotoReportStudio } from './components/PhotoReportStudio';
import { DailyPhotoGallery } from './components/DailyPhotoGallery';
import { ObservationModal } from './components/ObservationModal';
import { ObservationDetailModal } from './components/ObservationDetailModal';
import { PrintAndExportModal } from './components/PrintAndExportModal';
import { PrintableDocument } from './components/PrintableDocument';
import { DownloadAppModal } from './components/DownloadAppModal';
import { AiAssistantDrawer } from './components/AiAssistantDrawer';
import { ToolbarCustomizerModal } from './components/ToolbarCustomizerModal';

import { 
  Discipline, Observation, ObservationStatus, 
  PlanningActivity, PrintSettings, ProjectMetadata, SystemSettings, DailyPhoto 
} from './types';
import { 
  INITIAL_DISCIPLINES, INITIAL_OBSERVATIONS, 
  INITIAL_PLANNING_ACTIVITIES, INITIAL_PROJECT, INITIAL_SYSTEM_SETTINGS 
} from './data/initialData';
import { exportPlanWithPins, exportToCSV, exportToJSON, STORAGE_KEYS } from './utils/helpers';
import { RotateCcw, Undo2, X } from 'lucide-react';

const INITIAL_DAILY_PHOTOS: DailyPhoto[] = [
  {
    id: 'ph-demo-1',
    url: '/assets/aistudio/______e3f46fda.jfif',
    date: '2026-11-10',
    time: '09:30',
    zone: 'Piazza - Main Plaza',
    caption: 'معاينة مناسيب تركيب رخام التيراس الخارجي والعراميس',
  },
  {
    id: 'ph-demo-2',
    url: '/assets/aistudio/______e3f46fda.jfif',
    date: '2026-11-09',
    time: '14:15',
    zone: 'Atrium Glass Wall',
    caption: 'فحص مسارات كابلات الإنارة الديكورية أسفل الجدار الزجاجي',
  }
];

export default function App() {
  // 1. Persistent State Initialization (Offline-First Portable)
  const [project, setProject] = useState<ProjectMetadata>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.PROJECT);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return {
          ...INITIAL_PROJECT,
          ...parsed,
          logoUrl: '/assets/aistudio/gem_official_logo.jpg',
        };
      } catch (e) { /* fallback */ }
    }
    return INITIAL_PROJECT;
  });

  const [disciplines, setDisciplines] = useState<Discipline[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.DISCIPLINES);
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { /* fallback */ }
    }
    return INITIAL_DISCIPLINES;
  });

  const [observations, setObservations] = useState<Observation[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.OBSERVATIONS);
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { /* fallback */ }
    }
    return INITIAL_OBSERVATIONS;
  });

  const [planningActivities, setPlanningActivities] = useState<PlanningActivity[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.PLANNING);
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { /* fallback */ }
    }
    return INITIAL_PLANNING_ACTIVITIES;
  });

  const [dailyPhotos, setDailyPhotos] = useState<DailyPhoto[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.DAILY_PHOTOS);
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { /* fallback */ }
    }
    return INITIAL_DAILY_PHOTOS;
  });

  const [systemSettings, setSystemSettings] = useState<SystemSettings>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return {
          ...INITIAL_SYSTEM_SETTINGS,
          ...parsed,
          toolbar: { ...INITIAL_SYSTEM_SETTINGS.toolbar, ...(parsed.toolbar || {}) },
          pinStyle: { ...INITIAL_SYSTEM_SETTINGS.pinStyle, ...(parsed.pinStyle || {}) },
          columnVisibility: { ...INITIAL_SYSTEM_SETTINGS.columnVisibility, ...(parsed.columnVisibility || {}) },
        };
      } catch (e) { /* fallback */ }
    }
    return INITIAL_SYSTEM_SETTINGS;
  });

  // Undo / Redo History Stack (Requested by user: "خاصية الرجوع عن الأمر في كل حاجة")
  const [historyStack, setHistoryStack] = useState<Observation[][]>([INITIAL_OBSERVATIONS]);
  const [historyIndex, setHistoryIndex] = useState<number>(0);
  const [lastDeletedObservation, setLastDeletedObservation] = useState<Observation | null>(null);

  const pushToHistory = useCallback((newObservations: Observation[]) => {
    setHistoryStack(prev => {
      const sliced = prev.slice(0, historyIndex + 1);
      return [...sliced, newObservations];
    });
    setHistoryIndex(prev => prev + 1);
  }, [historyIndex]);

  const handleUndo = useCallback(() => {
    if (historyIndex > 0) {
      const newIndex = historyIndex - 1;
      setHistoryIndex(newIndex);
      setObservations(historyStack[newIndex]);
    }
  }, [historyIndex, historyStack]);

  const handleRedo = useCallback(() => {
    if (historyIndex < historyStack.length - 1) {
      const newIndex = historyIndex + 1;
      setHistoryIndex(newIndex);
      setObservations(historyStack[newIndex]);
    }
  }, [historyIndex, historyStack]);

  // Global Keyboard Shortcuts (Ctrl+Z for Undo, Ctrl+Y for Redo)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z') {
        if (e.shiftKey) {
          e.preventDefault();
          handleRedo();
        } else {
          e.preventDefault();
          handleUndo();
        }
      } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'y') {
        e.preventDefault();
        handleRedo();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleUndo, handleRedo]);

  // 2. Active Tab State ('dashboard' | 'plan' | 'table' | 'planning' | 'photo_studio' | 'gallery' | 'reports' | 'settings')
  const [activeTab, setActiveTab] = useState<'dashboard' | 'plan' | 'table' | 'planning' | 'photo_studio' | 'gallery' | 'reports' | 'settings'>('dashboard');

  // Table filter pass-through
  const [tableStatusFilter, setTableStatusFilter] = useState<ObservationStatus | 'all'>('all');
  const [tableDisciplineFilter, setTableDisciplineFilter] = useState<string>('all');

  // Auto-saved pulse indicator
  const [lastSavedTime, setLastSavedTime] = useState<string>('Just now');

  // 3. Modals State
  const [isObservationModalOpen, setIsObservationModalOpen] = useState(false);
  const [editingObservation, setEditingObservation] = useState<Observation | null>(null);
  const [initialPinCoords, setInitialPinCoords] = useState<{ x: number; y: number } | null>(null);

  const [selectedDetailObservation, setSelectedDetailObservation] = useState<Observation | null>(null);
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);
  const [singlePrintObservation, setSinglePrintObservation] = useState<Observation | null>(null);
  const [isDownloadModalOpen, setIsDownloadModalOpen] = useState(false);
  const [isAiDrawerOpen, setIsAiDrawerOpen] = useState(false);
  const [isToolbarCustomizerOpen, setIsToolbarCustomizerOpen] = useState(false);

  // 4. Print Settings State
  const [printSettings, setPrintSettings] = useState<PrintSettings>({
    reportType: 'punch_list',
    paperSize: 'a4',
    orientation: 'portrait',
    includePhotos: true,
    includeComments: true,
    includeSignatures: true,
    includeDrawingRef: true,
    includeQrCode: true,
    includeLogos: true,
    selectedDisciplineId: 'all',
    selectedStatus: 'all',
    columnVisibility: systemSettings.columnVisibility,
  });

  // Auto-Save Effect
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.PROJECT, JSON.stringify(project));
    localStorage.setItem(STORAGE_KEYS.DISCIPLINES, JSON.stringify(disciplines));
    localStorage.setItem(STORAGE_KEYS.OBSERVATIONS, JSON.stringify(observations));
    localStorage.setItem(STORAGE_KEYS.PLANNING, JSON.stringify(planningActivities));
    localStorage.setItem(STORAGE_KEYS.DAILY_PHOTOS, JSON.stringify(dailyPhotos));
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(systemSettings));
    setLastSavedTime(new Date().toLocaleTimeString('ar-EG'));
  }, [project, disciplines, observations, planningActivities, dailyPhotos, systemSettings]);

  // Observations Handlers
  const handleSaveObservation = (obs: Observation) => {
    setObservations(prev => {
      const exists = prev.some(o => o.id === obs.id);
      const updated = exists ? prev.map(o => (o.id === obs.id ? obs : o)) : [obs, ...prev];
      pushToHistory(updated);
      return updated;
    });
    setEditingObservation(null);
    setInitialPinCoords(null);
  };

  const handleDeleteObservation = (obsId: string) => {
    const target = observations.find(o => o.id === obsId);
    if (target) {
      setLastDeletedObservation(target);
    }
    setObservations(prev => {
      const updated = prev.filter(o => o.id !== obsId);
      pushToHistory(updated);
      return updated;
    });
    if (selectedDetailObservation?.id === obsId) {
      setSelectedDetailObservation(null);
    }
  };

  // Restore deleted observation
  const handleRecoverDeletedObservation = () => {
    if (!lastDeletedObservation) return;
    setObservations(prev => {
      const updated = [lastDeletedObservation, ...prev];
      pushToHistory(updated);
      return updated;
    });
    setLastDeletedObservation(null);
  };

  const handleQuickStatusChange = (obsId: string, newStatus: ObservationStatus) => {
    setObservations(prev => {
      const updated = prev.map(o => {
        if (o.id === obsId) {
          return {
            ...o,
            status: newStatus,
            closedAt: newStatus === 'closed' ? new Date().toISOString().slice(0, 10) : undefined,
          };
        }
        return o;
      });
      pushToHistory(updated);
      return updated;
    });
  };

  const handleAddObservationAtCoords = (coords: { x: number; y: number }) => {
    setEditingObservation(null);
    setInitialPinCoords(coords);
    setIsObservationModalOpen(true);
  };

  const handleOpenNewObservation = () => {
    setEditingObservation(null);
    setInitialPinCoords({ x: 50, y: 50 });
    setIsObservationModalOpen(true);
  };

  const handleEditObservation = (obs: Observation) => {
    setEditingObservation(obs);
    setInitialPinCoords(obs.pin);
    setIsObservationModalOpen(true);
  };

  // Gallery to Snag bridge
  const handleCreateSnagFromDailyPhoto = (photo: DailyPhoto) => {
    setEditingObservation({
      id: `obs-${Date.now()}`,
      serialNumber: `ARC-${String(observations.length + 1).padStart(3, '0')}`,
      disciplineId: photo.disciplineId || disciplines[0].id,
      title: photo.caption || 'ملاحظة موقع جديدة من المعرض اليومي',
      description: `تم توثيق الملاحظة بتاريخ ${photo.date} في تمام ${photo.time}`,
      locationZone: photo.zone || 'Piazza',
      drawingReference: project.drawingNumber,
      pin: { x: 50, y: 50 },
      contractor: project.contractor,
      status: 'open',
      priority: 'high',
      photos: [
        {
          id: `ph-${Date.now()}`,
          originalUrl: photo.annotatedUrl || photo.url,
          caption: photo.caption,
          uploadedAt: `${photo.date} ${photo.time}`
        }
      ],
      createdAt: photo.date,
      dueDate: new Date(Date.now() + 7 * 86400000).toISOString().slice(0, 10),
      inspectorName: 'م. استشاري الجودة (EHAF)'
    });
    setIsObservationModalOpen(true);
  };

  const handleAddToPhotoReport = (photo: DailyPhoto) => {
    setActiveTab('photo_studio');
  };

  // Toggle Language Handler
  const handleToggleLanguage = () => {
    setSystemSettings(prev => ({
      ...prev,
      language: prev.language === 'ar' ? 'en' : 'ar'
    }));
  };

  // Print execution handler
  const handleExecutePrint = () => {
    setSinglePrintObservation(null);
    setTimeout(() => {
      window.print();
    }, 150);
  };

  const handlePrintSingleNotice = (obs: Observation) => {
    setSinglePrintObservation(obs);
    setPrintSettings(prev => ({ ...prev, reportType: 'single_notice' }));
    setTimeout(() => {
      window.print();
    }, 150);
  };

  const handleExportCSV = () => {
    exportToCSV(observations, disciplines);
  };

  const handleExportJSON = () => {
    exportToJSON({ project, disciplines, observations, planningActivities, dailyPhotos, systemSettings });
  };

  const handleExportPlanImage = async () => {
    try {
      await exportPlanWithPins(
        project.blueprintUrl,
        observations,
        disciplines,
        project.projectNameAr,
        project.drawingNumber
      );
    } catch (err) {
      alert('تعذر تصدير صورة المخطط');
    }
  };

  const isAr = systemSettings.language === 'ar';

  return (
    <div 
      className="min-h-screen bg-[#f4f6f9] text-slate-800 flex flex-col font-sans selection:bg-amber-500 selection:text-white" 
      dir={isAr ? 'rtl' : 'ltr'}
    >
      
      {/* 1. Header with GEM, Hill, and EHAF logos & Navigation Tabs */}
      <Header
        project={project}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenNewObservation={handleOpenNewObservation}
        onOpenPrintModal={() => setIsPrintModalOpen(true)}
        onOpenDownloadModal={() => setIsDownloadModalOpen(true)}
        onOpenAiDrawer={() => setIsAiDrawerOpen(true)}
        onOpenToolbarCustomizer={() => setIsToolbarCustomizerOpen(true)}
        toolbarConfig={systemSettings?.toolbar || INITIAL_SYSTEM_SETTINGS.toolbar}
        language={systemSettings.language}
        onToggleLanguage={handleToggleLanguage}
        canUndo={historyIndex > 0}
        canRedo={historyIndex < historyStack.length - 1}
        onUndo={handleUndo}
        onRedo={handleRedo}
      />

      {/* 2. Main Content Views */}
      <main className="flex-1 p-3 sm:p-5 lg:p-6 max-w-[1750px] w-full mx-auto no-print">
        
        {/* Tab 1: Dashboard / لوحة التحكم */}
        {activeTab === 'dashboard' && (
          <DashboardView
            project={project}
            observations={observations}
            disciplines={disciplines}
            onNavigateToPlan={() => setActiveTab('plan')}
            onNavigateToTable={(status, disc) => {
              if (status) setTableStatusFilter(status);
              if (disc) setTableDisciplineFilter(disc);
              setActiveTab('table');
            }}
            onOpenNewObservation={handleOpenNewObservation}
            onSelectObservation={(obs) => setSelectedDetailObservation(obs)}
            onOpenPrintModal={() => setIsPrintModalOpen(true)}
            onOpenDownloadModal={() => setIsDownloadModalOpen(true)}
          />
        )}

        {/* Tab 2: Drawings & Location / المخططات والمواقع */}
        {activeTab === 'plan' && (
          <InteractivePlanView
            project={project}
            observations={observations}
            disciplines={disciplines}
            onAddObservationAtCoords={handleAddObservationAtCoords}
            onOpenNewObservation={handleOpenNewObservation}
            onSelectObservation={(obs) => setSelectedDetailObservation(obs)}
            onEditObservation={handleEditObservation}
            onDeleteObservation={handleDeleteObservation}
            onQuickStatusChange={handleQuickStatusChange}
            onOpenPrintModal={() => setIsPrintModalOpen(true)}
            language={systemSettings.language}
          />
        )}

        {/* Tab 3: Snags / الملاحظات */}
        {activeTab === 'table' && (
          <ObservationsTableView
            project={project}
            observations={observations}
            disciplines={disciplines}
            selectedDisciplineFilter={tableDisciplineFilter}
            onSelectObservation={(obs) => setSelectedDetailObservation(obs)}
            onEditObservation={handleEditObservation}
            onDeleteObservation={handleDeleteObservation}
            onQuickStatusChange={handleQuickStatusChange}
            onOpenNewObservation={handleOpenNewObservation}
            onOpenPrintModal={() => setIsPrintModalOpen(true)}
            onExportCSV={handleExportCSV}
            onExportJSON={handleExportJSON}
            onImportJSON={(e) => {
              const file = e.target.files?.[0];
              if (!file) return;
              const reader = new FileReader();
              reader.onload = (ev) => {
                try {
                  const data = JSON.parse(ev.target?.result as string);
                  if (data.observations) setObservations(data.observations);
                  if (data.project) setProject(data.project);
                } catch (err) {
                  alert('الملف غير صالح');
                }
              };
              reader.readAsText(file);
              e.target.value = '';
            }}
            onOpenDisciplineManager={() => setActiveTab('settings')}
            language={systemSettings.language}
          />
        )}

        {/* Tab 4: Planning / التخطيط */}
        {activeTab === 'planning' && (
          <PlanningView
            project={project}
            activities={planningActivities}
            disciplines={disciplines}
            onAddActivity={(act) => setPlanningActivities(prev => [act, ...prev])}
            onUpdateActivity={(act) => setPlanningActivities(prev => prev.map(a => a.id === act.id ? act : a))}
            onDeleteActivity={(id) => setPlanningActivities(prev => prev.filter(a => a.id !== id))}
            language={systemSettings.language}
          />
        )}

        {/* Tab 5: Photo Report Studio / استوديو التقارير المصورة (User requested) */}
        {activeTab === 'photo_studio' && (
          <PhotoReportStudio
            project={project}
            disciplines={disciplines}
            dailyPhotos={dailyPhotos}
            language={systemSettings.language}
          />
        )}

        {/* Tab 6: Daily Field Gallery / معرض الصور اليومي (User requested) */}
        {activeTab === 'gallery' && (
          <DailyPhotoGallery
            photos={dailyPhotos}
            onAddPhotos={(newItems) => setDailyPhotos(prev => [...newItems, ...prev])}
            onUpdatePhoto={(up) => setDailyPhotos(prev => prev.map(p => p.id === up.id ? up : p))}
            onDeletePhoto={(id) => setDailyPhotos(prev => prev.filter(p => p.id !== id))}
            disciplines={disciplines}
            project={project}
            language={systemSettings.language}
            onCreateSnagFromPhoto={handleCreateSnagFromDailyPhoto}
            onAddToPhotoReport={handleAddToPhotoReport}
          />
        )}

        {/* Tab 7: Reports / التقارير */}
        {activeTab === 'reports' && (
          <ReportsView
            project={project}
            observations={observations}
            disciplines={disciplines}
            onTriggerPrint={() => setIsPrintModalOpen(true)}
            onSelectObservation={(obs) => setSelectedDetailObservation(obs)}
          />
        )}

        {/* Tab 8: Settings / الإعدادات */}
        {activeTab === 'settings' && (
          <SettingsView
            project={project}
            onUpdateProject={setProject}
            disciplines={disciplines}
            onAddDiscipline={(d) => setDisciplines(prev => [...prev, d])}
            onDeleteDiscipline={(id) => setDisciplines(prev => prev.filter(d => d.id !== id))}
            observations={observations}
            planningActivities={planningActivities}
            onRestoreAllData={(data) => {
              if (data.project) setProject(data.project);
              if (data.disciplines) setDisciplines(data.disciplines);
              if (data.observations) setObservations(data.observations);
              if (data.planningActivities) setPlanningActivities(data.planningActivities);
            }}
            systemSettings={systemSettings}
            onUpdateSystemSettings={setSystemSettings}
          />
        )}

      </main>

      {/* 3. Floating Recovery Toast for Undo Deletion (Requested by User) */}
      {lastDeletedObservation && (
        <div className="fixed bottom-12 left-1/2 -translate-x-1/2 z-50 bg-slate-900 text-white px-4 py-2.5 rounded-xl shadow-2xl flex items-center gap-3 border border-slate-700 animate-in fade-in duration-200">
          <span className="text-xs">
            {isAr ? `تم حذف الملاحظة رقم ${lastDeletedObservation.serialNumber}` : `Deleted ${lastDeletedObservation.serialNumber}`}
          </span>
          <button
            onClick={handleRecoverDeletedObservation}
            className="px-2.5 py-1 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-lg flex items-center gap-1"
          >
            <Undo2 className="w-3.5 h-3.5" />
            <span>{isAr ? 'تراجع عن الحذف' : 'Undo Delete'}</span>
          </button>
          <button
            onClick={() => setLastDeletedObservation(null)}
            className="text-slate-400 hover:text-white p-1"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* 4. Bottom Right "✓ Saved" Status Indicator matching screenshot */}
      <div className="fixed bottom-3 right-4 z-30 bg-white/90 backdrop-blur-xs border border-slate-300 rounded-lg px-3 py-1 text-[11px] font-bold text-slate-700 shadow-md flex items-center gap-1.5 no-print">
        <span className="text-emerald-600 font-extrabold text-sm">✓</span>
        <span>Saved</span>
        <span className="text-slate-400 font-mono text-[9px] mr-1 hidden sm:inline">({lastSavedTime})</span>
      </div>

      {/* 5. Modals */}

      {/* Observation Modal (with photo comments, markup canvas & AI Polish) */}
      <ObservationModal
        isOpen={isObservationModalOpen}
        onClose={() => {
          setIsObservationModalOpen(false);
          setEditingObservation(null);
          setInitialPinCoords(null);
        }}
        onSave={handleSaveObservation}
        disciplines={disciplines}
        allObservations={observations}
        editObservation={editingObservation}
        initialPinCoords={initialPinCoords}
      />

      {/* Observation Detail Modal (Official Inspection Sheet SON) */}
      <ObservationDetailModal
        isOpen={Boolean(selectedDetailObservation)}
        onClose={() => setSelectedDetailObservation(null)}
        observation={selectedDetailObservation}
        disciplines={disciplines}
        project={project}
        onEdit={handleEditObservation}
        onPrintSingle={handlePrintSingleNotice}
      />

      {/* Print and Export Modal */}
      <PrintAndExportModal
        isOpen={isPrintModalOpen}
        onClose={() => setIsPrintModalOpen(false)}
        project={project}
        observations={observations}
        disciplines={disciplines}
        printSettings={printSettings}
        onUpdatePrintSettings={(settings) => setPrintSettings(prev => ({ ...prev, ...settings }))}
        onExecutePrint={handleExecutePrint}
        onExportCSV={handleExportCSV}
        onExportJSON={handleExportJSON}
        onExportPlanImage={handleExportPlanImage}
      />

      {/* Download & Install Desktop App Modal */}
      <DownloadAppModal
        isOpen={isDownloadModalOpen}
        onClose={() => setIsDownloadModalOpen(false)}
        onExportPortablePackage={handleExportJSON}
        project={project}
      />

      {/* AI Assistant Drawer */}
      <AiAssistantDrawer
        isOpen={isAiDrawerOpen}
        onClose={() => setIsAiDrawerOpen(false)}
        language={systemSettings.language}
      />

      {/* Toolbar Buttons Customizer Modal */}
      <ToolbarCustomizerModal
        isOpen={isToolbarCustomizerOpen}
        onClose={() => setIsToolbarCustomizerOpen(false)}
        config={systemSettings?.toolbar || INITIAL_SYSTEM_SETTINGS.toolbar}
        onUpdateConfig={(newConfig) => setSystemSettings(prev => ({ ...prev, toolbar: newConfig }))}
        language={systemSettings.language}
      />

      {/* 6. Official Printable Document (Active exclusively on @media print) */}
      <PrintableDocument
        project={project}
        observations={observations}
        disciplines={disciplines}
        printSettings={printSettings}
        singleObservation={singlePrintObservation}
      />

    </div>
  );
}
