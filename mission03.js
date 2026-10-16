/* Mission 03 — Adaptive troubleshooting & failed-solution recovery.
   Runs in the browser and does not require an API key. */
(() => {
  const $ = (id) => document.getElementById(id);
  const form = $("recoveryForm");
  if (!form) return;
  const STORE_KEY = "everydayfix-mission03-history-v1";
  const hazardous = /\b(bleach|ammonia|toilet cleaner|drain cleaner|oven cleaner|acid|hydrochloric|mix(ed|ing)?\s+(the\s+)?(chemicals|cleaners)|smoke|sparks|burning smell|gas leak|electrical shock|electric shock|exposed wire|swollen battery)\b/i;
  const professional = /\b(gas leak|exposed wire|electrical shock|electric shock|sparks|smoke|swollen battery|fire|large mold|structural crack)\b/i;
  const escapeHTML = (value) => String(value).replace(/[&<>"']/g, ch => ({
    "&":"&amp;", "<":"&lt;", ">":"&gt;", '"':"&quot;", "'":"&#39;"
  }[ch]));
  let history = [];
  try {
    const stored = JSON.parse(localStorage.getItem(STORE_KEY) || "[]");
    if (Array.isArray(stored)) history = stored.slice(-12);
  } catch (_) { history = []; }

  function saveHistory() {
    try { localStorage.setItem(STORE_KEY, JSON.stringify(history.slice(-12))); } catch (_) {}
  }
  function renderHistory() {
    const list = $("recoveryHistory");
    if (!history.length) {
      list.innerHTML = '<li class="recovery-empty">Your attempts will appear here.</li>';
      return;
    }
    list.innerHTML = history.slice().reverse().map(item =>
      `<li><div class="history-top"><strong>${escapeHTML(item.problem)}</strong><time>${escapeHTML(item.time)}</time></div>
       <p><b>Tried:</b> ${escapeHTML(item.attempt)}</p><p><b>Outcome:</b> ${escapeHTML(item.outcomeLabel)}</p>
       <p><b>Next step:</b> ${escapeHTML(item.summary)}</p></li>`
    ).join("");
  }
  function showSafety(message) {
    const box = $("recoverySafety");
    box.textContent = message;
    box.classList.remove("hidden");
  }
  function hideSafety() {
    $("recoverySafety").textContent = "";
    $("recoverySafety").classList.add("hidden");
  }
  function createPlan(problem, attempt, outcome, details) {
    const all = `${problem} ${attempt} ${details}`;
    if (professional.test(all)) return {
      stop: true, title: "Stop troubleshooting and get professional help",
      reason: "The details may indicate a hazard. A different DIY step could make it worse.",
      steps: ["Stop using the affected item or area if you can do so safely.", "Do not touch exposed wires, batteries, gas fittings, or unknown substances.", "Move away from danger and contact the appropriate emergency service or qualified professional."]
    };
    if (hazardous.test(all)) return {
      stop: true, title: "Safety check needed before any next step",
      reason: "A chemical or hazardous condition may be involved. Do not add another product or treatment.",
      steps: ["Do not mix cleaning products or add more chemicals.", "If fumes, irritation, heat, or breathing difficulty are present, leave the area and seek local emergency or poison-control guidance.", "Check the product label and contact a qualified professional before continuing."]
    };
    const noRepeat = `You reported trying: “${attempt}”. Do not repeat that same action for now.`;
    if (outcome === "worse" || outcome === "new") return {
      stop: false, title: "Pause and reassess before trying anything else",
      reason: `${noRepeat} Since the result got worse or was unexpected, the revised plan starts with reducing risk rather than stronger treatment.`,
      steps: ["Stop applying the product or method you just tried.", "If this is a fabric or surface stain, gently blot excess liquid with a clean white cloth; do not scrub or add another cleaner.", "Check the care label or manufacturer's instructions and identify the exact material/product.", "Test any suitable mild method on a hidden spot first. If colour, texture, heat, fumes, or damage changes, stop and seek professional advice."]
    };
    if (outcome === "partial") return {
      stop: false, title: "Use a gentler, controlled next step",
      reason: `${noRepeat} Some improvement suggests the method may be helping, but repeating it aggressively can damage the material.`,
      steps: ["Pause and inspect the material in good light.", "If the surface instructions allow it, remove residue with a small amount of cool water and a clean cloth.", "Avoid heat, hard scrubbing, and adding multiple products.", "Spot-test any next method in a hidden area and stop if the material changes."]
    };
    return {
      stop: false, title: "Change the conditions, not the strength",
      reason: `${noRepeat} No change means the cause or material may be different than assumed. Stronger chemicals are not the automatic next step.`,
      steps: ["Pause before trying another product.", "Confirm the material and what caused the problem; read the product and care labels.", "Try only a material-compatible, mild method on a hidden test area first.", "If there is still no improvement, record the material and product used and ask a qualified cleaner/repair professional rather than escalating to harsh chemicals."]
    };
  }
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    hideSafety();
    const problem = $("recoveryProblem").value.trim();
    const attempt = $("recoveryAttempt").value.trim();
    const outcome = $("recoveryOutcome").value;
    const details = $("recoveryDetails").value.trim();
    if (!problem || !attempt || !outcome) {
      showSafety("Please choose a problem, describe the attempted solution, and select what happened.");
      return;
    }
    const outcomeLabels = {"no-change":"No change","worse":"It got worse","partial":"Improved a little","new":"Something unexpected happened"};
    const plan = createPlan(problem, attempt, outcome, details);
    const result = $("recoveryResult");
    result.innerHTML = `<div class="recovery-result-top"><span>${plan.stop ? "SAFETY FIRST" : "REVISED PLAN"}</span><h3>${escapeHTML(plan.title)}</h3></div>
      <p>${escapeHTML(plan.reason)}</p><ol>${plan.steps.map(step => `<li>${escapeHTML(step)}</li>`).join("")}</ol>
      <p class="recovery-footnote"><strong>Limit:</strong> This is general guidance, not a diagnosis. Material, product label, and local conditions matter. Never mix cleaning products.</p>`;
    result.classList.remove("hidden");
    const item = {problem, attempt, outcomeLabel: outcomeLabels[outcome], summary: plan.title,
      time: new Date().toLocaleString()};
    history.push(item); history = history.slice(-12); saveHistory(); renderHistory();
  });
  $("clearRecoveryHistory").addEventListener("click", () => {
    history = []; saveHistory(); renderHistory();
  });
  renderHistory();
})();
