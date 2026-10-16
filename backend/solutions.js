/**
 * EverydayFix AI (StainSolver) — Offline Household Solutions Database
 * -------------------------------------------------------------------
 * Comprehensive, safety-first cleaning protocols for common household stains.
 * Used for the explicit Offline Demonstration Mode and fallback rules engine.
 */

const SAMPLE_SOLUTIONS = [
  {
    id: "ink-marker",
    keywords: ["ink", "pen", "ballpoint", "marker", "sharpie", "highlighter", "printer ink"],
    title: "Ink or Marker Stain",
    supplies: ["Rubbing alcohol (isopropyl 70%+)", "Cotton balls or rounds", "Clean white paper towels", "Mild dish soap", "Cool water"],
    steps: [
      "Place several layers of white paper towels underneath the stained fabric or area to absorb dissolved pigment from behind.",
      "Dab (do not scrub) isopropyl rubbing alcohol or hand sanitizer onto the ink mark using a saturated cotton ball.",
      "Press firmly with clean paper towels to transfer the dissolved ink out of the fibers into the paper towels.",
      "Repeat with fresh alcohol-soaked cotton balls until no more ink transfers onto the cotton.",
      "Work a drop of mild liquid dish soap into the remaining faded spot and rinse thoroughly with cool tap water.",
      "Launder fabric on a regular cycle using cold water. Inspect before placing in any heated dryer."
    ],
    warnings: [
      "Do NOT use rubbing alcohol on acetate, rayon, or delicate triacetate fabrics, as it will dissolve synthetic fibers.",
      "For finished wood, rubbing alcohol can dissolve lacquer and polyurethane — use mineral oil or a dedicated wood cleaner instead.",
      "Never put clothing with ink residue into a hot tumble dryer; heat permanently sets pigment."
    ]
  },
  {
    id: "oil-grease",
    keywords: ["oil", "grease", "butter", "cooking oil", "salad dressing", "fryer", "motor oil", "lotion", "lip balm"],
    title: "Oil or Grease Stain",
    supplies: ["Baking soda or cornstarch", "Grease-cutting liquid dish soap", "Warm water", "Soft toothbrush or microfiber cloth"],
    steps: [
      "Sprinkle a generous mound of baking soda, cornstarch, or talcum powder directly over fresh grease to draw out free oil.",
      "Let the absorbent powder sit undisturbed for 15 to 20 minutes until it looks clumpy and saturated.",
      "Gently sweep or vacuum away the oily powder without pressing it back into the surface.",
      "Apply a few drops of grease-cutting liquid dish soap directly to the spot and massage gently with fingertips or a soft toothbrush.",
      "Let the soap sit for 10 minutes to break down lipid bonds, then flush with warm running water (use warm only if the care label permits).",
      "Wash fabric with heavy-duty detergent on the warmest water setting safe for that specific garment."
    ],
    warnings: [
      "Never use acidic cleaners (white vinegar or lemon juice) on natural stone like marble or granite — acid causes permanent dull etching.",
      "Do NOT pour boiling water over grease pools on delicate laminate or vinyl countertops as heat can warp adhesive layers.",
      "Ensure stovetops and cooking burners are completely cold before cleaning."
    ]
  },
  {
    id: "wine-tannin",
    keywords: ["wine", "red wine", "grape", "juice", "berry", "berries", "pomegranate", "beet", "sangria"],
    title: "Red Wine or Tannin Spill",
    supplies: ["Clean white microfiber cloth", "Table salt or baking soda", "Hydrogen peroxide 3% (for whites/light colors)", "Liquid dish soap", "Cold water"],
    steps: [
      "Immediately blot the spill firmly with clean white paper towels. Never rub in circles, which spreads pigments wider.",
      "Pour a thick mound of table salt or baking soda over wet wine to absorb liquid pigments; let sit for 5 minutes then vacuum.",
      "Mix 1 part liquid dish soap with 2 parts cool water in a small bowl.",
      "Dab the soapy mixture onto the stain using a clean cloth, working from outer perimeter inward toward the center.",
      "For light-colored fabrics or hard surfaces, dab a small amount of 3% hydrogen peroxide mixed with soap, and let sit for 5 minutes.",
      "Rinse thoroughly with cold running water and inspect in bright light before laundering."
    ],
    warnings: [
      "Do NOT use hot water on red wine — heat bakes tannin pigments directly into cotton and linen fibers.",
      "Hydrogen peroxide has mild bleaching properties: always spot-test on a hidden inside seam before using on colored fabrics.",
      "Never mix hydrogen peroxide with chlorine bleach or vinegar."
    ]
  },
  {
    id: "coffee-tea",
    keywords: ["coffee", "tea", "espresso", "latte", "cappuccino", "mug ring", "chai"],
    title: "Coffee or Tea Stain",
    supplies: ["Distilled white vinegar", "Cool water", "Mild dish soap", "Clean white cloth", "Baking soda"],
    steps: [
      "Blot excess standing liquid with a clean white microfiber towel. Avoid aggressive rubbing.",
      "Flush the back of the fabric with cold running water to push the stain out of the weave.",
      "Mix 1 tablespoon of white vinegar with 1 teaspoon of mild liquid dish soap in 2 cups of cool water.",
      "Sponge the solution onto the coffee stain and allow it to penetrate for 10 minutes.",
      "If the coffee had dairy or cream, add a small pinch of baking soda to help lift the milk fat.",
      "Rinse with cold water, blot dry, and wash according to the item's care instructions."
    ],
    warnings: [
      "Do NOT use vinegar on natural stone (marble, limestone, travertine) or finished hardwood — acid etches stone and clouds wood finish.",
      "Never mix white vinegar with chlorine bleach under any circumstances (creates dangerous chlorine gas).",
      "Avoid hot dryer cycles until the mark is completely gone."
    ]
  },
  {
    id: "food-sauce",
    keywords: ["tomato", "ketchup", "curry", "mustard", "chocolate", "pasta sauce", "soy sauce", "spaghetti", "barbecue", "bbq"],
    title: "Food, Sauce, or Condiment Spill",
    supplies: ["Dull butter knife or spoon", "Liquid dish soap", "White vinegar", "Cool water", "Clean sponge"],
    steps: [
      "Gently scrape away excess solid food or thick sauce using the dull edge of a spoon or plastic card. Do not wipe or smear.",
      "Run cold water through the backside of the stained fabric to push food particles out.",
      "Apply a drop of liquid dish soap directly to the spot and gently work it in with a damp sponge.",
      "For tomato or curry (tumeric) stains, dab a mixture of 1 part white vinegar and 2 parts water onto the area and let sit for 10 minutes.",
      "Rinse thoroughly in cold water.",
      "If color persists, expose damp item to natural outdoor sunlight for 1 to 2 hours (sunlight naturally breaks down turmeric and lycopene)."
    ],
    warnings: [
      "Never use hot water on tomato or egg-based sauces; heat cooks proteins and sets lycopene red pigments.",
      "Spot-test colored fabrics before using vinegar to verify dye stability.",
      "Do not leave damp fabrics in sunlight for more than 3 hours to avoid sun-fading on surrounding dyed fabric."
    ]
  },
  {
    id: "mud-dirt",
    keywords: ["mud", "dirt", "shoes", "shoe", "boots", "sneakers", "soil", "clay", "grass", "lawn"],
    title: "Mud, Dirt, or Grass on Footwear & Fabric",
    supplies: ["Old soft toothbrush", "Mild laundry detergent", "Warm water", "Paper towels", "Clean cloth"],
    steps: [
      "Allow wet mud to dry completely first. Trying to wipe wet mud smears fine silt deep into shoe mesh and textile weaves.",
      "Clap shoe soles or shake the garment outdoors to dislodge dry, crusty chunks.",
      "Gently brush away loose dirt from seams, grooves, and stitching using an old soft dry toothbrush.",
      "Mix warm water with a few drops of mild laundry detergent or liquid dish soap until sudsy.",
      "Dip the brush into suds and gently scrub canvas, mesh, and rubber in small circular motions. For smooth leather, wipe gently with a damp soapy cloth instead.",
      "Wipe all soap residue off with a clean damp cloth, stuff shoes with paper towels to hold shape, and air-dry away from heaters."
    ],
    warnings: [
      "Never submerge genuine leather or suede in water or run them through a washing machine.",
      "Keep wet shoes away from direct radiators, space heaters, or hair dryers, which cause rubber to warp and leather to crack.",
      "For genuine suede, use a dry suede eraser and dry brush only — water stains suede permanently."
    ]
  },
  {
    id: "wax-adhesive",
    keywords: ["wax", "candle", "candle wax", "crayon", "gum", "chewing gum", "sticker", "adhesive", "glue", "tape"],
    title: "Candle Wax, Crayon, or Gum on Surfaces",
    supplies: ["Ice cubes in a plastic zipper bag", "Plastic scraper or credit card", "Brown paper bag or unprinted paper towels", "Clothes iron", "Mild soapy water"],
    steps: [
      "Allow the wax or gum to harden completely. To accelerate, place an ice pack or ice in a zipper bag directly on the wax for 3 to 5 minutes.",
      "Carefully pop off brittle chunks using a plastic card or silicone spatula. Never use metal knives on wood or glass.",
      "Place a plain brown paper bag or 2 layers of white paper towels over any thin wax residue remaining on the table or fabric.",
      "Set a clothing iron to low heat with NO steam. Glide gently over the paper for 3 to 5 seconds to melt wax into the paper.",
      "Shift to a clean section of paper and repeat until no more oily marks appear.",
      "Wipe the area clean with a soft cloth lightly dampened with mild soapy water, then buff dry."
    ],
    warnings: [
      "Never let the heated iron soleplate directly touch wood, paint, varnish, or synthetic fabric — always keep paper in between.",
      "Keep electric irons away from water and cords out of reach of children.",
      "For delicate antique furniture, stop after the ice-and-plastic card step and consult a wood restoration specialist."
    ]
  },
  {
    id: "blood-protein",
    keywords: ["blood", "protein", "meat", "egg", "dairy", "sweat", "perspiration", "collar ring"],
    title: "Blood or Protein-Based Stain",
    supplies: ["Ice-cold water", "Mild liquid dish soap or saline solution", "Hydrogen peroxide 3% (light fabrics)", "Clean microfiber cloth"],
    steps: [
      "Rinse or soak IMMEDIATELY in ice-cold water. Cold water dissolves protein; hot water cooks protein into fibers permanently.",
      "Blot with a clean white cloth soaked in cold salt water (1 tablespoon salt per cup of cold water).",
      "Rub a small amount of mild liquid dish soap directly into the stain and let sit for 10 minutes in cold water.",
      "For white or colorfast cottons, dab a few drops of 3% hydrogen peroxide directly onto the stain and observe gentle bubbling.",
      "Rinse thoroughly with cold running water.",
      "Wash the item in a cold water wash cycle. Air-dry completely and check results before any heated drying."
    ],
    warnings: [
      "CRITICAL: NEVER use warm or hot water on blood, eggs, or dairy stains — heat permanently coagulates protein into the fabric.",
      "Do NOT use hydrogen peroxide on silk or wool (it weakens protein fibers).",
      "Wear gloves and practice hygiene when cleaning biological stains."
    ]
  }
];

