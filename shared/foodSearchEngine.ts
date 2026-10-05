/**
 * NutriFacts Food Discovery & Universal Search Engine
 * 
 * Features:
 * - English, Scientific, Regional & Multilingual (45+ languages) Food Matching
 * - Strict Precedence Ranking (Exact > Word Boundary > Scientific > Localized > Fuzzy > Compound)
 * - Typo-Tolerance via Damerau-Levenshtein Distance with Confidence Scoring
 * - Natural Language Nutrient Intent Detection ("high protein", "low calorie", "high fiber", etc.)
 * - Input Sanitization & Security (XSS protection, ReDoS prevention)
 * - Zero-Result Recommendations (Did you mean, popular foods, category chips)
 * - Macronutrient Sorting and Filtering
 */

import type { FoodItemClient, Language } from './schema';
import { COMMON_FOOD_VOCABULARY } from './translationUtils';

export interface SearchMatchResult {
  item: FoodItemClient;
  score: number; // Lower is better (0 = exact match)
  matchType: 'exact' | 'prefix' | 'word' | 'scientific' | 'localized' | 'fuzzy' | 'nutrient' | 'category' | 'substring';
  matchedField: string;
  matchedValue: string;
  confidence: number; // 0.0 to 1.0 (1.0 = 100% confidence)
}

export interface ZeroResultsSuggestion {
  query: string;
  sanitizedQuery: string;
  suggestedSpelling?: string;
  suggestedFoodId?: string;
  popularFoods: Array<{ id: string; name: string; category: string }>;
  suggestedCategories: Array<{ id: string; name: string; icon: string }>;
  searchTips: string[];
}

export type MacroSortOption = 
  | 'default'
  | 'protein-desc'
  | 'calories-asc'
  | 'calories-desc'
  | 'fiber-desc'
  | 'carbs-asc'
  | 'fat-asc';

export interface MacroFilterOptions {
  minProtein?: number;
  maxCalories?: number;
  minFiber?: number;
  maxCarbs?: number;
  maxFat?: number;
}

/**
 * Canonical registry of scientific names, multilingual aliases, and regional names
 * for 100% deterministic, high-accuracy searches across all 48 supported languages.
 */
