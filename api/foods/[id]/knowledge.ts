import { storage } from "../../../server/storage";
import { generateFoodKnowledgeProfile } from "../../../shared/foodKnowledgeEngine";
import { getOrTranslateKnowledgeProfile } from "../../../shared/foodKnowledgeTranslationService";
import type { Language } from "../../../shared/schema";

export default async function handler(req: any, res: any) {
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  try {
    const rawId = (req.query?.id || req.params?.id) as string | undefined;
    if (!rawId) {
      return res.status(400).json({ error: "Food ID is required" });
    }

    const cleanId = String(rawId).trim();
    const food = await storage.getFoodItemById(cleanId);
    if (!food) {
      return res.status(404).json({ error: "Food item not found" });
    }

    // Generate comprehensive, medically responsible scientific knowledge profile
    const rawProfile = generateFoodKnowledgeProfile(food);
    const requestedLang = (req.query?.lang || 'en') as Language;
    const profile = requestedLang && requestedLang !== 'en'
      ? await getOrTranslateKnowledgeProfile(rawProfile, requestedLang)
      : rawProfile;

    // Map into standard PART 19 output structure
    const output = {
      food_identity: profile.identity,
      serving_system: profile.servingSystem,
      nutrition: profile.nutritionSummary,
      what_this_food_provides: profile.whatThisFoodProvides,
      rda_comparisons: profile.rdaComparison,
      vitamins_minerals: {
        vitamins: profile.nutritionSummary.vitamins,
        calcium: profile.nutritionSummary.calcium,
        iron: profile.nutritionSummary.iron,
        magnesium: profile.nutritionSummary.magnesium,
        zinc: profile.nutritionSummary.zinc,
        potassium: `${profile.nutritionSummary.potassium}mg`,
        sodium: `${profile.nutritionSummary.sodium}mg`
      },
      bioactive_compounds: profile.nutritionSummary.bioactiveCompounds,
      bioavailability: profile.bioavailability,
      antinutrients: profile.antinutrients,
      cooking_effects: profile.cookingIntelligence,
      form_comparison: profile.formComparison,
      knowledge_graph: profile.knowledgeGraph,
      completeness_score: profile.completeness,
      health_benefits: profile.healthBenefits,
      organ_support: profile.organSupport,
      digestion: profile.digestion,
      best_time_to_eat: profile.bestTiming,
      seasonality: profile.seasonality,
      cultivation: profile.cultivation || null,
      harvest: profile.harvest || null,
      plant_life_cycle: profile.lifespan || null,
      storage: profile.storage,
      shelf_life: {
        whole_fresh: profile.storage.wholeFresh,
        refrigerated: profile.storage.refrigerated,
        frozen: profile.storage.frozen,
        dried_powdered: profile.storage.driedOrPowdered
      },
      preparation_methods: profile.culinaryAndUses.culinaryMethods,
      traditional_uses: profile.identity.traditionalUses,
      other_uses: profile.culinaryAndUses.nonFoodUses,
      safety: profile.safety,
      interactions: profile.safety.medicationInteractions,
      interesting_facts: profile.interestingFacts,
      article: profile.comprehensiveArticle,
      faq: profile.faqs,
      seo: profile.seoMetadata,
      references: profile.references,
      translation_meta: (profile as any).translationMeta || {
        targetLanguage: 'en',
        status: 'source_english'
      },
      translations_supported: 45
    };

    return res.status(200).json(output);
  } catch (error: any) {
    console.error("[api/foods/[id]/knowledge error]:", error);
    return res.status(500).json({ 
      error: "Failed to generate food knowledge profile", 
      message: error.message 
    });
  }
}
