/**
 * EverydayFix AI — Frontend Application Script
 * --------------------------------------------
 * Handles:
 * 1. Live server connectivity & health checks
 * 2. Drag-and-drop image upload & preview for JPG, PNG, WEBP
 * 3. Gemini 2.5 Flash multimodal photo stain analysis via backend
 * 4. Dynamic checklist rendering, uncertainty display, and clipboard copy
 * 5. Preserved 4 preset stain categories with instant guides & reset controls
 */

// Determine API Base URL (handles direct backend serving, Vite proxy, VS Code Live Server, and file://)
function getApiBase() {
  const port = window.location.port;
  if (port === "5000" || port === "5001" || port === "5173") {
    return "";
  }
  return "http://localhost:5000";
}
const API_BASE = getApiBase();

// =============================================================================
// 1. PRESET DATA FOR THE 4 COMMON PROBLEMS (PRESERVED)
// =============================================================================
const PRESET_SOLUTIONS = {
  "drink-spills": {
    id: "drink-spills",
    title: "Drink Spills on Clothing",
    category: "Fabric & Laundry Care",
    icon: "☕",
    time: "10–15 mins",
    difficulty: "Easy",
    supplies: "Clean white cloth, cool water, white vinegar, mild dish soap",
    steps: [
      "Blot gently immediately with a clean, dry white cloth or paper towel. Never rub vigorously, as rubbing drives the liquid deeper into fabric fibers.",
      "Turn the fabric inside-out and flush the back of the stain with cold running water to push the spill out of the fibers rather than into them.",
      "Mix 1 tablespoon of liquid dish soap with 2 cups of cool water and 1 tablespoon of white vinegar in a small bowl.",
      "Dab the cleaning mixture onto the stain using a soft sponge or cloth, working from the outside edge toward the center to avoid spreading.",
      "Let the mixture sit and penetrate the fibers for 5 to 10 minutes.",
      "Rinse thoroughly with cold water. If the stain has fully lifted, launder the garment as usual according to its care label."
    ],
    warnings: [
      "Always test vinegar or detergent solutions on an inconspicuous inside seam or hem first to ensure colorfastness.",
      "Never put a stained garment into a hot tumble dryer. High heat will permanently bake the stain into the fabric.",
      "Never mix vinegar with chlorine bleach — this combination creates toxic, hazardous fumes."
    ]
  },

  "oil-stains": {
    id: "oil-stains",
    title: "Oil Stains on Surfaces",
    category: "Countertops & Hard Surfaces",
    icon: "🍳",
    time: "15–20 mins",
    difficulty: "Quick Fix",
    supplies: "Baking soda or cornstarch, grease-cutting dish soap, microfiber cloth",
    steps: [
      "Cover fresh standing oil immediately with a generous mound of baking soda, cornstarch, or talcum powder to absorb liquid fat.",
      "Allow the powder to sit undisturbed for 15 minutes while it draws the grease out from the surface.",
      "Gently sweep or vacuum away the oil-saturated powder without scratching the surface.",
      "Mix warm water with a few drops of grease-cutting liquid dish soap in a bowl to make a rich soapy foam.",
      "Dip a soft microfiber cloth or non-scratch sponge into the solution and wipe in gentle circular motions over the stained area.",
      "Rinse the area with a clean damp cloth to remove any slick soap film, then buff dry with a clean microfiber towel."
    ],
    warnings: [
      "Do NOT use acidic cleaners (such as white vinegar, lemon juice, or harsh descalers) on natural stone like marble, limestone, or unsealed granite, as acids cause permanent dull etching.",
      "Never pour boiling water directly onto oil grease pools on counters, as this can splatter and spread grease fires or scald you.",
      "Ensure stovetops and burners are completely cool before applying any cleaning powders or liquids."
    ]
  },

  "candle-wax": {
    id: "candle-wax",
    title: "Candle Wax on Tables",
    category: "Wood & Hard Furniture Care",
    icon: "🕯️",
    time: "15 mins",
    difficulty: "Moderate",
    supplies: "Ice cubes in a bag, plastic card/scraper, paper bag or paper towels, clothes iron",
    steps: [
      "Wait until the melted wax is 100% hardened and cool. Never smear hot wax.",
      "To speed up chilling, place ice cubes in a plastic zipper bag and rest it on the wax for 2–3 minutes to make the wax brittle.",
      "Carefully lift the thick brittle chunks using the edge of a plastic credit card, ruler, or silicone spatula. Gently pop the chunks off.",
      "Place a plain unprinted brown paper grocery bag or 2 layers of white paper towels directly over the thin wax film remaining on the table.",
      "Set a clothing iron to its lowest heat setting with NO steam. Glide the warm iron gently over the paper for 3 to 5 seconds. The heated wax will melt and absorb directly into the paper.",
      "Shift the paper to a clean dry spot and repeat until no more oily wax spots transfer onto the paper.",
      "Wipe the table clean with a soft cloth lightly dampened with wood polish or mild soapy water, then buff dry."
    ],
    warnings: [
      "NEVER use metal knives, razor blades, or metal spatulas on finished wood or glass — they will permanently scratch the finish.",
      "Never let the heated iron touch the wooden surface directly; always keep paper between the iron soleplate and the furniture.",
      "For delicate antique furniture, consult a restoration specialist before applying any heat."
    ]
  },

  "mud-shoes": {
    id: "mud-shoes",
    title: "Mud on Shoes",
    category: "Footwear & Outdoor Gear",
    icon: "👟",
    time: "20 mins (+ air dry)",
    difficulty: "Easy",
    supplies: "Old toothbrush, mild laundry detergent or soap, warm water, paper towels",
    steps: [
      "Allow wet mud to dry completely before attempting to clean. Wiping wet mud smears dirty water deep into fabric fibers and shoe mesh.",
      "Clap the shoe soles together firmly outside or over a bin to crack and knock off large dried mud chunks.",
      "Take an old, dry toothbrush or shoe brush and scrub away the crusted dried dirt from tread grooves, eyelets, and stitching.",
      "Mix warm water with a few drops of mild laundry detergent or dish soap in a small bowl until sudsy.",
      "Dip the brush bristles into the suds and gently scrub the canvas, mesh, and rubber soles in small circular motions. For smooth leather, wipe gently with a damp soapy cloth rather than hard bristles.",
      "Wipe all soapy residue away with a clean, damp microfiber cloth.",
      "Stuff the shoes with crumpled paper towels or plain unprinted paper to help them maintain their shape, and let them air-dry in a breezy room away from direct radiators."
    ],
    warnings: [
      "Do NOT submerge leather or suede shoes in water, and never wash them in a washing machine; water ruins adhesives and warps leather.",
      "Never use hair dryers or place wet shoes directly onto heaters/radiators — extreme heat warps rubber soles and shrinks leather.",
      "For genuine suede shoes, never use water or soap. Use a dedicated dry suede eraser and suede brush instead."
    ]
  }
};