export const CANONICAL_FOOD_SEARCH_METADATA: Record<string, {
  canonicalId: string;
  scientificNames: string[];
  aliases: string[];
  multilingual: Partial<Record<Language, string[]>>;
  nutrientsOfInterest?: string[];
}> = {
  avocado: {
    canonicalId: 'avocado',
    scientificNames: ['Persea americana'],
    aliases: ['avocado', 'alligator pear', 'butter fruit', 'makhanfal', 'palta', 'abacate'],
    multilingual: {
      ta: ['வெண்ணெய் பழம்', 'அவகேடோ'],
      hi: ['एवोकैडो', 'मक्खन फल'],
      te: ['వెన్న పండు', 'అవకాడో'],
      kn: ['ಬೆಣ್ಣೆ ಹಣ್ಣು', 'ಅವಕಾಡೊ'],
      ml: ['വെണ്ണപ്പഴം', 'അവക്കാഡോ'],
      bn: ['অ্যাভোকাডো'],
      mr: ['अ‍ॅव्होकॅडो', 'लोणी फळ'],
      gu: ['એવોકાડો', 'માખણ ફળ'],
      pa: ['ਐਵੋਕਾਡੋ'],
      ur: ['ایوکاڈو'],
      es: ['Aguacate', 'Palta'],
      fr: ['Avocat'],
      de: ['Avocado'],
      ar: ['أفوكادو'],
      zh: ['牛油果', '鳄梨'],
      ja: ['アボカド']
    },
    nutrientsOfInterest: ['healthy fats', 'potassium', 'fiber', 'vitamin e', 'monounsaturated']
  },

  fuji_apple: {
    canonicalId: 'fuji_apple',
    scientificNames: ['Malus domestica'],
    aliases: ['apple', 'apples', 'fuji apple', 'red apple', 'sweet apple', 'pomme'],
    multilingual: {
      ta: ['ஆப்பிள்', 'பூஜி ஆப்பிள்'],
      hi: ['सेब', 'फूजी सेब'],
      te: ['యాపిల్', 'యాపిల్ పండు'],
      kn: ['ಸೇಬು', 'ಸೇಬು ಹಣ್ಣು'],
      ml: ['ആപ്പിൾ', 'ആപ്പിൾ പഴം'],
      bn: ['আপেল'],
      mr: ['सफरचंद'],
      gu: ['સફરજન'],
      pa: ['ਸੇਬ'],
      ur: ['سیب'],
      es: ['Manzana'],
      fr: ['Pomme'],
      de: ['Apfel'],
      ar: ['تفاح'],
      zh: ['苹果', '富士苹果'],
      ja: ['リンゴ', 'ふじりんご']
    },
    nutrientsOfInterest: ['fiber', 'vitamin c', 'antioxidants', 'quercetin']
  },

  pineapple: {
    canonicalId: 'pineapple',
    scientificNames: ['Ananas comosus'],
    aliases: ['pineapple', 'ananas', 'pine apple', 'bromeliad fruit', 'piña'],
    multilingual: {
      ta: ['அன்னாசிப்பழம்', 'அன்னாசி'],
      hi: ['अनानास', 'अनन्नास'],
      te: ['అనాస పండు', 'అనాస'],
      kn: ['ಅನಾನಸ್', 'ಅನಾನಸ್ ಹಣ್ಣು'],
      ml: ['കൈതച്ചക്ക', 'പൈനാപ്പിൾ'],
      bn: ['আনারস'],
      mr: ['अननस'],
      gu: ['અનાનસ'],
      pa: ['ਅਨਾਨਾਸ'],
      ur: ['انناس'],
      es: ['Piña', 'Ananás'],
      fr: ['Ananas'],
      de: ['Ananas'],
      ar: ['أناناس'],
      zh: ['菠萝', '凤梨'],
      ja: ['パイナップル']
    },
    nutrientsOfInterest: ['bromelain', 'vitamin c', 'manganese']
  },

  banana: {
    canonicalId: 'banana',
    scientificNames: ['Musa acuminata', 'Musa balbisiana', 'Musa paradisiaca'],
    aliases: ['banana', 'bananas', 'yellow banana', 'cavendish', 'plantain', 'kela'],
    multilingual: {
      ta: ['வாழைப்பழம்', 'வாழை'],
      hi: ['केला'],
      te: ['అరటిపండు', 'అరటి'],
      kn: ['ಬಾಳೆಹಣ್ಣು', 'ಬಾಳೆ'],
      ml: ['വാഴപ്പഴം', 'ഏത്തപ്പഴം'],
      bn: ['কলা'],
      mr: ['केळी'],
      gu: ['કેળું'],
      pa: ['ਕੇਲਾ'],
      ur: ['کیلا'],
      es: ['Plátano', 'Banana'],
      fr: ['Banane'],
      de: ['Banane'],
      ar: ['موز'],
      zh: ['香蕉'],
      ja: ['バナナ']
    },
    nutrientsOfInterest: ['potassium', 'vitamin b6', 'carbohydrates', 'resistant starch']
  },

  mango: {
    canonicalId: 'mango',
    scientificNames: ['Mangifera indica'],
    aliases: ['mango', 'alphonso', 'king of fruits', 'aam', 'manga'],
    multilingual: {
      ta: ['மாம்பழம்', 'மாங்காய்'],
      hi: ['आम'],
      te: ['మామిడి', 'మామిడి పండు'],
      kn: ['ಮಾವಿನ ಹಣ್ಣು', 'ಮಾವು'],
      ml: ['മാങ്ങ', 'മാമ്പഴം'],
      bn: ['আম'],
      mr: ['आंबा', 'हापूस'],
      gu: ['કેરી'],
      pa: ['ਅੰਬ'],
      ur: ['آم'],
      es: ['Mango'],
      fr: ['Mangue'],
      de: ['Mango'],
      ar: ['مانجو'],
      zh: ['芒果'],
      ja: ['マンゴー']
    },
    nutrientsOfInterest: ['vitamin a', 'vitamin c', 'polyphenols', 'mangiferin']
  },

  coconut_mature: {
    canonicalId: 'coconut_mature',
    scientificNames: ['Cocos nucifera'],
    aliases: ['coconut', 'dry coconut', 'nariyal', 'thengai', 'copra', 'mature coconut'],
    multilingual: {
      ta: ['தேங்காய்', 'முற்றிய தேங்காய்'],
      hi: ['नारियल', 'सूखा नारियल'],
      te: ['కొబ్బరికాయ', 'కొబ్బరి'],
      kn: ['ತೆಂಗಿನಕಾಯಿ', 'ತೆಂಗು'],
      ml: ['തേങ്ങ'],
      bn: ['নারকেল'],
      mr: ['नारळ'],
      gu: ['નાળિયેર', 'શ્રીફળ'],
      pa: ['ਨਾਰੀਅਲ'],
      ur: ['ناریل'],
      es: ['Coco'],
      fr: ['Noix de coco'],
      de: ['Kokosnuss'],
      ar: ['جوز الهند'],
      zh: ['椰子'],
      ja: ['ココナッツ']
    },
    nutrientsOfInterest: ['mcts', 'lauric acid', 'healthy fats', 'manganese']
  },

  tender_coconut: {
    canonicalId: 'tender_coconut',
    scientificNames: ['Cocos nucifera'],
    aliases: ['tender coconut', 'coconut water', 'elaneer', 'karikku', 'green coconut', 'young coconut', 'daab'],
    multilingual: {
      ta: ['இளநீர்', 'இளந்தேங்காய்'],
      hi: ['डाब', 'कच्चा नारियल पानी', 'हरा नारियल'],
      te: ['లేత కొబ్బరి', 'బొండం', 'కొబ్బరి నీళ్ళు'],
      kn: ['ಎಳನೀರು', 'ಎಳೆ ತೆಂಗು'],
      ml: ['കരിക്ക്', 'ഇളനീർ'],
      bn: ['ডাব', 'ডাবের জল'],
      mr: ['शहाळे', 'ओला नारळ'],
      gu: ['ત્રાફો', 'લીલું નાળિયેર'],
      pa: ['ਕੱਚਾ ਨਾਰੀਅਲ ਪਾਣੀ'],
      ur: ['ڈاب', 'کچا ناریل'],
      es: ['Agua de coco', 'Coco tierno'],
      fr: ['Eau de coco'],
      de: ['Kokoswasser'],
      ar: ['ماء جوز الهند'],
      zh: ['椰子水', '青椰'],
      ja: ['ココナッツウォーター']
    },
    nutrientsOfInterest: ['electrolytes', 'potassium', 'hydration', 'magnesium']
  },

  nungu_ice_apple: {
    canonicalId: 'nungu_ice_apple',
    scientificNames: ['Borassus flabellifer'],
    aliases: ['nungu', 'ice apple', 'tadgola', 'palmyra fruit', 'palmyra palm', 'taal', 'targula'],
    multilingual: {
      ta: ['நுங்கு', 'பனை நுங்கு'],
      hi: ['ताड़गोला', 'नुनगु', 'आइस एप्पल'],
      te: ['తాటి ముంజలు', 'ముంజలు'],
      kn: ['ತಾಳೆ ಹಣ್ಣು', 'ತಾಟಿನಿಂಗು'],
      ml: ['പനനൊങ്ക്', 'കരിമ്പന നൊങ്ക്'],
      bn: ['তালশাঁস'],
      mr: ['ताडगोळा'],
      gu: ['તાડગોળા'],
      pa: ['ਤਾੜਗੋਲਾ'],
      ur: ['تاڑگولہ'],
      es: ['Manzana de hielo'],
      fr: ['Fruit du rônier'],
      de: ['Palmyra-Palmfrucht'],
      ar: ['فاكهة نخيل تدمر'],
      zh: ['海椰子', '糖棕果'],
      ja: ['パルミラヤシの実']
    },
    nutrientsOfInterest: ['cooling', 'hydration', 'potassium', 'calcium', 'vitamin b complex']
  },

  jackfruit: {
    canonicalId: 'jackfruit',
    scientificNames: ['Artocarpus heterophyllus'],
    aliases: ['jackfruit', 'kathal', 'palapazham', 'chakka', 'panasa', 'fanas'],
    multilingual: {
      ta: ['பலாப்பழம்', 'பலா'],
      hi: ['कटहल'],
      te: ['పనస పండు', 'పనస'],
      kn: ['ಹಲಸಿನ ಹಣ್ಣು', 'ಹಲಸು'],
      ml: ['ചക്ക', 'വരിക്കച്ചക്ക'],
      bn: ['কাঁঠাল'],
      mr: ['फणस'],
      gu: ['ફણસ'],
      pa: ['ਕਠਹਲ'],
      ur: ['کٹہل'],
      es: ['Yaca', 'Jackfruit'],
      fr: ['Jacquier'],
      de: ['Jackfrucht'],
      ar: ['جاك فروت'],
      zh: ['菠萝蜜'],
      ja: ['パラミツ', 'ジャックフルーツ']
    },
    nutrientsOfInterest: ['fiber', 'vitamin c', 'potassium', 'resistant starch']
  },

  dragon_fruit: {
    canonicalId: 'dragon_fruit',
    scientificNames: ['Selenicereus undatus', 'Hylocereus polyrhizus', 'Hylocereus undatus'],
    aliases: ['dragon fruit', 'dragonfruit', 'pitaya', 'pitahaya', 'kamalam', 'strawberry pear'],
    multilingual: {
      ta: ['டிராகன் பழம்', 'கமலம் பழம்'],
      hi: ['ड्रैगन फ्रूट', 'कमलम'],
      te: ['డ్రాగన్ ఫ్రూట్'],
      kn: ['ಡ್ರ್ಯಾಗನ್ ಹಣ್ಣು'],
      ml: ['ഡ്രാഗൺ ഫ്രൂട്ട്'],
      bn: ['ড্রাগন ফল'],
      mr: ['ड्रॅगन फ्रूट'],
      gu: ['કમલમ', 'ડ્રેગન ફ્રૂટ'],
      pa: ['ਡਰੈਗਨ ਫਰੂਟ'],
      ur: ['ڈریگن فروٹ'],
      es: ['Pitaya', 'Fruta del dragón'],
      fr: ['Fruit du dragon'],
      de: ['Drachenfrucht'],
      ar: ['فاكهة التنين'],
      zh: ['火龙果'],
      ja: ['ドラゴンフルーツ', 'ピタヤ']
    },
    nutrientsOfInterest: ['antioxidants', 'betalains', 'iron', 'magnesium', 'fiber']
  },

  guava__pink_: {
    canonicalId: 'guava__pink_',
    scientificNames: ['Psidium guajava'],
    aliases: ['guava', 'pink guava', 'amrood', 'koyyapazham', 'jama pandu', 'peru'],
    multilingual: {
      ta: ['கொய்யாப்பழம்', 'கொய்யா'],
      hi: ['अमरूद', 'गुलाबी अमरूद'],
      te: ['జామపండు', 'జామ'],
      kn: ['ಸೀಬೆಹಣ್ಣು', 'ಪೇರಲ'],
      ml: ['പേരയ്ക്ക', 'പേര'],
      bn: ['পেয়ারা'],
      mr: ['पेरू'],
      gu: ['જામફળ'],
      pa: ['ਅਮਰੂਦ'],
      ur: ['امرود'],
      es: ['Guayaba'],
      fr: ['Goyave'],
      de: ['Guave'],
      ar: ['جوافة'],
      zh: ['番石榴', '芭乐'],
      ja: ['グアバ']
    },
    nutrientsOfInterest: ['vitamin c', 'lycopene', 'dietary fiber', 'potassium']
  },

  papaya: {
    canonicalId: 'papaya',
    scientificNames: ['Carica papaya'],
    aliases: ['papaya', 'pawpaw', 'papita', 'pappali', 'boppayi'],
    multilingual: {
      ta: ['பப்பாளி', 'பப்பாளிப் பழம்'],
      hi: ['पपीता'],
      te: ['బొప్పాయి', 'బొప్పాయి పండు'],
      kn: ['ಪಪ್ಪಾಯಿ'],
      ml: ['പപ്പായ', 'കർമ്മോസ'],
      bn: ['পেঁপে'],
      mr: ['पपई'],
      gu: ['પપૈયું'],
      pa: ['ਪਪੀਤਾ'],
      ur: ['پپیتا'],
      es: ['Papaya'],
      fr: ['Papaye'],
      de: ['Papaya'],
      ar: ['بابايا'],
      zh: ['木瓜'],
      ja: ['パパイヤ']
    },
    nutrientsOfInterest: ['papain', 'vitamin a', 'vitamin c', 'folate']
  },

  pomegranate: {
    canonicalId: 'pomegranate',
    scientificNames: ['Punica granatum'],
    aliases: ['pomegranate', 'anaar', 'anar', 'madhulai', 'danimma', 'dalim'],
    multilingual: {
      ta: ['மாதுளம்பழம்', 'மாதுளை'],
      hi: ['अनार'],
      te: ['దానిమ్మ', 'దానిమ్మ పండు'],
      kn: ['ದಾಳಿಂಬೆ'],
      ml: ['മാതളനാരങ്ങ', 'മാതളം'],
      bn: ['বেদানা', 'ডালিম'],
      mr: ['डाळिंब'],
      gu: ['દાડમ'],
      pa: ['ਅਨਾਰ'],
      ur: ['انار'],
      es: ['Granada'],
      fr: ['Grenade'],
      de: ['Granatapfel'],
      ar: ['رمان'],
      zh: ['石榴'],
      ja: ['ザクロ']
    },
    nutrientsOfInterest: ['punicalagins', 'polyphenols', 'vitamin k', 'antioxidants']
  },

  medjool_date: {
    canonicalId: 'medjool_date',
    scientificNames: ['Phoenix dactylifera'],
    aliases: ['dates', 'date', 'medjool date', 'medjool dates', 'khajur', 'khajoor', 'pericham pazham'],
    multilingual: {
      ta: ['பேரீச்சம்பழம்', 'பேரீச்சை'],
      hi: ['खजूर', 'मेद्जूल खजूर'],
      te: ['ఖర్జూరం', 'ఖర్జూర పండు'],
      kn: ['ಖರ್ಜೂರ'],
      ml: ['ഈന്തപ്പഴം'],
      bn: ['খেজুর'],
      mr: ['खजूर'],
      gu: ['ખજૂર'],
      pa: ['ਖਜੂਰ'],
      ur: ['کھجور'],
      es: ['Dátil', 'Dátiles Medjool'],
      fr: ['Datte', 'Dattes Medjool'],
      de: ['Dattel', 'Datteln'],
      ar: ['تمر', 'بلح'],
      zh: ['椰枣', '海枣'],
      ja: ['デーツ', 'ナツメヤシの実']
    },
    nutrientsOfInterest: ['energy', 'potassium', 'fiber', 'iron', 'magnesium']
  },

  fresh_fig__anjeer_: {
    canonicalId: 'fresh_fig__anjeer_',
    scientificNames: ['Ficus carica'],
    aliases: ['fig', 'figs', 'fresh fig', 'anjeer', 'anjir', 'atti pazham', 'dumur'],
    multilingual: {
      ta: ['அத்திப்பழம்', 'அத்தி'],
      hi: ['अंजीर', 'ताजा अंजीर'],
      te: ['అంజీర పండు', 'మేడి పండు'],
      kn: ['ಅಂಜೂರ'],
      ml: ['അത്തിപ്പഴം'],
      bn: ['ডুমুর', 'আনজির'],
      mr: ['अंजीर'],
      gu: ['અંજીર'],
      pa: ['ਅੰਜੀਰ'],
      ur: ['انجیر'],
      es: ['Higo', 'Higos frescos'],
      fr: ['Figue', 'Figues fraîches'],
      de: ['Feige', 'Feigen'],
      ar: ['تين'],
      zh: ['无花果'],
      ja: ['イチジク']
    },
    nutrientsOfInterest: ['calcium', 'potassium', 'fiber', 'ficin enzyme']
  },

  spinach: {
    canonicalId: 'spinach',
    scientificNames: ['Spinacia oleracea'],
    aliases: ['spinach', 'palak', 'pasalai keerai', 'palakura', 'cheera'],
    multilingual: {
      ta: ['பசலைக் கீரை', 'கீரை'],
      hi: ['पालक'],
      te: ['పాలకూర'],
      kn: ['ಪಾಲಕ್ ಸೊಪ್ಪು', 'ಪಾಲಕ್'],
      ml: ['ചീര', 'പാലക്ക്'],
      bn: ['পালং শাক'],
      mr: ['पालक'],
      gu: ['પાલક'],
      pa: ['ਪਾਲਕ'],
      ur: ['پالک'],
      es: ['Espinaca'],
      fr: ['Épinards'],
      de: ['Spinat'],
      ar: ['سبانخ'],
      zh: ['菠菜'],
      ja: ['ほうれん草']
    },
    nutrientsOfInterest: ['iron', 'lutein', 'vitamin k', 'folate', 'magnesium']
  },

  rice_basmati: {
    canonicalId: 'rice_basmati',
    scientificNames: ['Oryza sativa'],
    aliases: ['rice', 'basmati rice', 'chawal', 'arisi', 'annam', 'bhaat', 'arroz'],
    multilingual: {
      ta: ['அரிசி', 'பாசுமதி அரிசி'],
      hi: ['चावल', 'बासमती चावल'],
      te: ['బియ్యం', 'బాస్మతి బియ్యం', 'అన్నం'],
      kn: ['ಅಕ್ಕಿ', 'ಬಾಸುಮತಿ ಅಕ್ಕಿ'],
      ml: ['അരി', 'ചോറ്'],
      bn: ['চাল', 'ভাত'],
      mr: ['तांदूळ', 'भात'],
      gu: ['ચોખા', 'ભાત'],
      pa: ['ਚੌਲ'],
      ur: ['چاول'],
      es: ['Arroz', 'Arroz Basmati'],
      fr: ['Riz', 'Riz Basmati'],
      de: ['Reis'],
      ar: ['أرز'],
      zh: ['米饭', '大米'],
      ja: ['米', 'ご飯']
    },
    nutrientsOfInterest: ['energy', 'carbohydrates', 'manganese', 'gluten-free']
  },

  whole_wheat_grain: {
    canonicalId: 'whole_wheat_grain',
    scientificNames: ['Triticum aestivum'],
    aliases: ['wheat', 'whole wheat', 'wheat grain', 'gehu', 'gothumai', 'godhuma', 'trigo'],
    multilingual: {
      ta: ['கோதுமை', 'முழு கோதுமை'],
      hi: ['गेहूं'],
      te: ['గోధుమలు'],
      kn: ['ಗೋಧಿ'],
      ml: ['ഗോതമ്പ്'],
      bn: ['গম'],
      mr: ['गहू'],
      gu: ['ઘઉં'],
      pa: ['ਕਣਕ'],
      ur: ['گندم'],
      es: ['Trigo', 'Trigo integral'],
      fr: ['Blé', 'Blé complet'],
      de: ['Weizen'],
      ar: ['قمح'],
      zh: ['小麦', '全麦'],
      ja: ['小麦']
    },
    nutrientsOfInterest: ['fiber', 'b vitamins', 'iron', 'complex carbs']
  },

  almonds: {
    canonicalId: 'almonds',
    scientificNames: ['Prunus dulcis'],
    aliases: ['almond', 'almonds', 'badam', 'badami', 'almendras'],
    multilingual: {
      ta: ['பாதாம்', 'பாதாம் பருப்பு'],
      hi: ['बादाम'],
      te: ['బాదం', 'బాదం పప్పు'],
      kn: ['ಬಾದಾಮಿ'],
      ml: ['ബദാം'],
      bn: ['বাদাম', 'কাঠবাদাম'],
      mr: ['बदाम'],
      gu: ['બદામ'],
      pa: ['ਬਦਾਮ'],
      ur: ['بادام'],
      es: ['Almendras'],
      fr: ['Amandes'],
      de: ['Mandeln'],
      ar: ['لوز'],
      zh: ['杏仁', '扁桃仁'],
      ja: ['アーモンド']
    },
    nutrientsOfInterest: ['protein', 'vitamin e', 'healthy fats', 'magnesium']
  },

  milk: {
    canonicalId: 'milk',
    scientificNames: ['Bos taurus'],
    aliases: ['milk', 'whole milk', 'cow milk', 'dairy milk', 'doodh', 'paal', 'leche'],
    multilingual: {
      ta: ['பால்', 'பசுவின் பால்'],
      hi: ['दूध'],
      te: ['పాలు'],
      kn: ['ಹಾಲು'],
      ml: ['പാൽ'],
      bn: ['দুধ'],
      mr: ['दूध'],
      gu: ['દૂધ'],
      pa: ['ਦੁੱਧ'],
      ur: ['دودھ'],
      es: ['Leche'],
      fr: ['Lait'],
      de: ['Milch'],
      ar: ['حليب'],
      zh: ['牛奶'],
      ja: ['牛乳']
    },
    nutrientsOfInterest: ['calcium', 'protein', 'vitamin d', 'vitamin b12']
  },

  eggs: {
    canonicalId: 'eggs',
    scientificNames: ['Gallus gallus domesticus'],
    aliases: ['egg', 'eggs', 'whole egg', 'table egg', 'anda', 'muttai', 'guddu'],
    multilingual: {
      ta: ['முட்டை', 'கோழி முட்டை'],
      hi: ['अंडा', 'अंडे'],
      te: ['గుడ్డు', 'గుడ్లు'],
      kn: ['ಮೊಟ್ಟೆ'],
      ml: ['മുട്ട'],
      bn: ['ডিম'],
      mr: ['अंडे'],
      gu: ['ઈંડું', 'ઈંડાં'],
      pa: ['ਆਂਡਾ'],
      ur: ['انڈا'],
      es: ['Huevos', 'Huevo'],
      fr: ['Œufs', 'Œuf'],
      de: ['Eier', 'Ei'],
      ar: ['بيض'],
      zh: ['鸡蛋', '蛋'],
      ja: ['卵', 'たまご']
    },
    nutrientsOfInterest: ['complete protein', 'choline', 'lutein', 'zeaxanthin']
  },

  chicken_breast: {
    canonicalId: 'chicken_breast',
    scientificNames: ['Gallus gallus domesticus'],
    aliases: ['chicken', 'chicken breast', 'poultry', 'murgh', 'kozhi', 'kodi'],
    multilingual: {
      ta: ['சிக்கன்', 'கோழிக்கறி'],
      hi: ['चिकन', 'मुर्गा'],
      te: ['చికెన్', 'కోడి మాంసం'],
      kn: ['ಕೋಳಿ ಮಾಂಸ'],
      ml: ['കോഴിയിറച്ചി'],
      bn: ['মুরগির মাংস'],
      mr: ['चिकन', 'कोंबडी'],
      gu: ['ચિકન'],
      pa: ['ਮੁਰਗਾ'],
      ur: ['مرغی का گوشت'],
      es: ['Pollo', 'Pechuga de pollo'],
      fr: ['Poulet', 'Blanc de poulet'],
      de: ['Hähnchen', 'Hühnerbrust'],
      ar: ['دجاج', 'صدر دجاج'],
      zh: ['鸡肉', '鸡胸肉'],
      ja: ['鶏肉', '鶏むね肉']
    },
    nutrientsOfInterest: ['lean protein', 'niacin', 'vitamin b6', 'low fat']
  },

  salmon: {
    canonicalId: 'salmon',
    scientificNames: ['Salmo salar'],
    aliases: ['salmon', 'atlantic salmon', 'fish', 'salmon fish', 'seafood'],
    multilingual: {
      ta: ['சால்மன் மீன்', 'மீன்'],
      hi: ['सैल्मन मछली', 'मछली'],
      te: ['సాల్మన్ చేప', 'చేప'],
      kn: ['ಸಾಲ್ಮನ್ ಮೀನು', 'ಮೀನು'],
      ml: ['സാൽമൺ മത്സ്യം', 'മത്സ്യം'],
      bn: ['স্যামন মাছ', 'মাছ'],
      mr: ['सॅल्मन मासा', 'मासा'],
      gu: ['સેલમન માછલી', 'માછલી'],
      pa: ['ਸਾਲਮਨ ਮੱਛੀ', 'ਮੱਛੀ'],
      ur: ['سامن مچھلی', 'مچھلی'],
      es: ['Salmón', 'Pescado'],
      fr: ['Saumon', 'Poisson'],
      de: ['Lachs', 'Fisch'],
      ar: ['سلمون', 'سمك'],
      zh: ['三文鱼', '鲑鱼', '鱼'],
      ja: ['サーモン', '鮭', '魚']
    },
    nutrientsOfInterest: ['omega-3', 'dha', 'epa', 'high protein', 'vitamin d']
  }
};

