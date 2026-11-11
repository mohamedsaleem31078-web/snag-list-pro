import React, { useState, useRef } from 'react';
import { 
  ZoomIn, ZoomOut, RotateCcw, Maximize2, Minimize2, 
  MapPin, Plus, Filter, Search, Eye, Download, 
  Printer, Layers, ChevronDown, CheckCircle2, AlertCircle,
  ExternalLink, Edit, Trash2, Camera, EyeOff, Sliders
} from 'lucide-react';
import { Discipline, Observation, ObservationPriority, ObservationStatus, ProjectMetadata } from '../types';
import { getPriorityBadge, getStatusLabel, exportPlanWithPins } from '../utils/helpers';

interface InteractivePlanViewProps {
  project: ProjectMetadata;
  observations: Observation[];
  disciplines: Discipline[];
  onAddObservationAtCoords: (coords: { x: number; y: number }) => void;
  onOpenNewObservation: () => void;
  onSelectObservation: (obs: Observation) => void;
  onEditObservation: (obs: Observation) => void;
  onDeleteObservation: (obsId: string) => void;
  onQuickStatusChange: (obsId: string, newStatus: ObservationStatus) => void;
  onOpenPrintModal: () => void;
  language?: 'ar' | 'en';
}

export const InteractivePlanView: React.FC<InteractivePlanViewProps> = ({
  project,
  observations,
  disciplines,
  onAddObservationAtCoords,
  onOpenNewObservation,
  onSelectObservation,
  onEditObservation,
  onDeleteObservation,
  onQuickStatusChange,
  onOpenPrintModal,
  language = 'ar',
}) => {
  const isAr = language === 'ar';
  const containerRef = useRef<HTMLDivElement | null>(null);
  const imageRef = useRef<HTMLImageElement | null>(null);

  // Pan & Zoom states
  const [scale, setScale] = useState<number>(1);
  const [position, setPosition] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);

  // Pin drop mode
  const [isPinDropMode, setIsPinDropMode] = useState<boolean>(false);

  // Filters
  const [filterDiscipline, setFilterDiscipline] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterPriority, setFilterPriority] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Pin Refinement controls (Requested by user to avoid obscuring drawing details)
  const [pinMode, setPinMode] = useState<'needle' | 'dot' | 'badge' | 'hover_only'>('needle');
  const [pinOpacity, setPinOpacity] = useState<number>(0.92);
  const [ghostMode, setGhostMode] = useState<boolean>(false);

  // Active selected pin for popup preview
  const [selectedPinObs, setSelectedPinObs] = useState<Observation | null>(null);

  // Custom uploaded blueprint support
  const [customBlueprintUrl, setCustomBlueprintUrl] = useState<string>(project.blueprintUrl);

  const discMap = new Map(disciplines.map(d => [d.id, d]));

  // Filter observations
  const filteredObservations = observations.filter(obs => {
    if (filterDiscipline !== 'all' && obs.disciplineId !== filterDiscipline) return false;
    if (filterStatus !== 'all' && obs.status !== filterStatus) return false;
    if (filterPriority !== 'all' && obs.priority !== filterPriority) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchSerial = obs.serialNumber.toLowerCase().includes(q);
      const matchTitle = obs.title.toLowerCase().includes(q);
      const matchLocation = obs.locationZone.toLowerCase().includes(q);
      const matchContractor = obs.contractor.toLowerCase().includes(q);
      if (!matchSerial && !matchTitle && !matchLocation && !matchContractor) return false;
    }
    return true;
  });

  // Handle Zoom In / Out
  const handleZoom = (delta: number) => {
    setScale(prev => Math.min(Math.max(0.5, prev + delta), 4.5));
  };

  const handleResetZoom = () => {
    setScale(1);
    setPosition({ x: 0, y: 0 });
  };

  // Mouse wheel zoom
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const zoomFactor = e.deltaY < 0 ? 0.15 : -0.15;
    setScale(prev => Math.min(Math.max(0.5, prev + zoomFactor), 4.5));
  };

  // Drag to pan
  const handleMouseDown = (e: React.MouseEvent) => {
    if (isPinDropMode) return;
    if (e.button !== 0) return; // only left click
    setIsDragging(true);
    setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setPosition({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y,
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Plan click for Pin Dropping
  const handlePlanClick = (e: React.MouseEvent) => {
    if (!isPinDropMode) return;
    const img = imageRef.current;
    if (!img) return;

    const rect = img.getBoundingClientRect();
    const clientX = e.clientX;
    const clientY = e.clientY;

    if (
      clientX >= rect.left &&
      clientX <= rect.right &&
      clientY >= rect.top &&
      clientY <= rect.bottom
    ) {
      const xPercent = ((clientX - rect.left) / rect.width) * 100;
      const yPercent = ((clientY - rect.top) / rect.height) * 100;

      setIsPinDropMode(false);
      onAddObservationAtCoords({
        x: Math.round(xPercent * 10) / 10,
        y: Math.round(yPercent * 10) / 10,
      });
    }
  };

  // Toggle fullscreen
  const toggleFullscreen = () => {
    const el = containerRef.current;
    if (!el) return;
    if (!document.fullscreenElement) {
      el.requestFullscreen().then(() => setIsFullscreen(true)).catch(() => {});
    } else {
      document.exitFullscreen().then(() => setIsFullscreen(false)).catch(() => {});
    }
  };

  // Plan Image Export
  const [isExporting, setIsExporting] = useState(false);
  const handleExportPlanImage = async () => {
    setIsExporting(true);
    try {
      await exportPlanWithPins(
        customBlueprintUrl,
        filteredObservations,
        disciplines,
        project.projectNameAr,
        project.drawingNumber
      );
    } catch (err) {
      alert(isAr ? 'تعذر تصدير صورة المخطط' : 'Failed to export plan image');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div
      ref={containerRef}
      className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl flex flex-col h-[82vh] relative"
    >
      
      {/* 1. Control Toolbar */}
      <div className="bg-slate-950 border-b border-slate-800 px-4 py-2.5 flex flex-wrap items-center justify-between gap-2.5 select-none text-xs">
        
        {/* Left: Title & Pin Drop Toggle */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <h2 className="font-bold text-white text-xs sm:text-sm flex items-center gap-1.5">
              <span>{isAr ? 'المخطط التفاعلي' : 'Interactive Drawing'}</span>
              <span className="hidden sm:inline-block font-mono text-[10px] px-2 py-0.5 rounded bg-slate-800 text-amber-400 border border-slate-700">
                {project.drawingNumber}
              </span>
            </h2>
          </div>

          {/* Pin Drop Button */}
          <button
            onClick={() => {
              setIsPinDropMode(prev => !prev);
              if (!isPinDropMode) setSelectedPinObs(null);
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold text-xs transition-all ${
              isPinDropMode
                ? 'bg-red-500 text-white shadow-lg ring-2 ring-red-400 animate-pulse'
                : 'bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-xs'
            }`}
          >
            <MapPin className="w-3.5 h-3.5" />
            <span>{isPinDropMode ? (isAr ? '📍 انقر لإسقاط الدبوس' : 'Click to Drop Pin') : (isAr ? 'إسقاط دبوس جديد +' : 'Drop New Pin +')}</span>
          </button>
        </div>

        {/* Center: Search & Discipline Filters */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Search */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder={isAr ? 'بحث بسيريال أو موقع...' : 'Search serial or zone...'}
              className="w-28 sm:w-36 bg-slate-900 border border-slate-700 rounded-lg pr-8 pl-2 py-1 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
            />
          </div>

          {/* Discipline filter */}
          <select
            value={filterDiscipline}
            onChange={e => setFilterDiscipline(e.target.value)}
            className="bg-slate-900 border border-slate-700 rounded-lg px-2 py-1 text-xs text-white focus:outline-none focus:border-amber-500"
          >
            <option value="all">{isAr ? `كافة التخصصات (${disciplines.length})` : 'All Disciplines'}</option>
            {disciplines.map(d => (
              <option key={d.id} value={d.id}>
                {d.code} - {isAr ? d.nameAr : d.nameEn}
              </option>
            ))}
          </select>

          {/* Status filter */}
          <select
            value={filterStatus}
            onChange={e => setFilterStatus(e.target.value)}
            className="bg-slate-900 border border-slate-700 rounded-lg px-2 py-1 text-xs text-white focus:outline-none focus:border-amber-500"
          >
            <option value="all">{isAr ? 'كل الحالات' : 'All Statuses'}</option>
            <option value="open">مفتوحة / OPEN</option>
            <option value="in_progress">قيد التنفيذ / IN PROGRESS</option>
            <option value="verified">تم التحقق / VERIFIED</option>
            <option value="closed">مغلقة / CLOSED</option>
          </select>
        </div>

        {/* Right: Precision Pin Controls (User requested so pins do not obscure drawing) */}
        <div className="flex items-center gap-1.5">
          {/* Pin Mode Selector */}
          <div className="flex items-center bg-slate-900 rounded-lg p-0.5 border border-slate-800">
            <button
              onClick={() => setPinMode('needle')}
              className={`px-2 py-0.5 rounded text-[11px] font-bold transition-colors ${
                pinMode === 'needle' ? 'bg-amber-500 text-slate-950' : 'text-slate-400 hover:text-white'
              }`}
              title={isAr ? 'إبرة هندسية دقيقة تكشف مكان النقطة تماماً دون حجب المخطط' : 'Precision Needle: pinpoint tip touches exact spot'}
            >
              {isAr ? 'إبرة دقيقة 📍' : 'Needle'}
            </button>
            <button
              onClick={() => setPinMode('dot')}
              className={`px-2 py-0.5 rounded text-[11px] font-bold transition-colors ${
                pinMode === 'dot' ? 'bg-amber-500 text-slate-950' : 'text-slate-400 hover:text-white'
              }`}
              title={isAr ? 'نقطة صغيرة جداً 6 مم' : 'Micro Dot'}
            >
              {isAr ? 'نقطة صغيرة' : 'Micro'}
            </button>
            <button
              onClick={() => setPinMode('badge')}
              className={`px-2 py-0.5 rounded text-[11px] font-bold transition-colors ${
                pinMode === 'badge' ? 'bg-amber-500 text-slate-950' : 'text-slate-400 hover:text-white'
              }`}
              title={isAr ? 'شارة برقم السيريال' : 'Badge'}
            >
              {isAr ? 'شارة سيريال' : 'Badge'}
            </button>
          </div>

          {/* Quick Ghost Toggle (temporarily hides pins to see drawing clearly) */}
          <button
            onClick={() => setGhostMode(prev => !prev)}
            className={`p-1.5 rounded-lg border text-xs font-semibold flex items-center gap-1 transition-colors ${
              ghostMode
                ? 'bg-amber-500/20 text-amber-300 border-amber-500/50'
                : 'bg-slate-900 text-slate-400 hover:text-white border-slate-800'
            }`}
            title={isAr ? 'إخفاء مؤقت للدبابيس لقراءة بيانات المخطط بوضوح' : 'Ghost/Hide pins to inspect blueprint'}
          >
            {ghostMode ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
            <span className="hidden sm:inline">{ghostMode ? (isAr ? 'إظهار' : 'Show') : (isAr ? 'إخفاء مؤقت' : 'Ghost')}</span>
          </button>

          {/* Opacity Slider */}
          <div className="hidden lg:flex items-center gap-1 bg-slate-900 border border-slate-800 rounded-lg px-2 py-1">
            <span className="text-[10px] text-slate-400">{isAr ? 'شفافية:' : 'Opacity:'}</span>
            <input
              type="range"
              min="0.25"
              max="1"
              step="0.05"
              value={pinOpacity}
              onChange={e => setPinOpacity(parseFloat(e.target.value))}
              className="w-16 accent-amber-500 h-1 cursor-pointer"
            />
          </div>

          {/* Zoom In/Out */}
          <div className="flex items-center bg-slate-900 rounded-lg border border-slate-800 p-0.5">
            <button
              onClick={() => handleZoom(0.25)}
              className="p-1 text-slate-300 hover:text-white rounded"
              title="تكبير"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
            <span className="text-[10px] font-mono px-1.5 text-slate-400">
              {Math.round(scale * 100)}%
            </span>
            <button
              onClick={() => handleZoom(-0.25)}
              className="p-1 text-slate-300 hover:text-white rounded"
              title="تصغير"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={handleResetZoom}
              className="p-1 text-slate-300 hover:text-white rounded"
              title="إعادة ضبط 100%"
            >
              <RotateCcw className="w-3 h-3" />
            </button>
          </div>

          {/* Export PNG */}
          <button
            onClick={handleExportPlanImage}
            disabled={isExporting}
            className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-amber-400 transition-colors"
            title="تصدير صورة المخطط بالدبابيس PNG"
          >
            <Download className="w-3.5 h-3.5" />
          </button>

          {/* Fullscreen */}
          <button
            onClick={toggleFullscreen}
            className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white transition-colors"
            title="ملء الشاشة"
          >
            {isFullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
          </button>
        </div>

      </div>

      {/* 2. Main Interactive Plan Canvas */}
      <div 
        className={`relative flex-1 bg-slate-950 overflow-hidden select-none ${
          isPinDropMode ? 'cursor-crosshair' : isDragging ? 'cursor-grabbing' : 'cursor-grab'
        }`}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onWheel={handleWheel}
        onClick={handlePlanClick}
      >
        {/* Floating Pin Drop Prompt Banner */}
        {isPinDropMode && (
          <div className="absolute top-4 left-1/2 -translate-x-1/2 z-30 bg-red-600/95 backdrop-blur-md text-white text-xs font-bold px-4 py-2 rounded-full shadow-2xl flex items-center gap-2 border border-red-400 animate-bounce">
            <MapPin className="w-4 h-4" />
            <span>{isAr ? 'انقر في أي موقع على المخطط لإسقاط الدبوس وفتح نموذج الملاحظة فوراً' : 'Click anywhere on drawing to drop pin and open observation form'}</span>
          </div>
        )}

        {/* Blueprint Container with Transform Pan/Zoom */}
        <div
          className="w-full h-full flex items-center justify-center origin-center transition-transform duration-75"
          style={{
            transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`,
          }}
        >
          <div className="relative inline-block max-w-none">
            {/* The Master Blueprint Drawing */}
            <img
              ref={imageRef}
              src={customBlueprintUrl}
              alt="Grand Egyptian Museum Master Plan"
              className="max-h-[75vh] w-auto object-contain pointer-events-none select-none rounded shadow-2xl block"
              draggable={false}
            />

            {/* Pins Layer (Engineered with precision tip touching exact point) */}
            {!ghostMode && filteredObservations.map(obs => {
              const disc = discMap.get(obs.disciplineId);
              const pinColor = disc ? disc.color : '#e11d48';
              const isSelected = selectedPinObs?.id === obs.id;
              const isCritical = obs.priority === 'critical';

              return (
                <div
                  key={obs.id}
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedPinObs(obs);
                  }}
                  className="absolute z-20 cursor-pointer group"
                  style={{
                    left: `${obs.pin.x}%`,
                    top: `${obs.pin.y}%`,
                    opacity: pinOpacity,
                    // Pin placement: for needle, tip is at bottom-center (0, 0)
                    transform: pinMode === 'needle' ? 'translate(-50%, -100%)' : 'translate(-50%, -50%)',
                  }}
                >
                  {/* Mode 1: Precision Needle Pin (Does NOT obscure drawing details) */}
                  {pinMode === 'needle' && (
                    <div className="flex flex-col items-center relative transition-transform duration-150 hover:scale-125">
                      
                      {/* Pin Head Badge */}
                      <div
                        className={`px-1.5 py-0.5 rounded-full text-[9px] font-mono font-bold text-white shadow-md flex items-center gap-1 border border-white/80 transition-all ${
                          isSelected ? 'ring-2 ring-amber-400 scale-110 bg-amber-600' : ''
                        }`}
                        style={{ backgroundColor: isSelected ? undefined : pinColor }}
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                        <span>{obs.serialNumber}</span>
                      </div>

                      {/* Needle Shaft and Ultra-Fine Tip pointing directly to the millimeter coordinate */}
                      <svg width="18" height="22" viewBox="0 0 18 22" fill="none" className="drop-shadow-sm -mt-0.5">
                        {/* Needle stem */}
                        <line x1="9" y1="0" x2="9" y2="20" stroke={pinColor} strokeWidth="2.5" strokeLinecap="round" />
                        <line x1="9" y1="0" x2="9" y2="19" stroke="#ffffff" strokeWidth="1" />
                        {/* Sharp pinpoint dot at bottom */}
                        <circle cx="9" cy="20.5" r="1.5" fill="#ffffff" stroke={pinColor} strokeWidth="1.5" />
                      </svg>

                      {/* Hairline Crosshair at the exact coordinate */}
                      <div className="absolute top-[calc(100%-1px)] left-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none opacity-60 group-hover:opacity-100">
                        <div className="absolute top-1/2 left-0 right-0 h-[1px]" style={{ backgroundColor: pinColor }} />
                        <div className="absolute left-1/2 top-0 bottom-0 w-[1px]" style={{ backgroundColor: pinColor }} />
                      </div>

                    </div>
                  )}

                  {/* Mode 2: Micro Dot (6px diameter - Minimalist) */}
                  {pinMode === 'dot' && (
                    <div className="relative flex items-center justify-center transition-transform hover:scale-150">
                      {isCritical && (
                        <span 
                          className="absolute w-5 h-5 rounded-full animate-ping opacity-60"
                          style={{ backgroundColor: pinColor }}
                        />
                      )}
                      <div
                        className={`w-3.5 h-3.5 rounded-full border-2 border-white shadow-md ${
                          isSelected ? 'ring-2 ring-amber-400 scale-125' : ''
                        }`}
                        style={{ backgroundColor: pinColor }}
                      />
                      {/* Micro hair crosshair */}
                      <div className="absolute inset-0 pointer-events-none opacity-40">
                        <div className="w-full h-[0.5px] bg-white absolute top-1/2" />
                        <div className="h-full w-[0.5px] bg-white absolute left-1/2" />
                      </div>
                    </div>
                  )}

                  {/* Mode 3: Serial Badge */}
                  {pinMode === 'badge' && (
                    <div className="relative flex items-center justify-center transition-transform hover:scale-115">
                      <div
                        className={`px-2 py-0.5 rounded-md text-[10px] font-mono font-bold text-white shadow-lg border border-white flex items-center gap-1 ${
                          isSelected ? 'ring-2 ring-amber-400' : ''
                        }`}
                        style={{ backgroundColor: pinColor }}
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-white" />
                        <span>{obs.serialNumber}</span>
                      </div>
                    </div>
                  )}

                  {/* Mode 4: Hover Only */}
                  {pinMode === 'hover_only' && (
                    <div className="relative flex items-center justify-center">
                      <div
                        className="w-2 h-2 rounded-full border border-white opacity-40 group-hover:opacity-100 transition-opacity"
                        style={{ backgroundColor: pinColor }}
                      />
                      <div className="absolute top-full mt-1 hidden group-hover:flex px-1.5 py-0.5 bg-slate-950 text-white text-[9px] rounded font-mono font-bold shadow whitespace-nowrap">
                        {obs.serialNumber}
                      </div>
                    </div>
                  )}

                </div>
              );
            })}
          </div>
        </div>

        {/* Selected Pin Detail Popover Card */}
        {selectedPinObs && (
          <div className="absolute bottom-4 right-4 z-30 w-80 sm:w-96 bg-slate-900/95 backdrop-blur-md border border-slate-700 rounded-2xl shadow-2xl p-4 text-slate-100 animate-in fade-in duration-200">
            <div className="flex items-start justify-between gap-2 border-b border-slate-800 pb-2.5">
              <div className="flex items-center gap-2">
                <span
                  className="px-2 py-0.5 rounded-lg text-xs font-mono font-bold text-white shadow"
                  style={{
                    backgroundColor: discMap.get(selectedPinObs.disciplineId)?.color || '#f59e0b',
                  }}
                >
                  {selectedPinObs.serialNumber}
                </span>
                <span className="text-xs text-slate-400">
                  {isAr ? discMap.get(selectedPinObs.disciplineId)?.nameAr : discMap.get(selectedPinObs.disciplineId)?.nameEn}
                </span>
              </div>
              <button
                onClick={() => setSelectedPinObs(null)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800"
              >
                ✕
              </button>
            </div>

            {/* Title & Location */}
            <div className="mt-2.5 space-y-1">
              <h4 className="font-bold text-sm text-white line-clamp-2">
                {selectedPinObs.title}
              </h4>
              <p className="text-xs text-slate-400 flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-amber-500" />
                <span>{selectedPinObs.locationZone}</span>
              </p>
            </div>

            {/* Status & Priority badges */}
            <div className="flex items-center gap-2 mt-3">
              <span className={`text-[10px] px-2 py-0.5 rounded-md font-semibold border ${getStatusLabel(selectedPinObs.status).bg} ${getStatusLabel(selectedPinObs.status).color}`}>
                {isAr ? getStatusLabel(selectedPinObs.status).textAr : getStatusLabel(selectedPinObs.status).textEn}
              </span>
              <span className={`text-[10px] px-2 py-0.5 rounded-md font-semibold ${getPriorityBadge(selectedPinObs.priority).badge}`}>
                {isAr ? getPriorityBadge(selectedPinObs.priority).textAr : getPriorityBadge(selectedPinObs.priority).textEn}
              </span>
              {selectedPinObs.photos?.length > 0 && (
                <span className="text-[10px] px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 flex items-center gap-1">
                  <Camera className="w-3 h-3 text-amber-400" />
                  <span>{selectedPinObs.photos.length} {isAr ? 'صور' : 'Photos'}</span>
                </span>
              )}
            </div>

            {/* Quick Status Dropdown */}
            <div className="mt-3 flex items-center justify-between text-xs border-t border-slate-800 pt-2.5">
              <span className="text-slate-400">{isAr ? 'تحديث الحالة السريع:' : 'Quick Status:'}</span>
              <select
                value={selectedPinObs.status}
                onChange={e => {
                  const newSt = e.target.value as ObservationStatus;
                  onQuickStatusChange(selectedPinObs.id, newSt);
                  setSelectedPinObs(prev => (prev ? { ...prev, status: newSt } : null));
                }}
                className="bg-slate-950 border border-slate-700 rounded-lg px-2 py-1 text-xs text-amber-400 font-medium focus:outline-none"
              >
                <option value="open">مفتوحة / OPEN</option>
                <option value="in_progress">قيد المعالجة / IN PROGRESS</option>
                <option value="verified">تم التحقق / VERIFIED</option>
                <option value="closed">مغلقة / CLOSED</option>
              </select>
            </div>

            {/* Action Buttons */}
            <div className="mt-3 flex items-center gap-2">
              <button
                onClick={() => onSelectObservation(selectedPinObs)}
                className="flex-1 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors"
              >
                <Eye className="w-3.5 h-3.5" />
                <span>{isAr ? 'عرض التقرير الكامل' : 'View Full Sheet'}</span>
              </button>
              <button
                onClick={() => onEditObservation(selectedPinObs)}
                className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors"
                title={isAr ? 'تعديل الملاحظة' : 'Edit'}
              >
                <Edit className="w-4 h-4" />
              </button>
              <button
                onClick={() => {
                  if (window.confirm(isAr ? `هل أنت متأكد من حذف الملاحظة رقم ${selectedPinObs.serialNumber}؟` : `Delete observation ${selectedPinObs.serialNumber}?`)) {
                    onDeleteObservation(selectedPinObs.id);
                    setSelectedPinObs(null);
                  }
                }}
                className="p-1.5 rounded-xl bg-slate-800 hover:bg-red-950/60 text-red-400 transition-colors"
                title={isAr ? 'حذف الملاحظة' : 'Delete'}
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Bottom Left Legend */}
        <div className="absolute bottom-4 left-4 z-20 hidden md:block bg-slate-950/90 backdrop-blur-md border border-slate-800 rounded-xl p-3 shadow-xl max-w-xs text-xs">
          <div className="font-bold text-slate-300 mb-2 flex items-center justify-between">
            <span>{isAr ? 'دليل التخصصات والرموز:' : 'Discipline Legend:'}</span>
            <span className="text-[10px] text-amber-400 font-mono">
              {filteredObservations.length} {isAr ? 'دبابيس ظاهرة' : 'Pins Visible'}
            </span>
          </div>
          <div className="grid grid-cols-2 gap-x-3 gap-y-1.5">
            {disciplines.map(d => (
              <div key={d.id} className="flex items-center gap-1.5">
                <span
                  className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                  style={{ backgroundColor: d.color }}
                />
                <span className="font-mono text-[10px] font-bold text-slate-200">{d.code}:</span>
                <span className="text-[10px] text-slate-400 truncate">{isAr ? d.nameAr : d.nameEn}</span>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
};
