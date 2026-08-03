import Anthropic from '@anthropic-ai/sdk';
import { FoodItemClient, TranslatedContent } from '@shared/schema';

// the newest Anthropic model is "claude-3-7-sonnet-20250219" which was released February 24, 2025
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

// Extended TranslatedContent with _description field for internal use
interface ExtendedTranslatedContent extends TranslatedContent {
  _description?: TranslatedContent;
}

// Helper function to safely extract text from Claude response
function extractTextFromContentBlock(block: any): string {
  if (block.type === 'text' && typeof block.text === 'string') {
    return block.text;
  }
  return JSON.stringify(block);
}

/**
 * Generate multilingual translations for food item content
 */
export async function generateFoodTranslations(
  foodName: string,
  englishDescription: string,
  languages: string[]
): Promise<ExtendedTranslatedContent> {
  try {
    const languagesStr = languages.join(', ');
    const prompt = `
Please translate the following food item name and description into these languages: ${languagesStr}
Format the response as a JSON object with language codes as keys and translations as values.

Food name: ${foodName}
Food description: ${englishDescription}

Use this format:
{
  "en": "${foodName}",  // original English name
  "es": "Spanish translation",
  "fr": "French translation",
  // etc. for all requested languages
}

And for the description:
{
  "en": "${englishDescription}",  // original English description
  "es": "Spanish translation",
  "fr": "French translation",
  // etc. for all requested languages
}
`;

    const message = await anthropic.messages.create({
      max_tokens: 2000,
      messages: [{ role: 'user', content: prompt }],
      model: 'claude-3-7-sonnet-20250219',
    });

    // Extract the JSON from the response
    const content = extractTextFromContentBlock(message.content[0]);
    const jsonMatches = content.match(/\{[\s\S]*?\}/g);
    
    if (jsonMatches && jsonMatches.length >= 2) {
      const nameTranslationsJson = jsonMatches[0];
      const descriptionTranslationsJson = jsonMatches[1];
      
      const nameTranslations = JSON.parse(nameTranslationsJson);
      const descriptionTranslations = JSON.parse(descriptionTranslationsJson);
      
      return {
        ...nameTranslations, // This should contain all the name translations
        _description: descriptionTranslations, // We'll process this separately
      };
    }
    
    throw new Error('Failed to parse translations from Claude response');
  } catch (error) {
    console.error('Error generating translations:', error);
    return {
      en: foodName,
    };
  }
}

/**
 * Generate nutritional information for a food item
 */
export async function generateFoodNutrition(
  foodName: string,
  category: string[]
): Promise<any> {
  try {
    const prompt = `
Generate detailed nutritional information for ${foodName} which belongs to these categories: ${category.join(', ')}

Please format the response as a JSON object with the following structure:
{
  "calories": number,
  "carbs": number,
  "protein": number,
  "fat": number,
  "fiber": number,
  "vitamins": {
    "A": "percentage of daily value",
    "C": "percentage of daily value",
    // etc. for all relevant vitamins
  },
  "minerals": {
    "Iron": "percentage of daily value",
    "Calcium": "percentage of daily value",
    // etc. for all relevant minerals
  },
  "omega3": number (if applicable),
  "omega6": number (if applicable),
  "omega9": number (if applicable),
  "collagen": number (if applicable),
  "antioxidants": { 
    // if applicable
    "name": "amount"
  },
  "probiotics": {
    // if applicable
    "name": "amount"
  },
  "enzymes": {
    // if applicable
    "name": "function"
  }
}

Include only factual information based on publicly available nutritional data. If a certain field is not applicable, omit it from the response.
`;

    const message = await anthropic.messages.create({
      max_tokens: 1000,
      messages: [{ role: 'user', content: prompt }],
      model: 'claude-3-7-sonnet-20250219',
    });

    // Extract the JSON from the response
    const content = extractTextFromContentBlock(message.content[0]);
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    
    throw new Error('Failed to parse nutrition data from Claude response');
  } catch (error) {
    console.error('Error generating nutrition data:', error);
    return {
      calories: 0,
      carbs: 0,
      protein: 0,
      fat: 0,
      fiber: 0,
      vitamins: {}
    };
  }
}

/**
 * Generate health benefits for a food item
 */
export async function generateHealthBenefits(
  foodName: string,
  category: string[],
  languageCodes: string[]
): Promise<TranslatedContent[]> {
  try {
    const languagesStr = languageCodes.join(', ');
    const prompt = `
Generate 3-5 evidence-based health benefits of consuming ${foodName} (${category.join(', ')}).

For each benefit, provide translations in these languages: ${languagesStr}

Format the response as a JSON array where each object represents one health benefit with translations:
[
  {
    "en": "Benefit 1 in English",
    "es": "Benefit 1 in Spanish",
    "fr": "Benefit 1 in French",
    // etc. for all requested languages
  },
  {
    "en": "Benefit 2 in English",
    "es": "Benefit 2 in Spanish",
    // etc.
  }
]

Include only factual, evidence-based health benefits. Each benefit should be a complete sentence.
`;

    const message = await anthropic.messages.create({
      max_tokens: 1500,
      messages: [{ role: 'user', content: prompt }],
      model: 'claude-3-7-sonnet-20250219',
    });

    // Extract the JSON from the response
    const content = extractTextFromContentBlock(message.content[0]);
    const jsonMatch = content.match(/\[[\s\S]*\]/);
    
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    
    throw new Error('Failed to parse health benefits from Claude response');
  } catch (error) {
    console.error('Error generating health benefits:', error);
    return [{
      en: `May provide nutritional benefits.`
    }];
  }
}

/**
 * Generate a complete food item with multilingual content
 */
export async function generateCompleteFoodItem(
  foodName: string,
  englishDescription: string,
  categories: string[],
  imagePath: string,
  languageCodes: string[] = ['en', 'es', 'fr', 'hi', 'ta']
): Promise<FoodItemClient> {
  // Generate translations
  const translatedContent = await generateFoodTranslations(
    foodName,
    englishDescription,
    languageCodes
  );
  
  // Generate nutrition data
  const nutritionData = await generateFoodNutrition(foodName, categories);
  
  // Generate health benefits
  const healthBenefits = await generateHealthBenefits(
    foodName,
    categories,
    languageCodes
  );
  
  // Extract description translations
  const descriptionTranslations: TranslatedContent = 
    translatedContent._description || { en: englishDescription };
  
  // Remove the temporary field
  delete translatedContent._description;
  
  // Generate the food item
  const foodItem: FoodItemClient = {
    id: `${Date.now()}-${foodName.toLowerCase().replace(/\s+/g, '-')}`,
    name: translatedContent,
    description: descriptionTranslations,
    origin: 'Global',
    price: parseFloat((Math.random() * 10 + 1).toFixed(2)),
    image: imagePath || `https://source.unsplash.com/featured/?${encodeURIComponent(foodName)}`,
    category: categories,
    nutrition: nutritionData,
    healthBenefits: healthBenefits,
    recommendedIntake: {
      en: `Consume as part of a balanced diet.`
    },
    allergens: [],
    isPopular: Math.random() > 0.7 // 30% chance to be popular
  };
  
  return foodItem;
}