// =============================================================================
// 2. DOM REFERENCES
// =============================================================================
// Status Pill
const serverStatusPill = document.getElementById("serverStatusPill");
const serverStatusText = document.getElementById("serverStatusText");

// AI Upload Form Elements
const stainUploadForm = document.getElementById("stainUploadForm");
const dropzone = document.getElementById("dropzone");
const imageInput = document.getElementById("imageInput");
const cameraInput = document.getElementById("cameraInput");
const browsePhotoBtn = document.getElementById("browsePhotoBtn");
const takePhotoBtn = document.getElementById("takePhotoBtn");
const changePhotoBtn = document.getElementById("changePhotoBtn");
const loadSampleImageBtn = document.getElementById("loadSampleImageBtn");
const dropzonePrompt = document.getElementById("dropzonePrompt");
const previewBox = document.getElementById("previewBox");
const imagePreview = document.getElementById("imagePreview");
const previewFileName = document.getElementById("previewFileName");
const previewFileSize = document.getElementById("previewFileSize");
const removePhotoBtn = document.getElementById("removePhotoBtn");

const materialSelect = document.getElementById("materialSelect");
const stainAgeSelect = document.getElementById("stainAgeSelect");
const stainDescription = document.getElementById("stainDescription");
const analyzeBtn = document.getElementById("analyzeBtn");

// AI Loading & Error Elements
const aiLoadingState = document.getElementById("aiLoadingState");
const loadingTitle = document.getElementById("loadingTitle");
const loadingSubtext = document.getElementById("loadingSubtext");
const aiErrorAlert = document.getElementById("aiErrorAlert");
const errorTitle = document.getElementById("errorTitle");
const errorMessageText = document.getElementById("errorMessageText");
const errorHelpBox = document.getElementById("errorHelpBox");
const dismissErrorBtn = document.getElementById("dismissErrorBtn");

// AI Result Card Elements
const aiResultCard = document.getElementById("aiResultCard");
const aiProviderBadge = document.getElementById("aiProviderBadge");
const aiConfidenceBadge = document.getElementById("aiConfidenceBadge");
const analysisModeBanner = document.getElementById("analysisModeBanner");
const modeBannerIcon = document.getElementById("modeBannerIcon");
const modeBannerTitle = document.getElementById("modeBannerTitle");
const modeBannerDesc = document.getElementById("modeBannerDesc");
const aiStainType = document.getElementById("aiStainType");
const aiTargetSurface = document.getElementById("aiTargetSurface");
const aiReportedAge = document.getElementById("aiReportedAge");
const resultThumbnail = document.getElementById("resultThumbnail");
const aiUncertaintyNotes = document.getElementById("aiUncertaintyNotes");
const aiMaterialNotes = document.getElementById("aiMaterialNotes");
const aiSuppliesContainer = document.getElementById("aiSuppliesContainer");
const aiStepsList = document.getElementById("aiStepsList");
const stepProgress = document.getElementById("stepProgress");
const aiWarningsList = document.getElementById("aiWarningsList");
const aiPrintBtn = document.getElementById("aiPrintBtn");
const aiCopyBtn = document.getElementById("aiCopyBtn");
const aiResetBtn = document.getElementById("aiResetBtn");
const aiBottomResetBtn = document.getElementById("aiBottomResetBtn");

