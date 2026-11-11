import React, { useState } from 'react';
import { 
  Sparkles, X, Send, Bot, Copy, Check, ArrowRightLeft, 
  FileCheck, AlertTriangle, ShieldCheck, RefreshCw 
} from 'lucide-react';

interface AiAssistantDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  language: 'ar' | 'en';
  onApplyText?: (text: string) => void;
}

interface Message {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
}

export const AiAssistantDrawer: React.FC<AiAssistantDrawerProps> = ({
  isOpen,
  onClose,
  language,
  onApplyText,
}) => {
  const isAr = language === 'ar';
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'm1',
      sender: 'assistant',
      text: isAr 
        ? 'مرحباً بك في المساعد الذكي لمشروع المتحف المصري الكبير (GEM AI Assistant). كيف يمكنني مساعدتك اليوم؟ يمكنك كتابة أي وصف ملاحظة أو فحص ميداني وسأقوم بصياغته بلغة هندسية رسمية أو ترجمته فوراً.'
        : 'Welcome to the Grand Egyptian Museum Engineering AI Assistant. How can I assist you with site inspection notes, translations, or technical phrasing today?',
      timestamp: new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSend = async (customPrompt?: string, task = 'general') => {
    const textToSend = customPrompt || input;
    if (!textToSend.trim() || isLoading) return;

    const userMsg: Message = {
      id: `u-${Date.now()}`,
      sender: 'user',
      text: textToSend,
      timestamp: new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    if (!customPrompt) setInput('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/gemini/assist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          task,
          text: textToSend,
          context: 'Grand Egyptian Museum construction and engineering inspection. Consultant: EHAF / Hill International. Contractor: BESIX-ORASCOM JV.'
        })
      });

      const data = await response.json();
      const botText = data.result || (isAr ? 'عذراً، حدث خطأ أثناء معالجة الطلب.' : 'Sorry, failed to process request.');

      setMessages(prev => [
        ...prev,
        {
          id: `a-${Date.now()}`,
          sender: 'assistant',
          text: botText,
          timestamp: new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    } catch (err) {
      setMessages(prev => [
        ...prev,
        {
          id: `a-${Date.now()}`,
          sender: 'assistant',
          text: isAr 
            ? 'تعذر الاتصال بالخادم. يرجى التأكد من اتصال الإنترنت وصلاحية المفتاح.' 
            : 'Could not connect to AI service. Please check network connection.',
          timestamp: new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="fixed inset-y-0 left-0 z-50 w-full sm:w-[450px] bg-white shadow-2xl border-r border-slate-300 flex flex-col font-sans transition-all duration-300">
      
      {/* 1. Header */}
      <div className="p-4 bg-[#0f2237] text-white flex items-center justify-between border-b border-slate-700">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-400 border border-amber-500/40 flex items-center justify-center">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-bold text-sm tracking-tight flex items-center gap-2">
              <span>{isAr ? 'المساعد الهندسي الذكي (GEM AI)' : 'Engineering AI Assistant'}</span>
            </h3>
            <span className="text-[10px] text-amber-300 font-mono block">
              Powered by Gemini 2.5 Flash
            </span>
          </div>
        </div>

        <button
          onClick={onClose}
          className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* 2. Quick Action Templates */}
      <div className="p-3 bg-slate-50 border-b border-slate-200 text-xs">
        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1.5">
          {isAr ? 'إجراءات سريعة فورية:' : 'Quick Inspection Tools:'}
        </span>
        <div className="flex flex-wrap gap-1.5">
          <button
            onClick={() => handleSend('قم بصياغة ملاحظة فحص استلام رخام غير مطابق للمناسيب بلغة تقرير مهندس استشاري رسمي', 'formalize_snag')}
            className="px-2 py-1 rounded bg-white hover:bg-amber-50 border border-slate-200 text-[11px] text-slate-800 font-medium flex items-center gap-1 shadow-xs transition-colors"
          >
            <FileCheck className="w-3 h-3 text-amber-600" />
            <span>{isAr ? 'صياغة ملاحظة هندسية' : 'Formalize Snag'}</span>
          </button>
          <button
            onClick={() => handleSend('ترجم المصطلحات الفنية التالية هندسياً بين العربية والإنجليزية بدقة: Chipped marble tiles, expansion joint sealant, fire-stop mortar', 'translate')}
            className="px-2 py-1 rounded bg-white hover:bg-blue-50 border border-slate-200 text-[11px] text-slate-800 font-medium flex items-center gap-1 shadow-xs transition-colors"
          >
            <ArrowRightLeft className="w-3 h-3 text-blue-600" />
            <span>{isAr ? 'ترجمة هندسية AR/EN' : 'Translate Terms'}</span>
          </button>
          <button
            onClick={() => handleSend('ما هو السبب الجذري المقترح لظهور شروخ شعرية في دهانات الجيبسوم بورد وما هو الإجراء التصحيحي المعتمد؟', 'root_cause')}
            className="px-2 py-1 rounded bg-white hover:bg-red-50 border border-slate-200 text-[11px] text-slate-800 font-medium flex items-center gap-1 shadow-xs transition-colors"
          >
            <AlertTriangle className="w-3 h-3 text-red-600" />
            <span>{isAr ? 'تحليل السبب الجذري' : 'Root Cause'}</span>
          </button>
        </div>
      </div>

      {/* 3. Message Stream */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-[#f8fafc] text-xs">
        {messages.map(msg => (
          <div
            key={msg.id}
            className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
          >
            <div
              className={`max-w-[88%] p-3 rounded-2xl shadow-xs leading-relaxed ${
                msg.sender === 'user'
                  ? 'bg-amber-600 text-white rounded-br-none'
                  : 'bg-white text-slate-800 border border-slate-200 rounded-bl-none'
              }`}
            >
              <p className="whitespace-pre-line text-xs font-normal">
                {msg.text}
              </p>
            </div>

            <div className="flex items-center gap-2 mt-1 px-1 text-[10px] text-slate-400">
              <span>{msg.timestamp}</span>
              {msg.sender === 'assistant' && (
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => handleCopy(msg.text, msg.id)}
                    className="hover:text-slate-700 flex items-center gap-0.5"
                    title="نسخ النص"
                  >
                    {copiedId === msg.id ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedId === msg.id ? (isAr ? 'تم النسخ' : 'Copied') : (isAr ? 'نسخ' : 'Copy')}</span>
                  </button>

                  {onApplyText && (
                    <button
                      onClick={() => onApplyText(msg.text)}
                      className="hover:text-amber-700 text-amber-600 font-bold ml-1"
                    >
                      {isAr ? 'تطبيق في الحقل' : 'Apply'}
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex items-center gap-2 text-slate-500 text-xs italic p-2 bg-white rounded-xl border border-slate-200 w-fit">
            <RefreshCw className="w-3.5 h-3.5 animate-spin text-amber-600" />
            <span>{isAr ? 'الذكاء الاصطناعي يحلل ويكتب الإجابة...' : 'Gemini is processing...'}</span>
          </div>
        )}
      </div>

      {/* 4. Input Box */}
      <div className="p-3 bg-white border-t border-slate-200">
        <form
          onSubmit={e => {
            e.preventDefault();
            handleSend();
          }}
          className="flex items-center gap-2"
        >
          <input
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder={isAr ? 'اكتب ملاحظتك، استشارتك، أو نص لترجمته...' : 'Type text to improve, translate, or consult...'}
            className="flex-1 bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-amber-600"
          />
          <button
            type="submit"
            disabled={!input.trim() || isLoading}
            className="p-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 disabled:opacity-40 text-slate-950 font-bold shadow-xs transition-colors"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>

    </div>
  );
};
