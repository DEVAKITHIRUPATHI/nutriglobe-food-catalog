import { FoodItemClient } from './schema';

// Helper function to create a food item with consistent structure
const createFoodItem = (
  id: string,
  name: { en: string; hi?: string; ta?: string },
  description: { en: string; hi?: string; ta?: string },
  origin: string,
  price: number,
  image: string,
  category: string[],
  nutrition: {
    calories: number;
    carbs: number;
    protein: number;
    fat: number;
    fiber: number;
    vitamins: Record<string, string>;
    minerals?: Record<string, string>;
    omega3?: number;
    omega6?: number;
    omega9?: number;
    collagen?: number;
    antioxidants?: Record<string, string>;
    probiotics?: Record<string, string>;
    enzymes?: Record<string, string>;
  },
  allergens: string[],
  isPopular: boolean,
  healthBenefits?: { en: string; hi?: string; ta?: string }[],
  recommendedIntake?: { en: string; hi?: string; ta?: string },
): FoodItemClient => ({
  id,
  name,
  description,
  origin,
  price,
  image,
  category,
  nutrition,
  allergens,
  isPopular,
  healthBenefits,
  recommendedIntake,
});

// New food items - Fruits
export const additionalFruits: FoodItemClient[] = [
  createFoodItem(
    'lemon',
    {
      en: 'Lemon',
      hi: 'नींबू',
      ta: 'எலுமிச்சை'
    },
    {
      en: 'Bright yellow citrus fruit with sour taste and high vitamin C content',
      hi: 'चमकदार पीला साइट्रस फल जिसका स्वाद खट्टा होता है और विटामिन सी की मात्रा अधिक होती है',
      ta: 'புளிப்பு சுவையுடன் மற்றும் அதிக அளவு வைட்டமின் சி கொண்ட பிரகாசமான மஞ்சள் சிட்ரஸ் பழம்'
    },
    'Mediterranean',
    0.79,
    'https://cdn.pixabay.com/photo/2017/02/05/12/31/lemons-2039830_640.jpg',
    ['fruits', 'citrus', 'vitamin-c'],
    {
      calories: 29,
      carbs: 9.3,
      protein: 1.1,
      fat: 0.3,
      fiber: 2.8,
      vitamins: { 'C': '51%', 'B9': '3%', 'B6': '4%' },
      minerals: { 'Potassium': '2%', 'Calcium': '2%' },
      antioxidants: { 'Limonene': 'high', 'Hesperidin': 'medium' }
    },
    ['citrus'],
    true,
    [
      {
        en: 'Rich in vitamin C and antioxidants that support immune function and skin health',
        hi: 'विटामिन सी और एंटीऑक्सिडेंट से भरपूर जो प्रतिरक्षा प्रणाली और त्वचा के स्वास्थ्य का समर्थन करते हैं',
        ta: 'நோய் எதிர்ப்பு செயல்பாடு மற்றும் தோல் ஆரோக்கியத்தை ஆதரிக்கும் வைட்டமின் சி மற்றும் ஆன்டிஆக்ஸிடன்ட்கள் நிறைந்தது'
      }
    ],
    {
      en: '1/4 to 1/2 lemon juice daily, added to water, tea, or food',
      hi: 'रोजाना 1/4 से 1/2 नींबू का रस, पानी, चाय या भोजन में मिलाकर',
      ta: 'தினசரி 1/4 முதல் 1/2 எலுமிச்சை சாறு, தண்ணீர், தேநீர் அல்லது உணவில் சேர்க்கப்பட்டது'
    }
  ),

  createFoodItem(
    'lime',
    {
      en: 'Lime',
      hi: 'नीबू',
      ta: 'எலுமிச்சம்பழம்'
    },
    {
      en: 'Small, round citrus fruit with green skin and tart flavor',
      hi: 'हरी त्वचा और तीखे स्वाद वाला छोटा, गोल साइट्रस फल',
      ta: 'பச்சை தோல் மற்றும் புளிப்பான சுவையுடன் கூடிய சிறிய, வட்டமான சிட்ரஸ் பழம்'
    },
    'Tropical Asia',
    0.69,
    'https://cdn.pixabay.com/photo/2017/03/10/15/15/lime-2133091_640.jpg',
    ['fruits', 'citrus', 'tropical'],
    {
      calories: 20,
      carbs: 7.1,
      protein: 0.5,
      fat: 0.1,
      fiber: 1.9,
      vitamins: { 'C': '29%', 'A': '1%' },
      minerals: { 'Calcium': '2%', 'Iron': '1%' },
      antioxidants: { 'Limonene': 'high', 'Flavonoids': 'medium' }
    },
    ['citrus'],
    false,
    [
      {
        en: 'Good source of vitamin C and antioxidants that may help prevent kidney stones and improve digestion',
        hi: 'विटामिन सी और एंटीऑक्सिडेंट का अच्छा स्रोत जो किडनी स्टोन को रोकने और पाचन में सुधार करने में मदद कर सकता है',
        ta: 'சிறுநீரக கற்களைத் தடுக்கவும் செரிமானத்தை மேம்படுத்தவும் உதவக்கூடிய வைட்டமின் சி மற்றும் ஆன்டிஆக்ஸிடன்ட்களின் நல்ல ஆதாரம்'
      }
    ],
    {
      en: '1/4 to 1/2 lime juice daily, added to water or food',
      hi: 'रोजाना 1/4 से 1/2 नींबू का रस, पानी या भोजन में मिलाकर',
      ta: 'தினசரி 1/4 முதல் 1/2 எலுமிச்சம்பழச்சாறு, தண்ணீர் அல்லது உணவில் சேர்க்கப்பட்டது'
    }
  ),

  createFoodItem(
    'grapefruit',
    {
      en: 'Grapefruit',
      hi: 'चकोतरा',
      ta: 'கிரேப்ஃப்ரூட்'
    },
    {
      en: 'Large citrus fruit with yellowish-red flesh and sweet-tart flavor',
      hi: 'पीले-लाल गूदे और मीठे-खट्टे स्वाद वाला बड़ा साइट्रस फल',
      ta: 'மஞ்சள்-சிவப்பு சதைப்பகுதி மற்றும் இனிப்பு-புளிப்பான சுவையுடன் கூடிய பெரிய சிட்ரஸ் பழம்'
    },
    'Caribbean',
    1.59,
    'https://cdn.pixabay.com/photo/2016/03/05/22/18/food-1239224_640.jpg',
    ['fruits', 'citrus', 'vitamin-c'],
    {
      calories: 52,
      carbs: 13.2,
      protein: 0.9,
      fat: 0.2,
      fiber: 2.0,
      vitamins: { 'C': '64%', 'A': '28%', 'B5': '6%' },
      minerals: { 'Potassium': '5%', 'Magnesium': '3%' },
      antioxidants: { 'Naringenin': 'high', 'Lycopene': 'medium' }
    },
    ['citrus'],
    false,
    [
      {
        en: 'Contains naringenin which may help improve insulin sensitivity and reduce risk of diabetes',
        hi: 'इसमें नैरिंजेनिन होता है जो इंसुलिन संवेदनशीलता में सुधार करने और मधुमेह के जोखिम को कम करने में मदद कर सकता है',
        ta: 'இன்சுலின் உணர்திறனை மேம்படுத்தவும் நீரிழிவு நோய் ஆபத்தைக் குறைக்கவும் உதவும் நாரின்ஜெனின் உள்ளது'
      }
    ],
    {
      en: '1/2 grapefruit, 2-3 times per week (note: may interact with certain medications)',
      hi: 'प्रति सप्ताह 2-3 बार 1/2 चकोतरा (ध्यान दें: कुछ दवाओं के साथ बातचीत कर सकता है)',
      ta: 'வாரத்திற்கு 2-3 முறை 1/2 கிரேப்ஃப்ரூட் (குறிப்பு: சில மருந்துகளுடன் தொடர்புகொள்ளலாம்)'
    }
  ),

  createFoodItem(
    'pomelo',
    {
      en: 'Pomelo',
      hi: 'चकोतरा',
      ta: 'பம்பலிமாஸ்'
    },
    {
      en: 'Largest citrus fruit with thick rind, pale green to yellow flesh and mild sweet flavor',
      hi: 'मोटी छिलके वाला, पीले-हरे गूदे और हल्के मीठे स्वाद वाला सबसे बड़ा साइट्रस फल',
      ta: 'தடிமனான தோல், வெளிர் பச்சை முதல் மஞ்சள் சதைப்பகுதி மற்றும் மிதமான இனிப்பு சுவையுடன் கூடிய மிகப்பெரிய சிட்ரஸ் பழம்'
    },
    'Southeast Asia',
    3.99,
    'https://cdn.pixabay.com/photo/2016/02/17/19/14/pomelo-1205436_640.jpg',
    ['fruits', 'citrus', 'exotic'],
    {
      calories: 72,
      carbs: 17.6,
      protein: 1.4,
      fat: 0.2,
      fiber: 2.4,
      vitamins: { 'C': '193%', 'B1': '8%', 'B9': '10%' },
      minerals: { 'Potassium': '8%', 'Copper': '7%' },
      antioxidants: { 'Naringin': 'high', 'Limonene': 'medium' }
    },
    ['citrus'],
    false,
    [
      {
        en: 'Excellent source of vitamin C and potassium, supporting immune health and blood pressure regulation',
        hi: 'विटामिन सी और पोटैशियम का उत्कृष्ट स्रोत, प्रतिरक्षा स्वास्थ्य और रक्तचाप नियमन का समर्थन करता है',
        ta: 'வைட்டமின் சி மற்றும் பொட்டாசியத்தின் சிறந்த ஆதாரம், நோய் எதிர்ப்பு ஆரோக்கியத்தையும் இரத்த அழுத்த ஒழுங்குமுறையையும் ஆதரிக்கிறது'
      }
    ],
    {
      en: 'One-quarter to one-half pomelo, eaten fresh, 1-2 times per week',
      hi: 'प्रति सप्ताह 1-2 बार, एक-चौथाई से एक-आधा चकोतरा, ताजा खाया जाता है',
      ta: 'வாரத்திற்கு 1-2 முறை, கால் முதல் அரை பம்பலிமாஸ், புதிதாக சாப்பிடப்படுகிறது'
    }
  ),

  createFoodItem(
    'tangerine',
    {
      en: 'Tangerine',
      hi: 'टैंजरीन',
      ta: 'டேன்ஜரின்'
    },
    {
      en: 'Small citrus fruit with bright orange, easy-peel skin and sweet-tart flavor',
      hi: 'चमकदार नारंगी, आसानी से छीलने वाली त्वचा और मीठे-खट्टे स्वाद वाला छोटा साइट्रस फल',
      ta: 'பிரகாசமான ஆரஞ்சு, எளிதில் உரிக்கக்கூடிய தோல் மற்றும் இனிப்பு-புளிப்பான சுவையுடன் கூடிய சிறிய சிட்ரஸ் பழம்'
    },
    'China',
    1.29,
    'https://cdn.pixabay.com/photo/2016/12/31/16/07/tangerines-1943953_640.jpg',
    ['fruits', 'citrus', 'vitamin-c'],
    {
      calories: 47,
      carbs: 12.3,
      protein: 0.7,
      fat: 0.2,
      fiber: 1.8,
      vitamins: { 'C': '26%', 'A': '14%', 'B9': '5%' },
      minerals: { 'Potassium': '3%', 'Calcium': '3%' },
      antioxidants: { 'Beta-cryptoxanthin': 'high', 'Hesperidin': 'medium' }
    },
    ['citrus'],
    false,
    [
      {
        en: 'Good source of beta-cryptoxanthin, an antioxidant that may help reduce inflammation and cancer risk',
        hi: 'बीटा-क्रिप्टोक्सैन्थिन का अच्छा स्रोत, एक एंटीऑक्सिडेंट जो सूजन और कैंसर के जोखिम को कम करने में मदद कर सकता है',
        ta: 'அழற்சி மற்றும் புற்றுநோய் ஆபத்தைக் குறைக்க உதவும் ஆன்டிஆக்ஸிடன்ட், பீட்டா-கிரிப்டோசாந்தின் நல்ல ஆதாரம்'
      }
    ],
    {
      en: '1-2 tangerines daily, eaten fresh',
      hi: 'रोजाना 1-2 टैंजरीन, ताजा खाए जाते हैं',
      ta: 'தினசரி 1-2 டேன்ஜரின், புதிதாக சாப்பிடப்படுகிறது'
    }
  )
];

