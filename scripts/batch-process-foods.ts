/**
 * Script to process food data from multiple sources and generate a comprehensive
 * database of food items with multilingual content.
 */

import fs from 'fs';
import path from 'path';
import { generateCompleteFoodItem } from '../server/utils/anthropicHelper';
import { FoodItemClient } from '../shared/schema';

// Supports 100+ Languages

// Define language codes to generate content for
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
  ,'af', 'sq', 'hy', 'az', 'eu', 'be', 'bs', 'bg', 'ca', 'ceb', 'zh-TW',
        'hr', 'cs', 'da', 'dv', 'et', 'fi', 'gl', 'ka', 'el', 'ht',
        'iw', 'hu', 'is', 'ga', 'jv', 'kk', 'km', 'ku', 'ky', 'lo',
        'lv', 'lt', 'lb', 'mk', 'mg', 'mt', 'mn', 'no', 'ps', 'sr',
        'si', 'sk', 'sl', 'so', 'st', 'su', 'sv', 'tg', 'ti', 'tk',
        'uz', 'cy', 'xh', 'yi', 'yo', 'zu', 'ace', 'ach', 'ada', 'ady',
        'agq', 'ain', 'ak', 'aln', 'alt', 'aoz', 'arw', 'asa', 'ast',
        'awa', 'ay', 'ban', 'bas', 'bem', 'bez', 'bho', 'bik', 'bin',
        'bla', 'bpy', 'br', 'brx', 'bs', 'bug', 'byn', 'cch', 'ch', 'chk',
        'cho', 'crh', 'dak', 'dar', 'dav', 'del', 'doi', 'dua', 'dyo', 'efi',
        'elx', 'emk', 'eo', 'ewo', 'fan', 'ff', 'fon', 'fur', 'fy', 'gaa',
        'gag', 'gay', 'gez', 'gil', 'gld', 'gn', 'goh', 'gsw', 'guj',
        'gur', 'guz', 'gwi', 'hax', 'haw', 'hil', 'ho', 'hsb', 'hup',
        'iba', 'ibb', 'ilo', 'inh', 'io', 'iu', 'jam', 'jmc', 'kab',
        'kaj', 'kam', 'kbd', 'kcg', 'kde', 'kea', 'ken', 'kha', 'khm',
        'ki', 'kik', 'kj', 'kkj', 'kl', 'kln', 'kom', 'kpe', 'kr', 'krc',
        'kri', 'kru', 'ksb', 'ksh', 'kum', 'kv', 'lad', 'lag', 'lah', 'lam',
        'lbw', 'lez', 'lg', 'li', 'lif', 'lil', 'lkt', 'ln', 'loz', 'lua',
        'luo', 'lus', 'luy', 'mad', 'mag', 'mak', 'man', 'mas', 'mdf',
        'mer', 'mfe', 'min', 'mo', 'moh', 'mos', 'mrj', 'mul', 'mus',
        'mwr', 'mwv', 'mxi', 'mzn', 'na', 'nah', 'nap', 'nb', 'nd', 'nds',
        'ne', 'new', 'ng', 'niu', 'nnh', 'nog', 'nr', 'nso', 'nyn', 'oc',
        'oj', 'or', 'osa', 'pag', 'pam', 'pap', 'pau', 'pcd', 'pcm', 'pdc',
        'peo', 'phn', 'pi', 'pms', 'pon', 'prg', 'pro', 'pt-BR', 'qu',
        'quc', 'raj', 'rar', 'rm', 'rn', 'rof', 'rtm', 'rw', 'sa', 'sah',
        'sam', 'saq', 'sbp', 'sc', 'scn', 'sco', 'sdh', 'se', 'sei', 'ses',
        'sg', 'sgs', 'shi', 'shn', 'shr', 'sid', 'sin', 'sma', 'smj', 'smn',
        'sms', 'sn', 'snd', 'snk', 'srn', 'ss', 'ssy', 'stq', 'sux', 'syr',
        'szl', 'taq', 'tet', 'tiv', 'tkl', 'tlh', 'tn', 'to', 'trv',
        'ts', 'tt', 'tum', 'tvl', 'tw', 'ty', 'tyv', 'udm', 'uga', 'umb',
        'vai', 've', 'vec', 'vls', 'vo', 'vro', 'wa', 'wal', 'war', 'wo',
        'wuu', 'xal', 'yao', 'yap', 'yav', 'za', 'zea', 'zgh', 'zh-Hans'
        ];
