/**
 * EverydayFix AI (StainSolver) — Backend Server
 * ---------------------------------------------
 * Dual-Provider Vision AI Server supporting both:
 * 1. Google Gemini (Gemini 2.5 Flash / 1.5 Flash via @google/genai)
 * 2. OpenAI Vision (gpt-4o-mini via openai)
 * 
 * SECURITY:
 * - API keys are loaded ONLY on the server via environment variables (.env).
 * - Keys are NEVER passed to the browser, HTML, or client-side JavaScript.
 * - Excluded from git commits via .gitignore.
 */

import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import multer from "multer";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";
import { GoogleGenAI } from "@google/genai";
import OpenAI from "openai";
import { findSolution } from "./solutions.js";

// Load environment variables from backend/.env or root .env
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, "..");

const backendEnvPath = path.join(__dirname, ".env");
const rootEnvPath = path.join(rootDir, ".env");

if (fs.existsSync(backendEnvPath)) {
  dotenv.config({ path: backendEnvPath });
} else if (fs.existsSync(rootEnvPath)) {
  dotenv.config({ path: rootEnvPath });
} else {
  dotenv.config(); // fallback
}

const app = express();
const PORT = parseInt(process.env.PORT, 10) || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Serve static frontend files (index.html, style.css, script.js) from project root
app.use(express.static(rootDir));

// Configure Multer for in-memory file handling (safe, no lingering temp files)
const ALLOWED_MIME_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_FILE_SIZE },
  fileFilter: (req, file, cb) => {
    const mime = (file.mimetype || "").toLowerCase();
    if (ALLOWED_MIME_TYPES.includes(mime)) {
      cb(null, true);
    } else {
      cb(new Error("Invalid file type. Only JPG, PNG, and WEBP images are supported."));
    }
  }
});

/**
 * Key sanitization & auto-detection helpers
 */
function sanitizeKey(key) {
  if (!key || typeof key !== "string") return "";
  let clean = key.trim();
  // Strip accidental "AQ." prefix if present
  if (clean.startsWith("AQ.")) {
    clean = clean.replace(/^AQ\./, "").trim();
  }
  return clean;
}

function isOpenAiKey(key) {
  const clean = sanitizeKey(key);
  if (!clean || clean.length < 25) return false;
  if (clean.toLowerCase().includes("your_openai_api_key_here") || clean.toLowerCase().includes("your_actual")) {
    return false;
  }
  return clean.startsWith("sk-") || clean.includes("T3BlbkFJ");
}

function isGeminiKey(key) {
  const clean = sanitizeKey(key);
  if (!clean || clean.length < 20) return false;
  if (
    clean.toLowerCase().includes("your_gemini_api_key_here") ||
    clean.toLowerCase().includes("your_actual") ||
    isOpenAiKey(clean)
  ) {
    return false;
  }
  return true;
}

/**
 * Resolve effective keys and active provider
 */
function getResolvedConfig() {
  const rawGemini = process.env.GEMINI_API_KEY;
  const rawOpenAi = process.env.OPENAI_API_KEY;

  let geminiKey = "";
  let openAiKey = "";

  // Check for OpenAI key in OPENAI_API_KEY
  if (isOpenAiKey(rawOpenAi)) {
    openAiKey = sanitizeKey(rawOpenAi);
  }

  // Check if GEMINI_API_KEY contains an OpenAI key (auto-detection and rescue)
  if (isOpenAiKey(rawGemini)) {
    if (!openAiKey) {
      openAiKey = sanitizeKey(rawGemini);
      console.log("ℹ️  [AI Pipeline] Detected an OpenAI key inside GEMINI_API_KEY. Routing to OpenAI Vision.");
    }
  } else if (isGeminiKey(rawGemini)) {
    geminiKey = sanitizeKey(rawGemini);
  }

  // Check if OPENAI_API_KEY actually contains a Gemini key
  if (isGeminiKey(rawOpenAi) && !geminiKey) {
    geminiKey = sanitizeKey(rawOpenAi);
    console.log("ℹ️  [AI Pipeline] Detected a Google Gemini key inside OPENAI_API_KEY. Routing to Gemini.");
  }

  const preference = (process.env.AI_PROVIDER || "auto").toLowerCase().trim();

  let activeProvider = "none";
  let activeProviderName = "No AI Provider Configured";

  if (preference === "openai" && openAiKey) {
    activeProvider = "openai";
    activeProviderName = "OpenAI Vision (gpt-4o-mini)";
  } else if (preference === "gemini" && geminiKey) {
    activeProvider = "gemini";
    activeProviderName = "Google Gemini 2.5 Flash";
  } else if (geminiKey) {
    activeProvider = "gemini";
    activeProviderName = "Google Gemini 2.5 Flash";
  } else if (openAiKey) {
    activeProvider = "openai";
    activeProviderName = "OpenAI Vision (gpt-4o-mini)";
  }

  return {
    geminiKey,
    openAiKey,
    activeProvider,
    activeProviderName,
    hasGemini: Boolean(geminiKey),
    hasOpenAi: Boolean(openAiKey),
    preference
  };
}

