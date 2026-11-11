import { Discipline, Observation, ObservationPriority, ObservationStatus, ProjectMetadata } from '../types';

export const STORAGE_KEYS = {
  OBSERVATIONS: 'gem_observations_v2',
  DISCIPLINES: 'gem_disciplines_v2',
  PROJECT: 'gem_project_metadata_v2',
  PLANNING: 'gem_planning_activities_v2',
  SETTINGS: 'gem_system_settings_v2',
  DAILY_PHOTOS: 'gem_daily_photos_v2',
};

export const getStatusLabel = (status: ObservationStatus): { 
  textAr: string; 
  textEn: string; 
  combined: string; 
  color: string; 
  bg: string; 
  border: string;
  pillBg: string;
  pillText: string;
  topStripe: string;
} => {
  switch (status) {
    case 'open':
      return { 
        textAr: 'مفتوحة', 
        textEn: 'OPEN', 
        combined: 'OPEN / مفتوحة', 
        color: 'text-red-700', 
        bg: 'bg-red-50', 
        border: 'border-red-200',
        pillBg: 'bg-red-600',
        pillText: 'text-white',
        topStripe: 'border-t-4 border-t-red-500'
      };
    case 'in_progress':
      return { 
        textAr: 'قيد التنفيذ', 
        textEn: 'IN PROGRESS', 
        combined: 'IN PROGRESS / قيد التنفيذ', 
        color: 'text-amber-800', 
        bg: 'bg-amber-50', 
        border: 'border-amber-200',
        pillBg: 'bg-amber-600',
        pillText: 'text-white',
        topStripe: 'border-t-4 border-t-amber-500'
      };
    case 'verified':
      return { 
        textAr: 'تم التحقق', 
        textEn: 'VERIFIED', 
        combined: 'VERIFIED / تم التحقق', 
        color: 'text-teal-800', 
        bg: 'bg-teal-50', 
        border: 'border-teal-200',
        pillBg: 'bg-teal-600',
        pillText: 'text-white',
        topStripe: 'border-t-4 border-t-teal-500'
      };
    case 'reopened':
      return { 
        textAr: 'أُعيد فتحها', 
        textEn: 'REOPENED', 
        combined: 'REOPENED / أُعيد فتحها', 
        color: 'text-purple-800', 
        bg: 'bg-purple-50', 
        border: 'border-purple-200',
        pillBg: 'bg-purple-700',
        pillText: 'text-white',
        topStripe: 'border-t-4 border-t-purple-500'
      };
    case 'closed':
      return { 
        textAr: 'مغلقة', 
        textEn: 'CLOSED', 
        combined: 'CLOSED / مغلقة', 
        color: 'text-emerald-800', 
        bg: 'bg-emerald-50', 
        border: 'border-emerald-200',
        pillBg: 'bg-emerald-600',
        pillText: 'text-white',
        topStripe: 'border-t-4 border-t-emerald-500'
      };
    case 'disputed':
      return { 
        textAr: 'متنازع عليها', 
        textEn: 'DISPUTED', 
        combined: 'DISPUTED / متنازع عليها', 
        color: 'text-rose-800', 
        bg: 'bg-rose-50', 
        border: 'border-rose-200',
        pillBg: 'bg-rose-800',
        pillText: 'text-white',
        topStripe: 'border-t-4 border-t-rose-600'
      };
    case 'distributed':
      return { 
        textAr: 'تم التوزيع', 
        textEn: 'DISTRIBUTED', 
        combined: 'DISTRIBUTED / تم التوزيع', 
        color: 'text-blue-800', 
        bg: 'bg-blue-50', 
        border: 'border-blue-200',
        pillBg: 'bg-blue-600',
        pillText: 'text-white',
        topStripe: 'border-t-4 border-t-blue-500'
      };
    default:
      return { 
        textAr: 'غير محدد', 
        textEn: 'UNKNOWN', 
        combined: 'UNKNOWN', 
        color: 'text-slate-700', 
        bg: 'bg-slate-50', 
        border: 'border-slate-200',
        pillBg: 'bg-slate-600',
        pillText: 'text-white',
        topStripe: 'border-t-4 border-t-slate-400'
      };
  }
};

export const getPriorityBadge = (priority: ObservationPriority): { textAr: string; textEn: string; color: string; badge: string } => {
  switch (priority) {
    case 'critical':
      return { textAr: 'حرجة وعاجلة جداً', textEn: 'CRITICAL', color: 'text-red-700', badge: 'bg-red-600 text-white animate-pulse' };
    case 'high':
      return { textAr: 'عالية الأهمية', textEn: 'HIGH', color: 'text-orange-700', badge: 'bg-orange-500 text-white' };
    case 'medium':
      return { textAr: 'متوسطة', textEn: 'MEDIUM', color: 'text-amber-700', badge: 'bg-amber-500 text-white' };
    case 'low':
      return { textAr: 'منخفضة / عادية', textEn: 'LOW', color: 'text-slate-700', badge: 'bg-slate-500 text-white' };
    default:
      return { textAr: 'عادية', textEn: 'NORMAL', color: 'text-slate-600', badge: 'bg-slate-400 text-white' };
  }
};

export const generateNextSerial = (disciplineCode: string, observations: Observation[]): string => {
  const prefix = disciplineCode.toUpperCase().trim();
  const pattern = new RegExp(`^${prefix}[-_](?:DEMO[-_])?(\\d+)`, 'i');
  
  let maxSeq = 0;
  for (const obs of observations) {
    const match = obs.serialNumber.match(pattern);
    if (match && match[1]) {
      const num = parseInt(match[1], 10);
      if (!isNaN(num) && num > maxSeq) {
        maxSeq = num;
      }
    }
  }

  const nextNum = maxSeq + 1;
  const padded = String(nextNum).padStart(3, '0');
  return `${prefix}-${padded}`;
};

