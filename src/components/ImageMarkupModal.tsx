import React, { useRef, useState, useEffect } from 'react';
import { 
  X, Check, RotateCcw, Trash2, ArrowUpRight, 
  Circle, Square, Type, Pencil, AlertTriangle, 
  ZoomIn, ZoomOut, Maximize2 
} from 'lucide-react';

interface ImageMarkupModalProps {
  isOpen: boolean;
  onClose: () => void;
  imageUrl: string;
  photoId: string;
  initialCaption?: string;
  onSave: (annotatedDataUrl: string, updatedCaption: string) => void;
}

type ToolType = 'brush' | 'arrow' | 'circle' | 'rect' | 'text' | 'stamp';

interface DrawingAction {
  tool: ToolType;
  color: string;
  strokeWidth: number;
  points?: { x: number; y: number }[];
  startX?: number;
  startY?: number;
  endX?: number;
  endY?: number;
  text?: string;
}

export const ImageMarkupModal: React.FC<ImageMarkupModalProps> = ({
  isOpen,
  onClose,
  imageUrl,
  initialCaption = '',
  onSave,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [naturalSize, setNaturalSize] = useState<{ width: number; height: number }>({ width: 800, height: 600 });
  
  const [activeTool, setActiveTool] = useState<ToolType>('arrow');
  const [selectedColor, setSelectedColor] = useState<string>('#ef4444'); // Default engineering red
  const [strokeWidth, setStrokeWidth] = useState<number>(4);
  const [textInput, setTextInput] = useState<string>('موقع الخلل');
  const [caption, setCaption] = useState<string>(initialCaption);

  const [actions, setActions] = useState<DrawingAction[]>([]);
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentAction, setCurrentAction] = useState<DrawingAction | null>(null);

  const colors = [
    { name: 'أحمر تحذيري', value: '#ef4444' },
    { name: 'أصفر هندسي', value: '#eab308' },
    { name: 'أزرق', value: '#3b82f6' },
    { name: 'أخضر فسفوري', value: '#10b981' },
    { name: 'أبيض', value: '#ffffff' },
    { name: 'أسود', value: '#0f172a' },
  ];

  // Load natural image dimensions
  useEffect(() => {
    if (!isOpen || !imageUrl) return;
    setCaption(initialCaption || '');
    setActions([]);
    const img = new Image();
    img.src = imageUrl;
    img.onload = () => {
      const w = img.naturalWidth || 800;
      const h = img.naturalHeight || 600;
      setNaturalSize({ width: w, height: h });
      setImageLoaded(true);
    };
  }, [isOpen, imageUrl, initialCaption]);

  // Redraw canvas whenever actions or current action changes
  useEffect(() => {
    if (!imageLoaded) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw saved actions
    const allActions = currentAction ? [...actions, currentAction] : actions;
    allActions.forEach(action => {
      drawShape(ctx, action);
    });
  }, [actions, currentAction, imageLoaded]);

  const drawShape = (ctx: CanvasRenderingContext2D, action: DrawingAction) => {
    ctx.save();
    ctx.strokeStyle = action.color;
    ctx.fillStyle = action.color;
    ctx.lineWidth = action.strokeWidth;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    switch (action.tool) {
      case 'brush':
        if (action.points && action.points.length > 1) {
          ctx.beginPath();
          ctx.moveTo(action.points[0].x, action.points[0].y);
          for (let i = 1; i < action.points.length; i++) {
            ctx.lineTo(action.points[i].x, action.points[i].y);
          }
          ctx.stroke();
        }
        break;

      case 'arrow':
        if (action.startX !== undefined && action.startY !== undefined && action.endX !== undefined && action.endY !== undefined) {
          drawArrow(ctx, action.startX, action.startY, action.endX, action.endY, action.strokeWidth * 3.5);
        }
        break;

      case 'circle':
        if (action.startX !== undefined && action.startY !== undefined && action.endX !== undefined && action.endY !== undefined) {
          const radiusX = Math.abs(action.endX - action.startX) / 2;
          const radiusY = Math.abs(action.endY - action.startY) / 2;
          const centerX = (action.startX + action.endX) / 2;
          const centerY = (action.startY + action.endY) / 2;
          ctx.beginPath();
          ctx.ellipse(centerX, centerY, radiusX, radiusY, 0, 0, Math.PI * 2);
          ctx.stroke();
        }
        break;

      case 'rect':
        if (action.startX !== undefined && action.startY !== undefined && action.endX !== undefined && action.endY !== undefined) {
          const x = Math.min(action.startX, action.endX);
          const y = Math.min(action.startY, action.endY);
          const w = Math.abs(action.endX - action.startX);
          const h = Math.abs(action.endY - action.startY);
          ctx.strokeRect(x, y, w, h);
        }
        break;

      case 'text':
        if (action.startX !== undefined && action.startY !== undefined && action.text) {
          ctx.font = `bold ${Math.max(16, action.strokeWidth * 4)}px 'Cairo', Arial, sans-serif`;
          ctx.textBaseline = 'top';
          const textMetrics = ctx.measureText(action.text);
          // background label box
          ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
          ctx.roundRect(action.startX - 6, action.startY - 4, textMetrics.width + 12, action.strokeWidth * 5 + 8, 4);
          ctx.fill();
          ctx.strokeStyle = action.color;
          ctx.lineWidth = 1.5;
          ctx.stroke();
          // text
          ctx.fillStyle = action.color;
          ctx.fillText(action.text, action.startX, action.startY);
        }
        break;

      case 'stamp':
        if (action.startX !== undefined && action.startY !== undefined) {
          const size = Math.max(28, action.strokeWidth * 7);
          ctx.beginPath();
          ctx.arc(action.startX, action.startY, size / 2, 0, Math.PI * 2);
          ctx.fillStyle = 'rgba(239, 68, 68, 0.9)';
          ctx.fill();
          ctx.lineWidth = 2;
          ctx.strokeStyle = '#ffffff';
          ctx.stroke();

          ctx.fillStyle = '#ffffff';
          ctx.font = `bold ${size * 0.55}px Arial`;
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText('!', action.startX, action.startY);
        }
        break;
    }

    ctx.restore();
  };

  const drawArrow = (ctx: CanvasRenderingContext2D, fromX: number, fromY: number, toX: number, toY: number, headLength: number) => {
    const angle = Math.atan2(toY - fromY, toX - fromX);
    ctx.beginPath();
    ctx.moveTo(fromX, fromY);
    ctx.lineTo(toX, toY);
    ctx.stroke();

    // Arrowhead
    ctx.beginPath();
    ctx.moveTo(toX, toY);
    ctx.lineTo(toX - headLength * Math.cos(angle - Math.PI / 6), toY - headLength * Math.sin(angle - Math.PI / 6));
    ctx.lineTo(toX - headLength * Math.cos(angle + Math.PI / 6), toY - headLength * Math.sin(angle + Math.PI / 6));
    ctx.closePath();
    ctx.fill();
  };

  const getCanvasCoordinates = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY,
    };
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const { x, y } = getCanvasCoordinates(e);
    setIsDrawing(true);

    if (activeTool === 'brush') {
      setCurrentAction({
        tool: 'brush',
        color: selectedColor,
        strokeWidth,
        points: [{ x, y }],
      });
    } else if (activeTool === 'stamp') {
      const newAction: DrawingAction = {
        tool: 'stamp',
        color: selectedColor,
        strokeWidth,
        startX: x,
        startY: y,
      };
      setActions(prev => [...prev, newAction]);
      setIsDrawing(false);
    } else if (activeTool === 'text') {
      const newAction: DrawingAction = {
        tool: 'text',
        color: selectedColor,
        strokeWidth,
        startX: x,
        startY: y,
        text: textInput || 'ملاحظة الموقع',
      };
      setActions(prev => [...prev, newAction]);
      setIsDrawing(false);
    } else {
      setCurrentAction({
        tool: activeTool,
        color: selectedColor,
        strokeWidth,
        startX: x,
        startY: y,
        endX: x,
        endY: y,
      });
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !currentAction) return;
    const { x, y } = getCanvasCoordinates(e);

    if (currentAction.tool === 'brush') {
      setCurrentAction(prev => {
        if (!prev) return null;
        return {
          ...prev,
          points: [...(prev.points || []), { x, y }],
        };
      });
    } else {
      setCurrentAction(prev => {
        if (!prev) return null;
        return {
          ...prev,
          endX: x,
          endY: y,
        };
      });
    }
  };

  const handleMouseUp = () => {
    if (isDrawing && currentAction) {
      setActions(prev => [...prev, currentAction]);
    }
    setIsDrawing(false);
    setCurrentAction(null);
  };

  const handleUndo = () => {
    setActions(prev => prev.slice(0, prev.length - 1));
  };

  const handleClear = () => {
    if (window.confirm('هل تريد مسح جميع الإشارات والتعديلات على هذه الصورة؟')) {
      setActions([]);
    }
  };

  const handleSaveAnnotatedImage = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Create a final composite canvas with base image + drawings
    const compositeCanvas = document.createElement('canvas');
    compositeCanvas.width = naturalSize.width;
    compositeCanvas.height = naturalSize.height;
    const compositeCtx = compositeCanvas.getContext('2d');
    if (!compositeCtx) return;

    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = imageUrl;
    img.onload = () => {
      // Draw background image
      compositeCtx.drawImage(img, 0, 0, naturalSize.width, naturalSize.height);
      // Draw markup layer
      compositeCtx.drawImage(canvas, 0, 0, naturalSize.width, naturalSize.height);

      // Watermark Stamp
      compositeCtx.fillStyle = 'rgba(15, 23, 42, 0.7)';
      compositeCtx.roundRect(15, naturalSize.height - 35, 260, 25, 4);
      compositeCtx.fill();
      compositeCtx.font = '11px Arial';
      compositeCtx.fillStyle = '#38bdf8';
      compositeCtx.fillText('GEM INSPECTION MARKUP APPROVED', 25, naturalSize.height - 18);

      const finalDataUrl = compositeCanvas.toDataURL('image/jpeg', 0.92);
      onSave(finalDataUrl, caption);
      onClose();
    };
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-5xl h-[92vh] flex flex-col shadow-2xl overflow-hidden text-slate-100">
        
        {/* Top Header Bar */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-500">
              <Pencil className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-lg text-white flex items-center gap-2">
                محرر وتحديد الملاحظات الهندسية على الصورة
                <span className="text-xs font-normal px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  Engineering Photo Markup
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                استخدم أدوات التوجيه، الأسهم، الدوائر، ومربعات التحديد لتوضيح مكان ونوع الخلل للمقاول
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleUndo}
              disabled={actions.length === 0}
              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-slate-200 text-sm flex items-center gap-1.5 transition-colors"
              title="تراجع"
            >
              <RotateCcw className="w-4 h-4" />
              <span>تراجع</span>
            </button>
            <button
              onClick={handleClear}
              disabled={actions.length === 0}
              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-red-950/60 text-red-400 hover:text-red-300 disabled:opacity-40 text-sm flex items-center gap-1.5 transition-colors"
              title="مسح التعديلات"
            >
              <Trash2 className="w-4 h-4" />
              <span>مسح الكل</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Toolbar Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 px-6 py-2.5 bg-slate-900 border-b border-slate-800 text-sm">
          {/* Tool selectors */}
          <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800">
            <button
              onClick={() => setActiveTool('arrow')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
                activeTool === 'arrow' ? 'bg-amber-500 text-slate-950 font-bold shadow' : 'text-slate-300 hover:bg-slate-800'
              }`}
            >
              <ArrowUpRight className="w-4 h-4" />
              <span>سهم تأشير</span>
            </button>
            <button
              onClick={() => setActiveTool('circle')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
                activeTool === 'circle' ? 'bg-amber-500 text-slate-950 font-bold shadow' : 'text-slate-300 hover:bg-slate-800'
              }`}
            >
              <Circle className="w-4 h-4" />
              <span>دائرة تحديد</span>
            </button>
            <button
              onClick={() => setActiveTool('rect')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
                activeTool === 'rect' ? 'bg-amber-500 text-slate-950 font-bold shadow' : 'text-slate-300 hover:bg-slate-800'
              }`}
            >
              <Square className="w-4 h-4" />
              <span>مربع</span>
            </button>
            <button
              onClick={() => setActiveTool('brush')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
                activeTool === 'brush' ? 'bg-amber-500 text-slate-950 font-bold shadow' : 'text-slate-300 hover:bg-slate-800'
              }`}
            >
              <Pencil className="w-4 h-4" />
              <span>رسم يدوي</span>
            </button>
            <button
              onClick={() => setActiveTool('text')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
                activeTool === 'text' ? 'bg-amber-500 text-slate-950 font-bold shadow' : 'text-slate-300 hover:bg-slate-800'
              }`}
            >
              <Type className="w-4 h-4" />
              <span>نص توضيحي</span>
            </button>
            <button
              onClick={() => setActiveTool('stamp')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
                activeTool === 'stamp' ? 'bg-amber-500 text-slate-950 font-bold shadow' : 'text-slate-300 hover:bg-slate-800'
              }`}
            >
              <AlertTriangle className="w-4 h-4 text-red-500" />
              <span>ختم تحذير</span>
            </button>
          </div>

          {/* Color palette */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400">اللون:</span>
            <div className="flex items-center gap-1.5 bg-slate-950 p-1.5 rounded-xl border border-slate-800">
              {colors.map(c => (
                <button
                  key={c.value}
                  onClick={() => setSelectedColor(c.value)}
                  className={`w-6 h-6 rounded-full border transition-transform ${
                    selectedColor === c.value ? 'scale-115 ring-2 ring-amber-400 border-white' : 'border-transparent hover:scale-105'
                  }`}
                  style={{ backgroundColor: c.value }}
                  title={c.name}
                />
              ))}
            </div>
          </div>

          {/* Stroke thickness */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400">سُمك الخط:</span>
            <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800">
              {[2, 4, 8].map(size => (
                <button
                  key={size}
                  onClick={() => setStrokeWidth(size)}
                  className={`px-2.5 py-1 rounded text-xs transition-colors ${
                    strokeWidth === size ? 'bg-slate-700 text-white font-bold' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {size === 2 ? 'رفيع' : size === 4 ? 'متوسط' : 'عريض'}
                </button>
              ))}
            </div>
          </div>

          {/* Text input if text tool active */}
          {activeTool === 'text' && (
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400">النص:</span>
              <input
                type="text"
                value={textInput}
                onChange={e => setTextInput(e.target.value)}
                placeholder="أدخل النص المراد كتابته ثم انقر على الصورة"
                className="bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1 text-xs text-white focus:outline-none focus:border-amber-500 w-48"
              />
            </div>
          )}
        </div>

        {/* Canvas Display Viewport */}
        <div 
          ref={containerRef}
          className="flex-1 bg-slate-950 overflow-auto flex items-center justify-center p-4 relative select-none"
        >
          <div 
            className="relative border border-slate-800 rounded-lg shadow-2xl overflow-hidden max-h-full max-w-full"
            style={{
              aspectRatio: `${naturalSize.width} / ${naturalSize.height}`,
            }}
          >
            {/* Background Image */}
            <img
              src={imageUrl}
              alt="Site Snag Preview"
              className="max-h-[62vh] object-contain block pointer-events-none"
            />
            
            {/* Drawing Canvas Overlay */}
            <canvas
              ref={canvasRef}
              width={naturalSize.width}
              height={naturalSize.height}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
              className="absolute inset-0 w-full h-full cursor-crosshair"
            />
          </div>
        </div>

        {/* Bottom Bar: Photo Caption & Save */}
        <div className="px-6 py-4 bg-slate-950 border-t border-slate-800 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex-1 w-full">
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              التعليق التوضيحي أسفل الصورة (Photo Caption / Field Note):
            </label>
            <input
              type="text"
              value={caption}
              onChange={e => setCaption(e.target.value)}
              placeholder="اكتب هنا تعليقاً وتفصيلاً لما توضحه الصورة للمقاول والاستشاري..."
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 transition-colors"
            />
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto justify-end">
            <button
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm font-medium transition-colors"
            >
              إلغاء
            </button>
            <button
              onClick={handleSaveAnnotatedImage}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-sm flex items-center gap-2 shadow-lg shadow-amber-500/20 transition-all"
            >
              <Check className="w-4 h-4" />
              <span>حفظ التحديد والتعليق</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