/**
 * Sanitizes search input to prevent XSS, script injection, and ReDoS.
 */
export function sanitizeSearchQuery(input: string): string {
  if (!input) return '';
  // Truncate to 100 characters max
  const truncated = input.slice(0, 100);
  // Strip HTML / script tags
  const stripped = truncated.replace(/<[^>]*>/g, '');
  return stripped.trim();
}

/**
 * Calculates Damerau-Levenshtein distance between two strings
 * Handles insertions, deletions, substitutions, and adjacent transpositions.
 */
export function damerauLevenshteinDistance(a: string, b: string): number {
  const al = a.length;
  const bl = b.length;
  if (al === 0) return bl;
  if (bl === 0) return al;

  const matrix: number[][] = [];
  for (let i = 0; i <= al; i++) {
    matrix[i] = [i];
  }
  for (let j = 0; j <= bl; j++) {
    matrix[0][j] = j;
  }

  for (let i = 1; i <= al; i++) {
    for (let j = 1; j <= bl; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      matrix[i][j] = Math.min(
        matrix[i - 1][j] + 1,      // deletion
        matrix[i][j - 1] + 1,      // insertion
        matrix[i - 1][j - 1] + cost // substitution
      );

      // Transposition
      if (i > 1 && j > 1 && a[i - 1] === b[j - 2] && a[i - 2] === b[j - 1]) {
        matrix[i][j] = Math.min(matrix[i][j], matrix[i - 2][j - 2] + 1);
      }
    }
  }

  return matrix[al][bl];
}

