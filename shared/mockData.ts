import type { FoodItemClient } from './schema';

// This mock data simulates what would come from our database
// Helper function to create food items with consistent structure
const createFoodItem = (
  id: string,
  name: { en: string, hi: string, ta: string },
  description: { en: string, hi: string, ta: string },
  origin: string,
  price: number,
  image: string,
  category: string[],
  nutrition: {
    calories: number,
    carbs: number,
    protein: number,
    fat: number,
    fiber: number,
    vitamins: Record<string, string>,
    minerals?: Record<string, string>,
    omega3?: number,
    omega6?: number,
    omega9?: number,
    collagen?: number,
    antioxidants?: Record<string, string>,
    probiotics?: Record<string, string>,
    enzymes?: Record<string, string>,
  },
  allergens: string[],
  isPopular: boolean,
  healthBenefits?: { en: string, hi: string, ta: string }[],
  recommendedIntake?: { en: string, hi: string, ta: string }
): FoodItemClient => ({
  id,
  name,
  description,
  origin,
  price,
  image,
  category,
  nutrition,
  healthBenefits,
  recommendedIntake,
  allergens,
  isPopular
});

import { additionalFoodItems } from './additionalFoodItems';
import { expandedFoodItems } from './expandedFoodItems';
import { globalFoodDatabaseSeed } from './globalFoodDatabaseSeed';