// Define language codes to generate content for
// const LANGUAGE_CODES = [
//   // English
//   'en',
  
//   // Indian languages
//   'hi', 'ta', 'bn', 'mr', 'te', 'gu', 'ur', 'kn', 'or', 
//   'ml', 'pa', 'as', 'mai', 'sat', 'ks', 'ne', 'sd', 'kok',
  
//   // International languages
//   'es', 'fr', 'ar', 'ru', 'pt', 'id', 'de', 'ja', 'sw', 
//   'tr', 'yue', 'vi', 'ko', 'it', 'fa', 'th', 'ha', 'pl', 
//   'uk', 'ms', 'ro', 'nl', 'am', 'fil', 'my', 'om', 'zh'
//   ,'af', 'sq', 'hy', 'az', 'eu', 'be', 'bs', 'bg', 'ca', 'ceb', 'zh-TW',
//         'hr', 'cs', 'da', 'dv', 'et', 'fi', 'gl', 'ka', 'el', 'ht',
//         'iw', 'hu', 'is', 'ga', 'jv', 'kk', 'km', 'ku', 'ky', 'lo',
//         'lv', 'lt', 'lb', 'mk', 'mg', 'mt', 'mn', 'no', 'ps', 'sr',
//         'si', 'sk', 'sl', 'so', 'st', 'su', 'sv', 'tg', 'ti', 'tk',
//         'uz', 'cy', 'xh', 'yi', 'yo', 'zu', 'ace', 'ach', 'ada', 'ady',
//         'agq', 'ain', 'ak', 'aln', 'alt', 'aoz', 'arw', 'asa', 'ast',
//         'awa', 'ay', 'ban', 'bas', 'bem', 'bez', 'bho', 'bik', 'bin',
//         'bla', 'bpy', 'br', 'brx', 'bs', 'bug', 'byn', 'cch', 'ch', 'chk',
//         'cho', 'crh', 'dak', 'dar', 'dav', 'del', 'doi', 'dua', 'dyo', 'efi',
//         'elx', 'emk', 'eo', 'ewo', 'fan', 'ff', 'fon', 'fur', 'fy', 'gaa',
//         'gag', 'gay', 'gez', 'gil', 'gld', 'gn', 'goh', 'gsw', 'guj',
//         'gur', 'guz', 'gwi', 'hax', 'haw', 'hil', 'ho', 'hsb', 'hup',
//         'iba', 'ibb', 'ilo', 'inh', 'io', 'iu', 'jam', 'jmc', 'kab',
//         'kaj', 'kam', 'kbd', 'kcg', 'kde', 'kea', 'ken', 'kha', 'khm',
//         'ki', 'kik', 'kj', 'kkj', 'kl', 'kln', 'kom', 'kpe', 'kr', 'krc',
//         'kri', 'kru', 'ksb', 'ksh', 'kum', 'kv', 'lad', 'lag', 'lah', 'lam',
//         'lbw', 'lez', 'lg', 'li', 'lif', 'lil', 'lkt', 'ln', 'loz', 'lua',
//         'luo', 'lus', 'luy', 'mad', 'mag', 'mak', 'man', 'mas', 'mdf',
//         'mer', 'mfe', 'min', 'mo', 'moh', 'mos', 'mrj', 'mul', 'mus',
//         'mwr', 'mwv', 'mxi', 'mzn', 'na', 'nah', 'nap', 'nb', 'nd', 'nds',
//         'ne', 'new', 'ng', 'niu', 'nnh', 'nog', 'nr', 'nso', 'nyn', 'oc',
//         'oj', 'or', 'osa', 'pag', 'pam', 'pap', 'pau', 'pcd', 'pcm', 'pdc',
//         'peo', 'phn', 'pi', 'pms', 'pon', 'prg', 'pro', 'pt-BR', 'qu',
//         'quc', 'raj', 'rar', 'rm', 'rn', 'rof', 'rtm', 'rw', 'sa', 'sah',
//         'sam', 'saq', 'sbp', 'sc', 'scn', 'sco', 'sdh', 'se', 'sei', 'ses',
//         'sg', 'sgs', 'shi', 'shn', 'shr', 'sid', 'sin', 'sma', 'smj', 'smn',
//         'sms', 'sn', 'snd', 'snk', 'srn', 'ss', 'ssy', 'stq', 'sux', 'syr',
//         'szl', 'taq', 'tet', 'tiv', 'tkl', 'tlh', 'tn', 'to', 'trv',
//         'ts', 'tt', 'tum', 'tvl', 'tw', 'ty', 'tyv', 'udm', 'uga', 'umb',
//         'vai', 've', 'vec', 'vls', 'vo', 'vro', 'wa', 'wal', 'war', 'wo',
//         'wuu', 'xal', 'yao', 'yap', 'yav', 'za', 'zea', 'zgh', 'zh-Hans'
// ];