// Preset Stain Cards Elements
const problemCards = document.querySelectorAll(".problem-card");
const emptyState = document.getElementById("emptyState");
const solutionCard = document.getElementById("solutionCard");
const solutionIcon = document.getElementById("solutionIcon");
const solutionCategory = document.getElementById("solutionCategory");
const solutionTitle = document.getElementById("solutionTitle");
const metaTime = document.getElementById("metaTime");
const metaDifficulty = document.getElementById("metaDifficulty");
const metaSupplies = document.getElementById("metaSupplies");
const stepsList = document.getElementById("stepsList");
const warningsList = document.getElementById("warningsList");
const resetBtn = document.getElementById("resetBtn");
const bottomResetBtn = document.getElementById("bottomResetBtn");
const copyBtn = document.getElementById("copyBtn");

// Application State
let selectedFile = null;
let currentAiAnalysis = null;
let activePresetKey = null;
let loadingCycleTimer = null;

// =============================================================================
// 3. SERVER HEALTH MONITOR
// =============================================================================
async function checkServerHealth() {
  const dot = serverStatusPill ? serverStatusPill.querySelector(".status-dot") : null;
  if (!serverStatusPill || !serverStatusText || !dot) return;

  try {
    const res = await fetch(`${API_BASE}/api/health`, { method: "GET" });
    if (!res.ok) throw new Error("Server returned non-200");
    const data = await res.json();

    if (data.apiKeyConfigured) {
      dot.className = "status-dot online";
      serverStatusText.textContent = `AI Server Online (${data.provider || "Active"})`;
      serverStatusPill.title = `Connected to Node.js backend. Active AI provider: ${data.provider}.`;

      const heroBadge = document.getElementById("heroProviderBadge");
      if (heroBadge) {
        heroBadge.textContent = `✨ Powered by ${data.provider || "Vision AI"}`;
      }
    } else {
      dot.className = "status-dot checking";
      serverStatusText.textContent = "Server Online (No API Key)";
      serverStatusPill.title = "Backend is running, but no GEMINI_API_KEY or OPENAI_API_KEY is configured in backend/.env.";
    }
  } catch (err) {
    dot.className = "status-dot offline";
    serverStatusText.textContent = "Server Offline";
    serverStatusPill.title = "Backend server not reached at http://localhost:5000. Start it with 'npm start' in the backend folder.";
  }
}

// Check health immediately and every 15 seconds
checkServerHealth();
setInterval(checkServerHealth, 15000);

// =============================================================================
// 4. IMAGE UPLOAD & PREVIEW (DRAG & DROP + PICKER)
// =============================================================================
const ALLOWED_MIME_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_BYTES = 10 * 1024 * 1024; // 10MB

function formatBytes(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function handleSelectedImage(file) {
  hideError();

  if (!file) return;

  // Validate MIME type
  if (!ALLOWED_MIME_TYPES.includes(file.type)) {
    showError(
      "Unsupported File Type",
      "Please upload a valid JPG, PNG, or WEBP image file.",
      "Tip: Screenshots, phone camera photos, or web images saved as .jpg or .png work best."
    );
    clearSelectedPhoto();
    return;
  }

  // Validate File Size
  if (file.size > MAX_BYTES) {
    showError(
      "File Too Large",
      `The selected file is ${formatBytes(file.size)}. The maximum allowed size is 10 MB.`,
      "Tip: Try taking a smaller photo or resizing the image before uploading."
    );
    clearSelectedPhoto();
    return;
  }

  selectedFile = file;

  // Display Preview
  const objectUrl = URL.createObjectURL(file);
  imagePreview.src = objectUrl;
  previewFileName.textContent = file.name;
  previewFileSize.textContent = formatBytes(file.size);

  dropzonePrompt.classList.add("hidden");
  previewBox.classList.remove("hidden");
}

function clearSelectedPhoto() {
  selectedFile = null;
  imageInput.value = "";
  imagePreview.src = "";
  previewBox.classList.add("hidden");
  dropzonePrompt.classList.remove("hidden");
}

// File input change
imageInput.addEventListener("change", (e) => {
  if (e.target.files && e.target.files[0]) {
    handleSelectedImage(e.target.files[0]);
  }
});

// Camera input change (for mobile capture)
if (cameraInput) {
  cameraInput.addEventListener("change", (e) => {
    if (e.target.files && e.target.files[0]) {
      handleSelectedImage(e.target.files[0]);
    }
  });
}

// Button triggers
if (browsePhotoBtn) {
  browsePhotoBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    imageInput.click();
  });
}

if (takePhotoBtn) {
  takePhotoBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    if (cameraInput) {
      cameraInput.click();
    } else {
      imageInput.click();
    }
  });
}

if (changePhotoBtn) {
  changePhotoBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    imageInput.click();
  });
}

