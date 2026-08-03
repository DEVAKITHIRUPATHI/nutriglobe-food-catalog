import { EditorialArticle, EditorialTopic, EditorialEngineSettings } from './editorialSchema';

export const defaultEditorialSettings: EditorialEngineSettings = {
  autoGenerateEnabled: true,
  autoFactCheckEnabled: true,
  autoImageCheckEnabled: true,
  autoSeoCheckEnabled: true,
  autoPublishEnabled: false, // Default OFF as per prompt instructions
  requireHumanApproval: true, // Default ON
  autoPublishThreshold: 90,
  dailyPublishTarget: 1,
  adsenseEnabled: false,
  googleNewsEligibilityMonitoring: true,
};

export const initialTopics: EditorialTopic[] = [
  {
    id: 'topic_tn_summer_fruits',
    title: '5 Traditional Summer Superfoods from Tamil Nadu',
    category: 'Regional Heritage',
    regionOrCuisine: 'India (Tamil Nadu)',
    themeType: 'regional_heritage',
    selectedFoodIds: ['nungu_ice_apple', 'tender_coconut', 'mango_alphonso', 'kamalathodai_orange', 'watermelon_organic'],
    selectionReason: 'High regional search interest + verified database records + seasonal relevance for summer hydration',
    priorityScore: 98,
    freshnessScore: 95,
    scheduledDate: '2026-07-26',
    status: 'article_created'
  },
  {
    id: 'topic_iron_rich_greens',
    title: '5 High-Iron Traditional Greens to Boost Energy & Immunity',
    category: 'Nutritional Focus',
    regionOrCuisine: 'Global & Indian Subcontinent',
    themeType: 'nutrient',
    selectedFoodIds: ['murungai_keerai_moringa', 'spinach_organic', 'pirandai_adamant_creeper', 'manathakkali_black_nightshade', 'curry_leaves'],
    selectionReason: 'High nutritional demand for iron & hemoglobin support with verified micronutrient density',
    priorityScore: 94,
    freshnessScore: 92,
    scheduledDate: '2026-07-27',
    status: 'article_created'
  },
  {
    id: 'topic_tropical_exotics',
    title: '5 Tropical Fruits Packed with Bioactive Antioxidants',
    category: 'Discovery & Exotics',
    regionOrCuisine: 'Tropical Regions',
    themeType: 'discovery',
    selectedFoodIds: ['dragon_fruit_red', 'jackfruit_raw', 'rambutan_exotic', 'mangosteen_exotic', 'papaya_red_lady'],
    selectionReason: 'Popular discovery items in the database with rich antioxidant profiles',
    priorityScore: 91,
    freshnessScore: 90,
    scheduledDate: '2026-07-28',
    status: 'article_created'
  },
  {
    id: 'topic_heritage_millets',
    title: '5 Ancient Millets for Sustainable Gut Health & Diabetes Control',
    category: 'Ancient Grains',
    regionOrCuisine: 'South Asia & Africa',
    themeType: 'variety_guide',
    selectedFoodIds: ['samai_little_millet', 'thinai_foxtail_millet', 'kuthiraivali_barnyard_millet', 'varagu_kodo_millet', 'ragi_finger_millet'],
    selectionReason: 'Low glycemic index, rich dietary fiber, and growing global health adoption',
    priorityScore: 96,
    freshnessScore: 94,
    scheduledDate: '2026-07-29',
    status: 'article_created'
  },
  {
    id: 'topic_healing_spices',
    title: '5 Healing Spices & Herbs Backed by Ancient Wisdom & Modern Science',
    category: 'Medicinal Herbs & Spices',
    regionOrCuisine: 'Global Culinary Heritage',
    themeType: 'preparation',
    selectedFoodIds: ['turmeric_curcumin', 'ginger_fresh', 'black_pepper_malabar', 'cardamom_green', 'cinnamon_ceylon'],
    selectionReason: 'Top searched culinary spices with verified anti-inflammatory and digestive properties',
    priorityScore: 93,
    freshnessScore: 89,
    scheduledDate: '2026-07-30',
    status: 'idea'
  }
];

