export type Language = 'ar' | 'en';

export const translations = {
  ar: {
    // Navigation & Header
    projectName: 'المتحف المصري الكبير',
    projectSubtitle: 'منظومة إدارة الإنشاءات والملاحظات الهندسية',
    tabDashboard: 'لوحة التحكم',
    tabPlan: 'المخططات والمواقع',
    tabSnags: 'سجل الملاحظات',
    tabPlanning: 'التخطيط والجدول الزمني',
    tabPhotoReports: 'استوديو التقارير المصورة',
    tabDailyGallery: 'معرض الصور اليومي',
    tabReports: 'التقارير الرسمية',
    tabSettings: 'الإعدادات والتحكم',
    
    // Actions
    newIssue: 'ملاحظة جديدة',
    print: 'طباعة',
    exportExcel: 'تصدير إكسيل',
    downloadApp: 'تحميل البرنامج',
    undo: 'تراجع',
    redo: 'إعادة',
    save: 'حفظ',
    cancel: 'إلغاء',
    delete: 'حذف',
    edit: 'تعديل',
    search: 'بحث',
    filter: 'تصفية',
    all: 'الكل',
    customColumns: 'تخصيص الأعمدة',
    customizeToolbar: 'تخصيص الأزرار',
    aiAssistant: 'مساعد المهندس الذكي (AI)',
    
    // KPI Cards
    totalSnags: 'إجمالي الملاحظات',
    open: 'مفتوحة',
    inProgress: 'قيد التنفيذ',
    verified: 'تم التحقق',
    reopened: 'أُعيد فتحها',
    closed: 'مغلقة',
    disputed: 'متنازع عليها',
    distributed: 'تم التوزيع',
    
    // Map & Pins
    pinDropMode: 'إسقاط دبوس جديد',
    pinDropPrompt: 'انقر على المخطط لتحديد مكان الملاحظة بدقة',
    needleMode: 'دبوس إبرة دقيق جداً',
    dotMode: 'نقطة ليزر مدمجة',
    badgeMode: 'شارة كاملة',
    hidePins: 'إخفاء الدبابيس مؤقتاً',
    showPins: 'إظهار الدبابيس',
    pinOpacity: 'شفافية الدبابيس',
    
    // Planning
    timeSchedule: 'البرنامج الزمني للمشروع',
    importExcel: 'استيراد برنامج إكسيل',
    downloadTemplate: 'تحميل نموذج إكسيل',
    activityCode: 'كود النشاط',
    activityName: 'اسم النشاط',
    startDate: 'تاريخ البدء',
    endDate: 'تاريخ الانتهاء',
    actualProgress: 'الإنجاز الفعلي',
    variance: 'أيام الانحراف',
    
    // Snags & Columns
    serial: 'الرقم التسلسلي',
    discipline: 'البند والتخصص',
    location: 'الموقع والمنطقة',
    description: 'الوصف الفني',
    contractor: 'المقاول المسند إليه',
    photos: 'الصور والتحديد',
    priority: 'درجة الخطورة',
    status: 'الحالة',
    dueDate: 'تاريخ الاستحقاق',
    inspector: 'المهندس الراصد',
    actions: 'إجراءات',
    
    // Priorities
    critical: 'حرجة وعاجلة جداً',
    high: 'عالية الأهمية',
    medium: 'متوسطة',
    low: 'منخفضة',
    
    // Status badges
    saved: 'تم الحفظ تلقائياً',
  },
  en: {
    // Navigation & Header
    projectName: 'The Grand Egyptian Museum',
    projectSubtitle: 'GEM Construction Management System',
    tabDashboard: 'Dashboard',
    tabPlan: 'Drawings & Location',
    tabSnags: 'Snags / Issues',
    tabPlanning: 'Planning & Schedule',
    tabPhotoReports: 'Photo Report Studio',
    tabDailyGallery: 'Daily Photo Gallery',
    tabReports: 'Official Reports',
    tabSettings: 'Settings & Control',
    
    // Actions
    newIssue: 'New Issue +',
    print: 'Print',
    exportExcel: 'Export Excel',
    downloadApp: 'Download App',
    undo: 'Undo',
    redo: 'Redo',
    save: 'Save',
    cancel: 'Cancel',
    delete: 'Delete',
    edit: 'Edit',
    search: 'Search',
    filter: 'Filter',
    all: 'All',
    customColumns: 'Columns',
    customizeToolbar: 'Customize Toolbar',
    aiAssistant: 'AI Engineering Assistant',
    
    // KPI Cards
    totalSnags: 'TOTAL SNAGS',
    open: 'OPEN',
    inProgress: 'IN PROGRESS',
    verified: 'VERIFIED',
    reopened: 'REOPENED',
    closed: 'CLOSED',
    disputed: 'DISPUTED',
    distributed: 'DISTRIBUTED',
    
    // Map & Pins
    pinDropMode: 'Drop Pin on Drawing',
    pinDropPrompt: 'Click on blueprint to pinpoint defect location',
    needleMode: 'Precision Needle Pin',
    dotMode: 'Laser Dot (Compact)',
    badgeMode: 'Full Serial Badge',
    hidePins: 'Ghost Pins (Blueprint View)',
    showPins: 'Show Pins',
    pinOpacity: 'Pin Opacity',
    
    // Planning
    timeSchedule: 'Project Time Schedule & Progress',
    importExcel: 'Import Excel Schedule',
    downloadTemplate: 'Download Excel Template',
    activityCode: 'Activity Code',
    activityName: 'Activity Name',
    startDate: 'Start Date',
    endDate: 'End Date',
    actualProgress: 'Actual Progress',
    variance: 'Variance (Days)',
    
    // Snags & Columns
    serial: 'ID / Serial',
    discipline: 'Discipline',
    location: 'Location / Zone',
    description: 'Technical Description',
    contractor: 'Assigned Contractor',
    photos: 'Photos / Markups',
    priority: 'Priority',
    status: 'Status',
    dueDate: 'Due Date',
    inspector: 'Inspector',
    actions: 'Actions',
    
    // Priorities
    critical: 'Critical Urgent',
    high: 'High',
    medium: 'Medium',
    low: 'Low',
    
    // Status badges
    saved: 'Saved',
  },
};

export function t(key: keyof typeof translations['ar'], lang: Language = 'ar'): string {
  const dict = translations[lang] || translations.ar;
  return dict[key] || translations.ar[key] || key;
}