// List of all food data files to process
const foodDataPaths = [
  {
    path: '../attached_assets/Pasted-Here-s-the-complete-list-of-vegetables-with-Google-Images-search-links-for-each-open-in-a-new-t-1743992030158.txt',
    type: 'vegetable',
    parseFunction: parseVegetableData
  },
  {
    path: '../attached_assets/Pasted-Here-s-a-comprehensive-list-of-fruits-with-Google-Images-search-links-for-each--1743992045896.txt',
    type: 'fruit',
    parseFunction: parseFruitData
  },
  {
    path: '../attached_assets/Pasted-Here-s-a-comprehensive-list-of-worldwide-non-vegetarian-foods-including-meats-poultry-game-r-1743992062374.txt',
    type: 'non-vegetarian',
    parseFunction: parseNonVegData
  },
  {
    path: '../attached_assets/Pasted-Here-s-a-comprehensive-list-of-grocery-foods-and-ingredients-categorized-for-easy-reference-wi-1743992078962.txt',
    type: 'grocery',
    parseFunction: parseGroceryData
  }
];

// Define parsing functions for each food type
function parseVegetableData(filePath: string): Array<{ name: string, category: string[], type: string }> {
  const text = fs.readFileSync(filePath, 'utf8');
  const vegetables: Array<{ name: string, category: string[], type: string }> = [];
  
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
            category: ['Vegetable', categoryName],
            type: 'vegetable'
          });
        }
      }
    }
  }
  
  return vegetables;
}

function parseFruitData(filePath: string): Array<{ name: string, category: string[], type: string }> {
  const text = fs.readFileSync(filePath, 'utf8');
  const fruits: Array<{ name: string, category: string[], type: string }> = [];
  
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
            category: ['Fruit', categoryName],
            type: 'fruit'
          });
        }
      }
    }
  }
  
  return fruits;
}

function parseNonVegData(filePath: string): Array<{ name: string, category: string[], type: string }> {
  const text = fs.readFileSync(filePath, 'utf8');
  const foods: Array<{ name: string, category: string[], type: string }> = [];
  
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
    
    // Process each food line in this category
    for (let j = 1; j < lines.length; j++) {
      const line = lines[j].trim();
      
      // Check if line is a food item
      const foodMatch = line.match(/^-\s*\*\*(.+?)\*\*/);
      
      if (foodMatch) {
        const foodName = foodMatch[1].trim();
        
        // Handle varieties listed in parentheses
        let names: string[] = [];
        
        if (foodName.includes('(') && foodName.includes(')')) {
          // Extract varieties from parentheses
          const mainName = foodName.split('(')[0].trim();
          const varietiesStr = foodName.match(/\((.+?)\)/)?.[1];
          
          if (varietiesStr) {
            const varieties = varietiesStr.split(',').map(v => v.trim());
            names = varieties.map(v => `${mainName} (${v})`);
            
            // Also add the main category name
            if (!mainName.endsWith('s')) {
              names.unshift(mainName);
            }
          } else {
            names = [foodName];
          }
        } else {
          names = [foodName];
        }
        
        // Add each food with the category
        for (const name of names) {
          foods.push({
            name,
            category: ['Non-Vegetarian', categoryName],
            type: 'non-vegetarian'
          });
        }
      }
    }
  }
  
  return foods;
}



const FOOD_ITEMS_PER_LANGUAGE = 1000; // Support 1000+ food items