export const initialArticles: EditorialArticle[] = [
  {
    id: 'art_5_traditional_summer_superfoods_tn',
    slug: '5-traditional-summer-superfoods-from-tamil-nadu',
    title: '5 Traditional Summer Superfoods from Tamil Nadu for Ultimate Hydration',
    subtitle: 'Discover age-old natural cooling foods from Tamil Nadu crafted by nature to combat tropical summer heat',
    summary: 'An evidence-based editorial exploring five cooling traditional superfoods from Tamil Nadu — from Tender Coconut and Nungu to Alphonso Mango, Kamalathodai, and Watermelon.',
    category: 'Regional Heritage',
    cuisineOrRegion: 'India (Tamil Nadu)',
    featuredImage: 'https://images.unsplash.com/photo-1546173159-315724a31696?auto=format&fit=crop&w=1200&q=80',
    imageAlt: 'Tender coconut and summer tropical fruits',
    imageCaption: 'Naturally cooling summer fruits sourced from verified agricultural cultivars in Tamil Nadu',
    whySelected: 'Selected due to peak summer interest, high electrolyte density, and proven cooling properties in traditional Siddha and Ayurvedic knowledge frameworks.',
    introduction: 'In the tropical heat of South India, traditional food wisdom has long relied on natural, unrefined cooling foods. Tamil Nadu boasts a rich heritage of seasonal produce specifically evolved to balance internal body temperature, replenish vital electrolytes, and maintain digestive calm.',
    conclusion: 'Incorporating these five traditional cooling foods into your daily summer diet provides sustained hydration, bioavailable micro-minerals, and natural antioxidant protection without artificial sugars or processed additives.',
    
    foods: [
      {
        foodId: 'tender_coconut',
        foodName: {
          en: 'Tender Coconut (Elaneer)',
          ta: 'இளநீர் (Elaneer)',
          hi: 'नारियल पानी (Nariyal Pani)'
        },
        image: 'https://images.unsplash.com/photo-1525385133512-2f3bdd039054?auto=format&fit=crop&w=800&q=80',
        origin: 'India (Tamil Nadu & Kerala Coastal Belts)',
        nutritionSummary: { calories: 19, protein: 0.7, carbs: 3.7, fat: 0.2, fiber: 1.1 },
        keyNutrients: ['Potassium', 'Sodium', 'Magnesium', 'Vitamin C', 'Natural Electrolytes'],
        regionalNames: { ta: 'இளநீர்', te: 'బొండం', kn: 'ఎలనీరు', hi: 'नारियल पानी' },
        culinaryUses: 'Consumed fresh as a natural isotonic drink. The delicate inner flesh (vazhakkai) is eaten directly or blended into cooling coconut smoothies.',
        interestingFacts: [
          'Tender coconut water is biologically sterile when inside the intact shell.',
          'Its electrolyte balance is remarkably similar to human blood plasma.'
        ],
        evidenceBasedBenefits: 'Rich in bioavailable potassium and sodium, tender coconut water helps maintain fluid balance, prevents thermal muscle cramping, and supports renal health.',
        safetyCaution: 'Individuals with severe chronic kidney disease requiring strict potassium restriction should consult their physician before high intake.'
      },
      {
        foodId: 'nungu_ice_apple',
        foodName: {
          en: 'Nungu / Ice Apple (Palmyra Fruit)',
          ta: 'நுங்கு (Nungu)',
          hi: 'ताड़गोला (Tadgola)'
        },
        image: 'https://images.unsplash.com/photo-1601004890684-d8cbf643f5f2?auto=format&fit=crop&w=800&q=80',
        origin: 'India (Tamil Nadu Palmyra Palms)',
        nutritionSummary: { calories: 43, protein: 0.8, carbs: 10.4, fat: 0.1, fiber: 1.2 },
        keyNutrients: ['B-Complex Vitamins', 'Calcium', 'Phytonutrients', 'Water Content (90%)'],
        regionalNames: { ta: 'நுங்கு', te: 'తాటి ముంజలు', kn: 'ತಾಟಿ ನುంగు', hi: 'ताड़गोला' },
        culinaryUses: 'Eaten raw after peeling the translucent outer membrane. Often infused into cold milk (Nungu Paal) or rose syrup drinks.',
        interestingFacts: [
          'Harvested exclusively from the State Tree of Tamil Nadu (Palmyra Palm).',
          'Contains natural cooling mucilage that soothes hyperacidic stomach lining.'
        ],
        evidenceBasedBenefits: 'Contains natural phytochemicals and high aqueous volume that soothe gastrointestinal heat, reduce acidity, and provide hydration.',
        safetyCaution: 'Best consumed fresh on the day of harvesting to avoid fermentation.'
      },
      {
        foodId: 'mango_alphonso',
        foodName: {
          en: 'Alphonso Mango (Salem & Krishnagiri Harvest)',
          ta: 'மாம்பழம் (Mampazham)',
          hi: 'अल्फांसो आम (Alphonso Aam)'
        },
        image: 'https://images.unsplash.com/photo-1553279768-865429fa0078?auto=format&fit=crop&w=800&q=80',
        origin: 'India (Tamil Nadu Orchard Belts)',
        nutritionSummary: { calories: 60, protein: 0.8, carbs: 15, fat: 0.38, fiber: 1.6 },
        keyNutrients: ['Beta-Carotene (Pro-Vitamin A)', 'Vitamin C', 'Polyphenols', 'Potassium'],
        regionalNames: { ta: 'மாம்பழம்', te: 'మామిడి పండు', hi: 'आम' },
        culinaryUses: 'Enjoyed sliced, blended into fresh mango juice, or incorporated into traditional Mangai Pachadi.',
        interestingFacts: [
          'Salem mangoes are world-famous for their intense sweetness and fiberless smooth pulp.',
          'Rich in mangiferin, a potent antioxidant compound studied for immune health.'
        ],
        evidenceBasedBenefits: 'Provides robust Vitamin A for skin barrier integrity during harsh sun exposure and supplies dietary polyphenols that neutralize oxidative stress.',
        safetyCaution: 'Diabetic individuals should monitor portion size due to natural fruit sugar content.'
      },
      {
        foodId: 'kamalathodai_orange',
        foodName: {
          en: 'Kamalathodai (Hill Orange)',
          ta: 'கமலா ஆரஞ்சு (Kamala Orange)',
          hi: 'संतरा (Santara)'
        },
        image: 'https://images.unsplash.com/photo-1611080626919-7cf5a9dbab5b?auto=format&fit=crop&w=800&q=80',
        origin: 'India (Nilgiris & Kodaikanal Hills)',
        nutritionSummary: { calories: 47, protein: 0.9, carbs: 11.7, fat: 0.1, fiber: 2.4 },
        keyNutrients: ['Vitamin C', 'Hesperidin', 'Folate', 'Citric Acid'],
        regionalNames: { ta: 'கமலா ஆரஞ்சு', hi: 'संतरा' },
        culinaryUses: 'Peeled and eaten fresh or pressed into citrus coolers sprinkled with a pinch of rock salt and mint.',
        interestingFacts: [
          'Grown in high-altitude soil giving it a distinct tangy sweetness compared to lowland varieties.'
        ],
        evidenceBasedBenefits: 'Supplies bioavailable Vitamin C and bioflavonoids that protect cellular collagen and enhance iron absorption from plant foods.',
        safetyCaution: 'Excess consumption on an empty stomach may trigger citrus acidity in sensitive individuals.'
      },
      {
        foodId: 'watermelon_organic',
        foodName: {
          en: 'Organic Watermelon (Thannir Mathan)',
          ta: 'தண்ணீர் பழம் (Thannir Mathan)',
          hi: 'तरबूज (Tarbooj)'
        },
        image: 'https://images.unsplash.com/photo-1587049352847-4a222e784d38?auto=format&fit=crop&w=800&q=80',
        origin: 'India (Farm Fresh Harvest)',
        nutritionSummary: { calories: 30, protein: 0.6, carbs: 7.5, fat: 0.15, fiber: 0.4 },
        keyNutrients: ['Lycopene', 'L-Citrulline', 'Vitamin A', 'Water (92%)'],
        regionalNames: { ta: 'தண்ணீர் பழம்', te: 'పుచ్చకాయ', hi: 'तरबूज' },
        culinaryUses: 'Chilled wedges, fresh squeezed juice with lime and mint, or summer salad cubes.',
        interestingFacts: [
          'Contains L-citrulline, an amino acid that helps relax arterial blood vessels and reduces muscle soreness.'
        ],
        evidenceBasedBenefits: 'Promotes arterial dilation and hydration through high lycopene and L-citrulline concentrations.',
        safetyCaution: 'Store cut watermelon in refrigerator and consume within 24 hours.'
      }
    ],

    author: {
      name: 'Dr. Arulmani Sundaram, PhD',
      role: 'Chief Nutritionist & Food Heritage Scientist',
      bio: 'Dr. Sundaram specializes in South Asian ethnobotany, food science, and micro-nutrient verification with over 15 years of agricultural research experience.',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80'
    },
    publishedAt: '2026-07-26T08:00:00.000Z',
    updatedAt: '2026-07-26T08:00:00.000Z',
    status: 'published',
    
    qualityGate: {
      duplicateTopicCheck: true,
      duplicateArticleCheck: true,
      factualConsistencyScore: 98,
      foodDatabaseVerified: true,
      nutritionDataVerified: true,
      sourceVerified: true,
      imageMatchConfidence: 96,
      copyrightLicensePassed: true,
      medicalClaimSafetyPassed: true,
      aiHallucinationCheckPassed: true,
      grammarReadabilityScore: 95,
      seoScore: 96,
      internalLinkCheckPassed: true,
      schemaValidationPassed: true,
      overallQualityScore: 96,
      autoPublishEligible: true,
      recommendation: 'Auto-publish eligible'
    },
    
    sources: [
      {
        title: 'Indian Food Composition Tables (IFCT) - National Institute of Nutrition (NIN)',
        url: 'https://www.nin.res.in/',
        sourceType: 'government_health',
        accessDate: '2026-07-26'
      },
      {
        title: 'Physio-Chemical Properties and Electrolyte Profile of Cocos nucifera L.',
        url: 'https://www.ncbi.nlm.nih.gov/pmc/',
        sourceType: 'scientific_journal',
        accessDate: '2026-07-26'
      }
    ],
    
    topicId: 'topic_tn_summer_fruits',
    isAiGenerated: true,
    aiDisclosureText: 'This article was generated with AI assistance from Google Gemini, trained on our verified 100,000+ food database, and reviewed by our food science editorial board.',
    medicalDisclaimer: 'This article provides evidence-based educational nutrition information only and is not intended to replace professional medical diagnosis or personalized dietary advice.',
    
    viewsCount: 1420,
    likesCount: 184,
    sharesCount: 62,
    readingTimeMinutes: 5
  },
  {
    id: 'art_5_high_iron_greens',
    slug: '5-high-iron-traditional-greens-to-boost-energy',
    title: '5 High-Iron Traditional Greens to Naturally Boost Hemoglobin & Energy',
    subtitle: 'Unlock nutrient-dense dark leafy greens backed by traditional culinary science and dietary iron research',
    summary: 'A detailed nutrition breakdown of five remarkable high-iron green leafy vegetables including Moringa, Spinach, Adamant Creeper, Black Nightshade, and Curry Leaves.',
    category: 'Nutritional Focus',
    cuisineOrRegion: 'Global & Indian Subcontinent',
    featuredImage: 'https://images.unsplash.com/photo-1576045057995-568f588f82fb?auto=format&fit=crop&w=1200&q=80',
    imageAlt: 'Fresh green spinach and moringa leaves',
    imageCaption: 'Fresh dark leafy greens rich in non-heme dietary iron and chlorophyllic phytonutrients',
    whySelected: 'Selected to address widespread dietary iron deficiency with easily accessible, fiber-rich natural greens that provide superior micro-nutrient absorption.',
    introduction: 'Dietary iron is fundamental for oxygen transport, mitochondrial cellular energy, and immune cell proliferation. While synthetic iron supplements often cause digestive distress, natural green leafy vegetables offer dietary non-heme iron accompanied by Vitamin C, folate, and protective chlorophyll.',
    conclusion: 'Integrating a variety of these five high-iron traditional greens into weekly soups, curries, and steamed side dishes provides sustainable metabolic vigor and natural anemia protection.',
    
    foods: [
      {
        foodId: 'murungai_keerai_moringa',
        foodName: {
          en: 'Moringa Leaves (Murungai Keerai)',
          ta: 'முருங்கை கீரை (Murungai Keerai)',
          hi: 'सहजन के पत्ते (Sahjan Ke Patte)'
        },
        image: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=800&q=80',
        origin: 'India & South Asia Native',
        nutritionSummary: { calories: 64, protein: 9.4, carbs: 8.3, fat: 1.4, fiber: 2.0 },
        keyNutrients: ['Iron (4.0 mg/100g)', 'Vitamin C', 'Vitamin A', 'Calcium', 'Quercetin'],
        regionalNames: { ta: 'முருங்கை கீரை', te: 'మునగాకు', kn: 'ನುಗ್ಗೆ ಸೊಪ್ಪು', hi: 'सहजन' },
        culinaryUses: 'Sautéed with freshly grated coconut, added to lentil dhal (Kootu), or simmered into a clear detoxifying soup.',
        interestingFacts: [
          'Known globally as the "Miracle Tree" due to its exceptional protein and micronutrient density.',
          'Contains 7x more Vitamin C than oranges, which naturally accelerates plant-iron absorption.'
        ],
        evidenceBasedBenefits: 'Provides substantial bioavailable iron along with native ascorbic acid to optimize non-heme iron uptake in the gut.',
        safetyCaution: 'Pregnant women should avoid concentrated root extracts; leaf greens are safe and highly nutritious.'
      },
      {
        foodId: 'spinach_organic',
        foodName: {
          en: 'Fresh Spinach (Pasalai Keerai)',
          ta: 'பசலை கீரை (Pasalai Keerai)',
          hi: 'पालक (Palak)'
        },
        image: 'https://images.unsplash.com/photo-1576045057995-568f588f82fb?auto=format&fit=crop&w=800&q=80',
        origin: 'Central & Western Asia',
        nutritionSummary: { calories: 23, protein: 2.9, carbs: 3.6, fat: 0.4, fiber: 2.2 },
        keyNutrients: ['Iron (2.7 mg/100g)', 'Folate (Vitamin B9)', 'Lutein', 'Magnesium'],
        regionalNames: { ta: 'பசலை கீரை', te: 'పాలకూర', hi: 'पालक' },
        culinaryUses: 'Steamed for Palak Paneer, blended into green smoothies, or added to rustic vegetable stews.',
        interestingFacts: [
          'Light cooking breaks down oxalic acid, enhancing iron and mineral bio-accessibility.'
        ],
        evidenceBasedBenefits: 'Supports red blood cell formation via combined folate and non-heme iron content.',
        safetyCaution: 'Individuals prone to calcium oxalate kidney stones should consume in moderation with adequate hydration.'
      },
      {
        foodId: 'pirandai_adamant_creeper',
        foodName: {
          en: 'Pirandai / Adamant Creeper',
          ta: 'பிரண்டை (Pirandai)',
          hi: 'हड़जोड़ (Hadjod)'
        },
        image: 'https://images.unsplash.com/photo-1518977676601-b53f82aba655?auto=format&fit=crop&w=800&q=80',
        origin: 'India & Tropical Africa',
        nutritionSummary: { calories: 38, protein: 1.8, carbs: 6.2, fat: 0.3, fiber: 2.8 },
        keyNutrients: ['Calcium Oxalate-bound Iron', 'Ketosteroids', 'Vitamin C', 'Flavonoids'],
        regionalNames: { ta: 'பிரண்டை', te: 'நல்லాలేమ', hi: 'हड़जोड़' },
        culinaryUses: 'Sauteed with sesame oil and tamarind to prepare traditional digestive chutney (Pirandai Thuvaiyal).',
        interestingFacts: [
          'Celebrated in Siddha medicine for bone healing and gastrointestinal motility.'
        ],
        evidenceBasedBenefits: 'Stimulates digestive enzymes, improves gut nutrient absorption, and supports metabolic wellness.',
        safetyCaution: 'Must be sautéed thoroughly with tamarind or lemon juice to neutralize natural calcium oxalate tingling.'
      },
      {
        foodId: 'manathakkali_black_nightshade',
        foodName: {
          en: 'Manathakkali Keerai (Black Nightshade Greens)',
          ta: 'மணத்தக்காளி கீரை (Manathakkali)',
          hi: 'मकोय (Makoy)'
        },
        image: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=800&q=80',
        origin: 'India & Mediterranean Region',
        nutritionSummary: { calories: 35, protein: 4.8, carbs: 5.1, fat: 0.6, fiber: 1.5 },
        keyNutrients: ['Iron', 'Riboflavin (B2)', 'Solasodine', 'Calcium'],
        regionalNames: { ta: 'மணத்தக்காளி கீரை', hi: 'मकोय' },
        culinaryUses: 'Simmered in coconut milk stew (Vatha Kuzhambu) or lightly sautéed with garlic.',
        interestingFacts: [
          'Traditionally prescribed for rapid healing of mouth and stomach ulcers.'
        ],
        evidenceBasedBenefits: 'Exhibits gastro-protective anti-ulcer activity and replenishes red blood cells.',
        safetyCaution: 'Eat mature cooked leaves; avoid raw unripe wild berries.'
      },
      {
        foodId: 'curry_leaves',
        foodName: {
          en: 'Fresh Curry Leaves (Karuveppilai)',
          ta: 'கருவேப்பிலை (Karuveppilai)',
          hi: 'कढ़ी पत्ता (Kadi Patta)'
        },
        image: 'https://images.unsplash.com/photo-1615485290382-441e4d049cb5?auto=format&fit=crop&w=800&q=80',
        origin: 'India Subcontinent Native',
        nutritionSummary: { calories: 108, protein: 6.1, carbs: 18.7, fat: 1.0, fiber: 6.4 },
        keyNutrients: ['Iron (0.93 mg/10g)', 'Mahanimbine', 'Vitamin A', 'Folic Acid'],
        regionalNames: { ta: 'கருவேப்பிலை', te: 'కరివేపాకు', hi: 'कढ़ी पत्ता' },
        culinaryUses: 'Tempered in ghee/mustard oil for lentil soups, ground into herbal rice powder (Karuveppilai Podi).',
        interestingFacts: [
          'Contains mahanimbine, an alkaloid studied for hair pigment protection and lipid regulation.'
        ],
        evidenceBasedBenefits: 'Supports hair follicle health and delivers high density dietary iron per gram weight.',
        safetyCaution: 'Wash thoroughly before use to remove surface garden dust.'
      }
    ],

    author: {
      name: 'Dr. Priya Ramachandran, MD',
      role: 'Clinical Clinical Dietitian & Integrative Nutritionist',
      bio: 'Dr. Priya Ramachandran holds a Doctorate in Clinical Nutrition and leads dietary research initiatives focused on botanical micro-nutrition.',
      avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=200&q=80'
    },
    publishedAt: '2026-07-25T10:00:00.000Z',
    updatedAt: '2026-07-25T10:00:00.000Z',
    status: 'published',
    
    qualityGate: {
      duplicateTopicCheck: true,
      duplicateArticleCheck: true,
      factualConsistencyScore: 97,
      foodDatabaseVerified: true,
      nutritionDataVerified: true,
      sourceVerified: true,
      imageMatchConfidence: 95,
      copyrightLicensePassed: true,
      medicalClaimSafetyPassed: true,
      aiHallucinationCheckPassed: true,
      grammarReadabilityScore: 96,
      seoScore: 95,
      internalLinkCheckPassed: true,
      schemaValidationPassed: true,
      overallQualityScore: 95,
      autoPublishEligible: true,
      recommendation: 'Auto-publish eligible'
    },
    
    sources: [
      {
        title: 'Nutritional Value of Indian Leafy Vegetables - ICMR Research Monograph',
        url: 'https://main.icmr.nic.in/',
        sourceType: 'government_health',
        accessDate: '2026-07-25'
      }
    ],
    
    topicId: 'topic_iron_rich_greens',
    isAiGenerated: true,
    aiDisclosureText: 'This article was generated with AI assistance from Google Gemini, trained on our verified 100,000+ food database, and reviewed by our food science editorial board.',
    medicalDisclaimer: 'This article provides evidence-based educational nutrition information only and is not intended to replace professional medical diagnosis or personalized dietary advice.',
    
    viewsCount: 2180,
    likesCount: 310,
    sharesCount: 105,
    readingTimeMinutes: 6
  }
];
