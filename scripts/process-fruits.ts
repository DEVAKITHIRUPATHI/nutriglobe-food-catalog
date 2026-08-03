/**
 * Script to process fruit data from the attached text file and generate food items
 * using the Claude API integration.
 */

import fs from 'fs';
import path from 'path';
import { generateCompleteFoodItem } from '../server/utils/anthropicHelper';
import { FoodItemClient } from '../shared/schema';

// Define language codes to generate content for
// 100+ Languages Support



const LANGUAGE_CODES = [
  // English
  'en',
  
  // Indian languages
  'hi', 'ta', 'bn', 'mr', 'te', 'gu', 'ur', 'kn', 'or', 
  'ml', 'pa', 'as', 'mai', 'sat', 'ks', 'ne', 'sd', 'kok',
  
  // International languages
  'es', 'fr', 'ar', 'ru', 'pt', 'id', 'de', 'ja', 'sw',
  'tr', 'yue', 'vi', 'ko', 'it', 'fa', 'th', 'ha', 'pl',
  'uk', 'ms', 'ro', 'nl', 'am', 'fil', 'my', 'om', 'zh',
  'sv', 'da', 'no', 'fi', 'el', 'hu', 'cs', 'sk', 'bg',
  'hr', 'sr', 'sl', 'et', 'lv', 'lt', 'ga', 'mt', 'cy',
  'sq', 'is', 'mk', 'bs', 'hy', 'ka', 'az', 'kk', 'uz',
  'tk', 'ky', 'tg', 'ku', 'ps', 'dv', 'si', 'km', 'lo',
  'mn', 'ti', 'so', 'yo', 'ig', 'zu', 'xh', 'rw', 'rn',
  'sn', 'ny', 'mg', 'eo', 'af', 'zu', 'xh', 'st', 'ts',
  'tn', 've', 'ii', 'iu',
  
];

// 1000+ Food Items Support



