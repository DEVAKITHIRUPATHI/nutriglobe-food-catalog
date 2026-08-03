import { db } from '../server/db';
import { foodItems } from '../shared/schema';
import { generateFoodItems, LANGUAGE_CODES } from './generate-food-data';
import { LanguageCode } from '../shared/types';

async function seedDatabase() {
  console.log('Starting database seeding...');

  try {
    // Clear existing data
    const existingItems = await db.select().from(foodItems);
    if (existingItems.length > 0) {
      console.log(
        `Clearing existing ${existingItems.length} food items from database...`
      );
      await db.delete(foodItems);
    }

    const totalLanguages = LANGUAGE_CODES.length;
    const generatedItemsPerLanguage = 1000;
    let totalGeneratedItems = 0;

    const batchSize = 50;
    for (const langCode of LANGUAGE_CODES) {
      console.log(`Generating data for language: ${langCode}`);
      const generatedItems = generateFoodItems(generatedItemsPerLanguage);
      console.log(
        `Generated ${generatedItems.length} food items for ${langCode}`
      );
      totalGeneratedItems += generatedItems.length;
      for (let i = 0; i < generatedItems.length; i += batchSize) {
        const batch = generatedItems.slice(i, i + batchSize);

        // Process batch insertions in parallel
        const insertPromises = batch.map((item) => {
          const foodItemValues = {
            itemId: item.id,
            origin: item.origin,
            price: Math.round(item.price * 100), // Convert to cents
            image: item.image,
            categories: item.category,
            calories: item.nutrition.calories,
            carbs: Math.round(item.nutrition.carbs * 10), // Convert to decigrames
            protein: Math.round(item.nutrition.protein * 10), // Convert to decigrames
            fat: Math.round(item.nutrition.fat * 10), // Convert to decigrames
            fiber: Math.round(item.nutrition.fiber * 10), // Convert to decigrames
            vitamins: item.nutrition.vitamins,
            allergens: item.allergens,
            isPopular: item.isPopular,
          } as any;

          (Object.keys(item.name) as LanguageCode[]).forEach((lang) => {
            foodItemValues[`name${lang.charAt(0).toUpperCase() + lang.slice(1)}`] = item.name[lang];
          });

          (Object.keys(item.description) as LanguageCode[]).forEach(
            (lang) => {
              foodItemValues[`description${lang.charAt(0).toUpperCase() + lang.slice(1)}`] = item.description[lang];
            }
          );
          return db.insert(foodItems).values(foodItemValues);
        });
        await Promise.all(insertPromises);
        console.log(
          `Inserted batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(generatedItems.length / batchSize)} for ${langCode}`
        );
      }
    }
    console.log(`Successfully seeded database with ${totalGeneratedItems} food items in ${totalLanguages} languages`);
  } catch (error) {
    console.error('Error seeding database:', error);
    throw error;
  }
}

// Run the seeding function
seedDatabase()
  .then(() => {
    console.log('Database seeding completed');
    process.exit(0);
  })
  .catch(error => {
    console.error('Database seeding failed:', error);
    process.exit(1);
  });