function parseGroceryData(filePath: string): Array<{ name: string, category: string[], type: string }> {
  const text = fs.readFileSync(filePath, 'utf8');
  const foods: Array<{ name: string, category: string[], type: string }> = [];
  
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
    
    // Process each food line in this category
    for (let j = 1; j < lines.length; j++) {
      const line = lines[j].trim();
      
      // Check if line is a food item
      const foodMatch = line.match(/^-\s*\*\*(.+?)\*\*/);
      
      if (foodMatch) {
        const foodName = foodMatch[1].trim();
        
        // Handle varieties listed in parentheses
        let names: string[] = [];
        
        if (foodName.includes('(') && foodName.includes(')')) {
          // Extract varieties from parentheses
          const mainName = foodName.split('(')[0].trim();
          const varietiesStr = foodName.match(/\((.+?)\)/)?.[1];
          
          if (varietiesStr) {
            const varieties = varietiesStr.split(',').map(v => v.trim());
            names = varieties.map(v => `${mainName} (${v})`);
            
            // Also add the main category name
            if (!mainName.endsWith('s')) {
              names.unshift(mainName);
            }
          } else {
            names = [foodName];
          }
        } else {
          names = [foodName];
        }
        
        // Add each food with the category
        for (const name of names) {
          foods.push({
            name,
            category: ['Grocery', categoryName],
            type: 'grocery'
          });
        }
      }
    }
  }
  
  return foods;
}

// Main function to process all food types
export async function batchProcessFoods(): Promise<FoodItemClient[]> {
  try {
    const allFoods: Array<{ name: string, category: string[], type: string }> = [];
    
    // Parse all food data files
    for (const foodData of foodDataPaths) {
      try {
        console.log(`Processing ${foodData.type} data from ${foodData.path}...`);
        const filePath = path.join(__dirname, foodData.path);
        
        if (fs.existsSync(filePath)) {
          const foods = foodData.parseFunction(filePath);
          console.log(`Parsed ${foods.length} ${foodData.type} items.`);
          allFoods.push(...foods);
        } else {
          console.warn(`File not found: ${filePath}`);
        }
      } catch (error) {
        console.error(`Error parsing ${foodData.type} data:`, error);
      }
    }
    
    console.log(`Total foods parsed: ${allFoods.length}`);
    
    // Select a diverse subset for testing
    const selectedFoods: Array<{ name: string, category: string[], type: string }> = [];
    
    // Take 2 items from each category
    const foodsByType = allFoods.reduce((acc, food) => {
      if (!acc[food.type]) {
        acc[food.type] = [];
      }
      acc[food.type].push(food);
      return acc;
    }, {} as Record<string, Array<{ name: string, category: string[], type: string }>>);
    
    for (const type in foodsByType) {
      const typeFoods = foodsByType[type];
      selectedFoods.push(...typeFoods.slice(0, 2));
    }
    
    console.log(`Selected ${selectedFoods.length} foods for processing.`);
    
    // Generate food items for the selected foods
    const foodItems: FoodItemClient[] = [];
    
    for (const food of selectedFoods) {
      console.log(`Generating data for ${food.name} (${food.type})...`);
      
      try {
        let description = '';
        
        switch (food.type) {
          case 'vegetable':
            description = `${food.name} is a nutritious vegetable that belongs to the ${food.category[1]} category.`;
            break;
          case 'fruit':
            description = `${food.name} is a delicious fruit that belongs to the ${food.category[1]} category.`;
            break;
          case 'non-vegetarian':
            description = `${food.name} is a popular non-vegetarian food from the ${food.category[1]} category.`;
            break;
          case 'grocery':
            description = `${food.name} is a common grocery item from the ${food.category[1]} category.`;
            break;
          default:
            description = `${food.name} is a nutritious food item.`;
        }
        
        // Using a smaller subset of languages for testing
        const testLanguages = ['en', 'es', 'fr', 'hi', 'ta'];
        
        const foodItem = await generateCompleteFoodItem(
          food.name,
          description,
          food.category,
          '', // No image path, will use default
          testLanguages
        );
        
        foodItems.push(foodItem);
        console.log(`Successfully generated data for ${food.name}`);
      } catch (error) {
        console.error(`Error generating data for ${food.name}:`, error);
      }
      
      // Add a small delay between API calls
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
    // Save the generated food items to a JSON file
    const outputFilePath = path.join(__dirname, '../generated-foods.json');
    fs.writeFileSync(outputFilePath, JSON.stringify(foodItems, null, 2));
    
    console.log(`Successfully generated data for ${foodItems.length} food items.`);
    console.log(`Data saved to ${outputFilePath}`);
    
    return foodItems;
  } catch (error) {
    console.error('Error processing foods:', error);
    return [];
  }
}

// Run the main function if this file is executed directly
if (require.main === module) {
  batchProcessFoods();
}