// Interactive sample image generator
function createSampleStainImage() {
  const canvas = document.createElement("canvas");
  canvas.width = 400;
  canvas.height = 400;
  const ctx = canvas.getContext("2d");

  // Fabric texture background
  ctx.fillStyle = "#f6f1e8";
  ctx.fillRect(0, 0, 400, 400);

  ctx.strokeStyle = "rgba(0, 0, 0, 0.03)";
  for (let i = 0; i < 400; i += 4) {
    ctx.beginPath();
    ctx.moveTo(0, i);
    ctx.lineTo(400, i);
    ctx.stroke();
  }

  // Red wine stain gradient
  const gradient = ctx.createRadialGradient(200, 200, 15, 200, 200, 125);
  gradient.addColorStop(0, "rgba(102, 24, 43, 0.9)");
  gradient.addColorStop(0.65, "rgba(142, 42, 65, 0.75)");
  gradient.addColorStop(0.88, "rgba(185, 75, 98, 0.45)");
  gradient.addColorStop(1, "rgba(246, 241, 232, 0)");

  ctx.fillStyle = gradient;
  ctx.beginPath();
  ctx.arc(200, 200, 120, 0, Math.PI * 2);
  ctx.fill();

  // Fine splatter dots
  for (let j = 0; j < 14; j++) {
    const angle = (j / 14) * Math.PI * 2;
    const dist = 115 + (j % 4) * 20;
    const x = 200 + Math.cos(angle) * dist;
    const y = 200 + Math.sin(angle) * dist;
    const r = 3 + (j % 4) * 2;
    ctx.fillStyle = "rgba(125, 30, 52, 0.7)";
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
  }

  return new Promise((resolve) => {
    canvas.toBlob((blob) => {
      const file = new File([blob], "sample-red-wine-stain.jpg", { type: "image/jpeg" });
      resolve(file);
    }, "image/jpeg", 0.92);
  });
}

if (loadSampleImageBtn) {
  loadSampleImageBtn.addEventListener("click", async (e) => {
    e.stopPropagation();
    try {
      const sampleFile = await createSampleStainImage();
      handleSelectedImage(sampleFile);
      materialSelect.value = "cotton";
      stainAgeSelect.selectedIndex = 0;
      stainDescription.value = "Red wine spill dropped on cotton shirt during dinner";
    } catch (err) {
      console.warn("Could not generate sample image:", err);
    }
  });
}

// Quick stain suggestion chips
document.querySelectorAll(".stain-chip").forEach((chip) => {
  chip.addEventListener("click", () => {
    document.querySelectorAll(".stain-chip").forEach((c) => c.classList.remove("active"));
    chip.classList.add("active");
    const text = chip.dataset.stain || chip.textContent;
    stainDescription.value = text;

    if (text.toLowerCase().includes("wax")) {
      materialSelect.value = "wood";
    } else if (text.toLowerCase().includes("mud") && !materialSelect.value) {
      materialSelect.value = "cotton";
    } else if (!materialSelect.value) {
      materialSelect.value = "cotton";
    }
    stainDescription.focus();
  });
});

// Remove photo button
removePhotoBtn.addEventListener("click", (e) => {
  e.stopPropagation();
  clearSelectedPhoto();
});

// Drag & Drop handlers
["dragenter", "dragover"].forEach((eventName) => {
  dropzone.addEventListener(eventName, (e) => {
    e.preventDefault();
    e.stopPropagation();
    dropzone.classList.add("dragover");
  });
});

["dragleave", "drop"].forEach((eventName) => {
  dropzone.addEventListener(eventName, (e) => {
    e.preventDefault();
    e.stopPropagation();
    dropzone.classList.remove("dragover");
  });
});

dropzone.addEventListener("drop", (e) => {
  if (e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files[0]) {
    handleSelectedImage(e.dataTransfer.files[0]);
  }
});

// =============================================================================
// 5. ERROR DISPLAY & TROUBLESHOOTING
// =============================================================================
function showError(title, message, helpHtml = "") {
  errorTitle.textContent = title;
  errorMessageText.textContent = message;

  if (helpHtml) {
    errorHelpBox.innerHTML = typeof helpHtml === "string" ? helpHtml : "";
    errorHelpBox.classList.remove("hidden");
  } else {
    errorHelpBox.innerHTML = "";
    errorHelpBox.classList.add("hidden");
  }

  aiErrorAlert.classList.remove("hidden");
  aiErrorAlert.scrollIntoView({ behavior: "smooth", block: "nearest" });
}

function hideError() {
  aiErrorAlert.classList.add("hidden");
  errorHelpBox.innerHTML = "";
}

dismissErrorBtn.addEventListener("click", hideError);

