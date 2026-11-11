import React, { useState } from 'react';
import { 
  X, Download, Monitor, Smartphone, Check, 
  Copy, HardDrive, ShieldCheck, Sparkles, ExternalLink,
  Laptop, Share2, HelpCircle, Save, Database, ArrowRight
} from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';
import { ProjectMetadata } from '../types';

interface DownloadAppModalProps {
  isOpen: boolean;
  onClose: () => void;
  onExportPortablePackage: () => void;
  project: ProjectMetadata;
}

export const DownloadAppModal: React.FC<DownloadAppModalProps> = ({
  isOpen,
  onClose,
  onExportPortablePackage,
  project,
}) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [copiedLink, setCopiedLink] = useState(false);
  const [activeTab, setActiveTab] = useState<'install' | 'guide'>('install');

  if (!isOpen) return null;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-xs p-4 animate-in fade-in duration-200" dir="rtl">
      <div className="bg-white border border-slate-300 rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden text-slate-800 max-h-[92vh] flex flex-col">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-[#0f2237] text-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500 flex items-center justify-center text-slate-950 font-bold shadow-md shrink-0">
              <Download className="w-5 h-5 text-slate-950" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                تحميل وتثبيت البرنامج وحفظ البيانات (Desktop & Portable App)
              </h2>
              <p className="text-xs text-amber-300">
                تشغيل البرنامج كتطبيق مستقل على سطح المكتب ونقل وحفظ البيانات دون إنترنت
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab switch between Install & How-to-guide */}
        <div className="flex border-b border-slate-200 bg-slate-100 px-6 pt-2 text-xs font-bold gap-2">
          <button
            onClick={() => setActiveTab('install')}
            className={`py-2 px-4 rounded-t-lg transition-all border-t-2 ${
              activeTab === 'install'
                ? 'bg-white text-slate-900 border-amber-500 shadow-xs'
                : 'text-slate-600 hover:text-slate-900 border-transparent'
            }`}
          >
            تثبيت البرنامج وتحميل النسخة المحمولة
          </button>
          <button
            onClick={() => setActiveTab('guide')}
            className={`py-2 px-4 rounded-t-lg transition-all border-t-2 ${
              activeTab === 'guide'
                ? 'bg-white text-slate-900 border-amber-500 shadow-xs'
                : 'text-slate-600 hover:text-slate-900 border-transparent'
            }`}
          >
            طريقة الحفظ والتعامل مع البرنامج ونقل البيانات
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1 text-xs">
          
          {activeTab === 'install' && (
            <>
              {/* Method 1: Desktop / Mobile App Installation (PWA) */}
              <div className="bg-slate-50 border-2 border-amber-500/50 rounded-xl p-4.5 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Laptop className="w-5 h-5 text-amber-600" />
                    <h3 className="text-sm font-bold text-slate-900">
                      1. تثبيت البرنامج كتطبيق رسمي على سطح المكتب (Desktop App):
                    </h3>
                  </div>
                  <span className="px-2 py-0.5 rounded bg-amber-100 text-amber-800 font-bold text-[10px]">
                    مُوصى به (Recommended)
                  </span>
                </div>

                <p className="text-slate-600 text-[11px] leading-relaxed">
                  يتحول البرنامج بضغطة زر إلى تطبيق أصلي مستقل يظهر على سطح مكتب جهازك (Desktop Shortcut) وشريط المهام (Taskbar) بشعار المتحف المصري الكبير، ويعمل كنافذة مستقلة بدون شريط متصفح وبدون إنترنت.
                </p>

                {isInstalled ? (
                  <div className="p-3 bg-emerald-50 border border-emerald-300 rounded-lg text-emerald-800 font-bold text-xs flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-600" />
                    <span>البرنامج مثبت بالفعل على جهازك ويعمل كتطبيق سطح مكتب مستقل!</span>
                  </div>
                ) : isInstallable ? (
                  <button
                    onClick={install}
                    className="w-full py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-black text-sm flex items-center justify-center gap-2 shadow-md transition-all"
                  >
                    <Monitor className="w-4 h-4 text-slate-950" />
                    <span>تثبيت البرنامج على الكمبيوتر الآن (Install Desktop App)</span>
                  </button>
                ) : isIOS ? (
                  <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg text-blue-900 space-y-1 text-[11px]">
                    <strong className="block text-xs font-bold">طريقة التثبيت على آيفون / آيباد (Safari):</strong>
                    <ol className="list-decimal list-inside space-y-0.5">
                      <li>اضغط على زر المشاركة (Share) في متصفح Safari.</li>
                      <li>اضغط على <strong>إضافة إلى الشاشة الرئيسية (Add to Home Screen)</strong>.</li>
                    </ol>
                  </div>
                ) : (
                  <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-slate-700 space-y-1 text-[11px]">
                    <strong className="block text-xs font-bold text-amber-900">طريقة التثبيت المباشرة من المتصفح:</strong>
                    <p>
                      • في متصفح Google Chrome أو Microsoft Edge: اضغط على أيقونة التثبيت <span className="font-mono bg-white px-1.5 py-0.5 rounded border border-slate-300 font-bold">⊕ Install</span> في شريط العنوان أعلى الشاشة، ثم اضغط <strong>Install</strong>.
                    </p>
                  </div>
                )}
              </div>

              {/* Method 2: Portable Offline Database Package */}
              <div className="bg-slate-50 border border-slate-300 rounded-xl p-4.5 space-y-3">
                <div className="flex items-center gap-2">
                  <HardDrive className="w-5 h-5 text-blue-600" />
                  <h3 className="text-sm font-bold text-slate-900">
                    2. تنزيل ملف قاعدة البيانات المحمولة بالكامل (.gemdata):
                  </h3>
                </div>

                <p className="text-slate-600 text-[11px] leading-relaxed">
                  تنزيل ملف واحد مضغوط وشامل يحتوي على كافة المخططات، الملاحظات، الصور الميدانية، الجداول الزمنية، والإعدادات. يمكنك وضعه على فلاش ميموري (USB) ونقله لأي جهاز آخر.
                </p>

                <button
                  onClick={() => {
                    onExportPortablePackage();
                    onClose();
                  }}
                  className="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition-all"
                >
                  <Download className="w-4 h-4 text-amber-400" />
                  <span>تحميل ملف النسخة المحمولة الكاملة (.gemdata) الآن</span>
                </button>
              </div>

              {/* Method 3: Cloud Access Link */}
              <div className="bg-slate-50 border border-slate-300 rounded-xl p-4 space-y-2">
                <h4 className="font-bold text-xs text-slate-900 flex items-center gap-1.5">
                  <Share2 className="w-4 h-4 text-emerald-600" />
                  <span>رابط البرنامج السحابي للوصول المباشر:</span>
                </h4>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    readOnly
                    value={window.location.href}
                    className="bg-white border border-slate-300 rounded px-2.5 py-1.5 text-slate-600 font-mono text-[11px] flex-1 select-all"
                  />
                  <button
                    onClick={handleCopyLink}
                    className="px-3 py-1.5 rounded bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold text-xs flex items-center gap-1"
                  >
                    {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedLink ? 'تم النسخ!' : 'نسخ الرابط'}</span>
                  </button>
                </div>
              </div>
            </>
          )}

          {activeTab === 'guide' && (
            <div className="space-y-4">
              
              {/* Step 1: How data is saved */}
              <div className="p-4 rounded-xl border border-emerald-200 bg-emerald-50/50 space-y-2">
                <div className="flex items-center gap-2 text-emerald-900 font-bold text-sm">
                  <Save className="w-4 h-4 text-emerald-600" />
                  <span>1. كيف يحفظ البرنامج بياناتك؟ (Auto-Save)</span>
                </div>
                <p className="text-slate-700 text-[11px] leading-relaxed">
                  البرنامج مجهز بنظام **حفظ تلقائي لحظي (Instant Local Storage)**. كلما أضفت ملاحظة، أسقطت دبوساً، عدلت صورة، أو حدثت نسبة إنجاز، يقوم البرنامج بحفظ البيانات فوراً في ذاكرة جهازك المحلية.
                  <br />
                  تظهر علامة <span className="font-bold text-emerald-700 bg-white px-1.5 py-0.5 rounded border border-emerald-300">✓ Saved</span> أسفل الشاشة للتأكيد على أن كل تعديلاتك محفوظة ومؤمنة حتى إذا انقطع الاتصال أو أغلقت الجهاز.
                </p>
              </div>

              {/* Step 2: How to move data to another device */}
              <div className="p-4 rounded-xl border border-blue-200 bg-blue-50/50 space-y-2">
                <div className="flex items-center gap-2 text-blue-900 font-bold text-sm">
                  <Database className="w-4 h-4 text-blue-600" />
                  <span>2. كيف تنقل البيانات إلى كمبيوتر آخر أو فلاشة؟</span>
                </div>
                <ol className="list-decimal list-inside space-y-1 text-slate-700 text-[11px]">
                  <li>اضغط على زر **"تحميل البرنامج"** ثم اختر **"تحميل ملف النسخة المحمولة (.gemdata)"**.</li>
                  <li>سيتم تنزيل ملف صغير الحجم يحتوي على كل الملاحظات والمخطط والصور.</li>
                  <li>انسخ الملف على فلاش ميموري (USB) وافتحه على أي لابتوب أو كمبيوتر موقع آخر.</li>
                  <li>في الجهاز الجديد، افتح البرنامج واضغط على زر **"استيراد"** في جدول الملاحظات أو من قسم الإعدادات (Settings).</li>
                  <li>ستظهر كافة الملاحظات والصور والدبابيس في مكانها المطابق تماماً فوراً وبدون إنترنت!</li>
                </ol>
              </div>

              {/* Step 3: Undo and recovery */}
              <div className="p-4 rounded-xl border border-amber-200 bg-amber-50/50 space-y-2">
                <div className="flex items-center gap-2 text-amber-900 font-bold text-sm">
                  <ShieldCheck className="w-4 h-4 text-amber-600" />
                  <span>3. ميزة التراجع عند الخطأ (Undo / Redo):</span>
                </div>
                <p className="text-slate-700 text-[11px] leading-relaxed">
                  إذا حذفت أو كتبت أي شيء بالخطأ:
                  <br />
                  • استخدم اختصار لوحة المفاتيح <span className="font-mono bg-white px-1.5 py-0.5 rounded border font-bold">Ctrl + Z</span> للتراجع الفوري.
                  <br />
                  • أو استخدم أزرار التراجع والإعادة الموجودة في الشريط العلوي.
                  <br />
                  • عند حذف أي ملاحظة، تظهر رسالة أسفل الشاشة تتيح لك الضغط على **"تراجع عن الحذف"** لاسترجاعها في ثانية.
                </p>
              </div>

            </div>
          )}

        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 bg-slate-100 border-t border-slate-200 flex justify-between items-center">
          <span className="text-[11px] text-slate-500 font-medium">
            المتحف المصري الكبير · GEM Construction Management System
          </span>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs"
          >
            إغلاق
          </button>
        </div>

      </div>
    </div>
  );
};
