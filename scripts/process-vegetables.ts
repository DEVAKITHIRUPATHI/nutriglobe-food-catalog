/**
 * Script to process fruit data from the attached text file and generate food items
 * using the Claude API integration.
 */

import fs from 'fs';
import path from 'path';
import { generateCompleteFoodItem, generateMultipleFoodItem } from '../server/utils/anthropicHelper';
import { FoodItemClient } from '../shared/schema';

// Define language codes to generate content for 100+ languages
const LANGUAGE_CODES = [
  // English
  'en',
  
  // Indian languages
  'hi', 'ta', 'bn', 'mr', 'te', 'gu', 'ur', 'kn', 'or', 
  'ml', 'pa', 'as', 'mai', 'sat', 'ks', 'ne', 'sd', 'kok',
  
  // International languages
  'es', 'fr', 'ar', 'ru', 'pt', 'id', 'de', 'ja', 'sw', 
  'tr', 'yue', 'vi', 'ko', 'it', 'fa', 'th', 'ha', 'pl', 
  'uk', 'ms', 'ro', 'nl', 'am', 'fil', 'my', 'om', 'zh'
];


// Add more language codes to reach 100+ languages
const additionalLanguageCodes = ['sv', 'da', 'no', 'fi', 'hu', 'cs', 'sk', 'el', 'he', 'iw', 'bg', 'hr', 'sr', 'sl', 'et', 'lv', 'lt', 'is', 'ga', 'mt', 'sq', 'mk', 'bs', 'be', 'uk', 'hy', 'ka', 'az', 'kk', 'ky', 'tg', 'uz', 'tk', 'mn', 'km', 'lo', 'si', 'mr', 'sa', 'bo', 'dz', 'ti', 'so', 'af', 'zu', 'xh', 'st', 'tn', 'ss', 'nr', 've', 'ts', 'rn', 'rw', 'ku', 'ps', 'sd', 'ug', 'yo', 'ig'];
LANGUAGE_CODES.push(...additionalLanguageCodes);


// Helper function to parse fruit categories and names from the text file
function parseFruitData(filePath: string): Array<{ name: string, category: string[] }> {
    const text = fs.readFileSync(filePath, 'utf8');

  const vegetables: Array<{ name: string, category: string[] }> = [];
  
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
    
    // Process each vegetable line in this category
    for (let j = 1; j < lines.length; j++) {
      const line = lines[j].trim();
      
      // Check if line is a vegetable item
      const vegetableMatch = line.match(/^-\s*\*\*(.+?)\*\*/);
      
      if (vegetableMatch) {
        const vegetableName = vegetableMatch[1].trim();
        
        // Handle varieties listed in parentheses
        let names: string[] = [];
        
        if (vegetableName.includes('(') && vegetableName.includes(')')) {
          // Extract varieties from parentheses
          const mainName = vegetableName.split('(')[0].trim();
          const varietiesStr = vegetableName.match(/\((.+?)\)/)?.[1];
          
          if (varietiesStr) {
            const varieties = varietiesStr.split(',').map(v => v.trim());
            names = varieties.map(v => `${mainName} (${v})`);
            
            // Also add the main category name
            if (!mainName.endsWith('s')) {
              names.unshift(mainName);
            }
          } else {
            names = [vegetableName];
          }
        } else {
          names = [vegetableName];
        }
        
        // Add each vegetable with the category
        for (const name of names) {
          vegetables.push({
            name,
            category: ['Vegetable', categoryName]
          });
        }
      }
    }
  }
  
  return vegetables;
}

// Main function to process fruits and generate food items
async function processVegetables() {
  try {
    // Path to the vegetable data file
    const dataFilePath = path.join(__dirname, '../attached_assets/Pasted-Here-s-the-complete-list-of-vegetables-with-Google-Images-search-links-for-each-open-in-a-new-t-1743992030158.txt');
    
    // Parse vegetable data
    const vegetables = parseVegetableData(dataFilePath);
    console.log(`Parsed ${vegetables.length} fruits from the data file.`);
    
    const chunkSize = 100; // Number of foods to process in each batch
    const totalFoods = vegetables.length;
    let start = 0;
    
    while (start < totalFoods) {
        const end = Math.min(start + chunkSize, totalFoods);
        const batch = vegetables.slice(start, end);
        console.log(`Processing foods ${start + 1} to ${end} of ${totalFoods}`);

        const foodItemsBatch: FoodItemClient[] = [];

        for (const food of batch) {
            console.log(`Generating data for ${food.name}...`);
             try {
              const description = `${food.name} is a fruit that belongs to the ${food.category[1]} category.`;
              const foodItem = await generateCompleteFoodItem(food.name, description, food.category,'',LANGUAGE_CODES)
              foodItemsBatch.push(foodItem)
             }
             catch(error){
                 console.log(error)
             }
        }
        start += chunkSize;
    }
    
    // Save the generated food items to a JSON file
    const outputFilePath = path.join(__dirname, '../generated-vegetables.json');
    fs.writeFileSync(outputFilePath, JSON.stringify(foodItems, null, 2));
    
    console.log(`Successfully generated data for ${foodItems.length} vegetables.`);
    console.log(`Data saved to ${outputFilePath}`);        
  } catch (error) {
    console.error('Error processing vegetables:', error);
  }
}

// Run the main function
processVegetables();