// =============================================================================
// 6. AI ANALYSIS SUBMISSION (GEMINI 2.5 FLASH)
// =============================================================================
stainUploadForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  hideError();

  // Validate image
  if (!selectedFile) {
    showError(
      "Photo Required",
      "Please upload or drop a photo of your stain before analyzing.",
      "You can click the upload box or drag an image directly from your computer."
    );
    return;
  }

  // Validate material
  const material = materialSelect.value;
  if (!material) {
    showError(
      "Material Required",
      "Please select the target surface or material (e.g. Cotton, Wood, Tile, Leather, etc.).",
      "Stain removal methods differ greatly by material. Cleaning wood requires different solutions than cotton!"
    );
    materialSelect.focus();
    return;
  }

  // Show loading indicator
  startLoading();

  const formData = new FormData();
  formData.append("image", selectedFile);
  formData.append("material", material);
  formData.append("stainAge", stainAgeSelect.value);
  formData.append("description", stainDescription.value.trim());

  try {
    const response = await fetch(`${API_BASE}/api/analyze-stain`, {
      method: "POST",
      body: formData
    });

    const data = await response.json();

    if (!response.ok) {
      stopLoading();

      if (data.code === "MISSING_API_KEY") {
        showError(
          "AI API Key Required",
          data.error || "No AI API key is configured on the server.",
          `<div style="display:flex; flex-direction:column; gap:0.75rem;">
             <p><strong>Option 1 (Recommended — 100% Free):</strong></p>
             <ol>
               <li>Get a free Gemini API key from <a href="https://aistudio.google.com/" target="_blank" rel="noopener">Google AI Studio (aistudio.google.com)</a>.</li>
               <li>Open <code>backend/.env</code> in Notepad.</li>
               <li>Paste your key: <code>GEMINI_API_KEY=AIzaSy...</code></li>
               <li>Restart backend: <code>npm start</code></li>
             </ol>
             <p><strong>Option 2 (OpenAI):</strong></p>
             <ol>
               <li>Get a key from <a href="https://platform.openai.com/api-keys" target="_blank" rel="noopener">platform.openai.com/api-keys</a>.</li>
               <li>Set <code>OPENAI_API_KEY=sk-...</code> in <code>backend/.env</code>.</li>
             </ol>
             <div style="margin-top:0.5rem; padding-top:0.5rem; border-top:1px dashed var(--color-error-border);">
               <p style="margin-bottom:0.4rem;"><strong>Or test the interface right now without an API key:</strong></p>
               <button type="button" class="btn btn-primary btn-sm" id="demoFallbackBtn">🧪 Run Offline Demo Simulation</button>
             </div>
           </div>`
        );
        attachDemoFallbackListener();
        checkServerHealth();
        return;
      }

      if (data.code === "QUOTA_EXCEEDED") {
        showError(
          "AI Quota or Credit Limit Reached",
          data.error || "Your AI API provider has no credits or exceeded quota.",
          `<div style="display:flex; flex-direction:column; gap:0.75rem;">
             <p><strong>Why this happens:</strong> The OpenAI key configured in <code>backend/.env</code> has 0 credits remaining (HTTP 429).</p>
             <p><strong>Quick Fix (Free):</strong> Switch to Google Gemini which offers a free tier with no credit card required!</p>
             <ol>
               <li>Visit <a href="https://aistudio.google.com/" target="_blank" rel="noopener">Google AI Studio (aistudio.google.com)</a>.</li>
               <li>Click "Get API Key" and copy your free key.</li>
               <li>In <code>backend/.env</code>, set: <code>GEMINI_API_KEY=your_key_here</code></li>
               <li>Restart the backend: <code>npm start</code></li>
             </ol>
             <div style="margin-top:0.5rem; padding-top:0.5rem; border-top:1px dashed var(--color-error-border);">
               <p style="margin-bottom:0.4rem;"><strong>Want to preview results right now?</strong></p>
               <button type="button" class="btn btn-primary btn-sm" id="demoFallbackBtn">🧪 Run Offline Demo Simulation</button>
             </div>
           </div>`
        );
        attachDemoFallbackListener();
        return;
      }

      if (data.code === "INVALID_API_KEY") {
        showError(
          "Invalid AI API Key",
          data.error || "Your API key was rejected by the provider.",
          `<p>Please check <code>backend/.env</code> for accidental spaces or prefixes.</p>
           <p style="margin-top:0.5rem;"><button type="button" class="btn btn-primary btn-sm" id="demoFallbackBtn">🧪 Run Offline Demo Simulation</button></p>`
        );
        attachDemoFallbackListener();
        return;
      }

      showError(
        "Analysis Failed",
        data.error || "The server could not complete the stain analysis.",
        `<p>${data.details || "Check your terminal for backend logs or try uploading a clearer image."}</p>
         <p style="margin-top:0.5rem;"><button type="button" class="btn btn-primary btn-sm" id="demoFallbackBtn">🧪 Run Offline Demo Simulation</button></p>`
      );
      attachDemoFallbackListener();
      return;
    }

    // Success! Stop loading and render results
    stopLoading();
    renderAiResult(data);

  } catch (err) {
    stopLoading();
    showError(
      "Backend Server Offline",
      "Could not connect to the backend server at " + API_BASE + ".",
      `<p><strong>To start your backend server:</strong></p>
       <ol>
         <li>Open a PowerShell window.</li>
         <li>Run: <code>cd c:\\Users\\manas\\OneDrive\\Desktop\\fix-ai\\backend</code></li>
         <li>Run: <code>npm start</code></li>
         <li>Refresh this browser page and try again!</li>
       </ol>`
    );
    checkServerHealth();
  }
});