const GENERAL_FALLBACK = {
  id: "general",
  title: "General Household Cleaning Protocol",
  supplies: ["Clean white microfiber towel", "Cool water", "Mild liquid dish soap", "Baking soda"],
  steps: [
    "Identify the surface material first (cotton, wood, leather, tile, stone, or synthetic fabric).",
    "Blot any excess liquid gently with a clean dry white cloth — never rub aggressively.",
    "Start with the gentlest possible cleaner: cool water with a single drop of mild dish soap.",
    "Apply cleaner to the cloth first (not directly to the surface), working from the outside edge toward the center.",
    "Rinse with a clean damp cloth to remove soap residue, then gently pat dry.",
    "Check results in natural lighting. Avoid heated drying until the spot is completely gone."
  ],
  warnings: [
    "Always perform a small spot-test in an inconspicuous area (e.g. inside hem, bottom edge) before applying any solution.",
    "Never mix household cleaning chemicals, especially chlorine bleach with ammonia or vinegar (creates toxic fumes).",
    "Keep all cleaning agents away from children and pets."
  ]
};

/**
 * Surface-specific cautions to append to any matching solution
 */
const MATERIAL_SAFETY_RULES = {
  marble: "⚠️ STONE SAFETY: Never use acidic cleaners (vinegar, lemon, descalers) on marble, granite, or limestone as acid causes permanent dull etching. Use only pH-neutral stone soap and water.",
  stone: "⚠️ STONE SAFETY: Never use acidic cleaners (vinegar, lemon, descalers) on marble, granite, or limestone as acid causes permanent dull etching. Use only pH-neutral stone soap and water.",
  wood: "⚠️ WOOD SAFETY: Never soak wood in water or use steel wool/sharp blades. Keep irons off bare wood. Avoid harsh alcohol cleaners which dissolve varnish.",
  leather: "⚠️ LEATHER & SUEDE SAFETY: Do not submerge in water. Never apply high heat. For genuine suede, use dry brushing and specialized suede cleaners only.",
  delicates: "⚠️ DELICATES (SILK & WOOL): Never use chlorine bleach or enzyme detergents on silk or wool (they eat animal fibers). Use cold water and gentle wool wash only.",
  silk: "⚠️ SILK SAFETY: Never use chlorine bleach, hot water, or aggressive scrubbing. Dry clean or spot-clean gently with cool water.",
  wool: "⚠️ WOOL SAFETY: Never use hot water, harsh agitators, or standard tumble dryers (causes permanent felting and shrinkage)."
};

