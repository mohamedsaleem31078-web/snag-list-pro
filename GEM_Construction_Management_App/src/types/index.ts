export type ObservationStatus = 
  | 'open' 
  | 'in_progress' 
  | 'verified' 
  | 'reopened' 
  | 'closed' 
  | 'disputed' 
  | 'distributed';

export type ObservationPriority = 'critical' | 'high' | 'medium' | 'low';

export interface Discipline {
  id: string;
  code: string; // e.g. 'ARC', 'CIV', 'MEC', 'ELE', 'LAN', 'STR'
  nameAr: string;
  nameEn: string;
  color: string; // Hex color for pin & badges
  bgLight: string;
  border: string;
  icon: string;
  currentSequence: number;
}

export interface PhotoAnnotation {
  id: string;
  originalUrl: string;
  annotatedUrl?: string;
  caption?: string;
  uploadedAt: string;
}

export interface Observation {
  id: string;
  serialNumber: string; // e.g. ARC-001, CIV-002
  disciplineId: string;
  title: string;
  description: string;
  locationZone: string; // e.g. 'Piazza', 'Ticketing D13'
  drawingReference: string;
  pin: {
    x: number; // percentage (0 - 100)
    y: number; // percentage (0 - 100)
  };
  contractor: string;
  status: ObservationStatus;
  priority: ObservationPriority;
  photos: PhotoAnnotation[];
  createdAt: string;
  dueDate: string;
  closedAt?: string;
  inspectorName: string;
  inspectorNotes?: string;
  contractorResponse?: string;
  costImpact?: string;
  rootCause?: string;
  ageDays?: number;
}

// Daily Field Photo in the Gallery
export interface DailyPhoto {
  id: string;
  url: string;
  thumbnailUrl?: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:mm
  zone: string;
  disciplineId?: string;
  caption?: string;
  tags?: string[];
  annotatedUrl?: string;
}

// Visual Photo Report Card
export interface PhotoReportCard {
  id: string;
  photoUrl: string;
  title: string;
  description: string;
  location: string;
  contractor: string;
  status: ObservationStatus;
  priority: ObservationPriority;
  actionRequired: string;
}

// Visual Photo Report Template / Document
export interface PhotoReportDocument {
  id: string;
  titleAr: string;
  titleEn: string;
  reportNumber: string;
  date: string;
  zone: string;
  drawingRef: string;
  inspectorName: string;
  contractorName: string;
  layoutType: '1-large' | '2-side' | '4-grid' | '6-grid';
  headerNote: string;
  cards: PhotoReportCard[];
}

// Planning Time Schedule Activity
export interface PlanningActivity {
  id: string;
  code: string;
  nameAr: string;
  nameEn: string;
  disciplineId: string;
  plannedStartDate: string;
  plannedEndDate: string;
  actualProgress: number; // 0 - 100
  plannedProgress?: number; // 0 - 100
  weightPercentage?: number; // Weight in schedule
  varianceDays?: number; // Slip / lag days
  status: 'on_track' | 'delayed' | 'completed' | 'not_started';
  contractor: string;
  zone: string;
}

export interface ProjectMetadata {
  projectNameAr: string;
  projectNameEn: string;
  projectSubtitle: string;
  drawingTitle: string;
  drawingNumber: string;
  scale: string;
  date: string;
  client: string;
  consultant: string;
  projectManager: string;
  contractor: string;
  blueprintUrl: string;
  logoUrl?: string;
}

// Map Pin Visual Configurations
export interface PinStyleConfig {
  mode: 'precision_needle' | 'compact_dot' | 'badge' | 'hover_only';
  size: 'small' | 'medium' | 'large';
  opacity: number; // 0.2 to 1.0
  showLabels: boolean;
  ghostMode: boolean; // hide pins temporarily to see blueprint
}

// Column Visibility Toggles
export interface ColumnVisibility {
  serial: boolean;
  discipline: boolean;
  location: boolean;
  description: boolean;
  contractor: boolean; // requested to be hidable
  photos: boolean;
  priority: boolean;
  status: boolean;
  dueDate: boolean;
  inspector: boolean;
  actions: boolean;
}

// Toolbar Customization Configuration
export interface ToolbarConfig {
  showNewSnag: boolean;
  showPrint: boolean;
  showExcel: boolean;
  showGallery: boolean;
  showAiAssistant: boolean;
  showDownload: boolean;
  showUndo: boolean;
  buttonOrder: string[];
}

export interface PrintSettings {
  reportType: 'punch_list' | 'single_notice' | 'summary_report' | 'plan_sheet' | 'contractor_report' | 'aged_report' | 'photo_report';
  paperSize: 'a4' | 'a3' | 'letter';
  orientation: 'portrait' | 'landscape';
  includePhotos: boolean;
  includeComments: boolean;
  includeSignatures: boolean;
  includeDrawingRef: boolean;
  includeQrCode: boolean;
  includeLogos: boolean;
  selectedDisciplineId: string | 'all';
  selectedStatus: ObservationStatus | 'all';
  dateFrom?: string;
  dateTo?: string;
  columnVisibility: ColumnVisibility;
}

export interface SystemSettings {
  appName: string;
  theme: 'light';
  language: 'ar' | 'en';
  autoSaveIntervalMs: number;
  enableSoundAlerts: boolean;
  pinStyle: PinStyleConfig;
  columnVisibility: ColumnVisibility;
  toolbar: ToolbarConfig;
  customLocations: string[];
  customContractors: string[];
}