// Helper: trigger demo mode simulation
function attachDemoFallbackListener() {
  const btn = document.getElementById("demoFallbackBtn");
  if (!btn) return;
  btn.onclick = async () => {
    hideError();
    startLoading();
    const formData = new FormData();
    if (selectedFile) formData.append("image", selectedFile);
    formData.append("material", materialSelect.value || "Other / Unspecified");
    formData.append("stainAge", stainAgeSelect.value);
    formData.append("description", stainDescription.value.trim());

    try {
      const res = await fetch(`${API_BASE}/api/analyze-stain?demo=true`, {
        method: "POST",
        body: formData
      });
      const data = await res.json();
      stopLoading();
      if (res.ok && data.analysis) {
        renderAiResult(data);
      } else {
        showError("Simulation Failed", data.error || "Could not generate demo analysis.");
      }
    } catch (e) {
      stopLoading();
      showError("Simulation Error", e.message || "Failed to run simulation.");
    }
  };
}

// Loading state messages
const LOADING_STEPS = [
  { title: "Analyzing photo with Vision AI…", text: "Scanning visual pigments, color tone, and edge saturation" },
  { title: "Evaluating stain chemistry…", text: "Comparing against coffee, wine, grease, tannins, and pigment profiles" },
  { title: "Checking surface safety rules…", text: "Customizing non-damaging cleaning instructions for your material" }
];

function startLoading() {
  analyzeBtn.disabled = true;
  aiLoadingState.classList.remove("hidden");
  aiResultCard.classList.add("hidden");

  let stepIdx = 0;
  loadingTitle.textContent = LOADING_STEPS[0].title;
  loadingSubtext.textContent = LOADING_STEPS[0].text;

  const pills = aiLoadingState.querySelectorAll(".load-pill");
  pills.forEach((p, i) => p.classList.toggle("active", i === 0));

  loadingCycleTimer = setInterval(() => {
    stepIdx = (stepIdx + 1) % LOADING_STEPS.length;
    loadingTitle.textContent = LOADING_STEPS[stepIdx].title;
    loadingSubtext.textContent = LOADING_STEPS[stepIdx].text;
    pills.forEach((p, i) => p.classList.toggle("active", i === stepIdx));
  }, 2200);

  aiLoadingState.scrollIntoView({ behavior: "smooth", block: "nearest" });
}

function stopLoading() {
  analyzeBtn.disabled = false;
  aiLoadingState.classList.add("hidden");
  if (loadingCycleTimer) {
    clearInterval(loadingCycleTimer);
    loadingCycleTimer = null;
  }
}