/**
 * Calculates normalized similarity between two tokens [0.0, 1.0]
 */
export function calculateSimilarity(query: string, target: string): number {
  const q = query.toLowerCase().trim();
  const t = target.toLowerCase().trim();
  if (q === t) return 1.0;
  const maxLen = Math.max(q.length, t.length);
  if (maxLen === 0) return 1.0;
  const distance = damerauLevenshteinDistance(q, t);
  return Math.max(0, 1 - distance / maxLen);
}

/**
 * Detects if a query represents a natural language nutrient discovery intent
 * (e.g. "high protein", "low calorie", "high fiber", "low carb", "rich in iron", etc.)
 */
export function detectNutrientIntent(query: string): {
  isNutrientQuery: boolean;
  macroSort?: MacroSortOption;
  nutrientFilter?: string;
  recommendedCategory?: string;
} {
  const q = query.toLowerCase().trim();

  // High Protein
  if (q.includes('high protein') || q.includes('protein rich') || q.includes('rich in protein') || q.includes('protein foods')) {
    return { isNutrientQuery: true, macroSort: 'protein-desc', nutrientFilter: 'protein' };
  }

  // Low Calorie / Weight Loss
  if (q.includes('low calorie') || q.includes('low cal') || q.includes('weight loss') || q.includes('diet foods')) {
    return { isNutrientQuery: true, macroSort: 'calories-asc', nutrientFilter: 'calories' };
  }

  // High Fiber
  if (q.includes('high fiber') || q.includes('fiber rich') || q.includes('rich in fiber') || q.includes('high fibre')) {
    return { isNutrientQuery: true, macroSort: 'fiber-desc', nutrientFilter: 'fiber' };
  }

  // Low Carb / Keto
  if (q.includes('low carb') || q.includes('keto') || q.includes('low carbohydrate')) {
    return { isNutrientQuery: true, macroSort: 'carbs-asc', nutrientFilter: 'carbs' };
  }

  // Low Fat
  if (q.includes('low fat') || q.includes('fat free') || q.includes('lean foods')) {
    return { isNutrientQuery: true, macroSort: 'fat-asc', nutrientFilter: 'fat' };
  }

  // Specific Micronutrients
  if (q.includes('potassium')) {
    return { isNutrientQuery: true, nutrientFilter: 'potassium' };
  }
  if (q.includes('vitamin c')) {
    return { isNutrientQuery: true, nutrientFilter: 'vitamin c' };
  }
  if (q.includes('iron') && (q.includes('rich') || q.includes('foods'))) {
    return { isNutrientQuery: true, nutrientFilter: 'iron' };
  }
  if (q.includes('omega 3') || q.includes('omega-3')) {
    return { isNutrientQuery: true, nutrientFilter: 'omega-3' };
  }

  return { isNutrientQuery: false };
}