const FOOD_ITEMS_PER_LANGUAGE = [
  'Apple', 'Banana', 'Orange', 'Grape', 'Strawberry', 'Mango', 'Pineapple', 'Watermelon', 'Avocado', 'Kiwi',
  'Pear', 'Peach', 'Cherry', 'Blueberry', 'Raspberry', 'Blackberry', 'Lemon', 'Lime', 'Coconut', 'Pomegranate',
  'Fig', 'Date', 'Apricot', 'Cranberry', 'Plum', 'Papaya', 'Guava', 'Passion Fruit', 'Cantaloupe', 'Honeydew',
  'Grapefruit', 'Tangerine', 'Mandarin', 'Nectarine', 'Persimmon', 'Mulberry', 'Gooseberry', 'Currant', 'Elderberry',
  'Jackfruit', 'Durian', 'Lychee', 'Rambutan', 'Star Fruit', 'Dragon Fruit', 'Breadfruit', 'Plantain', 'Olive',
  'Tomato', 'Potato', 'Carrot', 'Onion', 'Garlic', 'Ginger', 'Cucumber', 'Broccoli', 'Cauliflower', 'Spinach',
  'Lettuce', 'Cabbage', 'Bell Pepper', 'Chili Pepper', 'Eggplant', 'Zucchini', 'Pumpkin', 'Squash', 'Sweet Potato',
  'Corn', 'Peas', 'Green Beans', 'Asparagus', 'Celery', 'Radish', 'Beetroot', 'Artichoke', 'Okra', 'Mushroom',
  'Turnip', 'Parsnip', 'Kale', 'Collard Greens', 'Mustard Greens', 'Arugula', 'Endive', 'Leek', 'Shallot', 'Scallion',
  'Brussels Sprout', 'Kohlrabi', 'Bok Choy', 'Watercress', 'Jalapeño', 'Habanero', 'Cayenne', 'Poblano', 'Serrano',
  'Shiitake', 'Oyster Mushroom', 'Portobello', 'Crimini', 'Chanterelle', 'Morel', 'Truffle', 'Sunflower Seed',
  'Chia Seed', 'Flaxseed', 'Sesame Seed', 'Poppy Seed', 'Pumpkin Seed', 'Almond', 'Walnut', 'Cashew', 'Peanut',
  'Pecan', 'Hazelnut', 'Brazil Nut', 'Macadamia Nut', 'Pistachio', 'Pine Nut', 'Chestnut', 'Soybean', 'Chickpea',
  'Lentil', 'Kidney Bean', 'Black Bean', 'White Bean', 'Pinto Bean', 'Lima Bean', 'Navy Bean', 'Garbanzo Bean',
  'Edamame', 'Mung Bean', 'Split Pea', 'Adzuki Bean', 'Fava Bean', 'Cocoa Bean', 'Quinoa', 'Rice', 'Wheat', 'Oat',
  'Barley', 'Rye', 'Millet', 'Buckwheat', 'Amaranth', 'Spelt', 'Teff', 'Cornmeal', 'Polenta', 'Couscous', 'Bulgur',
  'Pasta', 'Noodle', 'Bread', 'Tortilla', 'Biscuit', 'Muffin', 'Pancake', 'Waffle', 'Crepe', 'Doughnut', 'Croissant',
  'Bagel', 'Pizza', 'Sushi', 'Taco', 'Burrito', 'Enchilada', 'Tamale', 'Fajita', 'Quesadilla', 'Nachos', 'Chimichanga',
  'Arepa', 'Empanada', 'Roti', 'Naan', 'Chapati', 'Paratha', 'Samosa', 'Pakora', 'Falafel', 'Hummus', 'Baba Ghanoush',
  'Tabouleh', 'Dolma', 'Moussaka', 'Paella', 'Risotto', 'Gnocchi', 'Lasagna', 'Ravioli', 'Spaghetti', 'Macaroni',
  'Fettuccine', 'Linguine', 'Penne', 'Orzo', 'Couscous', 'Polenta', 'Grits', 'Oatmeal', 'Porridge', 'Muesli', 'Granola',
  'Cereal', 'Yogurt', 'Milk', 'Cheese', 'Butter', 'Cream', 'Ice Cream', 'Sorbet', 'Gelato', 'Custard', 'Pudding',
  'Cake', 'Pie', 'Cookie', 'Brownie', 'Muffin', 'Cupcake', 'Donut', 'Pastry', 'Tiramisu', 'Cheesecake', 'Eclair',
  'Macaron', 'Tart', 'Strudel', 'Crumble', 'Cobbler', 'Meringue', 'Soufflé', 'Fondue', 'Chocolate', 'Candy', 'Caramel',
  'Jelly', 'Jam', 'Honey', 'Maple Syrup', 'Molasses', 'Sugar', 'Salt', 'Pepper', 'Olive Oil', 'Vinegar', 'Mustard',
  'Ketchup', 'Mayonnaise', 'Soy Sauce', 'Worcestershire Sauce', 'Hot Sauce', 'Salsa', 'Guacamole', 'Pesto', 'Marinara',
  'Alfredo', 'Vodka Sauce', 'Teriyaki', 'Barbecue Sauce', 'Ranch Dressing', 'Caesar Dressing', 'Vinaigrette', 'Tahini',
  'Peanut Butter', 'Almond Butter', 'Cashew Butter', 'Sunflower Seed Butter', 'Nutella', 'Jelly', 'Jam', 'Honey',
  'Maple Syrup', 'Molasses', 'Sugar', 'Salt', 'Pepper', 'Olive Oil', 'Vinegar', 'Mustard', 'Ketchup', 'Mayonnaise',
  'Soy Sauce', 'Worcestershire Sauce', 'Hot Sauce', 'Salsa', 'Guacamole', 'Pesto', 'Marinara', 'Alfredo', 'Vodka Sauce',
  'Teriyaki', 'Barbecue Sauce', 'Ranch Dressing', 'Caesar Dressing', 'Vinaigrette', 'Tahini', 'Peanut Butter', 'Almond Butter',
  'Cashew Butter', 'Sunflower Seed Butter', 'Nutella', 'Basil', 'Parsley', 'Cilantro', 'Mint', 'Rosemary', 'Thyme',
  'Oregano', 'Sage', 'Dill', 'Chives', 'Cumin', 'Coriander', 'Paprika', 'Turmeric', 'Cinnamon', 'Nutmeg', 'Ginger',
  'Garlic Powder', 'Onion Powder', 'Chili Powder', 'Curry Powder', 'Five Spice', 'Saffron', 'Vanilla', 'Cocoa Powder',
  'Baking Soda', 'Baking Powder', 'Yeast', 'Cornstarch', 'Gelatin', 'Agar-Agar', 'Pectin', 'Gum', 'Isinglass',
  'Beef', 'Chicken', 'Pork', 'Lamb', 'Duck', 'Turkey', 'Fish', 'Shrimp', 'Crab', 'Lobster', 'Salmon', 'Tuna',
  'Cod', 'Halibut', 'Sardine', 'Anchovy', 'Mackerel', 'Herring', 'Tilapia', 'Catfish', 'Trout', 'Bass', 'Snapper',
  'Oyster', 'Mussel', 'Clam', 'Scallop', 'Squid', 'Octopus', 'Egg', 'Tofu', 'Seitan', 'Tempeh', 'Quorn', 'Burger',
  'Sausage', 'Hot Dog', 'Bacon', 'Ham', 'Steak', 'Ribs', 'Roast', 'Chops', 'Ground Meat', 'Meatloaf', 'Chicken Wings',
  'Chicken Nuggets', 'Chicken Tenders', 'Chicken Breast', 'Chicken Thigh', 'Chicken Leg', 'Pork Belly', 'Pork Ribs',
  'Pork Chop', 'Lamb Chop', 'Lamb Shank', 'Lamb Leg', 'Liver', 'Kidney', 'Tripe', 'Heart', 'Sweetbreads', 'Bone Marrow',
  'Foie Gras', 'Caviar', 'Escargot', 'Jerky', 'Prosciutto', 'Salami', 'Pepperoni', 'Mortadella', 'Bologna', 'Pastrami',
  'Corned Beef', 'Capicola', 'Pancetta', 'Chorizo', 'Andouille', 'Boudin', 'Head Cheese', 'Blood Sausage', 'Black Pudding',
  'White Pudding', 'Scrapple'
];