/**
 * GET /api/health
 * Checks server health and which AI providers are configured
 */
app.get("/api/health", (req, res) => {
  const config = getResolvedConfig();

  res.json({
    ok: true,
    message: "EverydayFix AI / StainSolver backend is running.",
    apiKeyConfigured: Boolean(config.hasGemini || config.hasOpenAi),
    geminiApiKeyConfigured: config.hasGemini,
    openAiConfigured: config.hasOpenAi,
    activeProvider: config.activeProvider,
    provider: config.activeProviderName,
    providers: {
      gemini: config.hasGemini,
      openai: config.hasOpenAi
    }
  });
});

/**
 * POST /api/solve
 * Legacy sample solver (kept for backwards compatibility)
 */
app.post("/api/solve", (req, res) => {
  const problem = (req.body && req.body.problem) || "";

  if (!String(problem).trim()) {
    return res.status(400).json({
      error: "Please type a household problem first."
    });
  }

  const solution = findSolution(problem);

  res.json({
    source: "sample",
    sourceLabel: "Sample solution (demo, not live AI)",
    problem: String(problem).trim(),
    title: solution.title,
    steps: solution.steps,
    warnings: solution.warnings
  });
});

/**
 * Build the standardized prompt for stain vision analysis
 */
function buildAnalysisPrompt(material, description, stainAge) {
  return `You are EverydayFix AI (StainSolver), an expert household stain identification chemist and cleaning safety specialist.
Analyze this photo of a stain carefully.

Context provided by the user:
- Target Material / Surface: ${material}
- Additional Description: ${description || "None provided"}
- Stain Age / Time Elapsed: ${stainAge}

Instructions:
1. Examine visual evidence in the image (color, texture, spread, absorption edges, surface texture) to identify the likely stain.
2. Determine confidence and note any uncertainty or alternative stain possibilities (e.g., if a dark stain could be coffee, red wine, soy sauce, or grease).
3. Provide safe, practical step-by-step cleaning instructions tailored explicitly to ${material}.
4. List accessible household supplies needed (e.g. baking soda, mild dish soap, white vinegar, cool water, microfiber towel).
5. Highlight critical safety warnings and precautions (e.g. chemical incompatibilities like never mixing bleach and vinegar, surface risks such as acid on marble or wood finish damage, and avoiding hot dryers that set stains).

Respond ONLY with a valid JSON object matching this exact schema:
{
  "stainType": "Name of the most likely stain (e.g. Red Wine Spill, Grease / Cooking Oil, Coffee Stain, Mud)",
  "confidence": "High (~85%) or Moderate (~60%) or Low (~35%)",
  "uncertaintyNotes": "Detailed visual rationale, why this stain was identified, and any alternative possibilities if ambiguous",
  "materialNotes": "Specific cleaning advice and cautions tailored to ${material}",
  "supplies": ["Item 1", "Item 2", "Item 3"],
  "steps": [
    "Step 1: Specific action with exact household supplies...",
    "Step 2: Specific action..."
  ],
  "warnings": [
    "Safety warning 1...",
    "Safety warning 2..."
  ]
}`;
}

/**
 * Clean raw JSON string from AI model responses
 */
function cleanAndParseJson(rawText) {
  let cleaned = String(rawText || "").trim();
  if (cleaned.startsWith("```")) {
    cleaned = cleaned.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/i, "");
  }
  return JSON.parse(cleaned);
}

/**
 * Call Google Gemini Vision model
 */
