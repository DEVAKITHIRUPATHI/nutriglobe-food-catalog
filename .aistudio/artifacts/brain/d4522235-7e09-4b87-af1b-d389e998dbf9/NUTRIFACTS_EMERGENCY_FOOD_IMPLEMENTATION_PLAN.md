# NUTRIFACTS — NATURAL DISASTER & EMERGENCY FOOD MANAGEMENT
## Architecture & Master Implementation Plan

**Project:** NutriFacts ([https://www.nutrifacts.fun/](https://www.nutrifacts.fun/))  
**Organization:** SDSV Trade Tech LLP  
**Baseline Catalog:** 1,379 canonical foods (100% unique IDs & slugs, 0 missing macros, 100% Tamil & scientific names)  
**Production Standards:** WHO, FAO, UNICEF, IFRC, FEMA, CDC, USDA, ICMR-NIN, FSSAI, NDMA India  

---

## 1. Executive Vision

Transform **NutriFacts** from a static food nutrition encyclopedia into an active, practical, evidence-based **Food Survival & Emergency Preparedness Platform**.

When severe disruptions occur—such as Tamil Nadu cyclones, coastal tsunamis, Chennai monsoonal floods, earthquakes, heatwaves, grid blackouts, or drinking water interruptions—households, disaster relief camps, and volunteer groups require immediate, life-critical answers:
- Which pantry foods are safe to eat without electricity, refrigeration, or cooking gas?
- Which foods require clean potable water versus those that can be rehydrated safely in cold water?
- How to ration existing food stocks for 72 hours, 7 days, 15 days, or 30 days while maintaining caloric and macronutrient adequacy?
- How to prevent deadly foodborne illnesses, spoilage, and floodwater contamination?

### Core Architectural Principle
The emergency module directly extends the **existing 1,379-food master catalog**. It introduces **zero duplicate databases** and **no duplicate food IDs**. Every emergency attribute attaches cleanly to the canonical food model and is verifiable against authoritative public-health and disaster-management guidelines.

---

## 2. Target Route Architecture & Navigation

The module will be accessible through dedicated routes, intuitive navigation in the top Navbar and Footer, and integrated tabs on every food detail page:

| Route | Title | Purpose & Scope |
| :--- | :--- | :--- |
| `/emergency-food` | **Emergency Food Hub** | Master dashboard, dual-mode toggle (Preparedness Mode vs. Crisis Mode), scenario cards, quick calculators. |
| `/emergency-food/scenarios` | **Disaster Scenarios Guide** | 18 scenario-specific food protocols (floods, cyclones, earthquakes, blackouts, fuel cuts). |
| `/emergency-food/planner` | **Household Food Planner** | 72-hr / 7-day / 15-day / 30-day survival ration calculator based on adults, children, seniors, water & fuel availability. |
| `/emergency-food/crisis-mode` | **Active Crisis Response** | Live disaster wizard for immediate no-power, no-water, no-gas decision making with strict food-safety warnings. |
| `/emergency-food/storage` | **Preservation & Storage** | Educational guides for solar drying, pickling, dehydration, airtight storage, FIFO/FEFO stock rotation. |
| `/emergency-food/water` | **Water & Food Preparation** | Potable drinking water vs. cooking water calculations, emergency purification, contamination avoidance. |
| `/emergency-food/inventory` | **Emergency Food Inventory** | Client-side IndexedDB stock tracker for household emergency rations with expiration alerts. |
| `/emergency-food/community-relief` | **Community Relief Tools** | Camp distribution calculator, bulk ration allocation, special diets (infants, elderly, diabetes). |
| `/food/:slug#emergency` | **Food Detail Integration** | Dedicated **Emergency & Disaster Preparedness** tab (`அவசரகால உணவு மற்றும் பேரிடர் தயார்நிலை`) on all food detail views. |

---

## 3. The 18 Emergency & Disaster Scenarios

Every scenario addresses: (1) food availability, (2) refrigeration loss, (3) potable water status, (4) fuel availability, (5) recommended shelf-stable foods, (6) hazardous foods to avoid, and (7) 72-hour vs 7/15/30-day action plans.

### Natural Disasters:
1. **Floods & Water Contamination** (e.g., Chennai / Northeast Monsoon floods, riverine flooding)
2. **Cyclones & Severe Hurricanes** (e.g., Bay of Bengal cyclones, high winds, downed power lines)
3. **Earthquakes & Structural Collapses** (gas line ruptures, water pipe breaks, rubble hazards)
4. **Tsunamis & Coastal Evacuations** (saltwater inundation, rapid displacement, destroyed kitchens)
5. **Drought & Extreme Water Scarcity** (limited cooking water, emphasis on low-water preparation foods)
6. **Wildfires & Sudden Evacuations** (smoke contamination, grab-and-go non-perishable rations)
7. **Landslides & Mountain Cutoffs** (isolated villages, multi-week supply disruption)
8. **Extreme Heatwaves (45°C+)** (rapid spoilage of perishables, critical hydration and electrolyte management)
9. **Severe Cold & Winter Storms** (freezing risks, high caloric energy density requirements)
10. **Prolonged Heavy Rainfall & Infrastructure Disruption** (damp storage, fungal/mold risks in grains)

### Infrastructure & Humanitarian Emergencies:
11. **Grid Blackouts & Total Electricity Failure** (first 4 hours in fridge, 48 hours in freezer, transitions to dry goods)
12. **Drinking-Water Supply Interruption** (safe storage, non-thirst-inducing foods, strict hydration rationing)
13. **LPG Cooking Gas & Fuel Shortages** (no-cook / ready-to-eat foods, cold soaking techniques)
14. **Transportation & Market Supply Disruptions** (local staple substitution, rationing stored grains and pulses)
15. **Food Inflation & Scarcity** (high-nutrition-per-rupee staples: millets, lentils, peanuts)
16. **Temporary Displacement & Relief Camps** (compact high-energy emergency packs, hygiene protocols)
17. **Long-Term Emergency Shelter Conditions** (micronutrient preservation, scurvy/beriberi prevention)
18. **Community Relief Kitchens** (mass batch cooking safety, allergen management, balanced distribution)

---

## 4. Food Emergency Suitability Engine (`emergencyFoodIntelligenceEngine.ts`)

Connects directly to the existing 1,379-food catalog (`@shared/mockData`, `@shared/schema`, `@shared/authoritativeNutritionDatabase`).

### A. Evaluated Food Characteristics:
- **Preparation & Cooking Classifications:**
  - `READY_TO_EAT`: Edible immediately without heating or water (e.g., roasted peanuts, dates, bananas, dry fruit, biscuits).
  - `COLD_SOAKABLE`: Edible after cold-water soaking without heat (e.g., flattened rice / aval / poha, oats, sattu).
  - `MINIMAL_BOIL`: Requires <5 minutes boiling (e.g., quick-cooking noodles, couscous, parboiled split lentils).
  - `FULL_COOK_REQUIRED`: Requires extended boiling/simmering >20 mins (e.g., raw whole chickpeas, raw whole rice, tubers).
  - `REFRIGERATION_DEPENDENT`: Spoils within 2–4 hours without power (e.g., fresh dairy, raw fish, fresh meat).
  - `PERISHABLE_PRODUCE`: Spoils within 2–5 days at room temperature (e.g., leafy greens, soft berries).
  - `SHELF_STABLE_LONG_TERM`: Stable 6–24+ months when dry and sealed (e.g., millets, whole lentils, jaggery, honey, ghee).

- **Water & Fuel Constraints:**
  - `Water Requirement`: `NONE`, `LOW (<100ml)`, `MODERATE (100-300ml)`, `HIGH (>500ml)`.
  - `Potable Water Sensitive`: Does the food absorb water directly (e.g., puffed rice, dried fruits)?
  - `Fuel Requirement`: `NONE`, `MINIMAL (<5 mins)`, `STANDARD (15-30 mins)`.

- **Storage & Environmental Tolerance:**
  - Moisture Sensitivity: Vulnerability to mold in 80%+ humidity.
  - Rodent / Pest Resistance: Packaging requirements (mylar bags, food-grade HDPE drums vs paper boxes).
  - Shelf-life Estimates: Ambient (unopened), opened, and crisis conditions.

- **Nutritional Role in Emergencies:**
  - High Caloric Density (>350 kcal/100g).
  - High Shelf-Stable Protein (>15g/100g).
  - Thirst-Induction Risk (very salty or high-sodium foods to avoid when water is scarce).
  - Complementary Pairings (e.g., Rice + Moong Dal, Millet + Roasted Bengal Gram).

---

## 5. Household Emergency Food Planner (`/emergency-food/planner`)

### Input Parameters:
- Household members: Adults, Children (1–10 yrs), Infants, Elderly, Pregnant / Lactating mothers.
- Preparedness Duration: 72 Hours (3 days), 7 Days, 15 Days, 30 Days.
- Infrastructure constraints:
  - Cooking fuel available? (Yes / Limited / No cooking possible)
  - Clean water status: (Full municipal / Stored reserve only / Severe shortage)
  - Refrigeration: (Active / Blackout)
- Dietary preferences & allergies: (Vegetarian, Vegan, Gluten-free, Peanut allergy).

### Output Deliverables:
- **Daily Nutritional Targets:** Household aggregate calories, protein, and dietary fiber.
- **Water Allocation Matrix:**
  - Drinking water: 3 liters/adult/day (WHO standard).
  - Food preparation water: 1–2 liters/person/day depending on food choice.
  - Hygiene / sanitation reserve: 2–4 liters/person/day.
- **Ration Checklist & Shopping Basket:** Quantities in kilograms/liters mapped to 1,379 catalog foods.
- **Meal Schedule:** Breakfast, lunch, dinner, and emergency snacks with zero-fuel options.
- **Export & Print:** Print-ready PDF/HTML emergency plan and CSV export.

---

## 6. Crisis Mode (`/emergency-food/crisis-mode`)

An immediate, high-contrast, distraction-free decision support system when disasters strike:
- **Step 1:** Select active disaster condition (e.g., "Power Out for 18 Hours", "Floodwater Outside", "Tap Water Brown/Contaminated").
- **Step 2:** Immediate Safety Directives:
  - *Refrigerator Rule:* Keep door closed. Discard milk, poultry, soft cheeses after 4 hours above 4°C.
  - *Floodwater Rule:* Discard any food contacted by floodwater unless commercially hermetically sealed in metal cans (sanitize outer can with bleach solution). Never consume screw-cap jars or cardboard cartons exposed to floodwaters.
  - *Water Alert:* Do not use suspected floodwater or groundwater for infant formula or baby food.
- **Step 3:** What to eat right now from available pantry inventory with zero cooking.

---

## 7. Food Detail Page Integration (`FoodDetailPage.tsx` & `FoodKnowledgeHub.tsx`)

Every food record (e.g., `banana`, `tender-coconut`, `millet`, `paneer`, `almonds`) will display an **Emergency & Disaster Preparedness** tab:
- **Preparedness Badge:** `Ready-to-Eat (No Fuel)` | `Shelf-Stable Dry Staple` | `Refrigeration Dependent` | `Perishable`.
- **Water Needed for 100g:** Minimal/None vs High.
- **Cooking Fuel:** None vs Boiling Required.
- **Disaster Suitability Matrix:** Cyclones, Floods, Blackouts, Drought.
- **Emergency Storage Recommendation:** Hermetic seal, moisture absorbers, pantry life.
- **Tamil Localized Section:** `அவசரகால உணவு மற்றும் பேரிடர் தயார்நிலை`.

---

## 8. Implementation Phases & Milestones

| Phase | Milestone | Deliverable |
| :---: | :--- | :--- |
| **1** | **Foundation & Schema** | Create `shared/emergencyFoodSchema.ts`, `server/emergencyFoodIntelligenceEngine.ts`, and `shared/emergencyEvidenceRegistry.ts`. Pilot with 50 diverse foundational foods. Unit tests in `tests/emergency-food-engine.test.ts`. |
| **2** | **Disaster Scenarios & Storage** | Build `client/src/pages/emergency-food/index.tsx`, `scenarios.tsx`, `storage.tsx`, and `water.tsx`. Detail the 18 disaster scenarios and water calculation formulas. |
| **3** | **Planner & Inventory** | Build `client/src/pages/emergency-food/planner.tsx` and `inventory.tsx` (with IndexedDB offline storage). |
| **4** | **Crisis Mode & Food Detail Integration** | Build `/emergency-food/crisis-mode` wizard and integrate the Emergency Preparedness tab into `FoodKnowledgeHub.tsx`. |
| **5** | **Tamil Localization & Navigation** | Add Navbar and Footer links, complete Tamil translations, and ensure 100% offline PWA caching. |
| **6** | **Production Verification & Audit** | Run full 170+ test suite, TypeScript checks, and production builds. Generate the 8 markdown/CSV deliverables. |

---

## 9. Verification & Quality Gates
- Preserve the existing 1,379 food records and 1,395 sitemap URLs.
- Maintain existing 170 passing tests without regressions.
- No fabricated medical or shelf-life claims; all rules anchored in WHO, FEMA, CDC, FSSAI, and NDMA guidelines.
- Zero TypeScript compiler errors.