// New food items - Vegetables
export const additionalVegetables: FoodItemClient[] = [
  createFoodItem(
    'swiss_chard',
    {
      en: 'Swiss Chard',
      hi: 'स्विस चार्ड',
      ta: 'சுவிஸ் சார்டு'
    },
    {
      en: 'Leafy green vegetable with colorful stems and nutrient-rich leaves',
      hi: 'रंगीन तनों और पोषक तत्वों से भरपूर पत्तों वाली पत्तेदार हरी सब्जी',
      ta: 'வண்ணமயமான தண்டுகள் மற்றும் ஊட்டச்சத்து நிறைந்த இலைகளைக் கொண்ட இலைக்கறி'
    },
    'Mediterranean',
    2.49,
    'https://cdn.pixabay.com/photo/2018/06/09/23/15/chard-3465438_640.jpg',
    ['vegetables', 'leafy green', 'nutrient-dense'],
    {
      calories: 19,
      carbs: 3.7,
      protein: 1.8,
      fat: 0.1,
      fiber: 1.6,
      vitamins: { 'K': '716%', 'A': '54%', 'C': '32%' },
      minerals: { 'Magnesium': '20%', 'Iron': '22%', 'Potassium': '14%' },
      antioxidants: { 'Betalains': 'high', 'Kaempferol': 'medium' }
    },
    ['vegan', 'gluten-free'],
    false,
    [
      {
        en: 'Excellent source of vitamins K and A, supporting bone health and vision',
        hi: 'विटामिन K और A का उत्कृष्ट स्रोत, हड्डियों के स्वास्थ्य और दृष्टि का समर्थन करता है',
        ta: 'வைட்டமின் கே மற்றும் ஏ-இன் சிறந்த ஆதாரம், எலும்பு ஆரோக்கியம் மற்றும் பார்வையை ஆதரிக்கிறது'
      }
    ],
    {
      en: '1 cup cooked, 2-3 times weekly',
      hi: 'सप्ताह में 2-3 बार, 1 कप पका हुआ',
      ta: 'வாரத்திற்கு 2-3 முறை, 1 கப் சமைத்தது'
    }
  ),

  createFoodItem(
    'collard_greens',
    {
      en: 'Collard Greens',
      hi: 'कोलार्ड ग्रीन्स',
      ta: 'கொலார்டு கீரைகள்'
    },
    {
      en: 'Loose-leaf cruciferous vegetable with large, dark green leaves',
      hi: 'बड़े, गहरे हरे पत्तों वाली ढीली-पत्ती वाली क्रूसिफेरस सब्जी',
      ta: 'பெரிய, அடர் பச்சை இலைகளைக் கொண்ட தளர்வான இலை முறுக்கீரை காய்கறி'
    },
    'Southern United States/Africa',
    1.99,
    'https://cdn.pixabay.com/photo/2018/06/18/14/22/collard-3482801_640.jpg',
    ['vegetables', 'leafy green', 'cruciferous'],
    {
      calories: 33,
      carbs: 5.7,
      protein: 2.5,
      fat: 0.5,
      fiber: 4.0,
      vitamins: { 'K': '638%', 'A': '102%', 'C': '58%' },
      minerals: { 'Calcium': '27%', 'Manganese': '32%' },
      antioxidants: { 'Kaempferol': 'high', 'Quercetin': 'medium' }
    },
    ['vegan', 'gluten-free'],
    false,
    [
      {
        en: 'High in calcium and vitamin K, supporting bone health and blood clotting',
        hi: 'कैल्शियम और विटामिन K में उच्च, हड्डियों के स्वास्थ्य और रक्त के थक्के जमने का समर्थन करता है',
        ta: 'எலும்பு ஆரோக்கியம் மற்றும் இரத்த உறைதலை ஆதரிக்கும் கால்சியம் மற்றும் வைட்டமின் கே அதிகம் கொண்டது'
      }
    ],
    {
      en: '1 cup cooked, 2-3 times weekly',
      hi: 'सप्ताह में 2-3 बार, 1 कप पका हुआ',
      ta: 'வாரத்திற்கு 2-3 முறை, 1 கப் சமைத்தது'
    }
  ),

  createFoodItem(
    'arugula',
    {
      en: 'Arugula (Rocket)',
      hi: 'अरुगुला (रॉकेट)',
      ta: 'அருகுலா (ராக்கெட்)'
    },
    {
      en: 'Peppery, tender leafy green with lobed leaves and strong flavor',
      hi: 'पाले वाले पत्तों और मजबूत स्वाद के साथ मिर्च जैसी, कोमल पत्तेदार हरी सब्जी',
      ta: 'லோப்டு இலைகள் மற்றும் வலுவான சுவையுடன் கூடிய மிளகுப்போன்ற, மென்மையான இலைக்கறி'
    },
    'Mediterranean',
    2.99,
    'https://cdn.pixabay.com/photo/2021/02/01/06/44/arugula-5969961_640.jpg',
    ['vegetables', 'leafy green', 'salad greens'],
    {
      calories: 25,
      carbs: 3.7,
      protein: 2.6,
      fat: 0.7,
      fiber: 1.6,
      vitamins: { 'K': '90%', 'A': '47%', 'C': '25%' },
      minerals: { 'Calcium': '16%', 'Folate': '24%' },
      antioxidants: { 'Glucosinolates': 'high', 'Flavonoids': 'medium' }
    },
    ['vegan', 'gluten-free'],
    false,
    [
      {
        en: 'Contains glucosinolates that may help protect against certain cancers',
        hi: 'इसमें ग्लूकोसिनोलेट्स होते हैं जो कुछ कैंसर से बचाव में मदद कर सकते हैं',
        ta: 'சில புற்றுநோயிலிருந்து பாதுகாக்க உதவும் குளுகோசினோலேட்கள் உள்ளன'
      }
    ],
    {
      en: '2 cups raw, 2-3 times weekly in salads',
      hi: 'सप्ताह में 2-3 बार सलाद में 2 कप कच्चा',
      ta: 'வாரத்திற்கு 2-3 முறை சாலட்களில் 2 கப் பச்சையாக'
    }
  ),

  createFoodItem(
    'brussels_sprouts',
    {
      en: 'Brussels Sprouts',
      hi: 'ब्रुसेल्स स्प्राउट्स',
      ta: 'புரூசெல்ஸ் ஸ்ப்ரவுட்ஸ்'
    },
    {
      en: 'Small, cabbage-like vegetables that grow on stalks with mild, nutty flavor when cooked',
      hi: 'छोटी, गोभी जैसी सब्जियां जो तनों पर उगती हैं और पकाने पर हल्का, मेवेदार स्वाद आता है',
      ta: 'தண்டுகளில் வளரும் சிறிய, முட்டைக்கோசு போன்ற காய்கறிகள், சமைக்கும்போது மிதமான, நட்டி சுவையுடன்'
    },
    'Belgium',
    3.49,
    'https://cdn.pixabay.com/photo/2016/11/18/19/15/brussels-sprouts-1836332_640.jpg',
    ['vegetables', 'cruciferous', 'high-fiber'],
    {
      calories: 43,
      carbs: 8.9,
      protein: 3.4,
      fat: 0.3,
      fiber: 3.8,
      vitamins: { 'K': '137%', 'C': '129%', 'A': '15%' },
      minerals: { 'Manganese': '12%', 'Folate': '15%' },
      antioxidants: { 'Kaempferol': 'high', 'Sulforaphane': 'high' }
    },
    ['vegan', 'gluten-free'],
    false,
    [
      {
        en: 'Rich in sulforaphane, a compound that may help protect against cancer and reduce inflammation',
        hi: 'सल्फोराफेन से भरपूर, एक यौगिक जो कैंसर से बचाव और सूजन को कम करने में मदद कर सकता है',
        ta: 'புற்றுநோயிலிருந்து பாதுகாக்கவும் அழற்சியைக் குறைக்கவும் உதவும் சல்ஃபோராஃபேன் என்ற சேர்மம் நிறைந்தது'
      }
    ],
    {
      en: '1 cup cooked, 2-3 times weekly',
      hi: 'सप्ताह में 2-3 बार, 1 कप पका हुआ',
      ta: 'வாரத்திற்கு 2-3 முறை, 1 கப் சமைத்தது'
    }
  ),

  createFoodItem(
    'kohlrabi',
    {
      en: 'Kohlrabi',
      hi: 'कोहलराबी',
      ta: 'கோல்ராபி'
    },
    {
      en: 'Bulbous vegetable with leafy stems and mild, sweet flavor similar to broccoli stem',
      hi: 'पत्तेदार तनों के साथ बल्बनुमा सब्जी और हल्का, मीठा स्वाद जो ब्रोकोली के तने के समान होता है',
      ta: 'இலைத்தண்டுகள் மற்றும் புரோக்கோலி தண்டை போன்ற மிதமான, இனிப்பு சுவையுடன் கூடிய குமிழ் வடிவ காய்கறி'
    },
    'Europe',
    2.69,
    'https://cdn.pixabay.com/photo/2017/07/11/17/12/kohlrabi-2494329_640.jpg',
    ['vegetables', 'cruciferous', 'root'],
    {
      calories: 36,
      carbs: 8.4,
      protein: 2.3,
      fat: 0.1,
      fiber: 4.9,
      vitamins: { 'C': '102%', 'B6': '16%', 'B1': '5%' },
      minerals: { 'Potassium': '10%', 'Copper': '7%' },
      antioxidants: { 'Isothiocyanates': 'medium', 'Glucosinolates': 'medium' }
    },
    ['vegan', 'gluten-free'],
    false,
    [
      {
        en: 'Excellent source of vitamin C and fiber, supporting immune function and digestive health',
        hi: 'विटामिन सी और फाइबर का उत्कृष्ट स्रोत, प्रतिरक्षा प्रणाली और पाचन स्वास्थ्य का समर्थन करता है',
        ta: 'நோய் எதிர்ப்பு செயல்பாடு மற்றும் செரிமான ஆரோக்கியத்தை ஆதரிக்கும் வைட்டமின் சி மற்றும் நார்ச்சத்தின் சிறந்த ஆதாரம்'
      }
    ],
    {
      en: '1 cup raw or cooked, 1-2 times weekly',
      hi: 'सप्ताह में 1-2 बार, 1 कप कच्चा या पका हुआ',
      ta: 'வாரத்திற்கு 1-2 முறை, 1 கப் பச்சை அல்லது சமைத்தது'
    }
  )
];

// Combine and export all additional food items
export const additionalFoodItems: FoodItemClient[] = [
  ...additionalFruits,
  ...additionalVegetables
];