/**
 * Scores and matches a food item against a sanitized query string.
 * Lower score is better (0 = exact match).
 */
export function scoreFoodMatch(
  item: FoodItemClient,
  rawQuery: string,
  userLanguage: string = 'en'
): SearchMatchResult | null {
  const cleanQ = sanitizeSearchQuery(rawQuery).toLowerCase().trim();
  if (!cleanQ) return null;

  const engName = (typeof item.name === 'string' ? item.name : item.name?.en || item.id || '').toLowerCase();
  const itemId = (item.id || '').toLowerCase();
  const categoryStr = (item.category || []).join(' ').toLowerCase();

  // 1. Exact Match on English name or ID (Score 0, 100% confidence)
  if (engName === cleanQ || itemId === cleanQ) {
    return {
      item,
      score: 0,
      matchType: 'exact',
      matchedField: engName === cleanQ ? 'name.en' : 'id',
      matchedValue: engName,
      confidence: 1.0
    };
  }

  // 2. Exact match in canonical aliases
  const canonicalMeta = CANONICAL_FOOD_SEARCH_METADATA[itemId] || 
    Object.values(CANONICAL_FOOD_SEARCH_METADATA).find(m => m.canonicalId === itemId);

  if (canonicalMeta) {
    // Check aliases
    if (canonicalMeta.aliases.includes(cleanQ)) {
      return {
        item,
        score: 0.1,
        matchType: 'exact',
        matchedField: 'alias',
        matchedValue: cleanQ,
        confidence: 0.99
      };
    }

    // Check scientific names exact
    for (const sci of canonicalMeta.scientificNames) {
      if (sci.toLowerCase() === cleanQ) {
        return {
          item,
          score: 0.2,
          matchType: 'scientific',
          matchedField: 'scientificName',
          matchedValue: sci,
          confidence: 0.99
        };
      }
    }
  }

  // 3. Name or ID starts with Query (Score 1, 95% confidence)
  if (engName.startsWith(cleanQ) || itemId.startsWith(cleanQ)) {
    return {
      item,
      score: 1.0,
      matchType: 'prefix',
      matchedField: engName.startsWith(cleanQ) ? 'name.en' : 'id',
      matchedValue: engName,
      confidence: 0.95
    };
  }

  // 4. Standalone Word Boundary Match in English Name (Score 2, 90% confidence)
  // e.g. "apple" in "Fuji Apple" or "Green Apple" -> word boundary matches!
  // In contrast, "apple" in "pineapple" does NOT match word boundary.
  const wordRegex = new RegExp(`\\b${escapeRegExp(cleanQ)}\\b`, 'i');
  if (wordRegex.test(engName)) {
    return {
      item,
      score: 2.0,
      matchType: 'word',
      matchedField: 'name.en',
      matchedValue: engName,
      confidence: 0.90
    };
  }

  // Word boundary starts-with (e.g. "avoc" in "Fresh Avocado")
  const wordStartRegex = new RegExp(`\\b${escapeRegExp(cleanQ)}`, 'i');
  if (wordStartRegex.test(engName)) {
    return {
      item,
      score: 2.5,
      matchType: 'word',
      matchedField: 'name.en',
      matchedValue: engName,
      confidence: 0.88
    };
  }

  // 5. Scientific Name Match (Prefix or Word Boundary)
  if (canonicalMeta) {
    for (const sci of canonicalMeta.scientificNames) {
      const sciLower = sci.toLowerCase();
      if (sciLower.startsWith(cleanQ) || sciLower.includes(cleanQ)) {
        return {
          item,
          score: 3.0,
          matchType: 'scientific',
          matchedField: 'scientificName',
          matchedValue: sci,
          confidence: 0.85
        };
      }
    }
  }

  // 6. Multilingual / Regional Names Match across all 48 languages
  // Check canonical metadata multilingual registry
  if (canonicalMeta && canonicalMeta.multilingual) {
    for (const [langCode, names] of Object.entries(canonicalMeta.multilingual)) {
      if (Array.isArray(names)) {
        for (const localizedName of names) {
          const locLower = localizedName.toLowerCase();
          if (locLower === cleanQ) {
            return {
              item,
              score: 3.8,
              matchType: 'localized',
              matchedField: `canonical.${langCode}`,
              matchedValue: localizedName,
              confidence: 0.95
            };
          }
          if (locLower.includes(cleanQ)) {
            return {
              item,
              score: 4.2,
              matchType: 'localized',
              matchedField: `canonical.${langCode}`,
              matchedValue: localizedName,
              confidence: 0.85
            };
          }
        }
      }
    }
  }

  // Check item.name object directly
  if (item.name && typeof item.name === 'object') {
    for (const [lang, val] of Object.entries(item.name)) {
      if (typeof val === 'string' && val.trim().length > 0) {
        const valLower = val.toLowerCase().trim();
        if (valLower === cleanQ) {
          return {
            item,
            score: 3.9,
            matchType: 'localized',
            matchedField: `name.${lang}`,
            matchedValue: val,
            confidence: 0.95
          };
        }
        if (valLower.includes(cleanQ)) {
          return {
            item,
            score: 4.5,
            matchType: 'localized',
            matchedField: `name.${lang}`,
            matchedValue: val,
            confidence: 0.80
          };
        }
      }
    }
  }

  // Check COMMON_FOOD_VOCABULARY
  const vocabKey = Object.keys(COMMON_FOOD_VOCABULARY).find(k => itemId.includes(k));
  if (vocabKey && COMMON_FOOD_VOCABULARY[vocabKey]) {
    for (const [lang, val] of Object.entries(COMMON_FOOD_VOCABULARY[vocabKey] || {})) {
      if (val && typeof val === 'string') {
        const valLower = val.toLowerCase().trim();
        if (valLower === cleanQ || valLower.includes(cleanQ)) {
          return {
            item,
            score: 4.6,
            matchType: 'localized',
            matchedField: `vocab.${lang}`,
            matchedValue: val,
            confidence: 0.82
          };
        }
      }
    }
  }

  // 7. Typo Tolerance / Fuzzy Match (Levenshtein Distance)
  // Only execute fuzzy check if query length is >= 4
  if (cleanQ.length >= 4) {
    // Check against English name
    const engTokens = engName.split(/[\s\-_(),]+/);
    for (const token of engTokens) {
      if (token.length >= 3) {
        const sim = calculateSimilarity(cleanQ, token);
        // Allow typo if similarity >= 0.75 and distance <= 2
        const dist = damerauLevenshteinDistance(cleanQ, token);
        if (sim >= 0.75 && dist <= (cleanQ.length <= 6 ? 1 : 2)) {
          return {
            item,
            score: 5.0 + (1 - sim),
            matchType: 'fuzzy',
            matchedField: 'name.en',
            matchedValue: engName,
            confidence: sim
          };
        }
      }
    }

    // Check against aliases
    if (canonicalMeta) {
      for (const alias of canonicalMeta.aliases) {
        const sim = calculateSimilarity(cleanQ, alias);
        const dist = damerauLevenshteinDistance(cleanQ, alias);
        if (sim >= 0.75 && dist <= (cleanQ.length <= 6 ? 1 : 2)) {
          return {
            item,
            score: 5.2 + (1 - sim),
            matchType: 'fuzzy',
            matchedField: 'alias',
            matchedValue: alias,
            confidence: sim
          };
        }
      }
    }
  }

  // 8. Category / Subcategory Match
  if (categoryStr.includes(cleanQ)) {
    return {
      item,
      score: 6.0,
      matchType: 'category',
      matchedField: 'category',
      matchedValue: item.category?.[0] || 'Category',
      confidence: 0.70
    };
  }

  // 9. Substring Match inside words (Score 7, 50% confidence)
  // e.g. "apple" inside "Pineapple" (score 7)
  if (engName.includes(cleanQ)) {
    return {
      item,
      score: 7.0,
      matchType: 'substring',
      matchedField: 'name.en',
      matchedValue: engName,
      confidence: 0.50
    };
  }

  return null;
}

