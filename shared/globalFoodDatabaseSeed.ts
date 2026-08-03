import { FoodItemClient } from './schema';

export const globalFoodDatabaseSeed: FoodItemClient[] = [
  // ==========================================
  // 1. COCONUT FAMILY (Cocos nucifera & derived)
  // ==========================================
  {
    id: 'tender_coconut_ilaneer',
    name: {
      en: 'Tender Coconut (Ilaneer)',
      ta: 'இளநீர் (Tender Coconut)',
      hi: 'नारियल पानी'
    },
    description: {
      en: 'Fresh young coconut harvested at 6–7 months, containing sterile electrolyte-rich water and soft delicate jelly meat.'
    },
    origin: 'India (Tamil Nadu & Kerala)',
    price: 0.80,
    image: 'https://images.unsplash.com/photo-1543362906-acfc16c67564?auto=format&fit=crop&q=80&w=800',
    category: ['fruits', 'tropical', 'beverages', 'indian'],
    allergens: ['Tree Nut (Low Risk)'],
    isPopular: true,
    nutrition: {
      calories: 19,
      protein: 0.7,
      carbs: 3.7,
      fat: 0.2,
      fiber: 1.1,
      vitamins: { 'Vitamin C': '2.4mg', 'B-Complex': '0.1mg' },
      minerals: { 'Potassium': '250mg', 'Sodium': '105mg', 'Magnesium': '25mg', 'Calcium': '24mg' },
      glycemicIndex: 3,
      glycemicLoad: 1,
      waterContentPercent: 95
    },
    digestionTimeHours: '20–30 mins',
    bestTimeToEat: 'Early Morning / Empty Stomach',
    idealGapHours: 1,
    digestibilityNotes: 'Extremely easy to digest; rapidly restores serum electrolytes without causing gastric distress.',
    doNotEatWith: [
      {
        itemOrCategory: 'Heavy Processed Meats',
        reason: 'Consuming high sodium heavy meats immediately with electrolyte water reduces hydration efficiency.',
        evidenceLevel: 'traditional'
      }
    ],
    cautionConditions: [
      {
        condition: 'End-Stage Renal Disease (ESRD)',
        reason: 'High natural potassium content requires caution in severe hyperkalemia management.',
        severity: 'moderate'
      }
    ],
    bestSeason: 'Summer',
    organBenefits: [
      {
        organ: 'kidney',
        benefit: 'Prevents renal crystal aggregation and lowers urine acidity.',
        supportingNutrient: 'Potassium & Water Content',
        evidenceLevel: 'established'
      },
      {
        organ: 'heart',
        benefit: 'Balances vascular fluid pressure and supports myocardial contraction.',
        supportingNutrient: 'Electrolytic Potassium & Magnesium',
        evidenceLevel: 'established'
      }
    ],
    medicalSuitability: {
      suitableFor: ['Hypertension', 'Dehydration & Heatstroke', 'Kidney Stone Prevention', 'Post-Workout Recovery'],
      cautionFor: ['Severe Chronic Kidney Disease Stage 4/5'],
      disclaimer: 'General dietary guidance. Consult a nephrologist for severe renal potassium restriction.'
    },
    plantProfile: {
      plantType: 'Perennial Palm (Cocos nucifera)',
      climateZone: 'Humid Tropical Coastal',
      idealSoilType: 'Coastal Sandy Loam',
      propagationMethod: 'Seed Nut Planting',
      harvestSeason: 'Year-Round (Peak: March to July)',
      waterRequirement: 'high',
      growingRegions: ['Tamil Nadu', 'Kerala', 'Karnataka', 'Andhra Pradesh', 'Sri Lanka']
    },
    imageConfidence: 99,
    verifiedStatus: 'admin_verified'
  },
  {
    id: 'coconut_meat_malai',
    name: {
      en: 'Tender Coconut Meat (Malai)',
      ta: 'தேங்காய் வழுக்கை (Malai)',
      hi: 'नारियल की मलाई'
    },
    description: {
      en: 'Soft, gelatinous inner layer formed inside young green coconuts, rich in medium-chain triglycerides (MCTs).'
    },
    origin: 'India (Tamil Nadu / Kerala)',
    price: 0.90,
    image: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&q=80&w=800',
    category: ['fruits', 'tropical', 'indian'],
    allergens: ['Tree Nut'],
    isPopular: true,
    nutrition: {
      calories: 140,
      protein: 1.5,
      carbs: 6.8,
      fat: 10.5,
      fiber: 2.8,
      vitamins: { 'Vitamin C': '1.5mg', 'Vitamin E': '0.4mg' },
      minerals: { 'Magnesium': '32mg', 'Potassium': '210mg', 'Manganese': '0.8mg' },
      glycemicIndex: 35,
      glycemicLoad: 2,
      waterContentPercent: 80
    },
    digestionTimeHours: '1.5–2 hours',
    bestTimeToEat: 'Morning / Afternoon',
    idealGapHours: 2,
    digestibilityNotes: 'Easily emulsified fats due to high presence of lauric acid and medium-chain fatty acids.',
    doNotEatWith: [],
    cautionConditions: [],
    bestSeason: 'Summer',
    organBenefits: [
      {
        organ: 'gut',
        benefit: 'Lauric acid exerts antimicrobial protective action against pathogenic gut flora.',
        supportingNutrient: 'Monolaurin & MCTs',
        evidenceLevel: 'established'
      },
      {
        organ: 'brain',
        benefit: 'MCTs supply ketone precursors for neuronal energy support.',
        supportingNutrient: 'Lauric Acid (C12)',
        evidenceLevel: 'emerging'
      }
    ],
    medicalSuitability: {
      suitableFor: ['Keto Diet', 'Gut Barrier Support', 'Energy Refueling'],
      cautionFor: ['Strict Calorie-Restricted Diets'],
      disclaimer: 'General nutrition guidance only.'
    },
    plantProfile: {
      plantType: 'Perennial Palm Tree',
      climateZone: 'Tropical Coastal',
      idealSoilType: 'Sandy Loam Soil',
      propagationMethod: 'Seed Nut Sapling',
      harvestSeason: 'All Season',
      waterRequirement: 'high',
      growingRegions: ['India', 'Indonesia', 'Philippines']
    },
    imageConfidence: 98,
    verifiedStatus: 'admin_verified'
  },
  {
    id: 'coconut_sprout_thengam_poo',
    name: {
      en: 'Sprouted Coconut (Thengam Poo)',
      ta: 'தேங்காய்ப் பூ (Thengam Poo)',
      hi: 'नारियल का अंकुर'
    },
    description: {
      en: 'The soft, spongy, sweet cotyledon that grows inside a germinated mature coconut, celebrated in traditional South Indian nutrition.'
    },
    origin: 'India (Tamil Nadu & Kerala)',
    price: 1.50,
    image: 'https://images.unsplash.com/photo-1543362906-acfc16c67564?auto=format&fit=crop&q=80&w=800',
    category: ['fruits', 'tropical', 'indian', 'vegan'],
    allergens: ['Tree Nut'],
    isPopular: true,
    nutrition: {
      calories: 110,
      protein: 2.2,
      carbs: 12.4,
      fat: 6.2,
      fiber: 4.5,
      vitamins: { 'Vitamin C': '8mg', 'B-Complex': '0.3mg' },
      minerals: { 'Zinc': '1.2mg', 'Phosphorus': '95mg', 'Magnesium': '40mg' },
      glycemicIndex: 28,
      glycemicLoad: 3,
      waterContentPercent: 75
    },
    digestionTimeHours: '1–1.5 hours',
    bestTimeToEat: 'Morning Empty Stomach',
    idealGapHours: 2,
    digestibilityNotes: 'High concentration of active digestive enzymes synthesized during seed germination.',
    doNotEatWith: [],
    cautionConditions: [],
    bestSeason: 'Monsoon / Winter',
    organBenefits: [
      {
        organ: 'immune_system',
        benefit: 'Rich in bioactive antioxidants synthesized during cotyledon formation.',
        supportingNutrient: 'Zinc & Germination Polyphenols',
        evidenceLevel: 'traditional'
      },
      {
        organ: 'gut',
        benefit: 'Soluble dietary fibers aid smooth peristalsis.',
        supportingNutrient: 'Enzymatic Dietary Fiber',
        evidenceLevel: 'established'
      }
    ],
    medicalSuitability: {
      suitableFor: ['Immune Support', 'Digestive Rejuvenation', 'Plant-Based Snack'],
      cautionFor: [],
      disclaimer: 'Traditional functional food.'
    },
    plantProfile: {
      plantType: 'Germinated Palm Seed',
      climateZone: 'Tropical',
      idealSoilType: 'Humid Organic Compost',
      propagationMethod: 'Seed Germination',
      harvestSeason: 'Monsoon / Post-Harvest',
      waterRequirement: 'moderate',
      growingRegions: ['Tamil Nadu', 'Kerala']
    },
    imageConfidence: 96,
    verifiedStatus: 'admin_verified'
  },

  // ==========================================
  // 2. PALMYRA FAMILY (Borassus flabellifer)
  // ==========================================
  {
    id: 'palmyra_nungu_ice_apple',
    name: {
      en: 'Nungu / Ice Apple (Palmyra Fruit)',
      ta: 'நுங்கு (Nungu / Ice Apple)',
      hi: 'ताड़गोला (Tadgola)'
    },
    description: {
      en: 'Translucent, cool, jelly-like seeds of the Palmyra palm fruit. Known for supreme natural cooling properties during peak summer.'
    },
    origin: 'India (Tamil Nadu / Andhra Pradesh)',
    price: 0.60,
    image: 'https://images.unsplash.com/photo-1618160702438-9b02ab6515c9?auto=format&fit=crop&q=80&w=800',
    category: ['fruits', 'tropical', 'indian', 'vegan'],
    allergens: ['None Known'],
    isPopular: true,
    nutrition: {
      calories: 43,
      protein: 0.8,
      carbs: 11.0,
      fat: 0.1,
      fiber: 1.0,
      vitamins: { 'Vitamin C': '5mg', 'Vitamin A': '120IU', 'Vitamin B7': '0.02mg' },
      minerals: { 'Calcium': '27mg', 'Phosphorus': '30mg', 'Iron': '1.0mg', 'Potassium': '140mg' },
      glycemicIndex: 30,
      glycemicLoad: 3,
      waterContentPercent: 88
    },
    digestionTimeHours: '30–45 mins',
    bestTimeToEat: 'Mid-Morning / Hot Afternoon',
    idealGapHours: 1,
    digestibilityNotes: 'Provides immediate cooling relief for thermal body heat and gastric inflammation.',
    doNotEatWith: [
      {
        itemOrCategory: 'Chilled Milk',
        reason: 'Combining extremely cold raw nungu with cold heavy milk can trigger digestive sluggishness in sensitive constitutions.',
        evidenceLevel: 'traditional'
      }
    ],
    cautionConditions: [
      {
        condition: 'Overconsumption',
        reason: 'Eating unpeeled fibrous outer husk in excessive quantities may cause mild abdominal tightness.',
        severity: 'mild'
      }
    ],
    bestSeason: 'Summer',
    organBenefits: [
      {
        organ: 'skin',
        benefit: 'Reduces heat rashes, prickly heat, and summer cutaneous dehydration.',
        supportingNutrient: 'Bio-hydration Complex & Calcium',
        evidenceLevel: 'traditional'
      },
      {
        organ: 'gut',
        benefit: 'Soothes peptic ulcers and hyperacidity by forming a protective mucilaginous layer.',
        supportingNutrient: 'Plant Mucilage & Minerals',
        evidenceLevel: 'established'
      }
    ],
    medicalSuitability: {
      suitableFor: ['Heatstroke & Prickly Heat', 'Acidity & Reflux', 'Hydration in Summer'],
      cautionFor: [],
      disclaimer: 'Natural seasonal cooling fruit.'
    },
    plantProfile: {
      plantType: 'Borassus flabellifer Palm Tree',
      climateZone: 'Semi-Arid & Tropical Plains',
      idealSoilType: 'Deep Sandy Soil',
      propagationMethod: 'Natural Seed Dispersal / Sapling',
      harvestSeason: 'Summer (April to July)',
      waterRequirement: 'low',
      growingRegions: ['Tamil Nadu', 'Andhra Pradesh', 'Telangana', 'West Bengal', 'Sri Lanka']
    },
    imageConfidence: 98,
    verifiedStatus: 'admin_verified'
  },
  {
    id: 'palmyra_sprout_panai_kizhangu',
    name: {
      en: 'Palmyra Sprout (Panai Kizhangu)',
      ta: 'பனங்கிழங்கு (Panai Kizhangu)',
      hi: 'ताड़ की जड़'
    },
    description: {
      en: 'Nutritious fibrous root sprout obtained by germinating Palmyra palm seeds underground. Boiled with turmeric and salt as a traditional South Indian superfood.'
    },
    origin: 'India (Tamil Nadu)',
    price: 1.20,
    image: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&q=80&w=800',
    category: ['vegetables', 'root', 'indian', 'vegan'],
    allergens: ['None Known'],
    isPopular: true,
    nutrition: {
      calories: 125,
      protein: 2.8,
      carbs: 26.5,
      fat: 0.4,
      fiber: 7.2,
      vitamins: { 'B-Complex': '0.4mg', 'Vitamin C': '3mg' },
      minerals: { 'Iron': '2.8mg', 'Calcium': '45mg', 'Magnesium': '38mg' },
      glycemicIndex: 42,
      glycemicLoad: 8,
      waterContentPercent: 65
    },
    digestionTimeHours: '2–3 hours',
    bestTimeToEat: 'Evening / Snack',
    idealGapHours: 2.5,
    digestibilityNotes: 'High insolube fiber requires thorough chewing and boiling prior to consumption.',
    doNotEatWith: [],
    cautionConditions: [
      {
        condition: 'Acute IBS / Loose Motion',
        reason: 'Very dense crude fiber content may accelerate intestinal transit excessively.',
        severity: 'mild'
      }
    ],
    bestSeason: 'Winter / Post-Monsoon',
    organBenefits: [
      {
        organ: 'gut',
        benefit: 'Clears residual intestinal sludge and regulates bowel motility.',
        supportingNutrient: 'Insoluble Fiber & Resistant Starch',
        evidenceLevel: 'established'
      },
      {
        organ: 'bones',
        benefit: 'Provides structural minerals needed for skeletal density.',
        supportingNutrient: 'Calcium & Magnesium',
        evidenceLevel: 'established'
      }
    ],
    medicalSuitability: {
      suitableFor: ['Constipation Relief', 'Diabetic-Friendly Fiber', 'Satiety & Weight Control'],
      cautionFor: ['Severe Gastroparesis'],
      disclaimer: 'Traditional boiled root vegetable.'
    },
    plantProfile: {
      plantType: 'Underground Palm Root Sprout',
      climateZone: 'Tropical Coastal',
      idealSoilType: 'Loose Sandy Soil',
      propagationMethod: 'Seed Burial Germination',
      harvestSeason: 'Winter (November to February)',
      waterRequirement: 'low',
      growingRegions: ['Tamil Nadu (Southern districts)', 'Sri Lanka']
    },
    imageConfidence: 97,
    verifiedStatus: 'admin_verified'
  },
  {
    id: 'palmyra_jaggery_karupatti',
    name: {
      en: 'Palmyra Jaggery (Karupatti)',
      ta: 'கருப்பட்டி (Palm Jaggery)',
      hi: 'पाम गुड़'
    },
    description: {
      en: 'Unrefined traditional natural sweetener boiled from raw Palmyra tree sap (Pathaneer). Rich in organic iron and mineral salts.'
    },
    origin: 'India (Tamil Nadu)',
    price: 2.50,
    image: 'https://images.unsplash.com/photo-1608039829572-78524f79c4c7?auto=format&fit=crop&q=80&w=800',
    category: ['sweeteners', 'indian', 'vegan'],
    allergens: ['None Known'],
    isPopular: true,
    nutrition: {
      calories: 380,
      protein: 0.4,
      carbs: 95.0,
      fat: 0.1,
      fiber: 0.2,
      vitamins: { 'B12 (Trace)': '0.01mcg', 'B6': '0.1mg' },
      minerals: { 'Iron': '11.0mg', 'Calcium': '80mg', 'Potassium': '1050mg', 'Magnesium': '70mg' },
      glycemicIndex: 35,
      glycemicLoad: 12,
      waterContentPercent: 4
    },
    digestionTimeHours: '1 hour',
    bestTimeToEat: 'Post-Meal / Afternoon Tea',
    idealGapHours: 1,
    digestibilityNotes: 'Low glycemic impact compared to refined white sugar; stimulates natural gastric digestive juices.',
    doNotEatWith: [],
    cautionConditions: [
      {
        condition: 'Uncontrolled Diabetes Mellitus',
        reason: 'Contains natural sucrose and fructose; monitor carbohydrate allowance carefully.',
        severity: 'moderate'
      }
    ],
    bestSeason: 'All Season',
    organBenefits: [
      {
        organ: 'liver',
        benefit: 'Assists natural hepatic cleansing by flushing metabolic waste products.',
        supportingNutrient: 'Potassium & Organic Iron Complex',
        evidenceLevel: 'traditional'
      }
    ],
    medicalSuitability: {
      suitableFor: ['Anemia Management', 'Refined Sugar Substitute', 'Postpartum Recuperation'],
      cautionFor: ['Strict Low-Carb Diabetes Diets'],
      disclaimer: 'Unrefined natural sugar replacement.'
    },
    plantProfile: {
      plantType: 'Palm Sap Concentrate',
      climateZone: 'Tropical Dry',
      idealSoilType: 'N/A',
      propagationMethod: 'Tapped Inflorescence Sap',
      harvestSeason: 'Spring - Summer',
      waterRequirement: 'low',
      growingRegions: ['Tamil Nadu (Tirunelveli, Tuticorin)']
    },
    imageConfidence: 99,
    verifiedStatus: 'admin_verified'
  },

  // ==========================================
  // 3. DRAGON FRUIT FAMILY (Pitahaya / Hylocereus)
  // ==========================================
  {
    id: 'dragon_fruit_red_fleshed',
    name: {
      en: 'Red Dragon Fruit (Pitaya Roja)',
      ta: 'சிவப்பு டிராகன் பழம்',
      hi: 'लाल ड्रैगन फ्रूट'
    },
    description: {
      en: 'Vibrant magenta-fleshed tropical cactus fruit loaded with betacyanins, dietary fiber, and crunchy tiny digestible black seeds.'
    },
    origin: 'Vietnam / Central America / India',
    price: 1.80,
    image: 'https://images.unsplash.com/photo-1527325678964-54921661f888?auto=format&fit=crop&q=80&w=800',
    category: ['fruits', 'tropical', 'vegan'],
    allergens: ['None Known'],
    isPopular: true,
    nutrition: {
      calories: 60,
      protein: 1.2,
      carbs: 13.0,
      fat: 0.6,
      fiber: 2.9,
      vitamins: { 'Vitamin C': '9.0mg', 'Vitamin E': '0.3mg', 'B2': '0.04mg' },
      minerals: { 'Magnesium': '40mg', 'Iron': '1.9mg', 'Calcium': '9mg' },
      glycemicIndex: 48,
      glycemicLoad: 4,
      waterContentPercent: 87
    },
    digestionTimeHours: '40–60 mins',
    bestTimeToEat: 'Morning Breakfast / Snack',
    idealGapHours: 1.5,
    digestibilityNotes: 'Gentle on stomach; small seeds stimulate smooth bowel elimination.',
    doNotEatWith: [],
    cautionConditions: [],
    bestSeason: 'Monsoon / Autumn',
    organBenefits: [
      {
        organ: 'heart',
        benefit: 'Betacyanin antioxidants neutralize vascular oxidation.',
        supportingNutrient: 'Betalains & Polyunsaturated Seed Fatty Acids',
        evidenceLevel: 'established'
      },
      {
        organ: 'gut',
        benefit: 'Prebiotic oligosaccharides nourish Bifidobacteria colonies.',
        supportingNutrient: 'Soluble Oligosaccharides',
        evidenceLevel: 'established'
      }
    ],
    medicalSuitability: {
      suitableFor: ['Diabetic Weight Maintenance', 'Cardiovascular Support', 'Gut Microbiome Diversity'],
      cautionFor: [],
      disclaimer: 'Clinical nutrition reference.'
    },
    plantProfile: {
      plantType: 'Climbing Cactaceous Vine (Hylocereus costaricensis)',
      climateZone: 'Tropical Dry / Subtropical',
      idealSoilType: 'Well-Drained Sandy Loam with Organic Matter',
      propagationMethod: 'Stem Cuttings',
      harvestSeason: 'June to November',
      waterRequirement: 'low',
      growingRegions: ['Vietnam', 'Thailand', 'India (Maharashtra, Gujarat, Tamil Nadu)', 'Mexico']
    },
    imageConfidence: 98,
    verifiedStatus: 'admin_verified'
  },
  {
    id: 'dragon_fruit_yellow',
    name: {
      en: 'Yellow Dragon Fruit (Pitahaya Amarilla)',
      ta: 'மஞ்சள் டிராகன் பழம்',
      hi: 'पीला ड्रैगन फ्रूट'
    },
    description: {
      en: 'Sweetest variety of pitahaya featuring yellow knobby skin and translucent white pulp. Renowned for natural digestive laxative qualities.'
    },
    origin: 'Ecuador / Colombia / Vietnam',
    price: 2.20,
    image: 'https://images.unsplash.com/photo-1527325678964-54921661f888?auto=format&fit=crop&q=80&w=800',
    category: ['fruits', 'tropical', 'vegan'],
    allergens: ['None Known'],
    isPopular: false,
    nutrition: {
      calories: 68,
      protein: 1.4,
      carbs: 15.2,
      fat: 0.4,
      fiber: 3.5,
      vitamins: { 'Vitamin C': '12.0mg', 'Vitamin A': '80IU' },
      minerals: { 'Phosphorus': '36mg', 'Calcium': '10mg', 'Iron': '1.2mg' },
      glycemicIndex: 50,
      glycemicLoad: 5,
      waterContentPercent: 85
    },
    digestionTimeHours: '30–45 mins',
    bestTimeToEat: 'Morning',
    idealGapHours: 1,
    digestibilityNotes: 'Higher natural soluble sugar and fiber count acts as a gentle natural laxative.',
    doNotEatWith: [],
    cautionConditions: [
      {
        condition: 'Diarrhea / Loose Bowels',
        reason: 'Laxative effect may worsen active loose stool frequency.',
        severity: 'moderate'
      }
    ],
    bestSeason: 'Autumn / Winter',
    organBenefits: [
      {
        organ: 'gut',
        benefit: 'Naturally relieves stubborn chronic constipation.',
        supportingNutrient: 'Mucilaginous Fiber & Prebiotic Solubles',
        evidenceLevel: 'established'
      }
    ],
    medicalSuitability: {
      suitableFor: ['Constipation Relief', 'Digestive Regularity'],
      cautionFor: ['Acute Gastroenteritis'],
      disclaimer: 'General food guidance.'
    },
    plantProfile: {
      plantType: 'Cactus Vine (Selenicereus megalanthus)',
      climateZone: 'Subtropical',
      idealSoilType: 'Sandy Volcanic Loam',
      propagationMethod: 'Stem Cutting',
      harvestSeason: 'Winter',
      waterRequirement: 'low',
      growingRegions: ['Ecuador', 'Colombia', 'Israel', 'Vietnam']
    },
    imageConfidence: 96,
    verifiedStatus: 'admin_verified'
  },

  // ==========================================
  // 4. TRADITIONAL MEDICINAL LEAFY GREENS (Keerai)
  // ==========================================
  {
    id: 'moringa_leaves_murungai_keerai',
    name: {
      en: 'Moringa Leaves (Murungai Keerai)',
      ta: 'முருங்கைக்கீரை (Murungai Keerai)',
      hi: 'सहजन की पत्तियां'
    },
    description: {
      en: 'Nutritional power-house leaves of the Moringa oleifera tree. Packed with plant iron, calcium, amino acids, and anti-inflammatory quercetin.'
    },
    origin: 'India (Tamil Nadu)',
    price: 0.50,
    image: 'https://images.unsplash.com/photo-1576045057995-568f588f82fb?auto=format&fit=crop&q=80&w=800',
    category: ['vegetables', 'leafy_greens', 'indian', 'vegan'],
    allergens: ['None Known'],
    isPopular: true,
    nutrition: {
      calories: 64,
      protein: 9.4,
      carbs: 8.2,
      fat: 1.4,
      fiber: 2.0,
      vitamins: { 'Vitamin A': '756mcg', 'Vitamin C': '51.7mg', 'B6': '1.2mg' },
      minerals: { 'Calcium': '185mg', 'Iron': '4.0mg', 'Magnesium': '147mg', 'Potassium': '337mg' },
      glycemicIndex: 15,
      glycemicLoad: 1,
      waterContentPercent: 78
    },
    digestionTimeHours: '1.5–2 hours',
    bestTimeToEat: 'Lunch / Afternoon',
    idealGapHours: 2,
    digestibilityNotes: 'Must be cooked with a small drop of ghee or oil to optimize fat-soluble Vitamin A absorption.',
    doNotEatWith: [],
    cautionConditions: [
      {
        condition: 'Night Consumption',
        reason: 'Traditional Ayurvedic practice discourages eating dense greens like moringa late at night due to slow nocturnal peristalsis.',
        severity: 'mild'
      }
    ],
    bestSeason: 'All Season',
    organBenefits: [
      {
        organ: 'eyes',
        benefit: 'High Beta-Carotene prevents night blindness and corneal xerophthalmia.',
        supportingNutrient: 'Vitamin A (756mcg)',
        evidenceLevel: 'established'
      },
      {
        organ: 'bones',
        benefit: 'Bioavailable non-dairy calcium fortifies skeletal bone matrix.',
        supportingNutrient: 'Calcium & Magnesium',
        evidenceLevel: 'established'
      }
    ],
    medicalSuitability: {
      suitableFor: ['Anemia Prevention', 'Osteoporosis Protection', 'Lactation Enhancement', 'Blood Sugar Control'],
      cautionFor: [],
      disclaimer: 'Clinical nutrient benchmark.'
    },
    plantProfile: {
      plantType: 'Deciduous Tree (Moringa oleifera)',
      climateZone: 'Arid / Semi-Arid Tropical',
      idealSoilType: 'Sandy Loam',
      propagationMethod: 'Seeds / Branch Cuttings',
      harvestSeason: 'Year-Round',
      waterRequirement: 'low',
      growingRegions: ['Tamil Nadu', 'Andhra Pradesh', 'Karnataka', 'Haiti', 'Nigeria']
    },
    imageConfidence: 99,
    verifiedStatus: 'admin_verified'
  },
  {
    id: 'manathakkali_keerai',
    name: {
      en: 'Black Nightshade Leaves (Manathakkali Keerai)',
      ta: 'மணத்தக்காளி கீரை (Manathakkali)',
      hi: 'मकोय (Makoy)'
    },
    description: {
      en: 'Medicinal herb used extensively in Tamil Siddha medicine for rapid healing of mouth ulcers, stomach gastritis, and acidity.'
    },
    origin: 'India (Tamil Nadu)',
    price: 0.60,
    image: 'https://images.unsplash.com/photo-1576045057995-568f588f82fb?auto=format&fit=crop&q=80&w=800',
    category: ['vegetables', 'leafy_greens', 'indian', 'vegan'],
    allergens: ['None Known'],
    isPopular: true,
    nutrition: {
      calories: 38,
      protein: 5.9,
      carbs: 4.1,
      fat: 1.0,
      fiber: 2.1,
      vitamins: { 'Vitamin C': '20mg', 'Vitamin A': '450mcg', 'Riboflavin': '0.5mg' },
      minerals: { 'Calcium': '410mg', 'Iron': '20.5mg', 'Phosphorus': '70mg' },
      glycemicIndex: 12,
      glycemicLoad: 1,
      waterContentPercent: 84
    },
    digestionTimeHours: '1–1.5 hours',
    bestTimeToEat: 'Lunch (cooked with coconut milk or soup)',
    idealGapHours: 2,
    digestibilityNotes: 'Best cooked gently with coconut milk to neutralize mild bitterness and maximize mucosal healing.',
    doNotEatWith: [],
    cautionConditions: [],
    bestSeason: 'Monsoon / Winter',
    organBenefits: [
      {
        organ: 'gut',
        benefit: 'Heals peptic ulcers, stomatitis, and esophageal inflammation rapidly.',
        supportingNutrient: 'Steroidal Glycoalkaloids & Riboflavin',
        evidenceLevel: 'established'
      },
      {
        organ: 'liver',
        benefit: 'Protects hepatocytes against oxidative drug-induced damage.',
        supportingNutrient: 'Solasonine & Flavonoids',
        evidenceLevel: 'emerging'
      }
    ],
    medicalSuitability: {
      suitableFor: ['Mouth & Stomach Ulcers', 'Acid Reflux / Gastritis', 'Iron Deficiency Anemia'],
      cautionFor: [],
      disclaimer: 'Traditional Siddha medicinal herb.'
    },
    plantProfile: {
      plantType: 'Herbaceous Annual (Solanum nigrum)',
      climateZone: 'Tropical & Subtropical',
      idealSoilType: 'Moist Organic Loam',
      propagationMethod: 'Seed Broadcast',
      harvestSeason: 'Monsoon to Spring',
      waterRequirement: 'moderate',
      growingRegions: ['Tamil Nadu', 'Kerala', 'Karnataka', 'Sri Lanka']
    },
    imageConfidence: 97,
    verifiedStatus: 'admin_verified'
  },
  {
    id: 'vallarai_keerai_gotu_kola',
    name: {
      en: 'Gotu Kola / Vallarai Keerai',
      ta: 'வல்லாரை கீரை (Vallarai)',
      hi: 'ब्राह्मी / मण्डूकपर्णी'
    },
    description: {
      en: 'Fan-shaped brain booster leaf revered in Siddha and Ayurveda as a primary Medhya Rasayana for cognitive enhancement and memory retention.'
    },
    origin: 'India (Tamil Nadu / Kerala)',
    price: 0.70,
    image: 'https://images.unsplash.com/photo-1576045057995-568f588f82fb?auto=format&fit=crop&q=80&w=800',
    category: ['vegetables', 'leafy_greens', 'indian', 'vegan'],
    allergens: ['None Known'],
    isPopular: true,
    nutrition: {
      calories: 32,
      protein: 2.4,
      carbs: 6.0,
      fat: 0.2,
      fiber: 1.6,
      vitamins: { 'Vitamin B1': '0.15mg', 'Vitamin C': '13mg' },
      minerals: { 'Calcium': '170mg', 'Iron': '5.6mg', 'Potassium': '390mg' },
      glycemicIndex: 10,
      glycemicLoad: 1,
      waterContentPercent: 88
    },
    digestionTimeHours: '1 hour',
    bestTimeToEat: 'Morning Chutney or Lunch Soup',
    idealGapHours: 1.5,
    digestibilityNotes: 'Consuming raw or lightly sautéed preserves active triterpenoid saponins.',
    doNotEatWith: [],
    cautionConditions: [],
    bestSeason: 'All Season',
    organBenefits: [
      {
        organ: 'brain',
        benefit: 'Stimulates dendritic arborization and synaptic plasticity, enhancing memory consolidation.',
        supportingNutrient: 'Asiaticoside & Madecassoside Triterpenes',
        evidenceLevel: 'established'
      }
    ],
    medicalSuitability: {
      suitableFor: ['Memory & Focus Enhancement', 'Anxiety Reduction', 'Venous Circulation'],
      cautionFor: [],
      disclaimer: 'Traditional cognitive herbal food.'
    },
    plantProfile: {
      plantType: 'Creeping Aquatic Herb (Centella asiatica)',
      climateZone: 'Wet Tropical Marshy',
      idealSoilType: 'Wet Alluvial Soil',
      propagationMethod: 'Stolon / Runner Cuttings',
      harvestSeason: 'Year-Round',
      waterRequirement: 'high',
      growingRegions: ['India', 'Sri Lanka', 'Madagascar', 'Indonesia']
    },
    imageConfidence: 98,
    verifiedStatus: 'admin_verified'
  },

  // ==========================================
  // 5. HERITAGE GRAINS & ANCIENT MILLETS
  // ==========================================
  {
    id: 'karuppu_kavuni_black_rice',
    name: {
      en: 'Karuppu Kavuni Rice (Black Forbidden Rice)',
      ta: 'கருப்பு கவுனி அரிசி',
      hi: 'काला चावल'
    },
    description: {
      en: 'Ancient Tamil heritage unpolished black rice loaded with anthocyanin antioxidants, low glycemic load, and deep nutty aroma.'
    },
    origin: 'India (Tamil Nadu - Chettinad)',
    price: 3.20,
    image: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&q=80&w=800',
    category: ['grains', 'rice', 'indian', 'vegan'],
    allergens: ['Gluten-Free'],
    isPopular: true,
    nutrition: {
      calories: 356,
      protein: 8.9,
      carbs: 75.5,
      fat: 3.3,
      fiber: 4.7,
      vitamins: { 'Vitamin E': '1.2mg', 'B1': '0.4mg', 'B3': '4.2mg' },
      minerals: { 'Iron': '3.5mg', 'Zinc': '2.2mg', 'Magnesium': '130mg' },
      glycemicIndex: 42,
      glycemicLoad: 18,
      waterContentPercent: 12
    },
    digestionTimeHours: '2.5–3 hours',
    bestTimeToEat: 'Lunch (Boiled / Sweet Pongal / Kanji)',
    idealGapHours: 3,
    digestibilityNotes: 'Requires soak time of 8+ hours before cooking due to dense bran layer.',
    doNotEatWith: [],
    cautionConditions: [],
    bestSeason: 'All Season',
    organBenefits: [
      {
        organ: 'heart',
        benefit: 'Anthocyanins prevent LDL cholesterol peroxidation and vascular plaque accumulation.',
        supportingNutrient: 'Cyanidin-3-Glucoside (Anthocyanin)',
        evidenceLevel: 'established'
      },
      {
        organ: 'liver',
        benefit: 'Reduces hepatic fat accumulation and oxidative biomarker levels.',
        supportingNutrient: 'Polyphenols & Fiber',
        evidenceLevel: 'established'
      }
    ],
    medicalSuitability: {
      suitableFor: ['Diabetes Management', 'Cardiovascular Longevity', 'Weight Management'],
      cautionFor: [],
      disclaimer: 'Heritage unpolished whole grain.'
    },
    plantProfile: {
      plantType: 'Oryza sativa Landrace',
      climateZone: 'Tropical Monsoons',
      idealSoilType: 'Clayey Wet Soil',
      propagationMethod: 'Seed Nursery Transplanting',
      harvestSeason: 'Post-Monsoon (January)',
      waterRequirement: 'high',
      growingRegions: ['Tamil Nadu (Chettinad, Thanjavur)']
    },
    imageConfidence: 99,
    verifiedStatus: 'admin_verified'
  },
  {
    id: 'kodo_millet_varagu',
    name: {
      en: 'Kodo Millet (Varagu)',
      ta: 'வரகு (Kodo Millet)',
      hi: 'कोदो बाजरा'
    },
    description: {
      en: 'Drought-resistant ancient millet high in lecithin and dietary fiber. Ideal low-GI substitute for white rice in diabetes diets.'
    },
    origin: 'India (Tamil Nadu / Deccan Plateau)',
    price: 1.40,
    image: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&q=80&w=800',
    category: ['millets', 'grains', 'indian', 'vegan'],
    allergens: ['Gluten-Free'],
    isPopular: true,
    nutrition: {
      calories: 353,
      protein: 8.3,
      carbs: 65.0,
      fat: 1.4,
      fiber: 9.0,
      vitamins: { 'B3': '3.2mg', 'B1': '0.3mg' },
      minerals: { 'Iron': '1.7mg', 'Calcium': '35mg', 'Phosphorus': '188mg' },
      glycemicIndex: 50,
      glycemicLoad: 15,
      waterContentPercent: 10
    },
    digestionTimeHours: '2 hours',
    bestTimeToEat: 'Lunch / Dinner',
    idealGapHours: 2.5,
    digestibilityNotes: 'Soaking for 2 hours reduces phytic acid and speeds up gastrointestinal breakdown.',
    doNotEatWith: [],
    cautionConditions: [],
    bestSeason: 'All Season',
    organBenefits: [
      {
        organ: 'heart',
        benefit: 'Lecithin content strengthens nervous system lipid membranes and cardiac tissue.',
        supportingNutrient: 'Lecithin & B-Vitamins',
        evidenceLevel: 'established'
      }
    ],
    medicalSuitability: {
      suitableFor: ['Glycemic Control', 'Weight Loss', 'Celiac Disease / Gluten-Free'],
      cautionFor: [],
      disclaimer: 'Nutritious ancient grain.'
    },
    plantProfile: {
      plantType: 'Annual Grass (Paspalum scrobiculatum)',
      climateZone: 'Arid & Semi-Arid',
      idealSoilType: 'Poor Gravelly Soil',
      propagationMethod: 'Seed Broadcast',
      harvestSeason: 'Autumn',
      waterRequirement: 'low',
      growingRegions: ['India', 'West Africa']
    },
    imageConfidence: 98,
    verifiedStatus: 'admin_verified'
  }
];