// =============================================================================
// 7. RENDER AI ANALYSIS RESULT
// =============================================================================
function renderAiResult(data) {
  currentAiAnalysis = data;
  const analysis = data.analysis;

  // Set Thumbnail from selected image
  if (selectedFile) {
    resultThumbnail.src = URL.createObjectURL(selectedFile);
  }

  // Mode Banner & Status
  if (analysisModeBanner) {
    analysisModeBanner.classList.remove("hidden", "live-banner", "demo-banner");
    if (data.fallbackTriggered) {
      analysisModeBanner.classList.add("demo-banner");
      if (modeBannerIcon) modeBannerIcon.textContent = "⚠️";
      if (modeBannerTitle) modeBannerTitle.textContent = "Cloud AI Unavailable — Seamlessly Switched to Offline Demo Mode";
      if (modeBannerDesc) {
        modeBannerDesc.innerHTML = `${data.fallbackMessage || "Cloud AI quota or credit limit was reached."} <br><strong>Surface-safe diagnosis generated from offline rules database.</strong> To activate live AI vision for free without credits, <a href="https://aistudio.google.com/" target="_blank" rel="noopener" style="color:#78350f; font-weight:700; text-decoration:underline;">get a free Google Gemini key</a> and add to <code>backend/.env</code>.`;
      }
      if (aiProviderBadge) {
        aiProviderBadge.className = "badge-gemini";
        aiProviderBadge.textContent = "⚠️ Offline Demo (Quota Fallback)";
      }
    } else if (data.isDemo) {
      analysisModeBanner.classList.add("demo-banner");
      if (modeBannerIcon) modeBannerIcon.textContent = "🧪";
      if (modeBannerTitle) modeBannerTitle.textContent = "Offline Demonstration Mode (Rule-Based)";
      if (modeBannerDesc) {
        modeBannerDesc.textContent = "Produced by StainSolver's offline household safety database. No live AI Vision API was contacted.";
      }
      if (aiProviderBadge) {
        aiProviderBadge.className = "badge-gemini";
        aiProviderBadge.textContent = "🧪 Offline Demo Mode";
      }
    } else {
      analysisModeBanner.classList.add("live-banner");
      if (modeBannerIcon) modeBannerIcon.textContent = "🟢";
      if (modeBannerTitle) modeBannerTitle.textContent = "Live Multimodal AI Vision Analysis";
      if (modeBannerDesc) {
        modeBannerDesc.textContent = `Visual pigment and texture analyzed by live cloud vision model (${data.provider || "Active AI"}).`;
      }
      if (aiProviderBadge) {
        aiProviderBadge.className = "badge-gemini";
        aiProviderBadge.textContent = `✨ ${data.provider || "AI Vision"} Analysis`;
      }
    }
  }

  aiConfidenceBadge.textContent = `Confidence: ${analysis.confidence}`;
  aiStainType.textContent = analysis.stainType;
  aiTargetSurface.textContent = `Surface: ${data.material}`;
  aiReportedAge.textContent = `Age: ${data.stainAge}`;

  // Uncertainty & Visual Rationale
  aiUncertaintyNotes.textContent = analysis.uncertaintyNotes || "Visual analysis complete.";

  // Material Notes
  aiMaterialNotes.textContent = analysis.materialNotes || `Cleaning protocol customized for ${data.material}.`;

  // Household Supplies Tags
  aiSuppliesContainer.innerHTML = "";
  if (Array.isArray(analysis.supplies) && analysis.supplies.length > 0) {
    analysis.supplies.forEach((supply) => {
      const tag = document.createElement("span");
      tag.className = "supply-tag";
      tag.textContent = supply;
      aiSuppliesContainer.appendChild(tag);
    });
  } else {
    aiSuppliesContainer.innerHTML = '<span class="supply-tag">Mild soap</span><span class="supply-tag">Clean cloth</span><span class="supply-tag">Cool water</span>';
  }

  // Numbered Cleaning Steps (Interactive Checklist with Progress)
  aiStepsList.innerHTML = "";
  const totalSteps = Array.isArray(analysis.steps) ? analysis.steps.length : 0;

  function updateAiStepProgress() {
    const checked = aiStepsList.querySelectorAll(".step-checkbox:checked").length;
    if (stepProgress) {
      if (checked === totalSteps && totalSteps > 0) {
        stepProgress.textContent = `🎉 All ${totalSteps} steps completed!`;
      } else {
        stepProgress.textContent = `${checked} of ${totalSteps} completed`;
      }
    }
  }

  if (totalSteps > 0) {
    analysis.steps.forEach((stepText, idx) => {
      const li = document.createElement("li");
      li.className = "step-item";

      const checkbox = document.createElement("input");
      checkbox.type = "checkbox";
      checkbox.className = "step-checkbox";
      checkbox.id = `ai-step-${idx}`;
      checkbox.title = "Mark step as completed";

      const num = document.createElement("span");
      num.className = "step-number";
      num.textContent = idx + 1;

      const spanText = document.createElement("span");
      spanText.className = "step-text";
      spanText.textContent = stepText;

      checkbox.addEventListener("change", () => {
        li.classList.toggle("completed", checkbox.checked);
        updateAiStepProgress();
      });

      li.appendChild(checkbox);
      li.appendChild(num);
      li.appendChild(spanText);
      aiStepsList.appendChild(li);
    });
  }
  updateAiStepProgress();

  // Crucial Safety Warnings
  aiWarningsList.innerHTML = "";
  if (Array.isArray(analysis.warnings) && analysis.warnings.length > 0) {
    analysis.warnings.forEach((warn) => {
      const li = document.createElement("li");
      li.className = "warning-item";
      li.textContent = warn;
      aiWarningsList.appendChild(li);
    });
  }

  // Show AI Result Card
  aiResultCard.classList.remove("hidden");
  aiCopyBtn.innerHTML = '<span class="btn-icon">📋</span> Copy AI Steps';

  // Smooth scroll to results
  setTimeout(() => {
    aiResultCard.scrollIntoView({ behavior: "smooth", block: "start" });
  }, 100);
}

// Print Handler
if (aiPrintBtn) {
  aiPrintBtn.addEventListener("click", () => {
    window.print();
  });
}

// Robust clipboard copy with fallback
async function copyToClipboard(text) {
  if (navigator.clipboard && window.isSecureContext) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch (e) {
      // Fall through to textarea fallback
    }
  }

  try {
    const textarea = document.createElement("textarea");
    textarea.value = text;
    textarea.style.position = "fixed";
    textarea.style.left = "-9999px";
    textarea.style.top = "-9999px";
    document.body.appendChild(textarea);
    textarea.focus();
    textarea.select();
    const successful = document.execCommand("copy");
    document.body.removeChild(textarea);
    return successful;
  } catch (err) {
    return false;
  }
}

// Copy AI Steps to Clipboard
async function copyAiSteps() {
  if (!currentAiAnalysis) return;
  const analysis = currentAiAnalysis.analysis;

  const textToCopy = `EverydayFix AI Analysis — ${analysis.stainType}\n` +
    `Confidence: ${analysis.confidence}\n` +
    `Surface: ${currentAiAnalysis.material} | Age: ${currentAiAnalysis.stainAge}\n\n` +
    `VISUAL NOTES:\n${analysis.uncertaintyNotes}\n\n` +
    `SUPPLIES NEEDED:\n` +
    (analysis.supplies || []).map(s => `- ${s}`).join("\n") +
    `\n\nCLEANING STEPS:\n` +
    (analysis.steps || []).map((step, i) => `${i + 1}. ${step}`).join("\n") +
    `\n\nSAFETY WARNINGS:\n` +
    (analysis.warnings || []).map(w => `• ${w}`).join("\n");

  const success = await copyToClipboard(textToCopy);
  if (success) {
    aiCopyBtn.innerHTML = '<span class="btn-icon">✅</span> Copied!';
    setTimeout(() => {
      aiCopyBtn.innerHTML = '<span class="btn-icon">📋</span> Copy AI Steps';
    }, 2500);
  } else {
    aiCopyBtn.innerHTML = '<span class="btn-icon">❌</span> Copy Failed';
    setTimeout(() => {
      aiCopyBtn.innerHTML = '<span class="btn-icon">📋</span> Copy AI Steps';
    }, 2500);
  }
}