async function callGeminiVision(apiKey, file, material, description, stainAge) {
  const ai = new GoogleGenAI({ apiKey });

  const imagePart = {
    inlineData: {
      mimeType: file.mimetype,
      data: file.buffer.toString("base64")
    }
  };

  const promptText = buildAnalysisPrompt(material, description, stainAge);

  // Try gemini-2.5-flash first, fallback to gemini-1.5-flash if needed
  const modelsToTry = [process.env.GEMINI_MODEL, "gemini-2.5-flash", "gemini-1.5-flash"].filter(Boolean);
  let lastError = null;

  for (const modelName of modelsToTry) {
    try {
      const response = await ai.models.generateContent({
        model: modelName,
        contents: [imagePart, { text: promptText }],
        config: {
          responseMimeType: "application/json"
        }
      });

      if (response && response.text) {
        const parsed = cleanAndParseJson(response.text);
        return {
          parsed,
          provider: "Google Gemini",
          model: modelName
        };
      }
    } catch (err) {
      lastError = err;
      // If error is model not found, try next model
      if (err.message && (err.message.includes("404") || err.message.includes("not found"))) {
        continue;
      }
      throw err;
    }
  }

  throw lastError || new Error("Failed to get response from Gemini models.");
}

/**
 * Call OpenAI Vision model (gpt-4o-mini)
 */
async function callOpenAiVision(apiKey, file, material, description, stainAge) {
  const openai = new OpenAI({ apiKey });

  const base64Image = file.buffer.toString("base64");
  const dataUrl = `data:${file.mimetype};base64,${base64Image}`;
  const promptText = buildAnalysisPrompt(material, description, stainAge);

  const modelName = process.env.OPENAI_MODEL || "gpt-4o-mini";

  const response = await openai.chat.completions.create({
    model: modelName,
    messages: [
      {
        role: "user",
        content: [
          { type: "text", text: promptText },
          {
            type: "image_url",
            image_url: {
              url: dataUrl,
              detail: "auto"
            }
          }
        ]
      }
    ],
    response_format: { type: "json_object" },
    max_tokens: 1500
  });

  const content = response.choices?.[0]?.message?.content;
  if (!content) {
    throw new Error("No response content received from OpenAI Vision.");
  }

  const parsed = cleanAndParseJson(content);
  return {
    parsed,
    provider: "OpenAI Vision",
    model: modelName
  };
}

/**
 * Fallback demo analysis when offline or when user requests preview mode
 */
function generateDemoAnalysis(material, description, stainAge) {
  const lowerDesc = `${material} ${description}`.toLowerCase();
  const sample = findSolution(lowerDesc, material);

  return {
    stainType: `${sample.title} (Offline Demonstration)`,
    confidence: "Estimated (~70% offline match)",
    uncertaintyNotes: "This diagnostic was generated by the StainSolver offline rules engine based on your surface and description. No live vision AI API was invoked.",
    materialNotes: `Surface cleaning protocol customized for ${material}. Check compatibility before applying solutions.`,
    supplies: sample.supplies || [
      "Clean white microfiber cloth",
      "Cool water",
      "Mild liquid dish soap",
      "White distilled vinegar",
      "Baking soda"
    ],
    steps: sample.steps,
    warnings: sample.warnings
  };
}

/**
 * POST /api/analyze-stain
 * Multimodal photo stain analysis with dual-provider pipeline (Gemini & OpenAI)
 */
