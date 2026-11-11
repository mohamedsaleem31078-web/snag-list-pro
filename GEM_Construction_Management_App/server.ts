import express from 'express';
import http from 'http';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = parseInt(process.env.PORT || '3000', 10);

app.use(express.json({ limit: '25mb' }));

// Initialize GoogleGenAI server-side with required User-Agent
let ai: GoogleGenAI | null = null;
if (process.env.GEMINI_API_KEY) {
  ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

// 1. Gemini AI Engineering Assistant Endpoint
app.post('/api/gemini/assist', async (req, res) => {
  try {
    const { action, text, context } = req.body;

    if (!text || typeof text !== 'string') {
      res.status(400).json({ error: 'Text prompt is required' });
      return;
    }

    if (!ai) {
      // Graceful offline fallback with structured engineering guidance
      res.json({
        success: true,
        fallback: true,
        result: generateEngineeringFallback(action, text, context),
      });
      return;
    }

    let systemInstruction = `You are an expert civil, architectural, and MEP site inspection engineer for The Grand Egyptian Museum (GEM) mega-project, working under EHAF Consulting Engineers, Hill International, and BESIX-ORASCOM JV standards. Provide professional, concise, FIDIC-compliant engineering outputs.`;

    let prompt = '';

    switch (action) {
      case 'enhance':
        prompt = `Rephrase and professionalize this site observation description into formal engineering non-conformance wording (FIDIC/Consultant standard). Provide both fluent Arabic and English:\n\nDraft: "${text}"`;
        break;

      case 'translate':
        prompt = `Translate the following engineering site note between Arabic and English accurately with correct technical construction terms (e.g. joints, grouting, settlement, cove light, up-light, waterstops, rebar, tolerance):\n\nText: "${text}"`;
        break;

      case 'root_cause':
        prompt = `Analyze this construction site snag/defect and suggest 2-3 most probable root causes (أسباب الخلل الجذرية) and immediate corrective actions (الإجراءات التصحيحية الموصى بها). Keep it concise in bullet points:\n\nSnag: "${text}"\nContext: ${JSON.stringify(context || {})}`;
        break;

      case 'chat':
      default:
        prompt = `Answer this engineering question or assist with site observation documentation for the Grand Egyptian Museum project. Provide answer in Arabic with key English terms:\n\nQuery: "${text}"`;
        break;
    }

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        systemInstruction,
      },
    });

    const outputText = response.text || '';
    res.json({
      success: true,
      result: outputText,
    });
  } catch (error: any) {
    console.error('Gemini API Error:', error);
    // Provide intelligent fallback on error so the application never fails
    res.json({
      success: true,
      fallback: true,
      result: generateEngineeringFallback(req.body?.action, req.body?.text, req.body?.context),
      warning: error?.message || 'Offline fallback mode active',
    });
  }
});

// Fallback generator when offline or no API key is attached
function generateEngineeringFallback(action: string, text: string, context: any): string {
  switch (action) {
    case 'enhance':
      return `[صياغة هندسية معتمدة]:\nلوحظ عدم مطابقة تنفيذ البند للمواصفات القياسية والرسومات التنفيذية المعتمدة (Shop Drawings). يُلزم المقاول فوراً بإيقاف الأعمال المعيبة وإزالة أسباب الخلل وإعادة الاستلام طبقا لكود البناء واشتراطات استشاري إيهاب EHAF.\n\n[Technical Note - EN]:\nNon-conformance observed regarding execution tolerances. The Contractor is instructed to rectify the defective works and re-submit for formal inspection as per GEM project specifications.`;
    case 'translate':
      return `الترجمة الهندسية المقترحة:\nInspection Note: ${text}\n(ملاحظة فحص الموقع الهندسي المعتمدة)`;
    case 'root_cause':
      return `• الأسباب المحتملة (Root Causes):\n1. سوء المصنعية أو عدم الالتزام بوزنات الليزر ومناسيب الشيرب.\n2. عدم كفاية فترة المعالجة والدمك لطبقات التأسيس.\n• الإجراء التصحيحي الموصى به:\nإزالة الجزء المعيب وإعادة التثبيت باستخدام مونة غير قابلة للانكماش (Non-shrink grout) وتقديم طلب فحص (WIR) جديد.`;
    default:
      return `تم استلام الاستفسار: "${text}". يُرجى مراجعة المواصفات التعاقدية للمشروع ولوحة الاعتماد GEMIII-PL-CS-LP-BD-DWG-ES-920635.`;
  }
}

// 2. Health check endpoint for heavy-duty diagnostics
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    geminiConfigured: Boolean(process.env.GEMINI_API_KEY),
  });
});

// 3. Vite development middleware or static production serve
async function startServer() {
  const httpServer = http.createServer(app);

  if (process.env.NODE_ENV !== 'production') {
    const isHmrDisabled = process.env.DISABLE_HMR === 'true';
    const vite = await createViteServer({
      server: { 
        middlewareMode: true,
        hmr: isHmrDisabled ? false : { server: httpServer }
      },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  }

  httpServer.listen(port, '0.0.0.0', () => {
    console.log(`GEM Server running at http://localhost:${port}`);
  });
}

startServer();