aiCopyBtn.addEventListener("click", copyAiSteps);

// Reset AI Photo Form (Analyze Another Photo)
function resetAiPhotoForm() {
  aiResultCard.classList.add("hidden");
  clearSelectedPhoto();
  stainDescription.value = "";
  materialSelect.value = "";
  stainAgeSelect.selectedIndex = 0;
  hideError();
  currentAiAnalysis = null;

  document.getElementById("aiSection").scrollIntoView({ behavior: "smooth", block: "start" });
}

aiResetBtn.addEventListener("click", resetAiPhotoForm);
aiBottomResetBtn.addEventListener("click", resetAiPhotoForm);

// =============================================================================
// 8. PRESET STAIN CARDS CONTROLLER (THE 4 PRESERVED OPTIONS)
// =============================================================================
function showPresetSolution(problemKey) {
  const data = PRESET_SOLUTIONS[problemKey];
  if (!data) return;

  activePresetKey = problemKey;

  // Highlight selected card
  problemCards.forEach((card) => {
    const isSelected = card.dataset.problem === problemKey;
    card.classList.toggle("active", isSelected);
    card.setAttribute("aria-pressed", isSelected ? "true" : "false");
  });

  // Populate data
  solutionIcon.textContent = data.icon;
  solutionCategory.textContent = data.category;
  solutionTitle.textContent = data.title;
  metaTime.textContent = data.time;
  metaDifficulty.textContent = data.difficulty;
  metaSupplies.textContent = data.supplies;

  // Steps checklist
  stepsList.innerHTML = "";
  data.steps.forEach((stepText, index) => {
    const li = document.createElement("li");
    li.className = "step-item";

    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.className = "step-checkbox";
    checkbox.id = `preset-step-${index}`;

    const num = document.createElement("span");
    num.className = "step-number";
    num.textContent = index + 1;

    const spanText = document.createElement("span");
    spanText.className = "step-text";
    spanText.textContent = stepText;

    checkbox.addEventListener("change", () => {
      li.classList.toggle("completed", checkbox.checked);
    });

    li.appendChild(checkbox);
    li.appendChild(num);
    li.appendChild(spanText);
    stepsList.appendChild(li);
  });

  // Warnings
  warningsList.innerHTML = "";
  data.warnings.forEach((warn) => {
    const li = document.createElement("li");
    li.className = "warning-item";
    li.textContent = warn;
    warningsList.appendChild(li);
  });

  // Toggle view
  emptyState.classList.add("hidden");
  solutionCard.classList.remove("hidden");
  copyBtn.innerHTML = '<span class="btn-icon">📋</span> Copy Steps';

  // Smooth scroll
  setTimeout(() => {
    document.getElementById("presetSolutionContainer").scrollIntoView({ behavior: "smooth", block: "start" });
  }, 100);
}

function resetPresetSolution() {
  activePresetKey = null;

  problemCards.forEach((card) => {
    card.classList.remove("active");
    card.setAttribute("aria-pressed", "false");
  });

  solutionCard.classList.add("hidden");
  emptyState.classList.remove("hidden");

  document.getElementById("presetSection").scrollIntoView({ behavior: "smooth", block: "start" });
}

async function copyPresetInstructions() {
  if (!activePresetKey) return;
  const data = PRESET_SOLUTIONS[activePresetKey];
  if (!data) return;

  const textToCopy = `EverydayFix Quick Guide — ${data.title}\n` +
    `Category: ${data.category}\n` +
    `Est. Time: ${data.time} | Difficulty: ${data.difficulty}\n` +
    `Supplies: ${data.supplies}\n\n` +
    `INSTRUCTIONS:\n` +
    data.steps.map((step, i) => `${i + 1}. ${step}`).join("\n") +
    `\n\nSAFETY WARNINGS:\n` +
    data.warnings.map(warn => `- ${warn}`).join("\n");

  const success = await copyToClipboard(textToCopy);
  if (success) {
    copyBtn.innerHTML = '<span class="btn-icon">✅</span> Copied!';
    setTimeout(() => {
      copyBtn.innerHTML = '<span class="btn-icon">📋</span> Copy Steps';
    }, 2500);
  } else {
    copyBtn.innerHTML = '<span class="btn-icon">❌</span> Copy Failed';
    setTimeout(() => {
      copyBtn.innerHTML = '<span class="btn-icon">📋</span> Copy Steps';
    }, 2500);
  }
}

// Attach preset card listeners
problemCards.forEach((card) => {
  card.addEventListener("click", () => {
    showPresetSolution(card.dataset.problem);
  });
});

if (resetBtn) resetBtn.addEventListener("click", resetPresetSolution);
if (bottomResetBtn) bottomResetBtn.addEventListener("click", resetPresetSolution);
if (copyBtn) copyBtn.addEventListener("click", copyPresetInstructions);