app.post("/api/analyze-stain", (req, res, next) => {
  // Wrap multer middleware to catch upload errors cleanly
  upload.single("image")(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      if (err.code === "LIMIT_FILE_SIZE") {
        return res.status(400).json({
          error: "Image file is too large. Maximum allowed file size is 10 MB.",
          code: "FILE_TOO_LARGE"
        });
      }
      return res.status(400).json({ error: `Upload error: ${err.message}`, code: "UPLOAD_ERROR" });
    } else if (err) {
      return res.status(400).json({ error: err.message, code: "INVALID_FILE_TYPE" });
    }
    next();
  });
}, async (req, res) => {
  try {
    // 1. Verify image presence
    if (!req.file) {
      return res.status(400).json({
        error: "No image file provided. Please upload or take a JPG, PNG, or WEBP photo.",
        code: "NO_FILE"
      });
    }

    const material = String(req.body.material || "Other / Unspecified").slice(0, 100).trim();
    const description = String(req.body.description || "").slice(0, 1000).trim();
    const stainAge = String(req.body.stainAge || "Unknown").slice(0, 100).trim();

    // Check for demo mode override
    const isDemoRequested = req.query.demo === "true" || req.headers["x-demo-mode"] === "true";

    const config = getResolvedConfig();

    if (isDemoRequested) {
      const demoResult = generateDemoAnalysis(material, description, stainAge);
      return res.json({
        success: true,
        isDemo: true,
        provider: "Offline Safety Database (Demo Mode)",
        model: "offline-rules-engine",
        material,
        description,
        stainAge,
        analysis: demoResult
      });
    }

    const allowAutoFallback = req.query.fallback !== "false";

    // If neither key is configured
    if (!config.hasGemini && !config.hasOpenAi) {
      if (allowAutoFallback) {
        const demoResult = generateDemoAnalysis(material, description, stainAge);
        return res.json({
          success: true,
          isDemo: true,
          fallbackTriggered: true,
          fallbackReason: "MISSING_API_KEY",
          fallbackMessage: "No AI API key is configured on the server. Seamlessly switched to Offline Demonstration Mode.",
          provider: "Offline Safety Database (No API Key Configured)",
          model: "offline-rules-engine",
          material,
          description,
          stainAge,
          analysis: demoResult
        });
      }

      return res.status(503).json({
        error: "No AI API key is configured on the server. Please add your free Google Gemini API key or OpenAI key to backend/.env and restart.",
        code: "MISSING_API_KEY",
        providers: {
          geminiUrl: "https://aistudio.google.com/",
          openAiUrl: "https://platform.openai.com/api-keys"
        }
      });
    }

    let result = null;
    let errors = [];

    // Order of execution:
    // If preference is openai and openaiKey is available, try OpenAI first
    // Otherwise try Gemini first, then fallback to OpenAI if Gemini fails
    const shouldTryOpenAiFirst = config.preference === "openai" && config.hasOpenAi;

    if (shouldTryOpenAiFirst) {
      try {
        result = await callOpenAiVision(config.openAiKey, req.file, material, description, stainAge);
      } catch (err) {
        errors.push({ provider: "OpenAI", error: err.message });
        console.warn("⚠️  OpenAI Vision attempt failed:", err.message);
        if (config.hasGemini) {
          console.log("🔄 Falling back to Google Gemini...");
          try {
            result = await callGeminiVision(config.geminiKey, req.file, material, description, stainAge);
          } catch (geminiErr) {
            errors.push({ provider: "Gemini", error: geminiErr.message });
          }
        }
      }
    } else {
      // Try Gemini first
      if (config.hasGemini) {
        try {
          result = await callGeminiVision(config.geminiKey, req.file, material, description, stainAge);
        } catch (err) {
          errors.push({ provider: "Gemini", error: err.message });
          console.warn("⚠️  Gemini Vision attempt failed:", err.message);
          if (config.hasOpenAi) {
            console.log("🔄 Falling back to OpenAI Vision...");
            try {
              result = await callOpenAiVision(config.openAiKey, req.file, material, description, stainAge);
            } catch (openAiErr) {
              errors.push({ provider: "OpenAI", error: openAiErr.message });
            }
          }
        }
      } else if (config.hasOpenAi) {
        try {
          result = await callOpenAiVision(config.openAiKey, req.file, material, description, stainAge);
        } catch (err) {
          errors.push({ provider: "OpenAI", error: err.message });
        }
      }
    }

    // If result succeeded
    if (result && result.parsed) {
      const analysisData = result.parsed;
      return res.json({
        success: true,
        isDemo: false,
        fallbackTriggered: false,
        provider: `${result.provider} (${result.model})`,
        model: result.model,
        material,
        description,
        stainAge,
        analysis: {
          stainType: analysisData.stainType || "Unidentified Stain",
          confidence: analysisData.confidence || "Moderate",
          uncertaintyNotes: analysisData.uncertaintyNotes || "Visual analysis completed based on image patterns.",
          materialNotes: analysisData.materialNotes || `Cleaning protocol customized for ${material}.`,
          supplies: Array.isArray(analysisData.supplies) && analysisData.supplies.length > 0
            ? analysisData.supplies
            : ["Mild dish soap", "Clean cloths", "Cool water"],
          steps: Array.isArray(analysisData.steps) && analysisData.steps.length > 0
            ? analysisData.steps
            : ["Blot gently with a clean cloth", "Rinse with cool water"],
          warnings: Array.isArray(analysisData.warnings) && analysisData.warnings.length > 0
            ? analysisData.warnings
            : ["Always spot-test cleaners in an inconspicuous area first."]
        }
      });
    }

    // If both providers failed or the single configured provider failed
    const combinedMsg = errors.map(e => `${e.provider}: ${e.error}`).join(" | ");
    console.error("All AI Provider attempts failed:", combinedMsg);

    const isQuotaError = combinedMsg.includes("429") || 
      combinedMsg.includes("credits remaining") || 
      combinedMsg.includes("RESOURCE_EXHAUSTED") ||
      combinedMsg.includes("quota");

    if (allowAutoFallback) {
      const demoResult = generateDemoAnalysis(material, description, stainAge);
      return res.json({
        success: true,
        isDemo: true,
        fallbackTriggered: true,
        fallbackReason: isQuotaError ? "QUOTA_EXCEEDED" : (combinedMsg.includes("401") || combinedMsg.includes("403") ? "INVALID_API_KEY" : "API_ERROR"),
        fallbackMessage: isQuotaError 
          ? "Cloud AI quota or credit limit exceeded (OpenAI HTTP 429: No credits remaining). Seamlessly switched to surface-safe Offline Demonstration Mode."
          : "Cloud AI vision service was temporarily unreachable. Seamlessly switched to surface-safe Offline Demonstration Mode.",
        errorDetails: combinedMsg,
        provider: "Offline Safety Database (Automatic Fallback)",
        model: "offline-rules-engine",
        material,
        description,
        stainAge,
        analysis: demoResult
      });
    }

    if (isQuotaError) {
      return res.status(429).json({
        error: "AI API Quota / Credit limit exceeded. If using OpenAI, you may have 0 credits remaining. Tip: Get a 100% FREE Gemini key from Google AI Studio (https://aistudio.google.com/) and add it to backend/.env as GEMINI_API_KEY.",
        code: "QUOTA_EXCEEDED",
        details: combinedMsg,
        suggestedFreeProvider: "Google Gemini (free at https://aistudio.google.com/)"
      });
    }

    const isInvalidKey = combinedMsg.includes("401") ||
      combinedMsg.includes("403") ||
      combinedMsg.includes("API_KEY_INVALID") ||
      combinedMsg.includes("Incorrect API key");

    if (isInvalidKey) {
      return res.status(401).json({
        error: "The configured AI API key was rejected by the provider. Please verify your key in backend/.env.",
        code: "INVALID_API_KEY",
        details: combinedMsg
      });
    }

    return res.status(500).json({
      error: `Failed to analyze photo with AI: ${combinedMsg || "Unknown error"}`,
      code: "ANALYSIS_FAILED",
      details: combinedMsg
    });

  } catch (error) {
    console.error("Unhandled Stain Analysis Error:", error);
    return res.status(500).json({
      error: `Internal server error: ${error.message || "Unknown error"}`,
      code: "SERVER_ERROR"
    });
  }
});