const baseFoodList: FoodItemClient[] = [
  // ... base items ...
  {
    id: 'mango_alphonso',
    name: {
      en: 'Alphonso Mango',
      hi: 'हापुस आम',
      ta: 'ஆல்ஃபான்சோ மாம்பழம்'
    },
    description: {
      en: 'Known as the king of mangoes, sweet and aromatic',
      hi: 'आम का राजा, मीठा और सुगंधित',
      ta: 'மாம்பழங்களின் ராஜா, இனிப்பு மற்றும் மணமுள்ள'
    },
    origin: 'India',
    price: 3.99,
    image: 'https://images.unsplash.com/photo-1553279768-865429fa0078?auto=format&fit=crop&q=80',
    category: ['fruits', 'indian', 'seasonal'],
    nutrition: {
      calories: 70,
      carbs: 17,
      protein: 0.6,
      fat: 0.3,
      fiber: 1.8,
      vitamins: { 'A': '25%', 'C': '60%' }
    },
    allergens: ['vegan', 'gluten-free'],
    isPopular: true
  },
  {
    id: 'avocado',
    name: {
      en: 'Avocado',
      hi: 'एवोकैडो',
      ta: 'வெண்ணெய்ப் பழம்'
    },
    description: {
      en: 'Creamy, nutrient-rich superfood',
      hi: 'क्रीमी, पोषक तत्वों से भरपूर सुपरफूड',
      ta: 'கிரீமி, சத்து நிறைந்த சூப்பர்ஃபுட்'
    },
    origin: 'Mexico',
    price: 2.49,
    image: 'https://images.unsplash.com/photo-1523049673857-eb18f1d7b578?auto=format&fit=crop&q=80',
    category: ['fruits', 'global', 'keto'],
    nutrition: {
      calories: 160,
      carbs: 9,
      protein: 2,
      fat: 15,
      fiber: 7,
      vitamins: { 'K': '26%', 'E': '10%', 'C': '17%' }
    },
    allergens: ['vegan', 'gluten-free'],
    isPopular: true
  },
  {
    id: 'turmeric',
    name: {
      en: 'Turmeric',
      hi: 'हल्दी',
      ta: 'மஞ்சள்'
    },
    description: {
      en: 'Golden spice with potent anti-inflammatory properties',
      hi: 'सोनहरा मसाला जिसमें शक्तिशाली एंटी-इंफ्लेमेटरी गुण हैं',
      ta: 'சக்திவாய்ந்த அழற்சி எதிர்ப்பு பண்புகளைக் கொண்ட தங்க மசாலா'
    },
    origin: 'India',
    price: 1.99,
    image: 'https://images.unsplash.com/photo-1615485500704-8e505ecbe124?auto=format&fit=crop&q=80',
    category: ['spices', 'indian', 'ayurvedic'],
    nutrition: {
      calories: 29,
      carbs: 6.3,
      protein: 0.9,
      fat: 0.3,
      fiber: 2.1,
      vitamins: { 'C': '4%', 'B6': '5%' }
    },
    allergens: ['vegan', 'gluten-free'],
    isPopular: false
  },
  {
    id: 'quinoa',
    name: {
      en: 'Quinoa',
      hi: 'क्विनोआ',
      ta: 'குயினோவா'
    },
    description: {
      en: 'Complete protein grain with all essential amino acids',
      hi: 'सभी आवश्यक अमीनो एसिड के साथ पूर्ण प्रोटीन अनाज',
      ta: 'அனைத்து அத்தியாவசிய அமினோ அமிலங்களுடன் முழுமையான புரத தானியம்'
    },
    origin: 'Peru',
    price: 4.29,
    image: 'https://images.unsplash.com/photo-1595661677316-e5ece76be7c0?auto=format&fit=crop&q=80',
    category: ['grains', 'global', 'protein'],
    nutrition: {
      calories: 120,
      carbs: 21,
      protein: 4.4,
      fat: 1.9,
      fiber: 2.8,
      vitamins: { 'B6': '10%', 'Folate': '19%', 'Magnesium': '16%' }
    },
    allergens: ['vegan', 'gluten-free'],
    isPopular: false
  },
  {
    id: 'amla',
    name: {
      en: 'Indian Gooseberry (Amla)',
      hi: 'आंवला',
      ta: 'நெல்லிக்காய்'
    },
    description: {
      en: 'Extremely rich in Vitamin C, used in Ayurvedic medicine',
      hi: 'विटामिन C से भरपूर, आयुर्वेदिक दवा में उपयोग किया जाता है',
      ta: 'வைட்டமின் C அதிகம் நிறைந்தது, ஆயுர்வேத மருத்துவத்தில் பயன்படுத்தப்படுகிறது'
    },
    origin: 'India',
    price: 3.49,
    image: 'https://images.unsplash.com/photo-1601055283742-8b27e81b5553?auto=format&fit=crop&q=80',
    category: ['fruits', 'indian', 'ayurvedic'],
    nutrition: {
      calories: 44,
      carbs: 10,
      protein: 0.9,
      fat: 0.1,
      fiber: 4.3,
      vitamins: { 'C': '700%', 'A': '15%' }
    },
    allergens: ['vegan', 'gluten-free'],
    isPopular: true
  },
  {
    id: 'kale',
    name: {
      en: 'Kale',
      hi: 'केल',
      ta: 'கேல்'
    },
    description: {
      en: 'Nutrient-dense leafy green, rich in vitamins and minerals',
      hi: 'पोषक तत्वों से भरपूर पत्तेदार साग, विटामिन और खनिजों से समृद्ध',
      ta: 'சத்துக்கள் நிறைந்த இலைக்கீரை, வைட்டமின்கள் மற்றும் தாதுக்கள் நிறைந்தது'
    },
    origin: 'Mediterranean',
    price: 2.99,
    image: 'https://images.unsplash.com/photo-1524179091875-bf99a9a6af57?auto=format&fit=crop&q=80',
    category: ['vegetables', 'global', 'superfoods'],
    nutrition: {
      calories: 33,
      carbs: 6.7,
      protein: 2.2,
      fat: 0.5,
      fiber: 1.3,
      vitamins: { 'K': '684%', 'A': '206%', 'C': '134%' }
    },
    allergens: ['vegan', 'gluten-free'],
    isPopular: false
  },
  {
    id: 'salmon',
    name: {
      en: 'Atlantic Salmon',
      hi: 'सैल्मन मछली',
      ta: 'சால்மன் மீன்'
    },
    description: {
      en: 'Rich in omega-3 fatty acids and high-quality protein',
      hi: 'ओमेगा-3 फैटी एसिड और उच्च गुणवत्ता वाले प्रोटीन से भरपूर',
      ta: 'ஒமேகா-3 கொழுப்பு அமிலங்கள் மற்றும் உயர் தரமான புரதம் நிறைந்தது'
    },
    origin: 'Norway',
    price: 12.99,
    image: 'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?auto=format&fit=crop&q=80',
    category: ['seafood', 'global', 'protein'],
    nutrition: {
      calories: 208,
      carbs: 0,
      protein: 20,
      fat: 13,
      fiber: 0,
      vitamins: { 'B12': '106%', 'D': '66%', 'B6': '38%' }
    },
    allergens: ['fish'],
    isPopular: true
  },
  {
    id: 'jackfruit',
    name: {
      en: 'Jackfruit',
      hi: 'कटहल',
      ta: 'பலாப்பழம்'
    },
    description: {
      en: 'World\'s largest tree fruit, can be used as a meat substitute',
      hi: 'दुनिया का सबसे बड़ा पेड़ फल, मांस के विकल्प के रूप में उपयोग किया जा सकता है',
      ta: 'உலகின் மிகப்பெரிய மரப்பழம், இறைச்சி மாற்றாகப் பயன்படுத்தலாம்'
    },
    origin: 'India',
    price: 5.49,
    image: 'https://images.unsplash.com/photo-1591068243886-d8bea9f5c491?auto=format&fit=crop&q=80',
    category: ['fruits', 'indian', 'vegan'],
    nutrition: {
      calories: 95,
      carbs: 24,
      protein: 1.7,
      fat: 0.3,
      fiber: 1.5,
      vitamins: { 'C': '13%', 'B6': '7%' }
    },
    allergens: ['vegan', 'gluten-free'],
    isPopular: false
  },
  {
    id: 'spinach',
    name: {
      en: 'Spinach',
      hi: 'पालक',
      ta: 'கீரை'
    },
    description: {
      en: 'Nutrient-rich leafy green vegetable with mild flavor',
      hi: 'हल्के स्वाद के साथ पोषक तत्वों से भरपूर पत्तेदार हरी सब्जी',
      ta: 'மிதமான சுவையுடன் ஊட்டச்சத்து நிறைந்த இலைக்கறி'
    },
    origin: 'Persia',
    price: 1.99,
    image: 'https://images.unsplash.com/photo-1576045057995-568f588f82fb?auto=format&fit=crop&q=80',
    category: ['vegetables', 'global', 'superfoods'],
    nutrition: {
      calories: 23,
      carbs: 3.6,
      protein: 2.9,
      fat: 0.4,
      fiber: 2.2,
      vitamins: { 'K': '604%', 'A': '188%', 'C': '47%' }
    },
    allergens: ['vegan', 'gluten-free'],
    isPopular: true
  },
  {
    id: 'almonds',
    name: {
      en: 'Almonds',
      hi: 'बादाम',
      ta: 'பாதாம்'
    },
    description: {
      en: 'Nutrient-dense tree nuts rich in vitamin E and healthy fats',
      hi: 'विटामिन ई और स्वस्थ वसा से भरपूर पोषक तत्वों से भरपूर पेड़ के नट्स',
      ta: 'வைட்டமின் E மற்றும் ஆரோக்கியமான கொழுப்புகள் நிறைந்த சத்துக்கள் நிறைந்த மரக்கொட்டைகள்'
    },
    origin: 'Middle East',
    price: 7.99,
    image: 'https://images.unsplash.com/photo-1567007601203-767b7dcfcf10?auto=format&fit=crop&q=80',
    category: ['nuts', 'global', 'protein'],
    nutrition: {
      calories: 164,
      carbs: 6.1,
      protein: 6,
      fat: 14.2,
      fiber: 3.5,
      vitamins: { 'E': '37%', 'Manganese': '32%', 'Magnesium': '19%' }
    },
    allergens: ['tree nuts'],
    isPopular: false
  },
  {
    id: 'millet',
    name: {
      en: 'Millet',
      hi: 'बाजरा',
      ta: 'கம்பு'
    },
    description: {
      en: 'Ancient grain that\'s gluten-free and highly nutritious',
      hi: 'प्राचीन अनाज जो ग्लूटेन-फ्री और अत्यधिक पौष्टिक है',
      ta: 'பழங்கால தானியம் குளுட்டன் இல்லாத மற்றும் அதிக ஊட்டச்சத்து நிறைந்தது'
    },
    origin: 'India',
    price: 3.49,
    image: 'https://images.unsplash.com/photo-1622542086073-346a41ce35fe?auto=format&fit=crop&q=80',
    category: ['grains', 'indian', 'gluten-free'],
    nutrition: {
      calories: 378,
      carbs: 73,
      protein: 11,
      fat: 4.2,
      fiber: 8.5,
      vitamins: { 'B3': '30%', 'B6': '15%', 'Magnesium': '22%' }
    },
    allergens: ['vegan', 'gluten-free'],
    isPopular: true
  },
  {
    id: 'paneer',
    name: {
      en: 'Paneer',
      hi: 'पनीर',
      ta: 'பனீர்'
    },
    description: {
      en: 'Fresh Indian cottage cheese with mild, milky flavor',
      hi: 'हल्के, दूधिया स्वाद के साथ ताजा भारतीय पनीर',
      ta: 'மிதமான, பால் சுவையுடன் புதிய இந்திய காட்டேஜ் சீஸ்'
    },
    origin: 'India',
    price: 4.99,
    image: 'https://images.unsplash.com/photo-1627907228175-2bf3e8f030d2?auto=format&fit=crop&q=80',
    category: ['dairy', 'indian', 'protein'],
    nutrition: {
      calories: 265,
      carbs: 3.4,
      protein: 18.3,
      fat: 20.8,
      fiber: 0,
      vitamins: { 'Calcium': '53%', 'Phosphorus': '32%' }
    },
    allergens: ['milk'],
    isPopular: true
  },
  // Add more food items (first batch of the 1000+ items)
  createFoodItem(
    'lentils_red',
    {
      en: 'Red Lentils',
      hi: 'मसूर दाल',
      ta: 'சிவப்பு பருப்பு'
    },
    {
      en: 'Quick-cooking legumes high in protein and fiber',
      hi: 'जल्दी पकने वाली फलियां जो प्रोटीन और फाइबर में उच्च होती हैं',
      ta: 'விரைவாக சமைக்கும் பருப்பு வகைகள் புரதம் மற்றும் நார்ச்சத்து நிறைந்தவை'
    },
    'India',
    2.49,
    'https://images.unsplash.com/photo-1612257999756-9d63c78eee46?auto=format&fit=crop&q=80',
    ['legumes', 'indian', 'protein'],
    {
      calories: 230,
      carbs: 40,
      protein: 18,
      fat: 0.8,
      fiber: 15.6,
      vitamins: { 'Folate': '90%', 'Iron': '37%', 'Magnesium': '18%' }
    },
    ['vegan', 'gluten-free'],
    true,
    [
      {
        en: 'Supports heart health and stable blood sugar',
        hi: 'हृदय स्वास्थ्य और स्थिर रक्त शर्करा का समर्थन करता है',
        ta: 'இதய ஆரோக்கியத்தையும் நிலையான இரத்த சர்க்கரையையும் ஆதரிக்கிறது'
      }
    ],
    {
      en: '1/2 cup cooked daily as part of a balanced meal',
      hi: 'संतुलित भोजन के हिस्से के रूप में रोजाना 1/2 कप पका हुआ',
      ta: 'சமநிலையான உணவின் ஒரு பகுதியாக தினமும் 1/2 கப் சமைத்தது'
    }
  ),
  createFoodItem(
    'cinnamon',
    {
      en: 'Cinnamon',
      hi: 'दालचीनी',
      ta: 'இலவங்கப்பட்டை'
    },
    {
      en: 'Sweet and warming spice with anti-inflammatory properties',
      hi: 'एंटी-इंफ्लेमेटरी गुणों के साथ मीठा और गर्म मसाला',
      ta: 'அழற்சி எதிர்ப்பு பண்புகளைக் கொண்ட இனிப்பு மற்றும் சூடான மசாலா'
    },
    'Sri Lanka',
    3.29,
    'https://images.unsplash.com/photo-1614326005381-344425877e0a?auto=format&fit=crop&q=80',
    ['spices', 'global', 'ayurvedic'],
    {
      calories: 6,
      carbs: 2,
      protein: 0.1,
      fat: 0.1,
      fiber: 1.4,
      vitamins: { 'Manganese': '22%', 'Calcium': '8%' },
      antioxidants: { 'Cinnamaldehyde': 'high', 'Polyphenols': 'high' }
    },
    ['vegan', 'gluten-free'],
    true,
    [
      {
        en: 'May help regulate blood sugar and improve insulin sensitivity',
        hi: 'रक्त शर्करा को नियंत्रित करने और इंसुलिन संवेदनशीलता में सुधार करने में मदद कर सकता है',
        ta: 'இரத்த சர்க்கரையை ஒழுங்குபடுத்தவும் இன்சுலின் உணர்திறனை மேம்படுத்தவும் உதவும்'
      }
    ],
    {
      en: '1/4 to 1 teaspoon daily in beverages or food',
      hi: 'पेय या भोजन में दैनिक 1/4 से 1 चम्मच',
      ta: 'பானங்கள் அல்லது உணவில் தினசரி 1/4 முதல் 1 தேக்கரண்டி'
    }
  ),
  createFoodItem(
    'sweet_potato',
    {
      en: 'Sweet Potato',
      hi: 'शकरकंद',
      ta: 'சர்க்கரைவள்ளிக் கிழங்கு'
    },
    {
      en: 'Nutrient-rich root vegetable with vibrant orange flesh',
      hi: 'जीवंत नारंगी रंग के साथ पोषक तत्वों से भरपूर जड़ वाली सब्जी',
      ta: 'பிரகாசமான ஆரஞ்சு நிறமுள்ள ஊட்டச்சத்து நிறைந்த வேர் காய்கறி'
    },
    'Central America',
    1.99,
    'https://images.unsplash.com/photo-1596620740331-304a92a7948f?auto=format&fit=crop&q=80',
    ['vegetables', 'global', 'superfoods'],
    {
      calories: 86,
      carbs: 20,
      protein: 1.6,
      fat: 0.1,
      fiber: 3,
      vitamins: { 'A': '438%', 'C': '37%', 'B6': '15%' }
    },
    ['vegan', 'gluten-free'],
    true,
    [
      {
        en: 'Supports eye health and immune function',
        hi: 'आंखों के स्वास्थ्य और प्रतिरक्षा कार्य का समर्थन करता है',
        ta: 'கண் ஆரோக்கியம் மற்றும் நோய் எதிர்ப்பு செயல்பாட்டை ஆதரிக்கிறது'
      }
    ],
    {
      en: 'One medium sweet potato 3-5 times per week',
      hi: 'एक मध्यम शकरकंद प्रति सप्ताह 3-5 बार',
      ta: 'ஒரு நடுத்தர சர்க்கரைவள்ளிக் கிழங்கு வாரத்திற்கு 3-5 முறை'
    }
  ),
  createFoodItem(
    'flaxseeds',
    {
      en: 'Flaxseeds',
      hi: 'अलसी के बीज',
      ta: 'ஆளிவிதை'
    },
    {
      en: 'Small seeds packed with omega-3 fatty acids and fiber',
      hi: 'ओमेगा-3 फैटी एसिड और फाइबर से भरपूर छोटे बीज',
      ta: 'ஒமேகா-3 கொழுப்பு அமிலங்கள் மற்றும் நார்ச்சத்து நிறைந்த சிறிய விதைகள்'
    },
    'Middle East',
    3.49,
    'https://images.unsplash.com/photo-1541083039736-fb320dec4509?auto=format&fit=crop&q=80',
    ['seeds', 'global', 'omega-3'],
    {
      calories: 55,
      carbs: 3,
      protein: 1.9,
      fat: 4.3,
      fiber: 2.8,
      vitamins: { 'Thiamin': '8%', 'Magnesium': '7%' },
      omega3: 2.5
    },
    ['vegan', 'gluten-free'],
    false,
    [
      {
        en: 'May help reduce inflammation and improve heart health',
        hi: 'सूजन को कम करने और हृदय स्वास्थ्य में सुधार करने में मदद कर सकता है',
        ta: 'அழற்சியைக் குறைக்கவும் இதய ஆரோக்கியத்தை மேம்படுத்தவும் உதவலாம்'
      }
    ],
    {
      en: '1-2 tablespoons ground flaxseeds daily',
      hi: 'रोजाना 1-2 बड़े चम्मच पिसे हुए अलसी के बीज',
      ta: 'தினசரி 1-2 மேஜைக்கரண்டி அரைத்த ஆளிவிதைகள்'
    }
  ),
  createFoodItem(
    'greek_yogurt',
    {
      en: 'Greek Yogurt',
      hi: 'ग्रीक दही',
      ta: 'கிரேக்க தயிர்'
    },
    {
      en: 'Thick, creamy yogurt strained to remove whey, higher in protein',
      hi: 'व्हे को हटाने के लिए छाना हुआ, मोटा, क्रीमी दही, प्रोटीन में अधिक',
      ta: 'வே நீக்கப்பட்ட கெட்டியான, கிரீமியான தயிர், அதிக புரதம் உள்ளது'
    },
    'Greece',
    4.99,
    'https://images.unsplash.com/photo-1609501967126-1a42085a3c7d?auto=format&fit=crop&q=80',
    ['dairy', 'global', 'protein'],
    {
      calories: 100,
      carbs: 3.6,
      protein: 17,
      fat: 0.4,
      fiber: 0,
      vitamins: { 'Calcium': '18%', 'B12': '15%', 'Phosphorus': '20%' },
      probiotics: { 'Lactobacillus': 'high', 'Bifidobacteria': 'medium' }
    },
    ['milk'],
    true,
    [
      {
        en: 'Supports digestive health and provides bone-building calcium',
        hi: 'पाचन स्वास्थ्य का समर्थन करता है और हड्डी-निर्माण कैल्शियम प्रदान करता है',
        ta: 'செரிமான ஆரோக்கியத்தை ஆதரிக்கிறது மற்றும் எலும்பு-உருவாக்கும் கால்சியத்தை வழங்குகிறது'
      }
    ],
    {
      en: '3/4 - 1 cup daily as a protein source',
      hi: 'प्रोटीन स्रोत के रूप में रोजाना 3/4 - 1 कप',
      ta: 'புரத ஆதாரமாக தினசரி 3/4 - 1 கப்'
    }
  ),
  createFoodItem(
    'blueberries',
    {
      en: 'Blueberries',
      hi: 'ब्लूबेरी',
      ta: 'புளூபெர்ரீஸ்'
    },
    {
      en: 'Small berries with powerful antioxidant properties',
      hi: 'शक्तिशाली एंटीऑक्सीडेंट गुणों वाली छोटी बेरीज़',
      ta: 'சக்திவாய்ந்த ஆன்டிஆக்ஸிடன்ட் பண்புகளைக் கொண்ட சிறிய பெர்ரிகள்'
    },
    'North America',
    4.49,
    'https://images.unsplash.com/photo-1502741224143-90386d7f8c82?auto=format&fit=crop&q=80',
    ['fruits', 'global', 'superfoods'],
    {
      calories: 57,
      carbs: 14.5,
      protein: 0.7,
      fat: 0.3,
      fiber: 2.4,
      vitamins: { 'C': '16%', 'K': '24%', 'Manganese': '22%' },
      antioxidants: { 'Anthocyanins': 'very high', 'Flavonoids': 'high' }
    },
    ['vegan', 'gluten-free'],
    true,
    [
      {
        en: 'Supports brain health and may improve memory',
        hi: 'मस्तिष्क के स्वास्थ्य का समर्थन करता है और याददाश्त में सुधार कर सकता है',
        ta: 'மூளை ஆரோக்கியத்தை ஆதரிக்கிறது மற்றும் நினைவாற்றலை மேம்படுத்தலாம்'
      }
    ],
    {
      en: '1/2 - 1 cup daily, fresh or frozen',
      hi: 'रोजाना 1/2 - 1 कप, ताजा या जमे हुए',
      ta: 'தினசரி 1/2 - 1 கப், பிரெஷ் அல்லது ஃப்ரோசன்'
    }
  ),
  createFoodItem(
    'chickpeas',
    {
      en: 'Chickpeas',
      hi: 'चने',
      ta: 'கொண்டைக்கடலை'
    },
    {
      en: 'Versatile legumes with nutty flavor, high in protein and fiber',
      hi: 'मेवेदार स्वाद वाली बहुमुखी फलियां, प्रोटीन और फाइबर में उच्च',
      ta: 'நட்டி சுவையுடன் பலதரப்பட்ட பயன்பாடுகளுக்கான பருப்பு வகை, புரதம் மற்றும் நார்ச்சத்து அதிகம்'
    },
    'Middle East',
    2.19,
    'https://images.unsplash.com/photo-1623855244183-52fd8d3ce2f7?auto=format&fit=crop&q=80',
    ['legumes', 'global', 'protein'],
    {
      calories: 164,
      carbs: 27,
      protein: 8.9,
      fat: 2.6,
      fiber: 7.6,
      vitamins: { 'Folate': '71%', 'Iron': '26%', 'Phosphorus': '28%' }
    },
    ['vegan', 'gluten-free'],
    true,
    [
      {
        en: 'Supports digestive health and helps stabilize blood sugar',
        hi: 'पाचन स्वास्थ्य का समर्थन करता है और रक्त शर्करा को स्थिर करने में मदद करता है',
        ta: 'செரிமான ஆரோக்கியத்தை ஆதரிக்கிறது மற்றும் இரத்த சர்க்கரையை நிலைப்படுத்த உதவுகிறது'
      }
    ],
    {
      en: '1/2 cup cooked, 3-4 times per week',
      hi: '1/2 कप पका हुआ, प्रति सप्ताह 3-4 बार',
      ta: '1/2 கப் சமைத்தது, வாரத்திற்கு 3-4 முறை'
    }
  ),
  createFoodItem(
    'olive_oil_extra_virgin',
    {
      en: 'Extra Virgin Olive Oil',
      hi: 'एक्स्ट्रा वर्जिन जैतून का तेल',
      ta: 'எக்ஸ்ட்ரா வர்ஜின் ஆலிவ் ஆயில்'
    },
    {
      en: 'Cold-pressed oil from olives with rich, fruity flavor',
      hi: 'समृद्ध, फलदार स्वाद के साथ जैतून से कोल्ड-प्रेस्ड तेल',
      ta: 'வளமான, பழச்சுவையுடன் ஆலிவ்களில் இருந்து குளிர் அழுத்தப்பட்ட எண்ணெய்'
    },
    'Mediterranean',
    8.99,
    'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?auto=format&fit=crop&q=80',
    ['oils', 'global', 'mediterranean'],
    {
      calories: 119,
      carbs: 0,
      protein: 0,
      fat: 13.5,
      fiber: 0,
      vitamins: { 'E': '12.9%', 'K': '7%' },
      omega9: 10.2
    },
    ['vegan', 'gluten-free'],
    true,
    [
      {
        en: 'Contains heart-healthy monounsaturated fats and antioxidants',
        hi: 'हृदय-स्वस्थ मोनोअनसैचुरेटेड वसा और एंटीऑक्सिडेंट्स होते हैं',
        ta: 'இதய ஆரோக்கியமான மோனோஅன்சாச்சுரேட்டட் கொழுப்புகள் மற்றும் ஆன்டிஆக்ஸிடன்ட்கள் உள்ளன'
      }
    ],
    {
      en: '1-2 tablespoons daily for cooking or dressing',
      hi: 'खाना पकाने या ड्रेसिंग के लिए रोजाना 1-2 बड़े चम्मच',
      ta: 'சமைப்பதற்கு அல்லது சாலட் டிரஸ்ஸிங் க்கு தினசரி 1-2 மேஜைக்கரண்டி'
    }
  ),
  createFoodItem(
    'oats',
    {
      en: 'Rolled Oats',
      hi: 'रोल्ड ओट्स',
      ta: 'ரோல்டு ஓட்ஸ்'
    },
    {
      en: 'Whole grain breakfast cereal high in soluble fiber',
      hi: 'घुलनशील फाइबर में उच्च होल ग्रेन नाश्ता अनाज',
      ta: 'கரையக்கூடிய நார்ச்சத்து அதிகம் கொண்ட முழு தானிய காலை உணவு'
    },
    'Scotland',
    3.29,
    'https://images.unsplash.com/photo-1471193945509-9ad0617afabf?auto=format&fit=crop&q=80',
    ['grains', 'global', 'breakfast'],
    {
      calories: 150,
      carbs: 27,
      protein: 5,
      fat: 2.5,
      fiber: 4,
      vitamins: { 'Manganese': '191%', 'Phosphorus': '41%', 'Magnesium': '34%' }
    },
    ['vegan'],
    true,
    [
      {
        en: 'May help lower cholesterol and improve blood sugar control',
        hi: 'कोलेस्ट्रॉल को कम करने और रक्त शर्करा नियंत्रण में सुधार करने में मदद कर सकता है',
        ta: 'கொலஸ்ட்ரால் அளவைக் குறைக்கவும் இரத்த சர்க்கரை கட்டுப்பாட்டை மேம்படுத்தவும் உதவலாம்'
      }
    ],
    {
      en: '1/2 cup dry oats daily prepared as porridge',
      hi: 'रोजाना 1/2 कप सूखे ओट्स को दलिया के रूप में तैयार किया गया',
      ta: 'தினசரி 1/2 கப் உலர் ஓட்ஸை கஞ்சியாக தயாரிக்கவும்'
    }
  ),
  createFoodItem(
    'garlic',
    {
      en: 'Garlic',
      hi: 'लहसुन',
      ta: 'பூண்டு'
    },
    {
      en: 'Pungent aromatic bulb used as a flavor foundation in cooking',
      hi: 'खाना पकाने में फ्लेवर फाउंडेशन के रूप में उपयोग किया जाने वाला तीखा सुगंधित बल्ब',
      ta: 'சமையலில் சுவை அடித்தளமாகப் பயன்படுத்தப்படும் கார மணமுள்ள பல்பு'
    },
    'Central Asia',
    0.99,
    'https://images.unsplash.com/photo-1615475689030-8c9f177d5e37?auto=format&fit=crop&q=80',
    ['spices', 'global', 'medicine'],
    {
      calories: 4,
      carbs: 1,
      protein: 0.2,
      fat: 0,
      fiber: 0.1,
      vitamins: { 'Manganese': '2%', 'Vitamin B6': '2%', 'Vitamin C': '1%' },
      antioxidants: { 'Allicin': 'high', 'Sulfur compounds': 'high' }
    },
    ['vegan', 'gluten-free'],
    true,
    [
      {
        en: 'Has antimicrobial properties and may support immune function',
        hi: 'एंटीमाइक्रोबियल गुण होते हैं और प्रतिरक्षा कार्य का समर्थन कर सकते हैं',
        ta: 'நுண்ணுயிர் எதிர்ப்பு பண்புகளைக் கொண்டுள்ளது மற்றும் நோய் எதிர்ப்பு செயல்பாட்டை ஆதரிக்கலாம்'
      }
    ],
    {
      en: '1-2 cloves daily, crushed or minced in food',
      hi: 'रोजाना 1-2 लौंग, भोजन में कुचले या बारीक कटे हुए',
      ta: 'தினசரி 1-2 பற்கள், உணவில் நசுக்கியது அல்லது நறுக்கியது'
    }
  ),
  // Adding chicken meat
  createFoodItem(
    'chicken_breast',
    {
      en: 'Chicken Breast',
      hi: 'चिकन ब्रेस्ट',
      ta: 'சிக்கன் மார்புக்கறி'
    },
    {
      en: 'Lean, boneless cut of poultry meat, high in protein',
      hi: 'प्रोटीन में उच्च, दुबला, हड्डी रहित पोल्ट्री मांस',
      ta: 'புரதம் நிறைந்த, மெலிந்த, எலும்பு இல்லாத கோழி இறைச்சி'
    },
    'Global',
    6.99,
    'https://images.unsplash.com/photo-1604503468506-a8da13d82791?auto=format&fit=crop&q=80',
    ['poultry', 'meat', 'protein'],
    {
      calories: 165,
      carbs: 0,
      protein: 31,
      fat: 3.6,
      fiber: 0,
      vitamins: { 'B6': '25%', 'Niacin': '70%', 'Phosphorus': '17%' }
    },
    ['animal', 'bird'],
    true,
    [
      {
        en: 'Supports muscle growth and tissue repair',
        hi: 'मांसपेशियों के विकास और ऊतक मरम्मत का समर्थन करता है',
        ta: 'தசை வளர்ச்சி மற்றும் திசு பழுதுபார்ப்பை ஆதரிக்கிறது'
      }
    ],
    {
      en: '3-4 ounces as part of a balanced meal',
      hi: 'संतुलित भोजन के हिस्से के रूप में 3-4 औंस',
      ta: 'சமநிலையான உணவின் ஒரு பகுதியாக 3-4 அவுன்ஸ்'
    }
  ),
  createFoodItem(
    'chicken_thighs',
    {
      en: 'Chicken Thighs',
      hi: 'चिकन थाई',
      ta: 'சிக்கன் தொடைக்கறி'
    },
    {
      en: 'Juicy, flavorful dark meat cut from the chicken leg',
      hi: 'चिकन लेग से काटा गया रसदार, स्वादिष्ट डार्क मीट',
      ta: 'கோழி காலில் இருந்து வெட்டப்பட்ட சாறுள்ள, சுவையான இருண்ட இறைச்சி'
    },
    'Global',
    5.99,
    'https://images.unsplash.com/photo-1622118713114-ac2475a7b0c1?auto=format&fit=crop&q=80',
    ['poultry', 'meat', 'protein'],
    {
      calories: 209,
      carbs: 0,
      protein: 26,
      fat: 10.9,
      fiber: 0,
      vitamins: { 'B12': '12%', 'Zinc': '15%', 'Iron': '7%' }
    },
    ['animal', 'bird'],
    false,
    [
      {
        en: 'Provides complete protein and essential minerals',
        hi: 'पूर्ण प्रोटीन और आवश्यक खनिज प्रदान करता है',
        ta: 'முழுமையான புரதம் மற்றும் அத்தியாவசிய தாதுக்களை வழங்குகிறது'
      }
    ],
    {
      en: '3-4 ounces, 2-3 times per week',
      hi: '3-4 औंस, प्रति सप्ताह 2-3 बार',
      ta: '3-4 அவுன்ஸ், வாரத்திற்கு 2-3 முறை'
    }
  ),
  // Adding river foods like crab
  createFoodItem(
    'crab',
    {
      en: 'Blue Crab',
      hi: 'नीला केकड़ा',
      ta: 'நீல நண்டு'
    },
    {
      en: 'Sweet, delicate shellfish with tender meat',
      hi: 'कोमल मांस के साथ मीठे, नाजुक शेलफिश',
      ta: 'மென்மையான இறைச்சியுடன் இனிப்பான, மெல்லிய சிப்பி'
    },
    'North America',
    14.99,
    'https://images.unsplash.com/photo-1565333280022-9b7f020c67e3?auto=format&fit=crop&q=80',
    ['seafood', 'shellfish', 'protein'],
    {
      calories: 98,
      carbs: 0,
      protein: 20.2,
      fat: 1.5,
      fiber: 0,
      vitamins: { 'B12': '339%', 'Copper': '85%', 'Zinc': '43%' }
    },
    ['shellfish', 'crustacean'],
    true,
    [
      {
        en: 'Rich source of omega-3 fatty acids and essential minerals',
        hi: 'ओमेगा-3 फैटी एसिड और आवश्यक खनिजों का समृद्ध स्रोत',
        ta: 'ஒமேகா-3 கொழுப்பு அமிலங்கள் மற்றும் அத்தியாவசிய தாதுக்களின் செறிவான ஆதாரம்'
      }
    ],
    {
      en: '4-6 ounces, 1-2 times per week',
      hi: '4-6 औंस, प्रति सप्ताह 1-2 बार',
      ta: '4-6 அவுன்ஸ், வாரத்திற்கு 1-2 முறை'
    }
  ),
  createFoodItem(
    'river_prawns',
    {
      en: 'Freshwater Prawns',
      hi: 'मीठे पानी के झींगे',
      ta: 'நன்னீர் இறால்'
    },
    {
      en: 'Tender, sweet river crustaceans with firm texture',
      hi: 'दृढ़ बनावट के साथ कोमल, मीठे नदी के क्रस्टेशियन',
      ta: 'உறுதியான அமைப்புடன் மென்மையான, இனிப்பான நதி உணவினம்'
    },
    'Southeast Asia',
    16.99,
    'https://images.unsplash.com/photo-1579191203419-1085567db843?auto=format&fit=crop&q=80',
    ['seafood', 'shellfish', 'river'],
    {
      calories: 119,
      carbs: 0.2,
      protein: 22.6,
      fat: 2.7,
      fiber: 0,
      vitamins: { 'B12': '117%', 'Selenium': '67%', 'Phosphorus': '25%' }
    },
    ['shellfish', 'crustacean'],
    false,
    [
      {
        en: 'Excellent source of lean protein and essential nutrients',
        hi: 'दुबले प्रोटीन और आवश्यक पोषक तत्वों का उत्कृष्ट स्रोत',
        ta: 'குறைந்த கொழுப்புள்ள புரதம் மற்றும் அத்தியாவசிய ஊட்டச்சத்துக்களின் சிறந்த ஆதாரம்'
      }
    ],
    {
      en: '4-6 ounces as part of a meal, 1-2 times per week',
      hi: 'भोजन के हिस्से के रूप में 4-6 औंस, प्रति सप्ताह 1-2 बार',
      ta: 'உணவின் ஒரு பகுதியாக 4-6 அவுன்ஸ், வாரத்திற்கு 1-2 முறை'
    }
  ),
  // Adding grocery staples
  createFoodItem(
    'rice_basmati',
    {
      en: 'Basmati Rice',
      hi: 'बासमती चावल',
      ta: 'பாசுமதி அரிசி'
    },
    {
      en: 'Aromatic long-grain rice with distinctive flavor',
      hi: 'विशिष्ट स्वाद के साथ सुगंधित लंबे दाने वाले चावल',
      ta: 'தனித்துவமான சுவையுடன் மணமுள்ள நீண்ட தானிய அரிசி'
    },
    'India',
    4.49,
    'https://images.unsplash.com/photo-1586201375761-83865001e8ac?auto=format&fit=crop&q=80',
    ['grains', 'indian', 'staple'],
    {
      calories: 190,
      carbs: 45,
      protein: 3.8,
      fat: 0.2,
      fiber: 0.5,
      vitamins: { 'Manganese': '19%', 'Selenium': '11%' }
    },
    ['vegan', 'gluten-free'],
    true,
    [
      {
        en: 'Low glycemic index version of rice for sustained energy',
        hi: 'निरंतर ऊर्जा के लिए चावल का कम ग्लाइसेमिक इंडेक्स वाला संस्करण',
        ta: 'நீடித்த ஆற்றலுக்கான குறைந்த கிளைசெமிக் குறியீடு அரிசி வகை'
      }
    ],
    {
      en: '1/2 - 3/4 cup cooked as part of a balanced meal',
      hi: 'संतुलित भोजन के हिस्से के रूप में 1/2 - 3/4 कप पका हुआ',
      ta: 'சமநிலையான உணவின் ஒரு பகுதியாக 1/2 - 3/4 கப் சமைத்தது'
    }
  ),
  createFoodItem(
    'eggs',
    {
      en: 'Eggs',
      hi: 'अंडे',
      ta: 'முட்டைகள்'
    },
    {
      en: 'Versatile, nutrient-dense food with complete protein',
      hi: 'पूर्ण प्रोटीन के साथ बहुमुखी, पोषक तत्वों से भरपूर खाद्य पदार्थ',
      ta: 'முழுமையான புரதத்துடன் பல்துறை, சத்து நிறைந்த உணவு'
    },
    'Global',
    3.49,
    'https://images.unsplash.com/photo-1506976785307-8732e854ad03?auto=format&fit=crop&q=80',
    ['protein', 'animal', 'breakfast'],
    {
      calories: 72,
      carbs: 0.4,
      protein: 6.3,
      fat: 5,
      fiber: 0,
      vitamins: { 'B12': '23%', 'Selenium': '28%', 'Vitamin D': '6%' },
      omega3: 0.1
    },
    ['eggs'],
    true,
    [
      {
        en: 'Contains all essential amino acids and important nutrients for brain health',
        hi: 'सभी आवश्यक अमीनो एसिड और मस्तिष्क स्वास्थ्य के लिए महत्वपूर्ण पोषक तत्व होते हैं',
        ta: 'அனைத்து அத்தியாவசிய அமினோ அமிலங்கள் மற்றும் மூளை ஆரோக்கியத்திற்கான முக்கியமான ஊட்டச்சத்துக்களைக் கொண்டுள்ளது'
      }
    ],
    {
      en: '1-2 eggs daily for most healthy adults',
      hi: 'अधिकांश स्वस्थ वयस्कों के लिए रोजाना 1-2 अंडे',
      ta: 'பெரும்பாலான ஆரோக்கியமான வயது வந்தவர்களுக்கு தினசரி 1-2 முட்டைகள்'
    }
  ),
  createFoodItem(
    'milk',
    {
      en: 'Whole Milk',
      hi: 'पूरा दूध',
      ta: 'முழு பால்'
    },
    {
      en: 'Nutrient-rich dairy beverage with protein, fat, and carbohydrates',
      hi: 'प्रोटीन, वसा और कार्बोहाइड्रेट के साथ पोषक तत्वों से भरपूर डेयरी पेय',
      ta: 'புரதம், கொழுப்பு மற்றும் கார்போஹைட்ரேட்டுகள் கொண்ட ஊட்டச்சத்து நிறைந்த பால் பானம்'
    },
    'Global',
    2.99,
    'https://images.unsplash.com/photo-1563636619-e9143da7973b?auto=format&fit=crop&q=80',
    ['dairy', 'beverage', 'calcium'],
    {
      calories: 149,
      carbs: 12,
      protein: 8,
      fat: 8,
      fiber: 0,
      vitamins: { 'Calcium': '28%', 'Vitamin D': '24%', 'B12': '18%' }
    },
    ['milk', 'dairy'],
    true,
    [
      {
        en: 'Supports bone health and provides complete protein',
        hi: 'हड्डी के स्वास्थ्य का समर्थन करता है और पूर्ण प्रोटीन प्रदान करता है',
        ta: 'எலும்பு ஆரோக்கியத்தை ஆதரிக்கிறது மற்றும் முழுமையான புரதத்தை வழங்குகிறது'
      }
    ],
    {
      en: '1-2 cups daily as part of a balanced diet',
      hi: 'संतुलित आहार के हिस्से के रूप में रोजाना 1-2 कप',
      ta: 'சமநிலையான உணவின் ஒரு பகுதியாக தினசரி 1-2 கப்'
    }
  ),
  createFoodItem(
    'tomatoes',
    {
      en: 'Tomatoes',
      hi: 'टमाटर',
      ta: 'தக்காளி'
    },
    {
      en: 'Versatile red fruit used as a vegetable in cooking',
      hi: 'खाना पकाने में सब्जी के रूप में इस्तेमाल किया जाने वाला बहुमुखी लाल फल',
      ta: 'சமையலில் காய்கறியாகப் பயன்படுத்தப்படும் பல்துறை சிவப்பு பழம்'
    },
    'South America',
    1.99,
    'https://images.unsplash.com/photo-1561136594-7f68413baa99?auto=format&fit=crop&q=80',
    ['vegetables', 'fruits', 'nightshade'],
    {
      calories: 18,
      carbs: 3.9,
      protein: 0.9,
      fat: 0.2,
      fiber: 1.2,
      vitamins: { 'C': '28%', 'K': '12%', 'A': '20%' },
      antioxidants: { 'Lycopene': 'very high', 'Beta-carotene': 'high' }
    },
    ['vegan', 'gluten-free'],
    true,
    [
      {
        en: 'Rich in lycopene, which may protect against certain cancers',
        hi: 'लाइकोपीन से भरपूर, जो कुछ कैंसर से सुरक्षा कर सकता है',
        ta: 'லைகோபீன் நிறைந்தது, இது சில புற்றுநோய்களில் இருந்து பாதுகாக்கலாம்'
      }
    ],
    {
      en: '1-2 medium tomatoes daily in various forms',
      hi: 'विभिन्न रूपों में रोजाना 1-2 मध्यम टमाटर',
      ta: 'தினசரி 1-2 நடுத்தர தக்காளிகள் பல்வேறு வடிவங்களில்'
    }
  ),
  createFoodItem(
    'ginger',
    {
      en: 'Ginger',
      hi: 'अदरक',
      ta: 'இஞ்சி'
    },
    {
      en: 'Pungent, spicy root used in cooking and traditional medicine',
      hi: 'खाना पकाने और पारंपरिक चिकित्सा में उपयोग किया जाने वाला तीखा, मसालेदार जड़',
      ta: 'சமையலிலும் பாரம்பரிய மருத்துவத்திலும் பயன்படுத்தப்படும் காரமான, மசாலா வேர்'
    },
    'Southeast Asia',
    2.49,
    'https://images.unsplash.com/photo-1574856344991-aaa31b6f4ce3?auto=format&fit=crop&q=80',
    ['spices', 'roots', 'medicinal'],
    {
      calories: 80,
      carbs: 17.8,
      protein: 1.8,
      fat: 0.8,
      fiber: 2,
      vitamins: { 'Magnesium': '7%', 'Vitamin B6': '5%', 'Potassium': '5%' },
      antioxidants: { 'Gingerol': 'high', 'Shogaol': 'high' }
    },
    ['vegan', 'gluten-free'],
    false,
    [
      {
        en: 'Natural anti-nausea remedy with anti-inflammatory properties',
        hi: 'एंटी-इंफ्लेमेटरी गुणों के साथ प्राकृतिक एंटी-मतली उपाय',
        ta: 'அழற்சி எதிர்ப்பு பண்புகளுடன் இயற்கை குமட்டல் எதிர்ப்பு மருந்து'
      }
    ],
    {
      en: '1-2 teaspoons freshly grated daily in food or tea',
      hi: 'खाने या चाय में रोजाना 1-2 चम्मच ताजा कसा हुआ',
      ta: 'உணவு அல்லது தேநீரில் தினசரி 1-2 தேக்கரண்டி புதிதாக துருவியது'
    }
  ),
  createFoodItem(
    'cucumber',
    {
      en: 'Cucumber',
      hi: 'खीरा',
      ta: 'வெள்ளரிக்காய்'
    },
    {
      en: 'Cool, crisp vegetable with high water content',
      hi: 'उच्च पानी की मात्रा के साथ ठंडी, कुरकुरी सब्जी',
      ta: 'அதிக நீர் அளவு கொண்ட குளிர்ந்த, நொறுங்கும் காய்கறி'
    },
    'India',
    0.99,
    'https://images.unsplash.com/photo-1604977042946-1eecc30f269e?auto=format&fit=crop&q=80',
    ['vegetables', 'salad', 'hydrating'],
    {
      calories: 16,
      carbs: 3.6,
      protein: 0.7,
      fat: 0.1,
      fiber: 0.5,
      vitamins: { 'K': '16%', 'C': '5%', 'Magnesium': '4%' }
    },
    ['vegan', 'gluten-free'],
    false,
    [
      {
        en: 'Supports hydration and contains compounds that may reduce inflammation',
        hi: 'हाइड्रेशन का समर्थन करता है और ऐसे यौगिक होते हैं जो सूजन को कम कर सकते हैं',
        ta: 'நீரேற்றத்தை ஆதரிக்கிறது மற்றும் அழற்சியைக் குறைக்கக்கூடிய சேர்மங்களைக் கொண்டுள்ளது'
      }
    ],
    {
      en: '1/2 - 1 medium cucumber daily in salads or as a snack',
      hi: 'सलाद में या नाश्ते के रूप में रोजाना 1/2 - 1 मध्यम खीरा',
      ta: 'சலாட்களில் அல்லது சிற்றுண்டியாக தினசரி 1/2 - 1 நடுத்தர வெள்ளரிக்காய்'
    }
  ),
  createFoodItem(
    'mango_green',
    {
      en: 'Green Mango',
      hi: 'कच्चा आम',
      ta: 'மாங்காய்'
    },
    {
      en: 'Unripe mango with sour, tangy flavor used in cooking',
      hi: 'खाना पकाने में उपयोग किया जाने वाला खट्टे, तीखे स्वाद वाला कच्चा आम',
      ta: 'சமையலில் பயன்படுத்தப்படும் புளிப்பு, காரமான சுவையுடன் கூடிய முற்றாத மாம்பழம்'
    },
    'India',
    2.99,
    'https://images.unsplash.com/photo-1590677702647-190120787dae?auto=format&fit=crop&q=80',
    ['fruits', 'unripe', 'indian'],
    {
      calories: 60,
      carbs: 15,
      protein: 0.8,
      fat: 0.2,
      fiber: 1.6,
      vitamins: { 'C': '50%', 'A': '10%', 'B6': '5%' }
    },
    ['vegan', 'gluten-free'],
    false,
    [
      {
        en: 'Rich in vitamin C and may aid digestion',
        hi: 'विटामिन सी से भरपूर और पाचन में सहायता कर सकता है',
        ta: 'வைட்டமின் சி நிறைந்தது மற்றும் செரிமானத்திற்கு உதவலாம்'
      }
    ],
    {
      en: 'Small amount as a condiment or in chutneys',
      hi: 'कॉन्डिमेंट के रूप में या चटनी में थोड़ी मात्रा',
      ta: 'தொட்டுக்கொள்ளும் உணவாக அல்லது சட்னிகளில் சிறிய அளவு'
    }
  ),
  createFoodItem(
    'cauliflower',
    {
      en: 'Cauliflower',
      hi: 'फूलगोभी',
      ta: 'காலிஃப்ளவர்'
    },
    {
      en: 'Versatile cruciferous vegetable with mild flavor',
      hi: 'हल्के स्वाद के साथ बहुमुखी क्रूसिफेरस सब्जी',
      ta: 'மிதமான சுவையுடன் பல்துறை குறுக்கு வகை காய்கறி'
    },
    'Mediterranean',
    2.49,
    'https://images.unsplash.com/photo-1568584711075-3d021a7c3ca3?auto=format&fit=crop&q=80',
    ['vegetables', 'cruciferous', 'keto'],
    {
      calories: 25,
      carbs: 5,
      protein: 2,
      fat: 0.1,
      fiber: 2.5,
      vitamins: { 'C': '77%', 'K': '20%', 'B6': '11%' },
      antioxidants: { 'Glucosinolates': 'high', 'Sulforaphane': 'high' }
    },
    ['vegan', 'gluten-free'],
    true,
    [
      {
        en: 'Contains compounds that may help reduce cancer risk',
        hi: 'ऐसे यौगिक होते हैं जो कैंसर के जोखिम को कम करने में मदद कर सकते हैं',
        ta: 'புற்றுநோய் அபாயத்தைக் குறைக்க உதவும் சேர்மங்களைக் கொண்டுள்ளது'
      }
    ],
    {
      en: '1 cup cooked or raw, 3-4 times per week',
      hi: '1 कप पका हुआ या कच्चा, प्रति सप्ताह 3-4 बार',
      ta: '1 கப் சமைத்தது அல்லது பச்சையானது, வாரத்திற்கு 3-4 முறை'
    }
  ),
  createFoodItem(
    'ghee',
    {
      en: 'Ghee',
      hi: 'घी',
      ta: 'நெய்'
    },
    {
      en: 'Clarified butter with rich flavor and high smoke point',
      hi: 'समृद्ध स्वाद और उच्च धुएं के बिंदु के साथ स्पष्ट मक्खन',
      ta: 'வளமான சுவை மற்றும் உயர் புகைப்புள்ளி கொண்ட தெளிந்த வெண்ணெய்'
    },
    'India',
    7.99,
    'https://images.unsplash.com/photo-1594014366117-0d303dd6b83c?auto=format&fit=crop&q=80',
    ['dairy', 'fats', 'indian'],
    {
      calories: 112,
      carbs: 0,
      protein: 0,
      fat: 12.7,
      fiber: 0,
      vitamins: { 'A': '15%', 'E': '2%', 'K': '1%' },
      omega3: 0.1
    },
    ['dairy'],
    true,
    [
      {
        en: 'Contains butyrate which may support gut health',
        hi: 'ब्यूटिरेट युक्त होता है जो आंत के स्वास्थ्य का समर्थन कर सकता है',
        ta: 'குடல் ஆரோக்கியத்தை ஆதரிக்கக்கூடிய பியூட்டிரேட் கொண்டுள்ளது'
      }
    ],
    {
      en: '1-2 teaspoons daily for cooking',
      hi: 'खाना पकाने के लिए रोजाना 1-2 चम्मच',
      ta: 'சமைப்பதற்கு தினசரி 1-2 தேக்கரண்டி'
    }
  ),
  createFoodItem(
    'papaya',
    {
      en: 'Papaya',
      hi: 'पपीता',
      ta: 'பப்பாளி'
    },
    {
      en: 'Sweet tropical fruit with orange flesh and digestive enzymes',
      hi: 'नारंगी गूदे और पाचक एंजाइमों के साथ मीठा उष्णकटिबंधीय फल',
      ta: 'ஆரஞ்சு சதை மற்றும் செரிமான நொதிகளுடன் இனிப்பான வெப்பமண்டல பழம்'
    },
    'Central America',
    3.99,
    'https://images.unsplash.com/photo-1617112848923-cc2234396a8d?auto=format&fit=crop&q=80',
    ['fruits', 'tropical', 'digestive'],
    {
      calories: 43,
      carbs: 11,
      protein: 0.5,
      fat: 0.1,
      fiber: 1.7,
      vitamins: { 'C': '62%', 'A': '18%', 'Folate': '14%' },
      enzymes: { 'Papain': 'high', 'Chymopapain': 'high' }
    },
    ['vegan', 'gluten-free'],
    false,
    [
      {
        en: 'Contains digestive enzymes that may help with protein digestion',
        hi: 'पाचक एंजाइम होते हैं जो प्रोटीन पाचन में मदद कर सकते हैं',
        ta: 'புரத செரிமானத்திற்கு உதவக்கூடிய செரிமான நொதிகளைக் கொண்டுள்ளது'
      }
    ],
    {
      en: '1 cup diced as part of a meal or snack',
      hi: 'भोजन या नाश्ते के हिस्से के रूप में 1 कप टुकड़े',
      ta: 'உணவு அல்லது சிற்றுண்டியின் ஒரு பகுதியாக 1 கப் துண்டுகள்'
    }
  ),
  createFoodItem(
    'tilapia',
    {
      en: 'Tilapia',
      hi: 'तिलापिया मछली',
      ta: 'திலாப்பியா மீன்'
    },
    {
      en: 'Mild, white freshwater fish that is farm-raised globally',
      hi: 'हल्की, सफेद मीठे पानी की मछली जो वैश्विक स्तर पर फार्म में उगाई जाती है',
      ta: 'உலகளவில் பண்ணை வளர்ப்பு செய்யப்படும் மிதமான, வெள்ளை நன்னீர் மீன்'
    },
    'Global',
    5.99,
    'https://images.unsplash.com/photo-1583833946873-5c944fc84783?auto=format&fit=crop&q=80',
    ['seafood', 'fish', 'protein'],
    {
      calories: 128,
      carbs: 0,
      protein: 26,
      fat: 2.7,
      fiber: 0,
      vitamins: { 'B12': '31%', 'Niacin': '24%', 'Selenium': '78%' }
    },
    ['fish'],
    true,
    [
      {
        en: 'Lean source of complete protein with essential nutrients',
        hi: 'आवश्यक पोषक तत्वों के साथ पूर्ण प्रोटीन का दुबला स्रोत',
        ta: 'அத்தியாவசிய ஊட்டச்சத்துக்களுடன் முழுமையான புரதத்தின் மெலிந்த ஆதாரம்'
      }
    ],
    {
      en: '4-6 ounce portion, 2-3 times per week',
      hi: '4-6 औंस हिस्सा, प्रति सप्ताह 2-3 बार',
      ta: '4-6 அவுன்ஸ் பகுதி, வாரத்திற்கு 2-3 முறை'
    }
  ),
  // Adding foods from the provided dataset
  createFoodItem(
    'watermelon',
    {
      en: 'Watermelon',
      hi: 'तरबूज',
      ta: 'தர்பூசணி'
    },
    {
      en: 'Sweet, juicy summer fruit with high water content and red flesh',
      hi: 'उच्च पानी की मात्रा और लाल गूदे के साथ मीठा, रसदार गर्मियों का फल',
      ta: 'அதிக நீர் அளவு மற்றும் சிவப்பு தசையுடன் இனிப்பான, சாறுள்ள கோடைகால பழம்'
    },
    'Africa',
    3.99,
    'https://cdn.pixabay.com/photo/2016/02/23/17/42/watermelon-1219017_640.jpg',
    ['fruits', 'summer', 'hydrating'],
    {
      calories: 46,
      carbs: 11.5,
      protein: 0.9,
      fat: 0.2,
      fiber: 0.6,
      vitamins: { 'C': '25%', 'A': '18%', 'B6': '8%' },
      antioxidants: { 'Lycopene': 'high', 'Beta-carotene': 'medium' }
    },
    ['vegan', 'gluten-free'],
    true,
    [
      {
        en: 'Supports hydration and contains antioxidants that may reduce inflammation',
        hi: 'हाइड्रेशन का समर्थन करता है और एंटीऑक्सिडेंट होते हैं जो सूजन को कम कर सकते हैं',
        ta: 'நீரேற்றத்தை ஆதரிக்கிறது மற்றும் அழற்சியைக் குறைக்கக்கூடிய ஆன்டிஆக்ஸிடன்ட்களைக் கொண்டுள்ளது'
      }
    ],
    {
      en: '1-2 cups of diced watermelon daily in hot weather',
      hi: 'गर्म मौसम में रोजाना 1-2 कप कटा हुआ तरबूज',
      ta: 'வெப்பமான வானிலையில் தினசரி 1-2 கப் துண்டாக்கப்பட்ட தர்பூசணி'
    }
  ),
  createFoodItem(
    'beef_steak',
    {
      en: 'Beef Steak',
      hi: 'बीफ स्टेक',
      ta: 'பீஃப் ஸ்டேக்'
    },
    {
      en: 'Premium cut of beef with rich flavor and tender texture',
      hi: 'समृद्ध स्वाद और कोमल बनावट के साथ बीफ का प्रीमियम कट',
      ta: 'வளமான சுவை மற்றும் மென்மையான அமைப்புடன் கூடிய பீஃப்பின் தரமான துண்டு'
    },
    'Global',
    15.99,
    'https://cdn.pixabay.com/photo/2018/02/25/07/15/steak-3179655_640.jpg',
    ['meat', 'beef', 'protein'],
    {
      calories: 252,
      carbs: 0,
      protein: 26,
      fat: 17,
      fiber: 0,
      vitamins: { 'B12': '85%', 'Zinc': '42%', 'Iron': '27%' },
      omega3: 0.3
    },
    ['meat', 'beef'],
    true,
    [
      {
        en: 'Excellent source of high-quality protein, iron, and B vitamins',
        hi: 'उच्च गुणवत्ता वाले प्रोटीन, आयरन और बी विटामिन का उत्कृष्ट स्रोत',
        ta: 'உயர் தரமான புரதம், இரும்பு மற்றும் பி வைட்டமின்களின் சிறந்த ஆதாரம்'
      }
    ],
    {
      en: '3-4 ounce portion, 1-2 times per week',
      hi: '3-4 औंस हिस्सा, प्रति सप्ताह 1-2 बार',
      ta: '3-4 அவுன்ஸ் பகுதி, வாரத்திற்கு 1-2 முறை'
    }
  ),
  createFoodItem(
    'pineapple',
    {
      en: 'Pineapple',
      hi: 'अनानास',
      ta: 'அன்னாசிப்பழம்'
    },
    {
      en: 'Tropical fruit with sweet-tart flavor and digestive enzymes',
      hi: 'मीठे-खट्टे स्वाद और पाचक एंजाइमों के साथ उष्णकटिबंधीय फल',
      ta: 'இனிப்பு-புளிப்பு சுவை மற்றும் செரிமான நொதிகளுடன் கூடிய வெப்பமண்டல பழம்'
    },
    'South America',
    3.99,
    'https://cdn.pixabay.com/photo/2016/03/05/19/13/pineapple-1238249_640.jpg',
    ['fruits', 'tropical', 'digestive'],
    {
      calories: 83,
      carbs: 22,
      protein: 0.9,
      fat: 0.2,
      fiber: 2.3,
      vitamins: { 'C': '88%', 'Manganese': '76%', 'B6': '11%' },
      enzymes: { 'Bromelain': 'high' }
    },
    ['vegan', 'gluten-free'],
    false,
    [
      {
        en: 'Contains bromelain which may aid digestion and reduce inflammation',
        hi: 'ब्रोमेलेन युक्त होता है जो पाचन में सहायता कर सकता है और सूजन को कम कर सकता है',
        ta: 'ப்ரோமிலைன் கொண்டுள்ளது, இது செரிமானத்திற்கு உதவலாம் மற்றும் அழற்சியைக் குறைக்கலாம்'
      }
    ],
    {
      en: '1 cup diced pineapple as a snack or dessert',
      hi: 'स्नैक या डेसर्ट के रूप में 1 कप कटा हुआ अनानास',
      ta: 'சிற்றுண்டி அல்லது இனிப்பு உணவாக 1 கப் துண்டாக்கப்பட்ட அன்னாசிப்பழம்'
    }
  ),
  createFoodItem(
    'broccoli',
    {
      en: 'Broccoli',
      hi: 'ब्रोकली',
      ta: 'ப்ரோக்கோலி'
    },
    {
      en: 'Nutritious green cruciferous vegetable with dense florets',
      hi: 'घने फूलगोभी के साथ पौष्टिक हरी क्रूसिफेरस सब्जी',
      ta: 'அடர்த்தியான பூக்கொத்துகளுடன் ஊட்டச்சத்து நிறைந்த பச்சை சிலுவை வகை காய்கறி'
    },
    'Mediterranean',
    2.49,
    'https://cdn.pixabay.com/photo/2016/03/05/19/02/broccoli-1238250_640.jpg',
    ['vegetables', 'cruciferous', 'green'],
    {
      calories: 31,
      carbs: 6,
      protein: 2.6,
      fat: 0.3,
      fiber: 2.4,
      vitamins: { 'C': '135%', 'K': '116%', 'Folate': '14%' },
      antioxidants: { 'Sulforaphane': 'very high', 'Glucosinolates': 'high' }
    },
    ['vegan', 'gluten-free'],
    true,
    [
      {
        en: 'Contains compounds that may help detoxify carcinogens and reduce cancer risk',
        hi: 'ऐसे यौगिक होते हैं जो कार्सिनोजेन को डिटॉक्सिफाई करने और कैंसर के जोखिम को कम करने में मदद कर सकते हैं',
        ta: 'புற்றுநோய் உண்டாக்கிகளை நச்சு நீக்கவும் புற்றுநோய் ஆபத்தைக் குறைக்கவும் உதவும் சேர்மங்களைக் கொண்டுள்ளது'
      }
    ],
    {
      en: '1 cup cooked broccoli, 3-5 times per week',
      hi: '1 कप पकी हुई ब्रोकली, प्रति सप्ताह 3-5 बार',
      ta: '1 கப் சமைத்த ப்ரோக்கோலி, வாரத்திற்கு 3-5 முறை'
    }
  ),
  createFoodItem(
    'shrimp',
    {
      en: 'Shrimp',
      hi: 'झींगा',
      ta: 'இறால்'
    },
    {
      en: 'Small, delicate seafood with mild, sweet flavor',
      hi: 'हल्के, मीठे स्वाद वाले छोटे, नाजुक समुद्री भोजन',
      ta: 'மிதமான, இனிப்பு சுவையுடன் சிறிய, மென்மையான கடல் உணவு'
    },
    'Global',
    12.99,
    'https://cdn.pixabay.com/photo/2016/03/05/20/00/shrimp-1239425_640.jpg',
    ['seafood', 'shellfish', 'protein'],
    {
      calories: 84,
      carbs: 0,
      protein: 18,
      fat: 1.7,
      fiber: 0,
      vitamins: { 'B12': '21%', 'Selenium': '48%', 'Phosphorus': '12%' },
      omega3: 0.3
    },
    ['shellfish', 'crustacean'],
    true,
    [
      {
        en: 'Low in calories but high in protein and essential nutrients',
        hi: 'कैलोरी में कम लेकिन प्रोटीन और आवश्यक पोषक तत्वों में उच्च',
        ta: 'கலோரிகள் குறைவாகவும் ஆனால் புரதம் மற்றும் அத்தியாவசிய ஊட்டச்சத்துக்கள் அதிகமாகவும் உள்ளது'
      }
    ],
    {
      en: '4-6 ounces, 1-2 times per week',
      hi: '4-6 औंस, प्रति सप्ताह 1-2 बार',
      ta: '4-6 அவுன்ஸ், வாரத்திற்கு 1-2 முறை'
    }
  ),
  createFoodItem(
    'bell_pepper',
    {
      en: 'Bell Pepper',
      hi: 'शिमला मिर्च',
      ta: 'குடை மிளகாய்'
    },
    {
      en: 'Colorful, crunchy vegetable available in multiple colors, especially red, yellow and green',
      hi: 'कई रंगों में उपलब्ध रंगीन, कुरकुरी सब्जी, विशेष रूप से लाल, पीला और हरा',
      ta: 'பல வண்ணங்களில் கிடைக்கும் வண்ணமயமான, நொறுமுறுமுறுப்பான காய்கறி, குறிப்பாக சிவப்பு, மஞ்சள் மற்றும் பச்சை'
    },
    'Central America',
    1.49,
    'https://cdn.pixabay.com/photo/2016/03/05/19/02/pepper-1238256_640.jpg',
    ['vegetables', 'nightshade', 'colorful'],
    {
      calories: 31,
      carbs: 7.6,
      protein: 1,
      fat: 0.3,
      fiber: 2.5,
      vitamins: { 'C': '169%', 'A': '19%', 'B6': '20%' },
      antioxidants: { 'Capsanthin': 'high', 'Quercetin': 'medium' }
    },
    ['vegan', 'gluten-free'],
    false,
    [
      {
        en: 'Excellent source of vitamin C and antioxidants that may protect against cellular damage',
        hi: 'विटामिन सी और एंटीऑक्सिडेंट का उत्कृष्ट स्रोत जो सेलुलर क्षति से बचा सकता है',
        ta: 'வைட்டமின் சி மற்றும் செல் சேதத்திலிருந்து பாதுகாக்கக்கூடிய ஆன்டிஆக்ஸிடன்ட்களின் சிறந்த ஆதாரம்'
      }
    ],
    {
      en: '1/2 to 1 bell pepper daily, raw or cooked',
      hi: 'रोजाना 1/2 से 1 शिमला मिर्च, कच्ची या पकी हुई',
      ta: 'தினசரி 1/2 முதல் 1 குடை மிளகாய், பச்சையாக அல்லது சமைத்தது'
    }
  ),
  createFoodItem(
    'lobster',
    {
      en: 'Lobster',
      hi: 'लॉबस्टर',
      ta: 'இறால் மீன்'
    },
    {
      en: 'Premium shellfish with sweet, tender meat and rich flavor',
      hi: 'मीठा, कोमल मांस और समृद्ध स्वाद वाला प्रीमियम शेलफिश',
      ta: 'இனிப்பான, மென்மையான இறைச்சி மற்றும் வளமான சுவை கொண்ட பிரீமியம் சிப்பி'
    },
    'North Atlantic',
    24.99,
    'https://cdn.pixabay.com/photo/2016/03/05/19/13/lobster-1238247_640.jpg',
    ['seafood', 'shellfish', 'luxury'],
    {
      calories: 89,
      carbs: 0,
      protein: 19,
      fat: 0.9,
      fiber: 0,
      vitamins: { 'B12': '155%', 'Copper': '185%', 'Selenium': '56%' },
      omega3: 0.2
    },
    ['shellfish', 'crustacean'],
    false,
    [
      {
        en: 'Excellent source of lean protein, vitamin B12, and essential minerals',
        hi: 'दुबले प्रोटीन, विटामिन बी12, और आवश्यक खनिजों का उत्कृष्ट स्रोत',
        ta: 'குறைந்த கொழுப்புள்ள புரதம், வைட்டமின் பி12 மற்றும் அத்தியாவசிய தாதுக்களின் சிறந்த ஆதாரம்'
      }
    ],
    {
      en: '4-6 ounces, as a special occasion meal',
      hi: '4-6 औंस, एक विशेष अवसर के भोजन के रूप में',
      ta: '4-6 அவுன்ஸ், சிறப்பு நிகழ்வு உணவாக'
    }
  ),
  createFoodItem(
    'strawberry',
    {
      en: 'Strawberry',
      hi: 'स्ट्रॉबेरी',
      ta: 'ஸ்ட்ராபெரி'
    },
    {
      en: 'Sweet, juicy red berries with seeds on the outside',
      hi: 'बाहरी सतह पर बीजों के साथ मीठी, रसदार लाल बेरीज',
      ta: 'வெளிப்புறத்தில் விதைகளுடன் இனிப்பான, சாறுள்ள சிவப்பு பெர்ரிகள்'
    },
    'Global',
    3.99,
    'https://cdn.pixabay.com/photo/2018/04/29/11/54/strawberries-3359755_640.jpg',
    ['fruits', 'berries', 'summer'],
    {
      calories: 32,
      carbs: 7.7,
      protein: 0.7,
      fat: 0.3,
      fiber: 2,
      vitamins: { 'C': '97%', 'Manganese': '24%', 'Folate': '9%' },
      antioxidants: { 'Anthocyanins': 'high', 'Ellagic Acid': 'high' }
    },
    ['vegan', 'gluten-free'],
    true,
    [
      {
        en: 'Rich in antioxidants that may improve heart health and blood sugar control',
        hi: 'एंटीऑक्सिडेंट से भरपूर जो हृदय स्वास्थ्य और रक्त शर्करा नियंत्रण में सुधार कर सकते हैं',
        ta: 'இதய ஆரோக்கியத்தையும் இரத்த சர்க்கரை கட்டுப்பாட்டையும் மேம்படுத்தக்கூடிய ஆன்டிஆக்ஸிடன்ட்கள் நிறைந்தது'
      }
    ],
    {
      en: '1 cup fresh strawberries daily when in season',
      hi: 'मौसम में होने पर रोजाना 1 कप ताजी स्ट्रॉबेरी',
      ta: 'பருவகாலத்தில் தினசரி 1 கப் புதிய ஸ்ட்ராபெரி'
    }
  ),
  createFoodItem(
    'pork_chops',
    {
      en: 'Pork Chops',
      hi: 'पोर्क चॉप्स',
      ta: 'பன்றிக்கறி சாப்ஸ்'
    },
    {
      en: 'Tender cut of pork from the loin, often bone-in',
      hi: 'लॉइन से पोर्क का कोमल कट, अक्सर हड्डी सहित',
      ta: 'பன்றியின் இடுப்பில் இருந்து மென்மையான வெட்டு, பெரும்பாலும் எலும்புடன்'
    },
    'Global',
    7.99,
    'https://cdn.pixabay.com/photo/2017/11/10/15/04/pork-2936534_640.jpg',
    ['meat', 'pork', 'protein'],
    {
      calories: 231,
      carbs: 0,
      protein: 25,
      fat: 14,
      fiber: 0,
      vitamins: { 'Thiamin': '54%', 'Selenium': '65%', 'Zinc': '20%' },
      omega3: 0.1
    },
    ['meat', 'pork'],
    false,
    [
      {
        en: 'Good source of complete protein and essential vitamins and minerals',
        hi: 'पूर्ण प्रोटीन और आवश्यक विटामिन और खनिजों का अच्छा स्रोत',
        ta: 'முழுமையான புரதம் மற்றும் அத்தியாவசிய வைட்டமின்கள் மற்றும் தாதுக்களின் நல்ல ஆதாரம்'
      }
    ],
    {
      en: '3-4 ounce serving, 1-2 times per week',
      hi: '3-4 औंस परोसा जाता है, प्रति सप्ताह 1-2 बार',
      ta: '3-4 அவுன்ஸ் பரிமாறல், வாரத்திற்கு 1-2 முறை'
    }
  ),
  createFoodItem(
    'lamb_leg',
    {
      en: 'Lamb Leg',
      hi: 'मेमने की टांग',
      ta: 'ஆட்டுக்கால்'
    },
    {
      en: 'Tender, flavorful cut of young sheep meat',
      hi: 'युवा भेड़ के मांस का कोमल, स्वादिष्ट कट',
      ta: 'இளம் ஆட்டு இறைச்சியின் மென்மையான, சுவையான வெட்டு'
    },
    'Global',
    14.99,
    'https://cdn.pixabay.com/photo/2017/12/29/12/03/lamb-3047152_640.jpg',
    ['meat', 'lamb', 'protein'],
    {
      calories: 258,
      carbs: 0,
      protein: 25.6,
      fat: 16.5,
      fiber: 0,
      vitamins: { 'B12': '51%', 'Zinc': '30%', 'Selenium': '35%' },
      omega3: 0.4
    },
    ['meat', 'lamb'],
    false,
    [
      {
        en: 'Rich source of high-quality protein, iron, and B vitamins',
        hi: 'उच्च गुणवत्ता वाले प्रोटीन, आयरन और बी विटामिन का समृद्ध स्रोत',
        ta: 'உயர் தரமான புரதம், இரும்பு மற்றும் பி வைட்டமின்களின் செறிவான ஆதாரம்'
      }
    ],
    {
      en: '3-4 ounce serving, 1-2 times per week',
      hi: '3-4 औंस परोसा जाता है, प्रति सप्ताह 1-2 बार',
      ta: '3-4 அவுன்ஸ் பரிமாறல், வாரத்திற்கு 1-2 முறை'
    }
  ),
  createFoodItem(
    'carrot',
    {
      en: 'Carrot',
      hi: 'गाजर',
      ta: 'கேரட்'
    },
    {
      en: 'Sweet, crunchy orange root vegetable rich in beta-carotene',
      hi: 'बीटा-कैरोटीन से भरपूर मीठी, कुरकुरी नारंगी जड़ वाली सब्जी',
      ta: 'பீட்டா-கரோட்டீன் நிறைந்த இனிப்பான, நொறுமுறுமுறுப்பான ஆரஞ்சு வேர் காய்கறி'
    },
    'Central Asia',
    0.99,
    'https://cdn.pixabay.com/photo/2016/11/23/00/33/carrots-1851424_640.jpg',
    ['vegetables', 'root', 'orange'],
    {
      calories: 41,
      carbs: 9.6,
      protein: 0.9,
      fat: 0.2,
      fiber: 2.8,
      vitamins: { 'A': '428%', 'K': '13%', 'C': '9%' },
      antioxidants: { 'Beta-carotene': 'very high', 'Lutein': 'medium' }
    },
    ['vegan', 'gluten-free'],
    true,
    [
      {
        en: 'Excellent source of vitamin A in the form of beta-carotene, supporting eye health',
        hi: 'बीटा-कैरोटीन के रूप में विटामिन ए का उत्कृष्ट स्रोत, आंखों के स्वास्थ्य का समर्थन करता है',
        ta: 'பீட்டா-கரோட்டீன் வடிவில் வைட்டமின் ஏ-யின் சிறந்த ஆதாரம், கண் ஆரோக்கியத்தை ஆதரிக்கிறது'
      }
    ],
    {
      en: '1-2 medium carrots daily, raw or cooked',
      hi: 'रोजाना 1-2 मध्यम गाजर, कच्ची या पकी हुई',
      ta: 'தினசரி 1-2 நடுத்தர கேரட், பச்சையாக அல்லது சமைத்தது'
    }
  ),
  
  // Adding more fruits from the fruits list
  createFoodItem(
    'mango',
    {
      en: 'Mango',
      hi: 'आम',
      ta: 'மாம்பழம்'
    },
    {
      en: 'Sweet, juicy tropical fruit with golden-orange flesh',
      hi: 'मीठा, रसदार उष्णकटिबंधीय फल जिसका गूदा सुनहरा-नारंगी होता है',
      ta: 'இனிப்பான, சாறுள்ள வெப்பமண்டல பழம், தங்க-ஆரஞ்சு நிற சதைப்பகுதியுடன்'
    },
    'India',
    2.99,
    'https://cdn.pixabay.com/photo/2016/03/05/22/18/food-1239241_640.jpg',
    ['fruits', 'tropical', 'sweet'],
    {
      calories: 99,
      carbs: 24.7,
      protein: 1.4,
      fat: 0.6,
      fiber: 2.6,
      vitamins: { 'C': '67%', 'A': '25%', 'B6': '12%' },
      antioxidants: { 'Beta-carotene': 'high', 'Quercetin': 'medium' }
    },
    ['vegan', 'gluten-free'],
    true,
    [
      {
        en: 'Supports immune function and eye health with vitamins A and C',
        hi: 'विटामिन ए और सी के साथ प्रतिरक्षा प्रणाली और आंखों के स्वास्थ्य का समर्थन करता है',
        ta: 'வைட்டமின் ஏ மற்றும் சி உடன் நோய் எதிர்ப்பு செயல்பாடு மற்றும் கண் ஆரோக்கியத்தை ஆதரிக்கிறது'
      }
    ],
    {
      en: '1 medium mango as a snack or dessert',
      hi: 'नाश्ते या डेसर्ट के रूप में 1 मध्यम आम',
      ta: 'சிற்றுண்டி அல்லது இனிப்பாக 1 நடுத்தர மாம்பழம்'
    }
  ),
  
  createFoodItem(
    'kiwi',
    {
      en: 'Kiwi Fruit',
      hi: 'कीवी फल',
      ta: 'கிவி பழம்'
    },
    {
      en: 'Tangy, sweet fruit with bright green flesh and tiny black seeds',
      hi: 'चटपटा, मीठा फल जिसका गूदा हरा और छोटे काले बीज होते हैं',
      ta: 'புளிப்பான, இனிப்பான பழம், பிரகாசமான பச்சை சதைப்பகுதி மற்றும் சிறிய கருப்பு விதைகளுடன்'
    },
    'New Zealand',
    1.50,
    'https://cdn.pixabay.com/photo/2017/05/07/19/32/kiwi-2294181_640.jpg',
    ['fruits', 'tropical', 'tangy'],
    {
      calories: 61,
      carbs: 14.7,
      protein: 1.1,
      fat: 0.5,
      fiber: 3,
      vitamins: { 'C': '103%', 'K': '38%', 'E': '10%' },
      antioxidants: { 'Lutein': 'high', 'Zeaxanthin': 'medium' }
    },
    ['vegan', 'gluten-free'],
    false,
    [
      {
        en: 'Exceptionally high in vitamin C, supporting immune health and collagen production',
        hi: 'विटामिन सी में अत्यधिक उच्च, प्रतिरक्षा स्वास्थ्य और कोलेजन उत्पादन का समर्थन करता है',
        ta: 'வைட்டமின் சி அதிகம் உள்ளது, நோய் எதிர்ப்பு ஆரோக்கியம் மற்றும் கொலாஜன் உற்பத்தியை ஆதரிக்கிறது'
      }
    ],
    {
      en: '1-2 kiwi fruits daily for optimal vitamin C intake',
      hi: 'इष्टतम विटामिन सी सेवन के लिए रोजाना 1-2 कीवी फल',
      ta: 'அதிகபட்ச வைட்டமின் சி உட்கொள்ளலுக்கு தினசரி 1-2 கிவி பழங்கள்'
    }
  ),
  
  createFoodItem(
    'pomegranate',
    {
      en: 'Pomegranate',
      hi: 'अनार',
      ta: 'மாதுளை'
    },
    {
      en: 'Ruby-red fruit filled with jewel-like seeds (arils) that are juicy and sweet-tart',
      hi: 'रूबी-लाल फल जो मणि जैसे बीजों (एरिल्स) से भरा होता है जो रसदार और मीठे-खट्टे होते हैं',
      ta: 'ரூபி-சிவப்பு பழம், சாறுள்ள மற்றும் இனிப்பு-புளிப்பான நகைபோன்ற விதைகள் (அரில்கள்) நிறைந்தது'
    },
    'Middle East',
    3.49,
    'https://cdn.pixabay.com/photo/2019/10/29/09/33/pomegranate-4586457_640.jpg',
    ['fruits', 'antioxidant', 'superfood'],
    {
      calories: 83,
      carbs: 18.7,
      protein: 1.7,
      fat: 1.2,
      fiber: 4,
      vitamins: { 'C': '16%', 'K': '21%', 'Folate': '10%' },
      antioxidants: { 'Punicalagins': 'very high', 'Anthocyanins': 'high' }
    },
    ['vegan', 'gluten-free'],
    true,
    [
      {
        en: 'Packed with powerful antioxidants that may help reduce inflammation and protect against heart disease',
        hi: 'शक्तिशाली एंटीऑक्सिडेंट से भरपूर जो सूजन को कम करने और हृदय रोग से बचाने में मदद कर सकता है',
        ta: 'சக்திவாய்ந்த ஆன்டிஆக்ஸிடன்ட்களால் நிறைந்துள்ளது, இது அழற்சியைக் குறைக்கவும் இதய நோயிலிருந்து பாதுகாக்கவும் உதவலாம்'
      }
    ],
    {
      en: '1/2 to 1 pomegranate daily or 1/4 cup arils as a snack',
      hi: 'रोजाना 1/2 से 1 अनार या नाश्ते के रूप में 1/4 कप एरिल्स',
      ta: 'தினசரி 1/2 முதல் 1 மாதுளை அல்லது சிற்றுண்டியாக 1/4 கப் அரில்கள்'
    }
  ),
  
  // Adding vegetables from the vegetable list
  createFoodItem(
    'spinach_baby',
    {
      en: 'Baby Spinach',
      hi: 'बेबी पालक',
      ta: 'பேபி கீரை'
    },
    {
      en: 'Young, tender spinach leaves with mild flavor, harvested early for softer texture',
      hi: 'कोमल बनावट के लिए जल्दी काटे गए युवा, कोमल पालक के पत्ते जिनका स्वाद हल्का होता है',
      ta: 'மென்மையான அமைப்புக்காக ஆரம்பத்திலேயே அறுவடை செய்யப்பட்ட மிதமான சுவையுடன் கூடிய இளம், மென்மையான கீரை இலைகள்'
    },
    'Persia (Iran)',
    2.49,
    'https://cdn.pixabay.com/photo/2016/03/05/19/02/spinach-1238251_640.jpg',
    ['vegetables', 'leafy green', 'superfood', 'baby greens'],
    {
      calories: 23,
      carbs: 3.6,
      protein: 2.9,
      fat: 0.4,
      fiber: 2.2,
      vitamins: { 'K': '604%', 'A': '188%', 'Folate': '66%' },
      minerals: { 'Iron': '15%', 'Magnesium': '20%', 'Potassium': '15%' },
      antioxidants: { 'Lutein': 'very high', 'Zeaxanthin': 'high' }
    },
    ['vegan', 'gluten-free'],
    true,
    [
      {
        en: 'Highly nutritious green that supports bone health, eye health, and reduces oxidative stress',
        hi: 'अत्यधिक पौष्टिक हरी सब्जी जो हड्डियों के स्वास्थ्य, आंखों के स्वास्थ्य का समर्थन करती है और ऑक्सीडेटिव तनाव को कम करती है',
        ta: 'எலும்பு ஆரோக்கியம், கண் ஆரோக்கியத்தை ஆதரிக்கும் மற்றும் ஆக்ஸிஜனேற்ற அழுத்தத்தைக் குறைக்கும் அதிக ஊட்டச்சத்து நிறைந்த கீரை'
      }
    ],
    {
      en: '2-3 cups of fresh baby spinach daily, raw in salads or lightly cooked',
      hi: 'रोजाना 2-3 कप ताजा बेबी पालक, सलाद में कच्चा या हल्का पका हुआ',
      ta: 'தினசரி 2-3 கப் புதிய பேபி கீரை, சாலட்டில் பச்சையாக அல்லது லேசாக சமைத்தது'
    }
  ),
  
  createFoodItem(
    'cauliflower_organic',
    {
      en: 'Organic Cauliflower',
      hi: 'जैविक फूलगोभी',
      ta: 'ஆர்கானிக் காலிஃபிளவர்'
    },
    {
      en: 'Versatile cruciferous vegetable with dense white florets, organically grown',
      hi: 'घने सफेद फूलों वाली बहुमुखी क्रूसिफेरस सब्जी, जैविक रूप से उगाई गई',
      ta: 'அடர்த்தியான வெள்ளை பூக்கொத்துகளுடன் பலதரப்பட்ட குறுக்குச் செடி காய்கறி, இயற்கை முறையில் வளர்க்கப்பட்டது'
    },
    'Mediterranean',
    2.49,
    'https://cdn.pixabay.com/photo/2016/03/05/19/02/cauliflower-1238255_640.jpg',
    ['vegetables', 'cruciferous', 'keto-friendly', 'organic'],
    {
      calories: 25,
      carbs: 5,
      protein: 2,
      fat: 0.1,
      fiber: 2.5,
      vitamins: { 'C': '77%', 'K': '20%', 'B6': '11%' },
      antioxidants: { 'Glucosinolates': 'high', 'Isothiocyanates': 'high' }
    },
    ['vegan', 'gluten-free'],
    false,
    [
      {
        en: 'Low-carb vegetable that can help reduce inflammation and may aid in cancer prevention',
        hi: 'कम कार्ब्स वाली सब्जी जो सूजन को कम करने में मदद कर सकती है और कैंसर की रोकथाम में सहायता कर सकती है',
        ta: 'குறைந்த கார்போஹைட்ரேட் காய்கறி, அழற்சியைக் குறைக்க உதவும் மற்றும் புற்றுநோய் தடுப்பில் உதவலாம்'
      }
    ],
    {
      en: '1 cup cooked cauliflower, 3-4 times per week',
      hi: '1 कप पकी हुई फूलगोभी, प्रति सप्ताह 3-4 बार',
      ta: '1 கப் சமைத்த காலிஃபிளவர், வாரத்திற்கு 3-4 முறை'
    }
  ),
  
  createFoodItem(
    'eggplant',
    {
      en: 'Eggplant',
      hi: 'बैंगन',
      ta: 'கத்தரிக்காய்'
    },
    {
      en: 'Glossy purple vegetable with spongy flesh and mild flavor',
      hi: 'चमकदार बैंगनी सब्जी जिसमें स्पंजी गूदा और हल्का स्वाद होता है',
      ta: 'பளபளப்பான ஊதா நிற காய்கறி, ஸ்பான்ஜி போன்ற தசை மற்றும் மிதமான சுவையுடன்'
    },
    'India',
    1.79,
    'https://cdn.pixabay.com/photo/2016/09/10/17/47/eggplant-1659784_640.jpg',
    ['vegetables', 'nightshade', 'low-calorie'],
    {
      calories: 25,
      carbs: 6,
      protein: 1,
      fat: 0.2,
      fiber: 3,
      vitamins: { 'B6': '5%', 'K': '4%', 'C': '3%' },
      antioxidants: { 'Nasunin': 'high', 'Chlorogenic Acid': 'medium' }
    },
    ['vegan', 'gluten-free'],
    false,
    [
      {
        en: 'Contains compounds that may help lower cholesterol and improve heart health',
        hi: 'ऐसे यौगिक होते हैं जो कोलेस्ट्रॉल को कम करने और हृदय स्वास्थ्य में सुधार करने में मदद कर सकते हैं',
        ta: 'கொலஸ்ட்ரோலைக் குறைக்கவும் இதய ஆரோக்கியத்தை மேம்படுத்தவும் உதவும் சேர்மங்களைக் கொண்டுள்ளது'
      }
    ],
    {
      en: '1 cup cooked eggplant, 2-3 times per week',
      hi: '1 कप पका हुआ बैंगन, प्रति सप्ताह 2-3 बार',
      ta: '1 கப் சமைத்த கத்தரிக்காய், வாரத்திற்கு 2-3 முறை'
    }
  ),
  
  // Adding non-vegetarian foods
  createFoodItem(
    'salmon_wild',
    {
      en: 'Wild-Caught Salmon',
      hi: 'जंगली पकड़ी गई सामन मछली',
      ta: 'இயற்கையாக பிடிக்கப்பட்ட சாமன் மீன்'
    },
    {
      en: 'Wild-caught oily fish with pink-orange flesh, rich in omega-3 fatty acids',
      hi: 'गुलाबी-नारंगी मांस वाली जंगली पकड़ी गई तैलीय मछली, ओमेगा-3 फैटी एसिड से भरपूर',
      ta: 'இளஞ்சிவப்பு-ஆரஞ்சு இறைச்சி கொண்ட இயற்கையாக பிடிக்கப்பட்ட எண்ணெய் மீன், ஒமேகா-3 கொழுப்பு அமிலங்கள் நிறைந்தது'
    },
    'Pacific Ocean',
    12.99,
    'https://cdn.pixabay.com/photo/2016/03/05/19/02/salmon-1238248_640.jpg',
    ['seafood', 'fish', 'omega-3', 'wild-caught'],
    {
      calories: 206,
      carbs: 0,
      protein: 22,
      fat: 13,
      fiber: 0,
      vitamins: { 'B12': '237%', 'D': '127%', 'B6': '38%' },
      minerals: { 'Selenium': '53%', 'Phosphorus': '26%' },
      omega3: 2.3
    },
    ['fish', 'pescatarian'],
    true,
    [
      {
        en: 'Excellent source of omega-3 fatty acids that support heart and brain health',
        hi: 'ओमेगा-3 फैटी एसिड का उत्कृष्ट स्रोत जो हृदय और मस्तिष्क के स्वास्थ्य का समर्थन करता है',
        ta: 'இதயம் மற்றும் மூளை ஆரோக்கியத்தை ஆதரிக்கும் ஒமேகா-3 கொழுப்பு அமிலங்களின் சிறந்த ஆதாரம்'
      }
    ],
    {
      en: '4-6 ounce portion, 2-3 times per week',
      hi: '4-6 औंस हिस्सा, प्रति सप्ताह 2-3 बार',
      ta: '4-6 அவுன்ஸ் பகுதி, வாரத்திற்கு 2-3 முறை'
    }
  ),
  
  createFoodItem(
    'chicken_breast_boneless',
    {
      en: 'Boneless Chicken Breast',
      hi: 'हड्डी रहित चिकन ब्रेस्ट',
      ta: 'எலும்பு இல்லாத கோழி மார்புக்கறி'
    },
    {
      en: 'Lean white meat cut from the breast of chicken, boneless, low in fat and high in protein',
      hi: 'चिकन के छाती से काटा गया दुबला सफेद मांस, हड्डी रहित, वसा में कम और प्रोटीन में उच्च',
      ta: 'கோழியின் மார்பிலிருந்து வெட்டப்பட்ட குறைந்த கொழுப்புள்ள வெள்ளை இறைச்சி, எலும்பு இல்லாத, குறைந்த கொழுப்பு மற்றும் அதிக புரதம் கொண்டது'
    },
    'Global',
    5.99,
    'https://cdn.pixabay.com/photo/2017/06/02/20/35/chicken-2367685_640.jpg',
    ['meat', 'poultry', 'protein', 'boneless'],
    {
      calories: 165,
      carbs: 0,
      protein: 31,
      fat: 3.6,
      fiber: 0,
      vitamins: { 'B6': '25%', 'B3': '87%', 'B12': '10%' },
      minerals: { 'Selenium': '36%', 'Phosphorus': '21%' }
    },
    ['meat', 'poultry'],
    true,
    [
      {
        en: 'Excellent source of lean protein for muscle building and repair',
        hi: 'मांसपेशियों के निर्माण और मरम्मत के लिए दुबले प्रोटीन का उत्कृष्ट स्रोत',
        ta: 'தசை வளர்ச்சி மற்றும் பழுதுபார்ப்புக்கான குறைந்த கொழுப்புள்ள புரதத்தின் சிறந்த ஆதாரம்'
      }
    ],
    {
      en: '3-4 ounce portion, as part of a balanced meal',
      hi: 'संतुलित भोजन के हिस्से के रूप में 3-4 औंस हिस्सा',
      ta: 'சமநிலை உணவின் ஒரு பகுதியாக 3-4 அவுன்ஸ் பகுதி'
    }
  ),
  
  createFoodItem(
    'eggs_free_range',
    {
      en: 'Free-Range Eggs',
      hi: 'मुक्त रेंज वाले अंडे',
      ta: 'சுதந்திரமாக வளர்க்கப்பட்ட முட்டைகள்'
    },
    {
      en: 'Versatile protein source from free-range chickens with nutrient-rich yolk and high-protein white',
      hi: 'मुक्त रेंज वाली मुर्गियों से पोषक तत्वों से भरपूर यॉक और उच्च प्रोटीन श्वेत के साथ बहुमुखी प्रोटीन स्रोत',
      ta: 'சுதந்திரமாக வளர்க்கப்பட்ட கோழிகளின் ஊட்டச்சத்து நிறைந்த மஞ்சள் கரு மற்றும் அதிக புரதம் கொண்ட வெள்ளைப் பகுதியுடன் பலதரப்பட்ட புரத ஆதாரம்'
    },
    'Global',
    2.99,
    'https://cdn.pixabay.com/photo/2018/03/11/18/23/eggs-3217675_640.jpg',
    ['protein', 'dairy-alternative', 'breakfast', 'free-range'],
    {
      calories: 72,
      carbs: 0.4,
      protein: 6.3,
      fat: 5,
      fiber: 0,
      vitamins: { 'B12': '21%', 'B2': '16%', 'A': '8%' },
      minerals: { 'Selenium': '28%', 'Phosphorus': '9%' },
      omega3: 0.1,
      collagen: 0
    },
    ['eggs'],
    true,
    [
      {
        en: 'Complete protein source containing all essential amino acids and important nutrients like choline',
        hi: 'सभी आवश्यक अमीनो एसिड और कोलीन जैसे महत्वपूर्ण पोषक तत्वों वाला पूर्ण प्रोटीन स्रोत',
        ta: 'அனைத்து அத்தியாவசிய அமினோ அமிலங்கள் மற்றும் கோலின் போன்ற முக்கியமான ஊட்டச்சத்துக்களைக் கொண்ட முழுமையான புரத ஆதாரம்'
      }
    ],
    {
      en: '1-2 eggs daily for most healthy adults',
      hi: 'अधिकांश स्वस्थ वयस्कों के लिए रोजाना 1-2 अंडे',
      ta: 'பெரும்பாலான ஆரோக்கியமான வயது வந்தவர்களுக்கு தினசரி 1-2 முட்டைகள்'
    }
  ),
  
  // Adding some grocery ingredients
  createFoodItem(
    'quinoa_organic',
    {
      en: 'Organic Quinoa',
      hi: 'जैविक क्विनोआ',
      ta: 'ஆர்கானிக் குயினோவா'
    },
    {
      en: 'Nutrient-rich pseudocereal with a fluffy texture when cooked, organically grown',
      hi: 'पकाने पर रुई जैसी बनावट वाला पोषक तत्वों से भरपूर जैविक रूप से उगाया गया छद्म अनाज',
      ta: 'சமைக்கும்போது புஷ்பவடிவ அமைப்புடன் ஊட்டச்சத்து நிறைந்த போலி தானியம், இயற்கை முறையில் வளர்க்கப்பட்டது'
    },
    'South America',
    4.99,
    'https://cdn.pixabay.com/photo/2015/04/10/00/22/quinoa-715625_640.jpg',
    ['grains', 'protein', 'gluten-free', 'organic'],
    {
      calories: 120,
      carbs: 21.3,
      protein: 4.4,
      fat: 1.9,
      fiber: 2.8,
      vitamins: { 'B1': '10%', 'B6': '11%', 'Folate': '19%' },
      minerals: { 'Magnesium': '30%', 'Phosphorus': '28%', 'Iron': '15%' }
    },
    ['vegan', 'gluten-free'],
    false,
    [
      {
        en: 'Complete plant protein containing all nine essential amino acids',
        hi: 'सभी नौ आवश्यक अमीनो एसिड वाला पूर्ण पौधे का प्रोटीन',
        ta: 'அனைத்து ஒன்பது அத்தியாவசிய அமினோ அமிலங்களையும் கொண்ட முழுமையான தாவர புரதம்'
      }
    ],
    {
      en: '1/2 cup cooked quinoa as a side dish or base for bowls',
      hi: 'साइड डिश या बाउल के आधार के रूप में 1/2 कप पका हुआ क्विनोआ',
      ta: 'பக்க உணவாக அல்லது பவுல்களுக்கான அடிப்படையாக 1/2 கப் சமைத்த குயினோவா'
    }
  ),
  
  createFoodItem(
    'lentils',
    {
      en: 'Lentils',
      hi: 'दाल',
      ta: 'பருப்பு'
    },
    {
      en: 'Small, lens-shaped legumes available in various colors including green, brown, and red',
      hi: 'छोटी, लेंस के आकार की फलियां जो हरे, भूरे और लाल सहित विभिन्न रंगों में उपलब्ध हैं',
      ta: 'சிறிய, லென்ஸ் வடிவ பருப்பு வகைகள், பச்சை, பழுப்பு மற்றும் சிவப்பு உள்ளிட்ட பல வண்ணங்களில் கிடைக்கின்றன'
    },
    'Middle East',
    1.49,
    'https://cdn.pixabay.com/photo/2015/09/03/08/05/lentils-919384_640.jpg',
    ['legumes', 'protein', 'fiber'],
    {
      calories: 115,
      carbs: 20,
      protein: 9,
      fat: 0.4,
      fiber: 8,
      vitamins: { 'B1': '22%', 'B6': '18%', 'Folate': '90%' },
      minerals: { 'Iron': '37%', 'Phosphorus': '18%', 'Potassium': '16%' }
    },
    ['vegan', 'gluten-free'],
    false,
    [
      {
        en: 'Excellent plant-based source of protein and fiber that may help lower cholesterol',
        hi: 'प्रोटीन और फाइबर का उत्कृष्ट पौधे-आधारित स्रोत जो कोलेस्ट्रॉल को कम करने में मदद कर सकता है',
        ta: 'புரதம் மற்றும் நார்ச்சத்தின் சிறந்த தாவர அடிப்படையிலான ஆதாரம், இது கொலஸ்ட்ரோலைக் குறைக்க உதவலாம்'
      }
    ],
    {
      en: '1/2 cup cooked lentils, 3-4 times per week',
      hi: '1/2 कप पकी हुई दाल, प्रति सप्ताह 3-4 बार',
      ta: '1/2 கப் சமைத்த பருப்பு, வாரத்திற்கு 3-4 முறை'
    }
  ),
  
  createFoodItem(
    'olive_oil',
    {
      en: 'Olive Oil',
      hi: 'जैतून का तेल',
      ta: 'ஆலிவ் எண்ணெய்'
    },
    {
      en: 'Heart-healthy plant oil extracted from olives, with fruity flavor and golden-green color',
      hi: 'जैतून से निकाला गया हृदय-स्वस्थ वनस्पति तेल, फलदार स्वाद और सुनहरे-हरे रंग के साथ',
      ta: 'ஆலிவ்களில் இருந்து பிரித்தெடுக்கப்பட்ட இதய-ஆரோக்கியமான தாவர எண்ணெய், பழச்சுவை மற்றும் தங்க-பச்சை நிறத்துடன்'
    },
    'Mediterranean',
    8.99,
    'https://cdn.pixabay.com/photo/2018/08/08/12/51/olive-oil-3592937_640.jpg',
    ['oils', 'mediterranean', 'healthy-fats'],
    {
      calories: 119,
      carbs: 0,
      protein: 0,
      fat: 14,
      fiber: 0,
      vitamins: { 'E': '10%', 'K': '8%' },
      omega3: 0.1,
      omega9: 9.8,
      antioxidants: { 'Oleocanthal': 'high', 'Oleuropein': 'medium' }
    },
    ['vegan', 'gluten-free'],
    true,
    [
      {
        en: 'Rich in heart-healthy monounsaturated fats and antioxidants that may reduce inflammation',
        hi: 'हृदय-स्वस्थ मोनोअनसैचुरेटेड वसा और एंटीऑक्सिडेंट से भरपूर जो सूजन को कम कर सकता है',
        ta: 'இதயத்திற்கு ஆரோக்கியமான மோனோஅன்சாச்சுரேட்டட் கொழுப்புகள் மற்றும் அழற்சியைக் குறைக்கக்கூடிய ஆன்டிஆக்ஸிடன்ட்கள் நிறைந்தது'
      }
    ],
    {
      en: '1-2 tablespoons daily as part of a healthy diet',
      hi: 'स्वस्थ आहार के हिस्से के रूप में रोजाना 1-2 बड़े चम्मच',
      ta: 'ஆரோக்கியமான உணவின் ஒரு பகுதியாக தினசரி 1-2 மேஜைக்கரண்டி'
    }
  ),
  
  // Adding more vegetables
  createFoodItem(
    'asparagus',
    {
      en: 'Asparagus',
      hi: 'शतावरी',
      ta: 'அஸ்பாரகஸ்'
    },
    {
      en: 'Tender spring vegetable with tall, slender stalks and pointed tips',
      hi: 'लंबे, पतले तने और नुकीले सिरों वाली कोमल वसंत सब्जी',
      ta: 'உயரமான, மெலிந்த தண்டுகள் மற்றும் கூர்மையான நுனிகளுடன் கூடிய மென்மையான வசந்த காய்கறி'
    },
    'Mediterranean',
    3.99,
    'https://cdn.pixabay.com/photo/2019/03/08/11/09/asparagus-4041925_640.jpg',
    ['vegetables', 'stem', 'spring'],
    {
      calories: 20,
      carbs: 3.7,
      protein: 2.2,
      fat: 0.2,
      fiber: 2.1,
      vitamins: { 'K': '57%', 'A': '20%', 'Folate': '68%' },
      minerals: { 'Copper': '10%', 'Iron': '5%' },
      antioxidants: { 'Glutathione': 'high', 'Rutin': 'medium' }
    },
    ['vegan', 'gluten-free'],
    false,
    [
      {
        en: 'Natural diuretic that may help flush excess fluid and support kidney health',
        hi: 'प्राकृतिक मूत्रवर्धक जो अतिरिक्त तरल पदार्थ को बाहर निकालने और गुर्दे के स्वास्थ्य का समर्थन करने में मदद कर सकता है',
        ta: 'இயற்கை சிறுநீர் பெருக்கி, அதிகப்படியான திரவத்தை வெளியேற்றவும் சிறுநீரக ஆரோக்கியத்தை ஆதரிக்கவும் உதவும்'
      }
    ],
    {
      en: '1 cup cooked asparagus, several times per week in season',
      hi: 'मौसम में प्रति सप्ताह कई बार 1 कप पकी हुई शतावरी',
      ta: 'பருவத்தில் வாரத்திற்கு பல முறை 1 கப் சமைத்த அஸ்பாரகஸ்'
    }
  ),
  
  createFoodItem(
    'avocado_hass',
    {
      en: 'Hass Avocado',
      hi: 'हास एवोकैडो',
      ta: 'ஹாஸ் அவகேடோ'
    },
    {
      en: 'Creamy Hass variety fruit with green-black skin, mild flavor and buttery texture',
      hi: 'हरे-काले छिलके वाला क्रीमी हास किस्म का फल, हल्के स्वाद और मक्खन जैसी बनावट के साथ',
      ta: 'பச்சை-கருப்பு தோலுடன் கூடிய கிரீமியான ஹாஸ் வகை பழம், மிதமான சுவை மற்றும் வெண்ணெய் போன்ற அமைப்புடன்'
    },
    'Mexico',
    1.50,
    'https://cdn.pixabay.com/photo/2017/05/19/20/28/avocado-2327811_640.jpg',
    ['fruits', 'healthy-fats', 'superfood', 'hass'],
    {
      calories: 160,
      carbs: 9,
      protein: 2,
      fat: 15,
      fiber: 7,
      vitamins: { 'K': '26%', 'C': '17%', 'E': '10%' },
      minerals: { 'Potassium': '14%', 'Folate': '20%', 'Copper': '9%' },
      omega3: 0.1,
      omega6: 1.7,
      omega9: 9.1
    },
    ['vegan', 'gluten-free'],
    true,
    [
      {
        en: 'Nutrient-dense fruit rich in heart-healthy monounsaturated fats and fiber',
        hi: 'हृदय-स्वस्थ मोनोअनसैचुरेटेड वसा और फाइबर से भरपूर पोषक तत्वों से भरपूर फल',
        ta: 'இதயத்திற்கு ஆரோக்கியமான மோனோஅன்சாச்சுரேட்டட் கொழுப்புகள் மற்றும் நார்ச்சத்து நிறைந்த ஊட்டச்சத்து நிறைந்த பழம்'
      }
    ],
    {
      en: '1/2 to 1 avocado daily as part of meals or snacks',
      hi: 'भोजन या नाश्ते के हिस्से के रूप में रोजाना 1/2 से 1 एवोकैडो',
      ta: 'உணவு அல்லது சிற்றுண்டிகளின் ஒரு பகுதியாக தினசரி 1/2 முதல் 1 அவகேடோ வரை'
    }
  ),
  
  createFoodItem(
    'kale_fresh',
    {
      en: 'Fresh Kale',
      hi: 'ताजा केल',
      ta: 'புத்தம் புதிய கேல்'
    },
    {
      en: 'Nutrient-dense dark leafy green with curly or flat leaves, freshly harvested',
      hi: 'घुंघराले या चपटे पत्तों वाला पोषक तत्वों से भरपूर ताजा काटा गया गहरा पत्तेदार हरा',
      ta: 'சுருள் அல்லது தட்டையான இலைகளுடன் ஊட்டச்சத்து நிறைந்த அடர் இலைக்கறி, புதிதாக அறுவடை செய்யப்பட்டது'
    },
    'Mediterranean',
    2.99,
    'https://cdn.pixabay.com/photo/2022/01/03/19/09/kale-6913884_640.jpg',
    ['vegetables', 'leafy green', 'superfood', 'fresh'],
    {
      calories: 33,
      carbs: 7,
      protein: 2.2,
      fat: 0.5,
      fiber: 2.6,
      vitamins: { 'K': '684%', 'A': '206%', 'C': '134%' },
      minerals: { 'Manganese': '26%', 'Calcium': '9%' },
      antioxidants: { 'Quercetin': 'high', 'Kaempferol': 'high' }
    },
    ['vegan', 'gluten-free'],
    true,
    [
      {
        en: 'One of the most nutrient-dense foods on the planet, high in antioxidants that fight inflammation',
        hi: 'दुनिया के सबसे अधिक पोषक तत्वों वाले खाद्य पदार्थों में से एक, सूजन से लड़ने वाले एंटीऑक्सिडेंट में उच्च',
        ta: 'கிரகத்தில் மிகவும் ஊட்டச்சத்து நிறைந்த உணவுகளில் ஒன்று, அழற்சியை எதிர்த்துப் போராடும் ஆன்டிஆக்ஸிடன்ட்கள் அதிகம் உள்ளது'
      }
    ],
    {
      en: '1-2 cups of raw kale or 1/2 cup cooked kale, several times per week',
      hi: 'प्रति सप्ताह कई बार 1-2 कप कच्ची केल या 1/2 कप पकी हुई केल',
      ta: 'வாரத்திற்கு பல முறை 1-2 கப் பச்சை கேல் அல்லது 1/2 கப் சமைத்த கேல்'
    }
  ),
  
  // Adding more fruits
  createFoodItem(
    'blueberry',
    {
      en: 'Blueberry',
      hi: 'ब्लूबेरी',
      ta: 'புளூபெர்ரி'
    },
    {
      en: 'Small, sweet-tart blue-purple berries with powerful antioxidant properties',
      hi: 'शक्तिशाली एंटीऑक्सिडेंट गुणों वाली छोटी, मीठी-खट्टी नीली-बैंगनी बेरीज',
      ta: 'சக்திவாய்ந்த ஆன்டிஆக்ஸிடன்ட் பண்புகளைக் கொண்ட சிறிய, இனிப்பு-புளிப்பான நீல-ஊதா பெர்ரி பழங்கள்'
    },
    'North America',
    4.99,
    'https://cdn.pixabay.com/photo/2017/05/07/19/32/blueberries-2294181_640.jpg',
    ['fruits', 'berries', 'antioxidants'],
    {
      calories: 57,
      carbs: 14.5,
      protein: 0.7,
      fat: 0.3,
      fiber: 2.4,
      vitamins: { 'K': '24%', 'C': '16%', 'Manganese': '25%' },
      antioxidants: { 'Anthocyanins': 'very high', 'Resveratrol': 'medium' }
    },
    ['vegan', 'gluten-free'],
    true,
    [
      {
        en: 'Packed with antioxidants that may improve brain function, heart health, and blood sugar control',
        hi: 'एंटीऑक्सिडेंट से भरपूर जो मस्तिष्क के कार्य, हृदय स्वास्थ्य और रक्त शर्करा नियंत्रण में सुधार कर सकता है',
        ta: 'மூளை செயல்பாடு, இதய ஆரோக்கியம் மற்றும் இரத்த சர்க்கரை கட்டுப்பாட்டை மேம்படுத்தக்கூடிய ஆன்டிஆக்ஸிடன்ட்கள் நிறைந்துள்ளது'
      }
    ],
    {
      en: '1/2 cup fresh or frozen blueberries daily',
      hi: 'रोजाना 1/2 कप ताजी या जमी हुई ब्लूबेरी',
      ta: 'தினசரி 1/2 கப் புதிய அல்லது உறைந்த புளூபெர்ரி'
    }
  ),
  
  createFoodItem(
    'orange',
    {
      en: 'Orange',
      hi: 'संतरा',
      ta: 'ஆரஞ்சு'
    },
    {
      en: 'Juicy citrus fruit with bright orange skin and sweet-tart segmented flesh',
      hi: 'चमकदार नारंगी त्वचा और मीठे-खट्टे खंडित गूदे वाला रसदार साइट्रस फल',
      ta: 'பிரகாசமான ஆரஞ்சு தோல் மற்றும் இனிப்பு-புளிப்பான பிரிக்கப்பட்ட சதைப்பகுதி கொண்ட சாறுள்ள சிட்ரஸ் பழம்'
    },
    'China',
    0.99,
    'https://cdn.pixabay.com/photo/2017/01/20/15/06/oranges-1995056_640.jpg',
    ['fruits', 'citrus', 'vitamin-c'],
    {
      calories: 62,
      carbs: 15.4,
      protein: 1.2,
      fat: 0.2,
      fiber: 3.1,
      vitamins: { 'C': '93%', 'B1': '11%', 'Folate': '10%' },
      minerals: { 'Potassium': '5%', 'Calcium': '5%' },
      antioxidants: { 'Hesperidin': 'high', 'Limonene': 'high' }
    },
    ['vegan', 'gluten-free'],
    true,
    [
      {
        en: 'Excellent source of vitamin C, supporting immune function and collagen production',
        hi: 'विटामिन सी का उत्कृष्ट स्रोत, प्रतिरक्षा प्रणाली और कोलेजन उत्पादन का समर्थन करता है',
        ta: 'வைட்டமின் சி-யின் சிறந்த ஆதாரம், நோய் எதிர்ப்பு செயல்பாடு மற்றும் கொலாஜன் உற்பத்தியை ஆதரிக்கிறது'
      }
    ],
    {
      en: '1 medium orange daily, or 1/2 cup freshly squeezed orange juice',
      hi: 'रोजाना 1 मध्यम संतरा, या 1/2 कप ताजा निचोड़ा हुआ संतरे का रस',
      ta: 'தினசரி 1 நடுத்தர ஆரஞ்சு, அல்லது 1/2 கப் புதிதாக பிழிந்த ஆரஞ்சு ஜூஸ்'
    }
  ),
  
  // Adding more non-vegetarian foods
  createFoodItem(
    'tuna',
    {
      en: 'Tuna',
      hi: 'ट्यूना मछली',
      ta: 'டூனா மீன்'
    },
    {
      en: 'Firm-fleshed ocean fish with meaty texture and mild flavor, available fresh or canned',
      hi: 'मांसल बनावट और हल्के स्वाद वाली दृढ़ मांस वाली समुद्री मछली, ताजा या डिब्बाबंद रूप में उपलब्ध',
      ta: 'இறைச்சி அமைப்பு மற்றும் மிதமான சுவையுடன் கூடிய உறுதியான சதைப்பகுதி கொண்ட கடல் மீன், புதியதாக அல்லது டின்னில் அடைக்கப்பட்டதாக கிடைக்கிறது'
    },
    'Pacific Ocean',
    9.99,
    'https://cdn.pixabay.com/photo/2016/03/05/23/02/tuna-1239347_640.jpg',
    ['seafood', 'fish', 'lean-protein'],
    {
      calories: 144,
      carbs: 0,
      protein: 30,
      fat: 1,
      fiber: 0,
      vitamins: { 'B12': '153%', 'B6': '53%', 'B3': '65%' },
      minerals: { 'Selenium': '167%', 'Phosphorus': '25%' },
      omega3: 0.8
    },
    ['fish', 'pescatarian'],
    true,
    [
      {
        en: 'High-quality protein source rich in omega-3 fatty acids and selenium',
        hi: 'ओमेगा-3 फैटी एसिड और सेलेनियम से भरपूर उच्च गुणवत्ता वाला प्रोटीन स्रोत',
        ta: 'ஒமேகா-3 கொழுப்பு அமிலங்கள் மற்றும் செலினியம் நிறைந்த உயர்தர புரத ஆதாரம்'
      }
    ],
    {
      en: '4-6 ounce portion, 1-2 times per week (limiting albacore/yellowfin due to mercury)',
      hi: '4-6 औंस हिस्सा, प्रति सप्ताह 1-2 बार (पारा के कारण अल्बाकोर/येलोफिन को सीमित करना)',
      ta: '4-6 அவுன்ஸ் பகுதி, வாரத்திற்கு 1-2 முறை (பாதரசம் காரணமாக ஆல்பகோர்/யெல்லோஃபின் மீன்களை மட்டுப்படுத்துதல்)'
    }
  ),
  
  createFoodItem(
    'lamb_chops',
    {
      en: 'Lamb Chops',
      hi: 'लैम्ब चॉप्स',
      ta: 'ஆட்டுக்கறி சாப்ஸ்'
    },
    {
      en: 'Tender, flavorful cuts of meat from young sheep, typically from the rib, loin, or shoulder',
      hi: 'युवा भेड़ के मांस के कोमल, स्वादिष्ट कट, आमतौर पर पसली, कमर, या कंधे से',
      ta: 'இளம் ஆடுகளிலிருந்து மென்மையான, சுவையான இறைச்சி, பொதுவாக விலா, இடுப்பு அல்லது தோள் பகுதியிலிருந்து'
    },
    'Australia/New Zealand',
    16.99,
    'https://cdn.pixabay.com/photo/2019/04/21/19/44/lamb-chops-4146378_640.jpg',
    ['meat', 'lamb', 'high-protein'],
    {
      calories: 310,
      carbs: 0,
      protein: 22,
      fat: 24,
      fiber: 0,
      vitamins: { 'B12': '71%', 'B3': '35%', 'B2': '22%' },
      minerals: { 'Zinc': '36%', 'Selenium': '27%', 'Iron': '14%' },
      omega3: 0.5
    },
    ['meat', 'lamb'],
    false,
    [
      {
        en: 'Rich source of complete protein, zinc, and B vitamins important for immune function',
        hi: 'प्रतिरक्षा प्रणाली के लिए महत्वपूर्ण पूर्ण प्रोटीन, जिंक और बी विटामिन का समृद्ध स्रोत',
        ta: 'நோய் எதிர்ப்பு செயல்பாட்டிற்கு முக்கியமான முழுமையான புரதம், துத்தநாகம் மற்றும் பி வைட்டமின்களின் செறிவான ஆதாரம்'
      }
    ],
    {
      en: '2-3 lamb chops as an occasional main dish',
      hi: 'कभी-कभी मुख्य व्यंजन के रूप में 2-3 लैम्ब चॉप्स',
      ta: 'அவ்வப்போது முக்கிய உணவாக 2-3 ஆட்டுக்கறி சாப்ஸ்'
    }
  ),
  
  // Adding more grocery items
  createFoodItem(
    'almonds_raw',
    {
      en: 'Raw Almonds',
      hi: 'कच्चे बादाम',
      ta: 'பச்சை பாதாம் பருப்பு'
    },
    {
      en: 'Crunchy, nutrient-dense raw tree nuts with brown skin and cream-colored interior',
      hi: 'कुरकुरे, पोषक तत्वों से भरपूर कच्चे पेड़ के मेवे जिनकी भूरी त्वचा और क्रीम रंग का आंतरिक भाग होता है',
      ta: 'பழுப்பு நிற தோல் மற்றும் வெண்ணிற உள்ளுறையுடன் கூடிய நொறுமுறுமுறுப்பான, ஊட்டச்சத்து நிறைந்த பச்சை மரக்கொட்டைகள்'
    },
    'Mediterranean',
    7.99,
    'https://cdn.pixabay.com/photo/2017/05/01/05/18/pastry-2274750_640.jpg',
    ['nuts', 'protein', 'healthy-fats', 'raw'],
    {
      calories: 161,
      carbs: 6,
      protein: 6,
      fat: 14,
      fiber: 3.5,
      vitamins: { 'E': '37%', 'B2': '17%', 'Manganese': '32%' },
      minerals: { 'Magnesium': '20%', 'Phosphorus': '15%' },
      antioxidants: { 'Flavonoids': 'high', 'Resveratrol': 'low' }
    },
    ['vegan', 'gluten-free'],
    true,
    [
      {
        en: 'Heart-healthy nuts that may help lower cholesterol and reduce blood pressure',
        hi: 'हृदय-स्वस्थ मेवे जो कोलेस्ट्रॉल को कम करने और रक्तचाप को कम करने में मदद कर सकते हैं',
        ta: 'கொலஸ்ட்ரோலைக் குறைக்கவும் இரத்த அழுத்தத்தைக் குறைக்கவும் உதவக்கூடிய இதய ஆரோக்கியமான கொட்டைகள்'
      }
    ],
    {
      en: '1 ounce (23 almonds) daily as a snack or added to meals',
      hi: 'नाश्ते के रूप में या भोजन में जोड़कर रोजाना 1 औंस (23 बादाम)',
      ta: 'சிற்றுண்டியாக அல்லது உணவுகளில் சேர்த்து தினசரி 1 அவுன்ஸ் (23 பாதாம் பருப்பு)'
    }
  ),
  
  createFoodItem(
    'greek_yogurt_nonfat',
    {
      en: 'Non-Fat Greek Yogurt',
      hi: 'बिना वसा वाला ग्रीक योगर्ट',
      ta: 'கொழுப்பு இல்லாத கிரேக்க தயிர்'
    },
    {
      en: 'Thick, strained non-fat yogurt with creamy texture and tangy flavor, higher in protein than regular yogurt',
      hi: 'क्रीमी बनावट और खट्टे स्वाद वाला बिना वसा वाला मोटा, छना हुआ दही, नियमित दही की तुलना में प्रोटीन में अधिक',
      ta: 'கிரீமி அமைப்பு மற்றும் புளிப்பு சுவையுடன் கூடிய கொழுப்பு இல்லாத கெட்டியான, வடிகட்டப்பட்ட தயிர், சாதாரண தயிரை விட புரதம் அதிகம் கொண்டது'
    },
    'Greece',
    3.99,
    'https://cdn.pixabay.com/photo/2016/06/07/17/51/greek-yogurt-1442034_640.jpg',
    ['dairy', 'protein', 'probiotics', 'nonfat'],
    {
      calories: 100,
      carbs: 3.6,
      protein: 17,
      fat: 0.7,
      fiber: 0,
      vitamins: { 'B12': '28%', 'B2': '28%', 'B5': '10%' },
      minerals: { 'Calcium': '18%', 'Phosphorus': '18%', 'Selenium': '34%' },
      probiotics: { 'Lactobacillus': 'high', 'Bifidobacterium': 'medium' }
    },
    ['dairy'],
    true,
    [
      {
        en: 'Excellent source of protein and beneficial probiotics that support gut health',
        hi: 'प्रोटीन और लाभकारी प्रोबायोटिक्स का उत्कृष्ट स्रोत जो आंत के स्वास्थ्य का समर्थन करता है',
        ta: 'குடல் ஆரோக்கியத்தை ஆதரிக்கும் புரதம் மற்றும் பயனுள்ள ப்ரோபயாடிக்ஸின் சிறந்த ஆதாரம்'
      }
    ],
    {
      en: '1 cup daily, plain or with fruit and honey',
      hi: 'रोजाना 1 कप, सादा या फल और शहद के साथ',
      ta: 'தினசரி 1 கப், எளிதாக அல்லது பழங்கள் மற்றும் தேனுடன்'
    }
  ),
  
  createFoodItem(
    'honey',
    {
      en: 'Honey',
      hi: 'शहद',
      ta: 'தேன்'
    },
    {
      en: 'Natural sweet substance produced by bees from flower nectar, with varying colors and flavors depending on flower source',
      hi: 'फूलों के अमृत से मधुमक्खियों द्वारा उत्पादित प्राकृतिक मीठा पदार्थ, फूल के स्रोत के आधार पर अलग-अलग रंग और स्वाद के साथ',
      ta: 'பூக்களின் தேன் பகுதியிலிருந்து தேனீக்களால் உற்பத்தி செய்யப்படும் இயற்கையான இனிப்பு பொருள், பூக்களின் ஆதாரத்தைப் பொறுத்து வெவ்வேறு நிறங்கள் மற்றும் சுவைகளுடன்'
    },
    'Global',
    6.99,
    'https://cdn.pixabay.com/photo/2015/11/07/11/55/honey-1031057_640.jpg',
    ['sweeteners', 'natural', 'antimicrobial'],
    {
      calories: 64,
      carbs: 17,
      protein: 0.1,
      fat: 0,
      fiber: 0,
      vitamins: { 'B6': '1%', 'C': '1%' },
      minerals: { 'Iron': '1%', 'Manganese': '2%' },
      antioxidants: { 'Flavonoids': 'medium', 'Phenolic Acids': 'medium' },
      enzymes: { 'Glucose Oxidase': 'high', 'Diastase': 'medium' }
    },
    ['gluten-free'],
    false,
    [
      {
        en: 'Natural sweetener with antimicrobial properties and trace amounts of antioxidants',
        hi: 'रोगाणुरोधी गुणों और एंटीऑक्सिडेंट की थोड़ी मात्रा वाला प्राकृतिक स्वीटनर',
        ta: 'நுண்ணுயிர் எதிர்ப்பு பண்புகள் மற்றும் ஆன்டிஆக்ஸிடன்ட்களின் அளவுகள் கொண்ட இயற்கை இனிப்பூட்டி'
      }
    ],
    {
      en: '1-2 teaspoons as a sweetener for beverages or foods (not for infants under 12 months)',
      hi: 'पेय या खाद्य पदार्थों के लिए स्वीटनर के रूप में 1-2 चम्मच (12 महीने से कम उम्र के शिशुओं के लिए नहीं)',
      ta: 'பானங்கள் அல்லது உணவுகளுக்கு இனிப்பூட்டியாக 1-2 தேக்கரண்டி (12 மாதங்களுக்குட்பட்ட குழந்தைகளுக்கு அல்ல)'
    }
  ),
  ...additionalFoodItems,
  ...expandedFoodItems,
  ...globalFoodDatabaseSeed
];

import { get100kFoodDatabase } from './largeScaleFoodCatalog';

export const baseFoodItems = baseFoodList;
export const foodItems: FoodItemClient[] = get100kFoodDatabase(baseFoodList);