/**
 * Searches and ranks foods using universal multi-tier ranking.
 * Guarantees that "apple" NEVER prioritizes Pineapple above Fuji Apple.
 */
export function searchAndRankFoods(
  catalog: FoodItemClient[],
  rawQuery: string,
  userLanguage: string = 'en',
  limit: number = 8
): {
  results: SearchMatchResult[];
  intent: ReturnType<typeof detectNutrientIntent>;
  suggestedSpelling?: string;
} {
  const cleanQ = sanitizeSearchQuery(rawQuery).toLowerCase().trim();
  if (!cleanQ || !catalog || catalog.length === 0) {
    return {
      results: [],
      intent: { isNutrientQuery: false }
    };
  }

  const intent = detectNutrientIntent(cleanQ);

  // If query is an intent like "high protein"
  if (intent.isNutrientQuery && intent.macroSort) {
    const sorted = sortFoodsByMacronutrient(catalog, intent.macroSort);
    const results: SearchMatchResult[] = sorted.slice(0, limit).map((item, idx) => ({
      item,
      score: idx * 0.1,
      matchType: 'nutrient',
      matchedField: intent.nutrientFilter || 'nutrient',
      matchedValue: `${item.nutrition?.protein || 0}g protein / ${item.nutrition?.calories || 0} kcal`,
      confidence: 0.95
    }));

    return { results, intent };
  }

  // Score all items
  const matches: SearchMatchResult[] = [];
  for (const item of catalog) {
    const res = scoreFoodMatch(item, cleanQ, userLanguage);
    if (res) {
      matches.push(res);
    }
  }

  // Sort by score asc (lower score = higher relevance)
  matches.sort((a, b) => {
    if (Math.abs(a.score - b.score) > 0.05) {
      return a.score - b.score;
    }

    // Tie-breaker 1: Shorter English name (canonical items are usually shorter)
    const aName = (typeof a.item.name === 'string' ? a.item.name : a.item.name?.en || a.item.id).toLowerCase();
    const bName = (typeof b.item.name === 'string' ? b.item.name : b.item.name?.en || b.item.id).toLowerCase();
    if (aName.length !== bName.length) {
      return aName.length - bName.length;
    }

    // Tie-breaker 2: Alphabetical
    return aName.localeCompare(bName);
  });

  // Check for typo suggestion if best result was fuzzy
  let suggestedSpelling: string | undefined;
  if (matches.length > 0 && matches[0].matchType === 'fuzzy') {
    suggestedSpelling = typeof matches[0].item.name === 'string' 
      ? matches[0].item.name 
      : matches[0].item.name?.en || matches[0].item.id;
  }

  return {
    results: matches.slice(0, limit),
    intent,
    suggestedSpelling
  };
}

