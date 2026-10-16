# EverydayFix AI / StainSolver — AI Photo Stain Detector

A modern, responsive household problem solver equipped with a **real AI-powered multimodal photo stain detector** supporting both **Google Gemini 2.5 Flash** (Free tier available) and **OpenAI Vision** (`gpt-4o-mini`).

---

## 🌟 Key Features

1. **Dual-Provider Multimodal Vision AI**:
   - **Google Gemini 2.5 Flash / 1.5 Flash** (via `@google/genai`) — 100% Free API key available at [Google AI Studio](https://aistudio.google.com/).
   - **OpenAI Vision gpt-4o-mini** (via `openai`) — Fast, precise vision diagnostics.
   - **Smart Auto-Routing & Fallback**: Server automatically detects key types, sanitizes prefixes, and auto-routes requests.
2. **Interactive Step-by-Step Checklists**:
   - Numbered cleaning procedures with live completion checkboxes.
   - Surface safety warnings preventing chemical damage (e.g. acid on marble, bleach + vinegar dangers).
   - Household supplies list generated specifically for the identified stain and material.
3. **Preserved Quick Common Stains**:
   - 4 instant one-click guides (Drink spills, Oil stains, Candle wax, Mud on shoes).
4. **Offline Demo Simulation Mode**:
   - Option to preview the full diagnostic UI and cleaning procedures even without an active paid API key.

---

## 🔒 Security Architecture

- **Never Expose Keys to the Client:** API keys (`GEMINI_API_KEY` and `OPENAI_API_KEY`) are loaded exclusively by Node.js on the server via `process.env`. They are **never** passed to `index.html`, `style.css`, or browser-side `script.js`.
- **Git Protection:** Secret keys are kept in `backend/.env` and excluded from version control via `.gitignore`.
- **Server-Side Validation:** The backend strictly verifies file formats (`image/jpeg`, `image/png`, `image/webp`) and enforces a 10 MB limit before forwarding anything to the AI model.

---

## 🚀 Step-by-Step Setup Guide (Windows)

### Option A: Free Setup with Google Gemini (Recommended)
1. Go to **[aistudio.google.com](https://aistudio.google.com/)**.
2. Sign in with your Google account.
3. Click **Get API key** -> **Create API key**.
4. Copy your key (starts with `AIzaSy...`).
5. Open `backend/.env` in Notepad and set:
   ```env
   GEMINI_API_KEY=AIzaSyYourActualKeyHere
   PORT=5000
   ```

### Option B: Setup with OpenAI Vision
1. Go to **[platform.openai.com/api-keys](https://platform.openai.com/api-keys)**.
2. Sign in or create an account.
3. Click **Create new secret key** and copy it (starts with `sk-...`).
4. Open `backend/.env` in Notepad and set:
   ```env
   OPENAI_API_KEY=sk-your_actual_key_here
   PORT=5000
   ```

---

### Step 2: Install Dependencies & Run the Server
Open a **PowerShell** window and run:

```powershell
# 1. Navigate to the backend directory
cd backend

# 2. Start the server (or npm.cmd start if PowerShell script execution is restricted)
npm start
```

You should see:
```
==================================================
EverydayFix AI / StainSolver backend running: http://localhost:5000
Serving frontend static files from: C:\Users\manas\OneDrive\Desktop\fix-ai
Active AI Provider: Google Gemini 2.5 Flash
  - Google Gemini: Configured ✅
==================================================
```

> **Note on Windows PowerShell:** If Windows displays `npm.ps1 cannot be loaded because running scripts is disabled`, run `npm.cmd start` or `node server.js` directly.

---

### Step 3: Open in your Browser

Open your browser and navigate to:
```
http://localhost:5000
```
*(You will see the green status pill in the top header: **🟢 AI Server Online**).*

1. **Upload a Stain Photo**: Drag-and-drop or browse any JPG, PNG, or WEBP image.
2. **Select Material**: Choose Cotton, Wood, Tile, Leather, Other Fabrics, or Other.
3. **Describe**: (Optional) Note what spilled and how long it has been there.
4. **Click "Analyze Photo with AI"**: View the identified stain, uncertainty rating, household supplies needed, numbered steps with interactive checkboxes, and safety precautions.
5. **Quick Common Stains**: Explore any of the 4 instant preset categories anytime.
