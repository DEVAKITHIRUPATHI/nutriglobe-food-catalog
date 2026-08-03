/**
 * Script to process food data and update the database with the generated items.
 * This can be run separately to populate the database with comprehensive food data.
 */

import fs from 'fs';
import path from 'path';
import { db } from '../server/db';
import { foodItems } from '../shared/schema';
import { FoodItemClient } from '../shared/schema';

// Import the batch processing functionality
import { batchProcessFoods } from './batch-process-foods';

// Function to save food items to the database
async function saveFoodItemsToDatabase(foods: FoodItemClient[]) {
  try {
    console.log(`Saving ${foods.length} food items to the database...`);
    
    for (const food of foods) {
        // Convert the FoodItemClient to the database format
        const dbFood = {
            id: food.id,
            name: JSON.stringify(food.name),
            description: JSON.stringify(food.description),
            origin: food.origin,
            price: food.price,
            image: food.image,
            category: food.category,
            nutrition: JSON.stringify(food.nutrition),
            healthBenefits: food.healthBenefits ? JSON.stringify(food.healthBenefits) : null,
            recommendedIntake: food.recommendedIntake ? JSON.stringify(food.recommendedIntake) : null,
            allergens: food.allergens,
            isPopular: food.isPopular
        };
      
      // Insert or update the food item in the database
      try {
          await db.insert(foodItems).values(dbFood)
              .onConflictDoUpdate({
                  target: foodItems.id,
                  set: dbFood
              });
          console.log(`Saved food item: ${food.name.en}`);
      } catch (error) {
          if ((error as any).code === '23505') {
              // Unique constraint violation, try updating instead
              console.log(`Duplicate found. Updating food item: ${food.name.en}`);
              await db.update(foodItems).set(dbFood).where(eq(foodItems.id, food.id));
          } else {
              // Handle other errors
              console.error('Error inserting food item:', error);
              throw error;
          }
      }
    }
    
    console.log('Database update completed successfully!');
  } catch (error) {
    console.error('Error saving food items to database:', error);
  }
}


// Main function to update the database
async function updateDatabase() {
  try {
    // Check if the generated foods file exists
    const foodsFilePath = path.join(__dirname, '../generated-foods.json');
    
    let foods: FoodItemClient[] = [];
    
    if (fs.existsSync(foodsFilePath)) {
      // If the file exists, read the foods from it
      console.log('Reading foods from existing JSON file...');
      const fileContent = fs.readFileSync(foodsFilePath, 'utf8');
      foods = JSON.parse(fileContent);
    } else {
      // If the file doesn't exist, generate the foods
      console.log('Generating new food data...');
      foods = await batchProcessFoods();
    }
    
    // Save the foods to the database
    await saveFoodItemsToDatabase(foods);
  } catch (error) {
    console.error('Error updating database:', error);
  } finally {
    // Close the database connection
    console.log('Database update process completed.');
    process.exit(0);
  }
}

// Run the update process
updateDatabase();