/**
 * Builds a rich zero-results payload with helpful recommendations
 */
export function buildZeroResultsPayload(rawQuery: string): ZeroResultsSuggestion {
  const sanitizedQuery = sanitizeSearchQuery(rawQuery);

  // Common spelling corrections dictionary
  const typoCorrections: Record<string, string> = {
    avacado: 'Avocado',
    avocadoo: 'Avocado',
    pineaple: 'Pineapple',
    pinapple: 'Pineapple',
    mango: 'Mango',
    cocunut: 'Coconut',
    coconuts: 'Coconut',
    pomegrante: 'Pomegranate',
    pomgranate: 'Pomegranate',
    bannana: 'Banana',
    bananna: 'Banana',
    spinch: 'Spinach',
    chiken: 'Chicken',
    salman: 'Salmon',
    salmn: 'Salmon'
  };

  const cleanLower = sanitizedQuery.toLowerCase().trim();
  const suggestedSpelling = typoCorrections[cleanLower];

  return {
    query: rawQuery,
    sanitizedQuery,
    suggestedSpelling,
    popularFoods: [
      { id: 'avocado', name: 'Avocado', category: 'Fruits' },
      { id: 'fuji_apple', name: 'Fuji Apple', category: 'Fruits' },
      { id: 'banana', name: 'Banana', category: 'Fruits' },
      { id: 'mango', name: 'Mango', category: 'Fruits' },
      { id: 'tender_coconut', name: 'Tender Coconut', category: 'Fruits' },
      { id: 'nungu_ice_apple', name: 'Nungu / Ice Apple', category: 'Fruits' },
      { id: 'almonds', name: 'Almonds', category: 'Nuts' },
      { id: 'salmon', name: 'Atlantic Salmon', category: 'Fish' }
    ],
    suggestedCategories: [
      { id: 'fruits', name: 'Fruits', icon: 'Apple' },
      { id: 'vegetables', name: 'Vegetables', icon: 'Carrot' },
      { id: 'grains', name: 'Grains & Cereals', icon: 'Wheat' },
      { id: 'dairy', name: 'Dairy & Milks', icon: 'Milk' },
      { id: 'high-protein', name: 'High Protein Foods', icon: 'Dumbbell' }
    ],
    searchTips: [
      'Check your spelling for any typos or omitted letters.',
      'Try searching in Tamil (எ.கா. மாம்பழம், இளநீர், நுங்கு) or Hindi (सेब, केला, आम).',
      'Search by botanical/scientific name (e.g. Persea americana, Malus domestica).',
      'Discover foods by nutrient goals (e.g. "high protein", "low calorie", "high fiber").'
    ]
  };
}

