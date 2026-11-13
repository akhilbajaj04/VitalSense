import 'dotenv/config';
import express from 'express';
import type { Request, Response } from 'express';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { GoogleGenAI, Type } from '@google/genai';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = Number(process.env.PORT || 3000);
const MODEL_NAME = 'gemini-4-hydrogen';

function getGeminiClient(): GoogleGenAI {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY is not configured in environment secrets.');
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

interface ParseReportBody {
  fileName?: string;
  mimeType?: string;
  base64Data?: string;
  rawText?: string;
}

interface TrendInsightBody {
  patientName: string;
  age: number;
  biomarkerName: string;
  unit: string;
  minRef: number;
  maxRef: number;
  readings: Array<{ date: string; value: number }>;
  audience: 'patient' | 'doctor';
}

const app = express();
app.use(express.json({ limit: '15mb' }));

app.post('/api/reports/parse', async (req: Request, res: Response) => {
  try {
    const body = req.body as ParseReportBody;
    const { fileName, mimeType, base64Data, rawText } = body;

    if (!base64Data && !rawText) {
      res.status(400).json({ error: 'Provide either a lab report file or report text to parse.' });
      return;
    }

    const ai = getGeminiClient();

    const prompt = [
      'Extract all clinical blood test biomarkers from the provided lab report.',
      'For each biomarker, normalize the canonical key (e.g., hba1c, vitamin_d, iron, tsh, ldl, ferritin, hemoglobin, fasting_glucose, vitamin_b12, creatinine).',
      'Provide exact numeric values, standard units, and standard reference range bounds (minRef, maxRef). If a reference range only has an upper bound (e.g. < 100), set minRef to 0.',
      'Critically evaluate extraction confidence:',
      '- Set confidence to "uncertain" if the value looks smudged, ambiguous, handwritten, has an unclear decimal point, missing unit, OCR artifact (like "?" or "~"), or a flagged/unusual note.',
      '- Set confidence to "confirmed" only when the biomarker name, numeric value, unit, and reference range are unambiguous.',
      '- Whenever confidence is "uncertain", provide a concise, specific uncertaintyNote explaining what the user must verify.',
      `Filename context: ${fileName || 'Uploaded Lab Report'}.`,
    ].join('\n');

    const parts: Array<{ text: string } | { inlineData: { mimeType: string; data: string } }> = [];

    if (base64Data && mimeType) {
      parts.push({
        inlineData: {
          mimeType,
          data: base64Data,
        },
      });
    }

    if (rawText) {
      parts.push({
        text: `Lab Report Content:\n${rawText}\n\n${prompt}`,
      });
    } else {
      parts.push({ text: prompt });
    }

    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: { parts },
      config: {
        systemInstruction:
          'You are a clinical laboratory report parser. Always return accurate, structured JSON matching the requested schema. Never invent biomarkers not present in the source.',
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            labName: {
              type: Type.STRING,
              description: 'Name of the diagnostic laboratory or hospital.',
            },
            reportDate: {
              type: Type.STRING,
              description: 'Report collection or issue date in YYYY-MM-DD format.',
            },
            markers: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  key: {
                    type: Type.STRING,
                    description: 'Lowercase snake_case canonical identifier such as hba1c, vitamin_d, iron, tsh, ldl, ferritin.',
                  },
                  name: {
                    type: Type.STRING,
                    description: 'Human-readable biomarker name such as HbA1c, Vitamin D (25-OH), Serum Iron.',
                  },
                  value: {
                    type: Type.NUMBER,
                    description: 'Best-estimate numeric value extracted from the report.',
                  },
                  unit: {
                    type: Type.STRING,
                    description: 'Measurement unit such as %, ng/mL, µg/dL, mg/dL, mIU/L.',
                  },
                  minRef: {
                    type: Type.NUMBER,
                    description: 'Lower bound of the normal clinical reference range.',
                  },
                  maxRef: {
                    type: Type.NUMBER,
                    description: 'Upper bound of the normal clinical reference range.',
                  },
                  confidence: {
                    type: Type.STRING,
                    description: 'Either "confirmed" or "uncertain".',
                  },
                  uncertaintyNote: {
                    type: Type.STRING,
                    description: 'Short explanation when confidence is "uncertain".',
                  },
                },
                required: ['key', 'name', 'value', 'unit', 'minRef', 'maxRef', 'confidence'],
              },
            },
          },
          required: ['labName', 'reportDate', 'markers'],
        },
      },
    });

    const jsonText = (response.text ?? '{}').trim();
    const parsed = JSON.parse(jsonText) as {
      labName?: string;
      reportDate?: string;
      markers?: Array<{
        key: string;
        name: string;
        value: number;
        unit: string;
        minRef: number;
        maxRef: number;
        confidence: string;
        uncertaintyNote?: string;
      }>;
    };

    res.json({
      labName: parsed.labName || 'Diagnostic Laboratory',
      reportDate: parsed.reportDate || new Date().toISOString().slice(0, 10),
      markers: Array.isArray(parsed.markers) ? parsed.markers : [],
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to parse blood report with Gemini AI.';
    console.error('Report parse error:', message);
    res.status(500).json({ error: message });
  }
});

app.post('/api/trends/insight', async (req: Request, res: Response) => {
  try {
    const body = req.body as TrendInsightBody;
    const { patientName, age, biomarkerName, unit, minRef, maxRef, readings, audience } = body;

    if (!biomarkerName || !Array.isArray(readings) || readings.length === 0) {
      res.status(400).json({ error: 'Biomarker name and confirmed readings are required.' });
      return;
    }

    const ai = getGeminiClient();

    const sorted = [...readings].sort((a, b) => a.date.localeCompare(b.date));
    const historyLines = sorted.map((r) => `${r.date}: ${r.value} ${unit}`).join(', ');

    const audienceInstruction =
      audience === 'doctor'
        ? 'Write a concise, objective 1-sentence clinical trend observation for an attending physician.'
        : 'Write a calm, clear, reassuring 1-sentence summary for a patient explaining how this biomarker has moved relative to the normal reference range, without alarmist phrasing.';

    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: [
        `Patient: ${patientName}, Age ${age}`,
        `Biomarker: ${biomarkerName} (Normal Reference Range: ${minRef}–${maxRef} ${unit})`,
        `Confirmed Historical Readings: ${historyLines}`,
        audienceInstruction,
        'Constraints: Respond with exactly ONE plain sentence (20 to 35 words). No markdown, no bullet points, no diagnosis.',
      ].join('\n'),
      config: {
        systemInstruction:
          'You summarize longitudinal biomarker data accurately in one concise, clinically grounded sentence.',
      },
    });

    const insight = (response.text ?? '').trim();
    if (!insight) {
      res.status(502).json({ error: 'Gemini returned an empty trend insight.' });
      return;
    }

    res.json({ insight });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to generate AI trend insight.';
    console.error('Trend insight error:', message);
    res.status(500).json({ error: message });
  }
});

async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Vitalsense server listening on http://localhost:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