export const exportToCSV = (observations: Observation[], disciplines: Discipline[], filename = 'GEM-Construction-Snags.csv') => {
  const discMap = new Map(disciplines.map(d => [d.id, d.nameAr]));
  
  const headers = [
    'الرقم (ID)',
    'البند / التخصص',
    'الموقع (LOCATION)',
    'عنوان الملاحظة (TITLE)',
    'الوصف الفني (DESCRIPTION)',
    'المقاول (CONTRACTOR)',
    'الحالة (STATUS)',
    'درجة الخطورة (PRIORITY)',
    'تاريخ الرصد',
    'تاريخ الاستحقاق',
    'المهندس الراصد',
    'توجيهات الاستشاري',
    'رد المقاول',
    'عدد الصور',
  ];

  const rows = observations.map(obs => {
    const discName = discMap.get(obs.disciplineId) || obs.disciplineId;
    const priorityLabel = getPriorityBadge(obs.priority).textAr;
    const statusLabel = getStatusLabel(obs.status).combined;
    
    return [
      `"${obs.serialNumber}"`,
      `"${discName}"`,
      `"${(obs.locationZone || '').replace(/"/g, '""')}"`,
      `"${obs.title.replace(/"/g, '""')}"`,
      `"${(obs.description || '').replace(/"/g, '""')}"`,
      `"${(obs.contractor || '').replace(/"/g, '""')}"`,
      `"${statusLabel}"`,
      `"${priorityLabel}"`,
      `"${obs.createdAt}"`,
      `"${obs.dueDate}"`,
      `"${(obs.inspectorName || '').replace(/"/g, '""')}"`,
      `"${(obs.inspectorNotes || '').replace(/"/g, '""')}"`,
      `"${(obs.contractorResponse || '').replace(/"/g, '""')}"`,
      `"${obs.photos?.length || 0}"`,
    ].join(',');
  });

  const csvContent = '\uFEFF' + [headers.join(','), ...rows].join('\r\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

export const exportToJSON = (data: any, filename?: string) => {
  const jsonStr = JSON.stringify(data, null, 2);
  const blob = new Blob([jsonStr], { type: 'application/json' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', filename || `GEM-Portable-Database-${new Date().toISOString().slice(0, 10)}.gemdata`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

export const exportPlanWithPins = async (
  imageUrl: string,
  observations: Observation[],
  disciplines: Discipline[],
  projectName: string,
  drawingNumber: string
): Promise<void> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = imageUrl;

    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.naturalWidth || 2400;
      canvas.height = img.naturalHeight || 1600;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error('Canvas context failed'));
        return;
      }

      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      const discMap = new Map(disciplines.map(d => [d.id, d]));

      observations.forEach(obs => {
        const disc = discMap.get(obs.disciplineId);
        const pinColor = disc ? disc.color : '#e11d48';
        const posX = (obs.pin.x / 100) * canvas.width;
        const posY = (obs.pin.y / 100) * canvas.height;

        ctx.save();
        ctx.shadowColor = 'rgba(0, 0, 0, 0.4)';
        ctx.shadowBlur = 10;
        ctx.shadowOffsetY = 4;

        ctx.beginPath();
        ctx.arc(posX, posY, 22, 0, Math.PI * 2);
        ctx.fillStyle = pinColor;
        ctx.fill();
        ctx.lineWidth = 4;
        ctx.strokeStyle = '#ffffff';
        ctx.stroke();

        ctx.beginPath();
        ctx.arc(posX, posY, 8, 0, Math.PI * 2);
        ctx.fillStyle = '#ffffff';
        ctx.fill();

        ctx.restore();
        ctx.font = 'bold 15px Arial, sans-serif';
        const labelText = obs.serialNumber;
        const textMetrics = ctx.measureText(labelText);
        const boxWidth = textMetrics.width + 16;
        const boxHeight = 24;

        ctx.fillStyle = '#0f172a';
        ctx.roundRect(posX - boxWidth / 2, posY - 48, boxWidth, boxHeight, 6);
        ctx.fill();
        ctx.strokeStyle = pinColor;
        ctx.lineWidth = 2;
        ctx.stroke();

        ctx.fillStyle = '#ffffff';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(labelText, posX, posY - 36);
      });

      // Top logo banner stamp
      ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';
      ctx.roundRect(canvas.width - 500, 20, 480, 100, 10);
      ctx.fill();
      ctx.strokeStyle = '#1e293b';
      ctx.lineWidth = 2;
      ctx.stroke();

      ctx.fillStyle = '#0f172a';
      ctx.font = 'bold 18px Arial, sans-serif';
      ctx.textAlign = 'right';
      ctx.fillText(projectName, canvas.width - 30, 50);
      ctx.font = 'bold 13px Arial';
      ctx.fillStyle = '#b45309';
      ctx.fillText('Hill International · EHAF Consulting Engineers', canvas.width - 30, 75);
      ctx.font = '12px monospace';
      ctx.fillStyle = '#475569';
      ctx.fillText(`DWG: ${drawingNumber} · TOTAL PINS: ${observations.length}`, canvas.width - 30, 98);

      const dataUrl = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.href = dataUrl;
      link.download = `GEM-Marked-Layout-${Date.now()}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      resolve();
    };

    img.onerror = (e) => reject(e);
  });
};
