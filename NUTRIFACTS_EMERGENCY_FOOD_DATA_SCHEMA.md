# NutriFacts Emergency Food Intelligence & Disaster Preparedness Data Schema

## 1. Executive Summary
This document specifies the technical data contracts, classification taxonomies, preparation types, storage environmental tolerances, and disaster scenario matrices implemented in NutriFacts for the 1,379 canonical foods.

- **Master Catalog Scope**: 1,379 unique food records (0 duplicates, 0 missing macronutrients).
- **Standards Basis**: World Health Organization (WHO Sphere 2023), FEMA (P-477 / ARC 4463), CDC Food Safety, ICMR-NIN (2024), and NDMA India.
- **Multilingual Support**: English, Tamil (`ta`), Scientific binomial nomenclature (`scientific_name`).

---

## 2. Preparation Classification Taxonomy (`EmergencyPreparationType`)

| Type Key | Description | Typical Canonical Food Examples |
|---|---|---|
| `READY_TO_EAT` | Eaten immediately without water or fuel | Almonds, Walnuts, Dates, Roasted Bengal Gram (`pottukadalai`), Jaggery, Peanuts, Biscuits |
| `READY_TO_EAT_AFTER_WASH` | Safe raw, requires potable wash | Fresh Apples, Bananas, Cucumbers, Oranges |
| `COLD_SOAKABLE` | Rehydrates in cold potable water (5-10m) | Flattened Rice (`aval / poha`), Puffed Rice (`pori`), Oats, Sattu Flour |
| `MINIMAL_BOIL` | Ready with < 5-7 mins boiling | Split Yellow Moong Dal, Quick Noodles, Parboiled rice |
| `FULL_COOK_REQUIRED` | Sustained cooking > 20 mins | Whole unpolished rice, raw chickpeas, whole wheat kernels |
| `REFRIGERATION_DEPENDENT` | Spoils within 2-4 hours at room temp | Fresh cow's milk, paneer, curd, fresh chicken, fish, mutton, eggs |
| `SHELF_STABLE_LONG_TERM` | Stable 12-36+ months dry airtight | Whole Millets (Ragi, Kodo, Foxtail), Whole Pulses, Ghee, Sugar, Iodized Salt |
| `UNSUITABLE_IN_CRISIS` | High toxicity or utility hazard | Raw shellfish during sewage inundation, frozen meats during grid blackout |

---

## 3. Water Accounting Model (`WaterRequirementLevel`)
- **WHO Drinking Water Standard**: 3.0 Liters / adult / day (temperate), scaled to 4.5 Liters in tropical heatwave.
- **Child Drinking Water**: 1.5 Liters / child / day.
- **Food Preparation Water**:
  - `NONE`: 0 ml / 100g
  - `LOW`: 50 - 120 ml / 100g (Cold-soaking Aval / Poha)
  - `MODERATE`: 200 - 250 ml / 100g (Moong dal)
  - `HIGH`: 350+ ml / 100g (Raw pulses / grains)
- **Sanitary Water Allocation**: 2.0 Liters / person / day.

---

## 4. Disaster Scenario Matrix (18 Scenarios)
1. `floods_water_contamination` (Hydrological)
2. `cyclones_hurricanes` (Meteorological)
3. `grid_blackout_power` (Infrastructure)
4. `earthquakes_structural` (Geophysical)
5. `tsunamis_coastal` (Oceanographic)
6. `drought_water_shortage` (Climatological)
7. `wildfires_evacuation` (Thermal)
8. `landslides_isolation` (Geophysical)
9. `extreme_heatwave` (Climatological)
10. `severe_cold_storm` (Meteorological)
11. `monsoon_heavy_rainfall` (Meteorological)
12. `drinking_water_cutoff` (Municipal Infrastructure)
13. `cooking_gas_fuel_shortage` (Supply & Fuel)
14. `supply_chain_disruption` (Logistical)
15. `food_shortage_inflation` (Economic & Food Security)
16. `evacuation_displacement` (Humanitarian)
17. `emergency_shelter` (Institutional)
18. `community_relief_camp` (Humanitarian Logistics)

---

## 5. Storage Vulnerabilities & Environmental Profile
- **Moisture Threshold**: Keep dry staples < 10% relative moisture to stop *Aspergillus flavus* aflatoxin contamination.
- **Thermal Rule**: Optimum 10° - 21°C. Shelf life halves for every 10°C increase above 21°C.
- **Oxygen Control**: 300cc - 500cc iron oxygen absorbers for Mylar sealed caches.
- **Packaging Hierarchy**:
  1. Metal Cans (100% hermetic, floodwater-sanitizable with 1 tbsp bleach/gallon).
  2. Mylar Bags with O2 Absorbers (Impervious to water vapor, vulnerable to rodents).
  3. Food-Grade HDPE Buckets (Rodent and impact shield).
  4. Paper / Cardboard (Zero protection; discard if touched by floodwater).