/**
 * Match a solution by problem text and customize warnings for surface
 */
function findSolution(problemText, material = "") {
  const text = `${problemText} ${material}`.toLowerCase();
  const matLower = String(material || "").toLowerCase();

  let matchedSolution = null;

  for (const sol of SAMPLE_SOLUTIONS) {
    const hasMatch = sol.keywords.some((word) => text.includes(word));
    if (hasMatch) {
      matchedSolution = { ...sol, steps: [...sol.steps], warnings: [...sol.warnings] };
      break;
    }
  }

  if (!matchedSolution) {
    matchedSolution = { ...GENERAL_FALLBACK, steps: [...GENERAL_FALLBACK.steps], warnings: [...GENERAL_FALLBACK.warnings] };
  }

  // Inject surface-specific warnings if applicable
  for (const [matKey, ruleText] of Object.entries(MATERIAL_SAFETY_RULES)) {
    if (matLower.includes(matKey) || text.includes(matKey)) {
      if (!matchedSolution.warnings.includes(ruleText)) {
        matchedSolution.warnings.unshift(ruleText);
      }
      break;
    }
  }

  return matchedSolution;
}

export { findSolution, SAMPLE_SOLUTIONS, GENERAL_FALLBACK, MATERIAL_SAFETY_RULES };
export default { findSolution, SAMPLE_SOLUTIONS, GENERAL_FALLBACK, MATERIAL_SAFETY_RULES };