/**
 * Sorts foods by macronutrient content or default alphabetical order
 */
export function sortFoodsByMacronutrient(
  items: FoodItemClient[],
  sortOption: MacroSortOption
): FoodItemClient[] {
  const copy = [...items];

  switch (sortOption) {
    case 'protein-desc':
      return copy.sort((a, b) => (b.nutrition?.protein || 0) - (a.nutrition?.protein || 0));

    case 'calories-asc':
      return copy.sort((a, b) => (a.nutrition?.calories || 0) - (b.nutrition?.calories || 0));

    case 'calories-desc':
      return copy.sort((a, b) => (b.nutrition?.calories || 0) - (a.nutrition?.calories || 0));

    case 'fiber-desc':
      return copy.sort((a, b) => (b.nutrition?.fiber || 0) - (a.nutrition?.fiber || 0));

    case 'carbs-asc':
      return copy.sort((a, b) => (a.nutrition?.carbs || 0) - (b.nutrition?.carbs || 0));

    case 'fat-asc':
      return copy.sort((a, b) => (a.nutrition?.fat || 0) - (b.nutrition?.fat || 0));

    case 'default':
    default:
      return copy.sort((a, b) => {
        const aName = (typeof a.name === 'string' ? a.name : a.name?.en || a.id).toLowerCase();
        const bName = (typeof b.name === 'string' ? b.name : b.name?.en || b.id).toLowerCase();
        return aName.localeCompare(bName);
      });
  }
}

/**
 * Filters foods by macronutrient thresholds
 */
export function filterFoodsByMacronutrients(
  items: FoodItemClient[],
  filters: MacroFilterOptions
): FoodItemClient[] {
  return items.filter(item => {
    const nut = item.nutrition;
    if (!nut) return true;

    if (filters.minProtein !== undefined && (nut.protein || 0) < filters.minProtein) {
      return false;
    }
    if (filters.maxCalories !== undefined && (nut.calories || 0) > filters.maxCalories) {
      return false;
    }
    if (filters.minFiber !== undefined && (nut.fiber || 0) < filters.minFiber) {
      return false;
    }
    if (filters.maxCarbs !== undefined && (nut.carbs || 0) > filters.maxCarbs) {
      return false;
    }
    if (filters.maxFat !== undefined && (nut.fat || 0) > filters.maxFat) {
      return false;
    }

    return true;
  });
}

function escapeRegExp(string: string): string {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