// Helper function to parse fruit categories and names from the text file
function parseFruitData(filePath: string): Array<{ name: string, category: string[] }> {
  const text = fs.readFileSync(filePath, 'utf8');
  const fruits: Array<{ name: string, category: string[] }> = [];
  
  // Split the text into sections based on the Markdown headings
  const sections = text.split('### **');
  
  for (let i = 1; i < sections.length; i++) {  // Skip the first element which is usually empty
    const section = sections[i];
    const lines = section.split('\n');
    
    if (lines.length === 0) continue;
    
    // Extract category name from the heading line
    const categoryLine = lines[0];
    const categoryMatch = categoryLine.match(/^([\d]+)\.\s*(.+?)\*\*/);
    
    if (!categoryMatch) continue;
    
    const categoryName = categoryMatch[2].trim();
    
    // Process each fruit line in this category
    for (let j = 1; j < lines.length; j++) {
      const line = lines[j].trim();
      
      // Check if line is a fruit item
      const fruitMatch = line.match(/^-\s*\*\*(.+?)\*\*/);
      
      if (fruitMatch) {
        const fruitName = fruitMatch[1].trim();
        
        // Handle varieties listed in parentheses
        let names: string[] = [];
        
        if (fruitName.includes('(') && fruitName.includes(')')) {
          // Extract varieties from parentheses
          const mainName = fruitName.split('(')[0].trim();
          const varietiesStr = fruitName.match(/\((.+?)\)/)?.[1];
          
          if (varietiesStr) {
            const varieties = varietiesStr.split(',').map(v => v.trim());
            names = varieties.map(v => `${mainName} (${v})`);
            
            // Also add the main category name
            if (!mainName.endsWith('s')) {
              names.unshift(mainName);
            }
          } else {
            names = [fruitName];
          }
        } else {
          names = [fruitName];
        }
        
        // Add each fruit with the category
        for (const name of names) {
          fruits.push({
            name,
            category: ['Fruit', categoryName]
          });
        }
      }
    }
  }
  
  return fruits;
}

// Main function to process fruits and generate food items
async function processFruits() {
  try {
    // Path to the fruit data file
    const dataFilePath = path.join(__dirname, '../attached_assets/Pasted-Here-s-a-comprehensive-list-of-fruits-with-Google-Images-search-links-for-each--1743992045896.txt');
    
    // Parse fruit data
    const fruits = parseFruitData(dataFilePath);
    console.log(`Parsed ${fruits.length} fruits from the data file.`);
    
    // For testing, just process a small subset
    const subset = fruits.slice(0, 5);
    
    // Generate food items for the subset
    const foodItems: FoodItemClient[] = [];
    
    for (const fruit of subset) {
      console.log(`Generating data for ${fruit.name}...`);
      
      try {
        const description = `${fruit.name} is a delicious fruit that belongs to the ${fruit.category[1]} category.`;
        
        // Using a smaller subset of languages for testing


        const testLanguages = LANGUAGE_CODES;


        const testFoodItems = FOOD_ITEMS_PER_LANGUAGE;

        
        const foodItem = await generateCompleteFoodItem(
          testFoodItems[0],
          description,
          fruit.category,
          '', // No image path, will use default
          testLanguages
        );
        
        foodItems.push(foodItem);
        console.log(`Successfully generated data for ${fruit.name}`);
      } catch (error) {
        console.error(`Error generating data for ${fruit.name}:`, error);
      }
      
      // Add a small delay between API calls
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
    // Save the generated food items to a JSON file
    const outputFilePath = path.join(__dirname, '../generated-fruits.json');
    fs.writeFileSync(outputFilePath, JSON.stringify(foodItems, null, 2));
    
    console.log(`Successfully generated data for ${foodItems.length} fruits.`);
    console.log(`Data saved to ${outputFilePath}`);
  } catch (error) {
    console.error('Error processing fruits:', error);
  }
}

// Run the main function
processFruits();