// Start listening with port fallback and error handling
function startServer(targetPort) {
  const srv = app.listen(targetPort, () => {
    const config = getResolvedConfig();
    console.log(`\n==================================================`);
    console.log(`EverydayFix AI / StainSolver backend running: http://localhost:${targetPort}`);
    console.log(`Serving frontend static files from: ${rootDir}`);
    console.log(`Active AI Provider: ${config.activeProviderName}`);
    if (config.hasGemini) console.log(`  - Google Gemini: Configured ✅`);
    if (config.hasOpenAi) console.log(`  - OpenAI Vision: Configured ✅`);
    if (!config.hasGemini && !config.hasOpenAi) {
      console.warn(`  ⚠️  No AI API keys configured. Set GEMINI_API_KEY in backend/.env for free AI.`);
    }
    console.log(`==================================================\n`);
  });

  srv.on("error", (err) => {
    if (err.code === "EADDRINUSE") {
      console.warn(`⚠️  Port ${targetPort} is already in use.`);
      if (targetPort === PORT) {
        console.log(`Attempting fallback to port ${targetPort + 1}...`);
        startServer(targetPort + 1);
      } else {
        console.error(`Unable to bind to port ${targetPort}. Please terminate existing node processes.`);
      }
    } else {
      console.error("Server error:", err);
    }
  });

  return srv;
}

startServer(PORT);
export default app;
