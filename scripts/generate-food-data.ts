import { FoodItemClient, TranslatedContent } from "../shared/schema";

// Helper function to create translated content
const createTranslatedContent = (
  en: string, 
  hi: string, 
  ta: string
): TranslatedContent => ({ en, hi, ta });

// Image URLs for different food categories
const foodImageUrls = {
  fruits: [
    "https://images.unsplash.com/photo-1490474418585-ba9bad8fd0ea?auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1519996529931-28324d5a630e?auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1591287083773-9a5d4a5df79b?auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1526318472351-c75fcf070305?auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1552089123-2d26226fc2b7?auto=format&fit=crop&q=80",
  ],
  vegetables: [
    "https://images.unsplash.com/photo-1566385101042-1a0aa0c1268c?auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1557844352-761f2565b576?auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1518977956812-cd3dbadaaf31?auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1576181256399-834e3b3a49bf?auto=format&fit=crop&q=80",
  ],
  grains: [
    "https://images.unsplash.com/photo-1574323347407-f5e1c5c6e040?auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1586201375761-83865001e8ac?auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1562675482-3bf761c7163a?auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1614961233913-a5113a4a34ed?auto=format&fit=crop&q=80",
  ],
  spices: [
    "https://images.unsplash.com/photo-1532336414038-cf19250c5757?auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1596040033229-a9821ebd058d?auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1613485446293-97af9db9a4d2?auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1531423403547-538d91395c5e?auto=format&fit=crop&q=80",
  ],
  dairy: [
    "https://images.unsplash.com/photo-1563636619-e9143da7973b?auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1628689469838-524a4a973b8e?auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1550583724-b2692b85b150?auto=format&fit=crop&q=80",
  ],
  protein: [
    "https://images.unsplash.com/photo-1607623814075-e51df1bdc82f?auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1615937657715-bc7b4b7962c1?auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1617692855027-33b14f061079?auto=format&fit=crop&q=80",
  ],
  meat: [
    "https://images.unsplash.com/photo-1607623814075-e51df1bdc82f?auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1602470520998-f4a52199a3d6?auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1560781290-7dc94c0f8f4f?auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1615937691194-97dbd3f3dc29?auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1529694157872-4e0c0f3b238b?auto=format&fit=crop&q=80",
  ],
  seafood: [
    "https://images.unsplash.com/photo-1579684947550-22e945225d9a?auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1559737558-2f5a35f4523b?auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1498654896293-37aacf113fd9?auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1510130387422-82bed34b37e9?auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1599488394566-856f668835fc?auto=format&fit=crop&q=80",
  ],
  poultry: [
    "https://images.unsplash.com/photo-1587593810167-a84920ea0781?auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1501200291289-c5a76c232e5f?auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1518492104633-130d0cc84637?auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1583033363768-f623d619ac1a?auto=format&fit=crop&q=80",
  ],
};

// Function to get a random image for a category
const getRandomImage = (category: string): string => {
  const categoryImages = foodImageUrls[category as keyof typeof foodImageUrls] || foodImageUrls.fruits;
  return categoryImages[Math.floor(Math.random() * categoryImages.length)];
};

// Define food items data
export const generateFoodItems = (): FoodItemClient[] => {
  // Large array of fruits with their translations
  const fruits = [
    {
      id: "apple_red",
      name: createTranslatedContent("Red Apple", "लाल सेब", "சிவப்பு ஆப்பிள்"),
      description: createTranslatedContent(
        "Sweet and crisp red apple, rich in fiber and antioxidants",
        "मीठा और कुरकुरा लाल सेब, फाइबर और एंटीऑक्सीडेंट्स से भरपूर",
        "இனிப்பு மற்றும் கிரிஸ்ப் சிவப்பு ஆப்பிள், நார்ச்சத்து மற்றும் ஆன்டிஆக்ஸிடன்ட்களில் நிறைந்தது"
      ),
      origin: "Global",
      price: 1.49,
      image: "https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?auto=format&fit=crop&q=80",
      category: ["fruits"],
      nutrition: {
        calories: 52,
        carbs: 14,
        protein: 0.3,
        fat: 0.2,
        fiber: 2.4,
        vitamins: { "C": "14%", "K": "2%" }
      },
      allergens: [],
      isPopular: true
    },
    {
      id: "banana",
      name: createTranslatedContent("Banana", "केला", "வாழைப்பழம்"),
      description: createTranslatedContent(
        "Energy-rich fruit with potassium and natural sugars",
        "पोटैशियम और प्राकृतिक शर्करा युक्त ऊर्जा से भरपूर फल",
        "பொட்டாசியம் மற்றும் இயற்கை சர்க்கரைகளுடன் ஆற்றல் நிறைந்த பழம்"
      ),
      origin: "Tropical Regions",
      price: 0.59,
      image: "https://images.unsplash.com/photo-1587132137056-bfbf0166836e?auto=format&fit=crop&q=80",
      category: ["fruits", "tropical"],
      nutrition: {
        calories: 105,
        carbs: 27,
        protein: 1.3,
        fat: 0.4,
        fiber: 3.1,
        vitamins: { "B6": "20%", "C": "17%" }
      },
      allergens: [],
      isPopular: true
    },
    {
      id: "mango_alphonso",
      name: createTranslatedContent("Alphonso Mango", "हापुस आम", "ஆல்ஃபான்சோ மாம்பழம்"),
      description: createTranslatedContent(
        "Known as the king of mangoes, sweet and aromatic",
        "आम का राजा, मीठा और सुगंधित",
        "மாம்பழங்களின் ராஜா, இனிப்பு மற்றும் மணமுள்ள"
      ),
      origin: "India",
      price: 3.99,
      image: "https://images.unsplash.com/photo-1553279768-865429fa0078?auto=format&fit=crop&q=80",
      category: ["fruits", "indian", "seasonal"],
      nutrition: {
        calories: 70,
        carbs: 17,
        protein: 0.6,
        fat: 0.3,
        fiber: 1.8,
        vitamins: { "A": "25%", "C": "60%" }
      },
      allergens: [],
      isPopular: true
    },
    {
      id: "strawberry",
      name: createTranslatedContent("Strawberry", "स्ट्रॉबेरी", "ஸ்ட்ராபெரி"),
      description: createTranslatedContent(
        "Sweet and slightly tart berries rich in vitamin C",
        "विटामिन सी से भरपूर मीठे और हल्के खट्टे बेरीज",
        "இனிப்பு மற்றும் சிறிது புளிப்பான வைட்டமின் சி நிறைந்த பெர்ரிகள்"
      ),
      origin: "Europe, Americas",
      price: 2.99,
      image: "https://images.unsplash.com/photo-1587393855524-087f83d95bc9?auto=format&fit=crop&q=80",
      category: ["fruits", "berries"],
      nutrition: {
        calories: 32,
        carbs: 7.7,
        protein: 0.7,
        fat: 0.3,
        fiber: 2,
        vitamins: { "C": "100%", "Manganese": "24%" }
      },
      allergens: [],
      isPopular: true
    },
    {
      id: "orange",
      name: createTranslatedContent("Orange", "संतरा", "ஆரஞ்சு"),
      description: createTranslatedContent(
        "Juicy citrus fruit packed with vitamin C",
        "विटामिन सी से भरपूर रसदार खट्टा फल",
        "வைட்டமின் சி நிறைந்த சாறுள்ள சிட்ரஸ் பழம்"
      ),
      origin: "Southeast Asia",
      price: 1.29,
      image: "https://images.unsplash.com/photo-1611080626919-7cf5a9dbab12?auto=format&fit=crop&q=80",
      category: ["fruits", "citrus"],
      nutrition: {
        calories: 62,
        carbs: 15.4,
        protein: 1.2,
        fat: 0.2,
        fiber: 3.1,
        vitamins: { "C": "88%", "Folate": "10%" }
      },
      allergens: [],
      isPopular: false
    },
  ];

  // Vegetables data
  const vegetables = [
    {
      id: "spinach",
      name: createTranslatedContent("Spinach", "पालक", "கீரை"),
      description: createTranslatedContent(
        "Nutrient-rich leafy green vegetable",
        "पोषक तत्वों से भरपूर हरी पत्तेदार सब्जी",
        "ஊட்டச்சத்து நிறைந்த இலை பச்சை காய்கறி"
      ),
      origin: "Middle East",
      price: 1.99,
      image: "https://images.unsplash.com/photo-1576045057995-568f588f82fb?auto=format&fit=crop&q=80",
      category: ["vegetables", "leafy_greens"],
      nutrition: {
        calories: 23,
        carbs: 3.6,
        protein: 2.9,
        fat: 0.4,
        fiber: 2.2,
        vitamins: { "A": "187%", "K": "604%", "Folate": "66%", "C": "47%", "E": "13%" },
        minerals: { "Iron": "36%", "Magnesium": "22%", "Potassium": "12%", "Calcium": "10%" },
        antioxidants: { "Lutein": "high", "Zeaxanthin": "high", "Chlorophyll": "very high" }
      },
      healthBenefits: [
        createTranslatedContent(
          "Supports eye health and reduces the risk of macular degeneration",
          "आँखों के स्वास्थ्य का समर्थन करता है और मैकुलर डिजेनरेशन के जोखिम को कम करता है",
          "கண் ஆரோக்கியத்தை ஆதரிக்கிறது மற்றும் மேக்குலர் சிதைவு அபாயத்தைக் குறைக்கிறது"
        ),
        createTranslatedContent(
          "Helps lower blood pressure due to naturally occurring nitrates",
          "प्राकृतिक रूप से पाए जाने वाले नाइट्रेट्स के कारण रक्तचाप को कम करने में मदद करता है",
          "இயற்கையாக உருவாகும் நைட்ரேட்டுகள் காரணமாக இரத்த அழுத்தத்தைக் குறைக்க உதவுகிறது"
        ),
        createTranslatedContent(
          "Rich in antioxidants that combat oxidative stress and inflammation",
          "ऑक्सीडेटिव तनाव और सूजन से लड़ने वाले एंटीऑक्सीडेंट से भरपूर",
          "ஆக்ஸிஜனேற்ற அழுத்தம் மற்றும் அழற்சியை எதிர்த்துப் போராடும் ஆக்ஸிஜனேற்ற எதிர்ப்பிகள் நிறைந்தது"
        )
      ],
      recommendedIntake: createTranslatedContent(
        "1-2 cups of raw spinach daily provides excellent nutritional benefits without concerns of oxalate buildup",
        "प्रतिदिन 1-2 कप कच्चा पालक ऑक्सलेट के बिना उत्कृष्ट पोषण लाभ प्रदान करता है",
        "ஆக்சலேட் குவிப்பு குறித்த கவலைகள் இல்லாமல் 1-2 கப் கச்சா கீரை சிறந்த ஊட்டச்சத்து நன்மைகளை வழங்குகிறது"
      ),
      allergens: [],
      isPopular: true
    },
    {
      id: "carrot",
      name: createTranslatedContent("Carrot", "गाजर", "கேரட்"),
      description: createTranslatedContent(
        "Sweet and crunchy root vegetable rich in beta-carotene",
        "बीटा-कैरोटीन से भरपूर मीठी और कुरकुरी जड़ वाली सब्जी",
        "பீட்டா-கரோட்டீன் நிறைந்த இனிப்பு மற்றும் கிரிஸ்பி வேர் காய்கறி"
      ),
      origin: "Western Asia",
      price: 1.49,
      image: "https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?auto=format&fit=crop&q=80",
      category: ["vegetables", "root_vegetables"],
      nutrition: {
        calories: 41,
        carbs: 9.6,
        protein: 0.9,
        fat: 0.2,
        fiber: 2.8,
        vitamins: { "A": "334%", "K": "13%", "C": "9%", "B6": "7%" },
        minerals: { "Potassium": "8%", "Manganese": "6%" },
        antioxidants: { "Beta-carotene": "very high", "Alpha-carotene": "high", "Lutein": "moderate" }
      },
      healthBenefits: [
        createTranslatedContent(
          "Supports eye health with high levels of beta-carotene which converts to vitamin A",
          "बीटा-कैरोटीन के उच्च स्तर के साथ आंखों के स्वास्थ्य का समर्थन करता है जो विटामिन ए में परिवर्तित होता है",
          "விட்டமின் ஏ ஆக மாறும் அதிக அளவிலான பீட்டா-கரோட்டீனுடன் கண் ஆரோக்கியத்தை ஆதரிக்கிறது"
        ),
        createTranslatedContent(
          "Contains antioxidants that may help reduce the risk of certain cancers",
          "एंटीऑक्सिडेंट्स युक्त है जो कुछ कैंसर के जोखिम को कम करने में मदद कर सकते हैं",
          "சில புற்றுநோய்களின் ஆபத்தைக் குறைக்க உதவும் ஆக்ஸிஜனேற்ற எதிர்ப்பிகளைக் கொண்டுள்ளது"
        ),
        createTranslatedContent(
          "Helps improve digestion due to its fiber content",
          "फाइबर युक्त होने के कारण पाचन में सुधार करने में मदद करता है",
          "இதன் நார்ச்சத்து உள்ளடக்கம் காரணமாக செரிமானத்தை மேம்படுத்த உதவுகிறது"
        )
      ],
      recommendedIntake: createTranslatedContent(
        "One medium carrot per day provides a significant amount of vitamin A and beneficial antioxidants",
        "प्रतिदिन एक मध्यम गाजर विटामिन ए और लाभकारी एंटीऑक्सिडेंट्स की महत्वपूर्ण मात्रा प्रदान करता है",
        "ஒரு நாளைக்கு ஒரு நடுத்தர கேரட் குறிப்பிடத்தக்க அளவு வைட்டமின் ஏ மற்றும் பயனுள்ள ஆக்ஸிஜனேற்ற எதிர்ப்பிகளை வழங்குகிறது"
      ),
      allergens: [],
      isPopular: true
    },
    {
      id: "broccoli",
      name: createTranslatedContent("Broccoli", "ब्रोकली", "ப்ரோக்கோலி"),
      description: createTranslatedContent(
        "Cruciferous vegetable with dense nutrients and fiber",
        "घने पोषक तत्वों और फाइबर के साथ क्रूसिफेरस सब्जी",
        "அடர்த்தியான ஊட்டச்சத்துக்கள் மற்றும் நார்ச்சத்து கொண்ட குறுக்கு வகை காய்கறி"
      ),
      origin: "Europe",
      price: 2.29,
      image: "https://images.unsplash.com/photo-1584270354949-c26b0d5b4a0c?auto=format&fit=crop&q=80",
      category: ["vegetables", "cruciferous"],
      nutrition: {
        calories: 34,
        carbs: 6.6,
        protein: 2.8,
        fat: 0.4,
        fiber: 2.6,
        vitamins: { "C": "135%", "K": "116%", "Folate": "14%" }
      },
      allergens: [],
      isPopular: false
    },
    {
      id: "bell_pepper_red",
      name: createTranslatedContent("Red Bell Pepper", "लाल शिमला मिर्च", "சிவப்பு பெல் மிளகாய்"),
      description: createTranslatedContent(
        "Sweet, crunchy pepper with high vitamin C content",
        "उच्च विटामिन सी सामग्री के साथ मीठी, कुरकुरी मिर्च",
        "அதிக வைட்டமின் சி உள்ளடக்கத்துடன் இனிப்பு, கிரிஸ்பி மிளகாய்"
      ),
      origin: "North and South America",
      price: 1.79,
      image: "https://images.unsplash.com/photo-1633943899161-711706756e21?auto=format&fit=crop&q=80",
      category: ["vegetables", "nightshade"],
      nutrition: {
        calories: 31,
        carbs: 6,
        protein: 1,
        fat: 0.3,
        fiber: 2.1,
        vitamins: { "C": "169%", "A": "19%" }
      },
      allergens: [],
      isPopular: false
    },
    {
      id: "tomato",
      name: createTranslatedContent("Tomato", "टमाटर", "தக்காளி"),
      description: createTranslatedContent(
        "Juicy, versatile fruit used as a vegetable in cooking",
        "खाना पकाने में सब्जी के रूप में प्रयुक्त रसदार, बहुमुखी फल",
        "சமையலில் காய்கறியாக பயன்படுத்தப்படும் சாறுள்ள, பன்முக பழம்"
      ),
      origin: "Western South America",
      price: 1.59,
      image: "https://images.unsplash.com/photo-1562708294-4df93280352d?auto=format&fit=crop&q=80",
      category: ["vegetables", "fruits", "nightshade"],
      nutrition: {
        calories: 18,
        carbs: 3.9,
        protein: 0.9,
        fat: 0.2,
        fiber: 1.2,
        vitamins: { "C": "17%", "K": "10%" }
      },
      allergens: [],
      isPopular: true
    },
  ];

  // Spices data
  const spices = [
    {
      id: "turmeric",
      name: createTranslatedContent("Turmeric", "हल्दी", "மஞ்சள்"),
      description: createTranslatedContent(
        "Vibrant yellow spice with anti-inflammatory properties",
        "एंटी-इंफ्लेमेटरी गुणों के साथ जीवंत पीला मसाला",
        "அழற்சி எதிர்ப்பு பண்புகளைக் கொண்ட துடிப்பான மஞ்சள் மசாலா"
      ),
      origin: "South Asia",
      price: 2.99,
      image: "https://images.unsplash.com/photo-1615485500704-8e990f9900e1?auto=format&fit=crop&q=80",
      category: ["spices", "indian"],
      nutrition: {
        calories: 24,
        carbs: 4.4,
        protein: 0.5,
        fat: 0.7,
        fiber: 1.4,
        vitamins: { "Iron": "9%", "Manganese": "26%", "Potassium": "3%" },
        minerals: { "Calcium": "2%", "Magnesium": "5%" },
        antioxidants: { "Curcumin": "very high", "Curcuminoids": "high" }
      },
      healthBenefits: [
        createTranslatedContent(
          "Contains curcumin, a potent anti-inflammatory compound that helps reduce inflammation",
          "इसमें करक्यूमिन होता है, एक शक्तिशाली एंटी-इंफ्लामेटरी यौगिक जो सूजन को कम करने में मदद करता है",
          "வீக்கத்தைக் குறைக்க உதவும் ஒரு சக்திவாய்ந்த அழற்சி எதிர்ப்பு கலவையான குர்குமின் உள்ளது"
        ),
        createTranslatedContent(
          "May help improve symptoms of arthritis and joint pain",
          "आर्थराइटिस और जोड़ों के दर्द के लक्षणों को बेहतर बनाने में मदद कर सकता है",
          "மூட்டு வாதம் மற்றும் மூட்டு வலி அறிகுறிகளை மேம்படுத்த உதவலாம்"
        ),
        createTranslatedContent(
          "Boosts brain health by increasing BDNF, which promotes neuron growth",
          "BDNF को बढ़ाकर मस्तिष्क के स्वास्थ्य को बढ़ावा देता है, जो न्यूरॉन के विकास को बढ़ावा देता है",
          "நியூரான் வளர்ச்சியை ஊக்குவிக்கும் BDNF ஐ அதிகரிப்பதன் மூலம் மூளை ஆரோக்கியத்தை மேம்படுத்துகிறது"
        )
      ],
      recommendedIntake: createTranslatedContent(
        "500-2,000 mg of turmeric per day, or 100-500 mg of curcumin. Best absorbed when consumed with black pepper.",
        "प्रतिदिन 500-2,000 मिलीग्राम हल्दी, या 100-500 मिलीग्राम करक्यूमिन। काली मिर्च के साथ खाने पर सबसे अच्छा अवशोषित होता है।",
        "ஒரு நாளைக்கு 500-2,000 மி.கி மஞ்சள் அல்லது 100-500 மி.கி குர்குமின். கருப்பு மிளகுடன் சேர்த்து உட்கொள்ளும்போது சிறப்பாக உறிஞ்சப்படுகிறது."
      ),
      allergens: [],
      isPopular: true
    },
    {
      id: "black_pepper",
      name: createTranslatedContent("Black Pepper", "काली मिर्च", "கருப்பு மிளகு"),
      description: createTranslatedContent(
        "Pungent spice used to add heat and flavor to dishes",
        "व्यंजनों में गर्मी और स्वाद जोड़ने के लिए उपयोग किया जाने वाला तीखा मसाला",
        "உணவுகளில் சூடு மற்றும் சுவை சேர்க்க பயன்படுத்தப்படும் காரமான மசாலா"
      ),
      origin: "India",
      price: 3.49,
      image: "https://images.unsplash.com/photo-1613484603373-d43930543c6c?auto=format&fit=crop&q=80",
      category: ["spices", "global", "indian"],
      nutrition: {
        calories: 20,
        carbs: 3.6,
        protein: 0.7,
        fat: 0.5,
        fiber: 1.7,
        vitamins: { "K": "13%", "Iron": "9%" }
      },
      allergens: [],
      isPopular: false
    },
    {
      id: "cardamom",
      name: createTranslatedContent("Cardamom", "इलायची", "ஏலக்காய்"),
      description: createTranslatedContent(
        "Aromatic spice with a sweet, floral flavor",
        "मीठे, फूलों के स्वाद वाला सुगंधित मसाला",
        "இனிப்பு, மலர் சுவை கொண்ட மணமுள்ள மசாலா"
      ),
      origin: "India",
      price: 5.99,
      image: "https://images.unsplash.com/photo-1627828094935-5a73a17affd0?auto=format&fit=crop&q=80",
      category: ["spices", "indian"],
      nutrition: {
        calories: 18,
        carbs: 4,
        protein: 0.6,
        fat: 0.2,
        fiber: 1.6,
        vitamins: { "Manganese": "80%", "Iron": "13%" }
      },
      allergens: [],
      isPopular: false
    },
    {
      id: "cinnamon",
      name: createTranslatedContent("Cinnamon", "दालचीनी", "இலவங்கப்பட்டை"),
      description: createTranslatedContent(
        "Sweet and woody spice with numerous health benefits",
        "कई स्वास्थ्य लाभों के साथ मीठा और लकड़ी वाला मसाला",
        "பல சுகாதார நன்மைகளுடன் இனிப்பு மற்றும் மரம் மசாலா"
      ),
      origin: "Sri Lanka",
      price: 2.59,
      image: "https://images.unsplash.com/photo-1621179816621-63fe388f7d0e?auto=format&fit=crop&q=80",
      category: ["spices", "global"],
      nutrition: {
        calories: 6,
        carbs: 2,
        protein: 0.1,
        fat: 0.1,
        fiber: 1.4,
        vitamins: { "Manganese": "76%", "Calcium": "8%" }
      },
      allergens: [],
      isPopular: true
    },
    {
      id: "cumin_seeds",
      name: createTranslatedContent("Cumin Seeds", "जीरा", "சீரகம்"),
      description: createTranslatedContent(
        "Earthy, nutty spice essential in many cuisines",
        "कई व्यंजनों में अनिवार्य मिट्टी, नट्टी मसाला",
        "பல உணவு வகைகளில் அத்தியாவசிய மண் போன்ற, நட்டி மசாலா"
      ),
      origin: "Middle East",
      price: 1.89,
      image: "https://images.unsplash.com/photo-1620574387735-3624d75b2dbc?auto=format&fit=crop&q=80",
      category: ["spices", "indian", "global"],
      nutrition: {
        calories: 22,
        carbs: 2.7,
        protein: 1.1,
        fat: 1.3,
        fiber: 0.6,
        vitamins: { "Iron": "20%", "Manganese": "16%" }
      },
      allergens: [],
      isPopular: false
    },
  ];

  // Grains data
  const grains = [
    {
      id: "quinoa",
      name: createTranslatedContent("Quinoa", "क्विनोआ", "குயினோவா"),
      description: createTranslatedContent(
        "Gluten-free grain with complete protein profile",
        "पूर्ण प्रोटीन प्रोफाइल के साथ ग्लूटेन-फ्री अनाज",
        "முழு புரத சுயவிவரத்துடன் குளுட்டன் இல்லாத தானியம்"
      ),
      origin: "South America",
      price: 4.99,
      image: "https://images.unsplash.com/photo-1595904567075-958e3add3c85?auto=format&fit=crop&q=80",
      category: ["grains", "protein", "global"],
      nutrition: {
        calories: 120,
        carbs: 21.3,
        protein: 4.4,
        fat: 1.9,
        fiber: 2.8,
        vitamins: { "Manganese": "58%", "Magnesium": "30%" }
      },
      allergens: [],
      isPopular: true
    },
    {
      id: "brown_rice",
      name: createTranslatedContent("Brown Rice", "भूरा चावल", "பழுப்பு அரிசி"),
      description: createTranslatedContent(
        "Whole grain rice with nutty flavor and chewy texture",
        "अखरोट के स्वाद और चबाने वाली बनावट के साथ साबुत अनाज चावल",
        "நட்டி சுவை மற்றும் மென்மையான அமைப்புடன் முழு தானிய அரிசி"
      ),
      origin: "Global",
      price: 2.79,
      image: "https://images.unsplash.com/photo-1607110760903-e5b9b17a63ce?auto=format&fit=crop&q=80",
      category: ["grains", "global"],
      nutrition: {
        calories: 112,
        carbs: 24,
        protein: 2.3,
        fat: 0.8,
        fiber: 1.8,
        vitamins: { "Manganese": "88%", "Magnesium": "21%" }
      },
      allergens: [],
      isPopular: false
    },
    {
      id: "oats",
      name: createTranslatedContent("Oats", "जई", "ஓட்ஸ்"),
      description: createTranslatedContent(
        "Heart-healthy whole grain with high fiber content",
        "उच्च फाइबर सामग्री के साथ हृदय-स्वस्थ साबुत अनाज",
        "அதிக நார்ச்சத்து உள்ளடக்கத்துடன் இதய ஆரோக்கியமான முழு தானியம்"
      ),
      origin: "Europe",
      price: 3.29,
      image: "https://images.unsplash.com/photo-1614961233913-a5113a4a34ed?auto=format&fit=crop&q=80",
      category: ["grains", "breakfast"],
      nutrition: {
        calories: 155,
        carbs: 27.4,
        protein: 5.9,
        fat: 3.2,
        fiber: 4.1,
        vitamins: { "Manganese": "191%", "Phosphorus": "41%" }
      },
      allergens: [],
      isPopular: true
    },
    {
      id: "millet",
      name: createTranslatedContent("Millet", "बाजरा", "கம்பு"),
      description: createTranslatedContent(
        "Drought-resistant grain with high nutritional value",
        "उच्च पोषण मूल्य के साथ सूखा प्रतिरोधी अनाज",
        "உயர் ஊட்டச்சத்து மதிப்புடன் வறட்சி எதிர்ப்பு தானியம்"
      ),
      origin: "India, Africa",
      price: 3.49,
      image: "https://images.unsplash.com/photo-1609252493481-9702fe2d93e3?auto=format&fit=crop&q=80",
      category: ["grains", "indian", "gluten_free"],
      nutrition: {
        calories: 119,
        carbs: 23.7,
        protein: 3.5,
        fat: 1,
        fiber: 1.3,
        vitamins: { "Manganese": "23%", "Magnesium": "19%" }
      },
      allergens: [],
      isPopular: false
    },
    {
      id: "amaranth",
      name: createTranslatedContent("Amaranth", "राजगिरा", "அமரந்த்"),
      description: createTranslatedContent(
        "Ancient gluten-free grain with complete protein",
        "पूर्ण प्रोटीन के साथ प्राचीन ग्लूटेन-मुक्त अनाज",
        "முழு புரதத்துடன் பழங்கால குளுட்டன் இல்லாத தானியம்"
      ),
      origin: "Central America",
      price: 5.99,
      image: "https://images.unsplash.com/photo-1593059155805-1b7ed427e486?auto=format&fit=crop&q=80",
      category: ["grains", "gluten_free", "protein"],
      nutrition: {
        calories: 103,
        carbs: 18.7,
        protein: 3.8,
        fat: 1.6,
        fiber: 2.1,
        vitamins: { "Manganese": "105%", "Iron": "29%" }
      },
      allergens: [],
      isPopular: false
    },
  ];

  // Dairy data
  const dairy = [
    {
      id: "paneer",
      name: createTranslatedContent("Paneer", "पनीर", "பனீர்"),
      description: createTranslatedContent(
        "Fresh Indian cottage cheese, rich in protein",
        "प्रोटीन से भरपूर ताज़ा भारतीय पनीर",
        "புரதம் நிறைந்த புதிய இந்திய பனீர்"
      ),
      origin: "India",
      price: 4.99,
      image: "https://images.unsplash.com/photo-1631452180519-c014fe946bc7?auto=format&fit=crop&q=80",
      category: ["dairy", "protein", "indian"],
      nutrition: {
        calories: 295,
        carbs: 3.4,
        protein: 18,
        fat: 23,
        fiber: 0,
        vitamins: { "Calcium": "53%", "Phosphorus": "38%" }
      },
      allergens: ["milk"],
      isPopular: true
    },
    {
      id: "greek_yogurt",
      name: createTranslatedContent("Greek Yogurt", "ग्रीक दही", "கிரேக்க தயிர்"),
      description: createTranslatedContent(
        "Thick strained yogurt with high protein content",
        "उच्च प्रोटीन सामग्री के साथ मोटा छना हुआ दही",
        "அதிக புரதம் கொண்ட தடித்த வடிகட்டிய தயிர்"
      ),
      origin: "Greece",
      price: 3.79,
      image: "https://images.unsplash.com/photo-1563804447971-6e113ab80713?auto=format&fit=crop&q=80",
      category: ["dairy", "protein", "global"],
      nutrition: {
        calories: 133,
        carbs: 7.3,
        protein: 17.3,
        fat: 4.1,
        fiber: 0,
        vitamins: { "Calcium": "15%", "Vitamin B12": "38%" }
      },
      allergens: ["milk"],
      isPopular: true
    },
    {
      id: "cheddar_cheese",
      name: createTranslatedContent("Cheddar Cheese", "चेडर चीज़", "செடார் சீஸ்"),
      description: createTranslatedContent(
        "Firm, sharp-tasting yellow cheese",
        "दृढ़, तेज स्वाद वाला पीला चीज़",
        "உறுதியான, கூர்மையான சுவையுள்ள மஞ்சள் சீஸ்"
      ),
      origin: "England",
      price: 5.29,
      image: "https://images.unsplash.com/photo-1618164436241-4473940d1f5c?auto=format&fit=crop&q=80",
      category: ["dairy", "global"],
      nutrition: {
        calories: 403,
        carbs: 1.3,
        protein: 24.9,
        fat: 33.1,
        fiber: 0,
        vitamins: { "Calcium": "72%", "Vitamin B12": "21%" }
      },
      allergens: ["milk"],
      isPopular: false
    },
    {
      id: "butter",
      name: createTranslatedContent("Butter", "मक्खन", "வெண்ணெய்"),
      description: createTranslatedContent(
        "Dairy product made from churning cream or milk",
        "क्रीम या दूध को मथने से बना डेयरी उत्पाद",
        "கிரீம் அல்லது பாலைக் கடைந்து தயாரிக்கப்படும் பால் பொருள்"
      ),
      origin: "Global",
      price: 3.49,
      image: "https://images.unsplash.com/photo-1589985270958-a664e7dc98b9?auto=format&fit=crop&q=80",
      category: ["dairy", "global"],
      nutrition: {
        calories: 717,
        carbs: 0.1,
        protein: 0.9,
        fat: 81.1,
        fiber: 0,
        vitamins: { "Vitamin A": "50%", "Vitamin E": "20%" }
      },
      allergens: ["milk"],
      isPopular: false
    },
  ];

  // Protein sources
  const proteins = [
    {
      id: "salmon",
      name: createTranslatedContent("Atlantic Salmon", "एटलांटिक सैलमन", "அட்லாண்டிக் சாமன்"),
      description: createTranslatedContent(
        "Oily fish rich in omega-3 fatty acids and protein",
        "ओमेगा-3 फैटी एसिड और प्रोटीन से भरपूर तेलीय मछली",
        "ஒமேகா-3 கொழுப்பு அமிலங்கள் மற்றும் புரதம் நிறைந்த எண்ணெய் மீன்"
      ),
      origin: "North Atlantic Ocean",
      price: 12.99,
      image: "https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?auto=format&fit=crop&q=80",
      category: ["seafood", "protein", "non_vegetarian"],
      nutrition: {
        calories: 208,
        carbs: 0,
        protein: 20.4,
        fat: 13.4,
        fiber: 0,
        vitamins: { "B12": "106%", "D": "66%", "B6": "38%", "Niacin": "50%" },
        minerals: { "Selenium": "53%", "Phosphorus": "21%", "Potassium": "8%" },
        omega3: 2.6,
        omega6: 0.1
      },
      healthBenefits: [
        createTranslatedContent(
          "Rich in long-chain omega-3 fatty acids EPA and DHA that support heart and brain health",
          "दिल और दिमाग के स्वास्थ्य का समर्थन करने वाले लंबी श्रृंखला वाले ओमेगा-3 फैटी एसिड EPA और DHA से भरपूर",
          "இதயம் மற்றும் மூளை ஆரோக்கியத்தை ஆதரிக்கும் நீண்ட சங்கிலி ஒமேகா-3 கொழுப்பு அமிலங்கள் EPA மற்றும் DHA நிறைந்தது"
        ),
        createTranslatedContent(
          "High-quality protein source containing all essential amino acids",
          "सभी आवश्यक अमीनो एसिड वाला उच्च गुणवत्ता वाला प्रोटीन स्रोत",
          "அனைத்து அத்தியாவசிய அமினோ அமிலங்களையும் கொண்ட உயர்தர புரத ஆதாரம்"
        ),
        createTranslatedContent(
          "Contains astaxanthin, a powerful antioxidant that may reduce inflammation",
          "एस्टाक्सैन्थिन युक्त है, एक शक्तिशाली एंटीऑक्सिडेंट जो सूजन को कम कर सकता है",
          "அழற்சியைக் குறைக்கக்கூடிய சக்திவாய்ந்த ஆக்ஸிஜனேற்ற எதிர்ப்பியான அஸ்டாக்சாந்தினைக் கொண்டுள்ளது"
        )
      ],
      recommendedIntake: createTranslatedContent(
        "The American Heart Association recommends eating 2 servings of fatty fish like salmon per week",
        "अमेरिकन हार्ट एसोसिएशन हर सप्ताह सैल्मन जैसी वसायुक्त मछली के 2 परोसने खाने की सिफारिश करता है",
        "அமெரிக்க இதய சங்கம் வாரத்திற்கு 2 பரிமாறல்கள் சாமன் போன்ற கொழுப்பு மீன் சாப்பிட பரிந்துரைக்கிறது"
      ),
      allergens: ["fish"],
      isPopular: true
    },
    {
      id: "chickpeas",
      name: createTranslatedContent("Chickpeas", "चना", "கடலை"),
      description: createTranslatedContent(
        "Protein-rich legume central to many cuisines",
        "कई व्यंजनों के लिए केंद्रीय प्रोटीन से भरपूर फलियां",
        "பல உணவுகளுக்கு மையமான புரதம் நிறைந்த பருப்பு"
      ),
      origin: "Middle East",
      price: 1.99,
      image: "https://images.unsplash.com/photo-1515543904379-3d757afe72e4?auto=format&fit=crop&q=80",
      category: ["protein", "legumes", "indian", "global"],
      nutrition: {
        calories: 269,
        carbs: 45,
        protein: 14.5,
        fat: 4.3,
        fiber: 12.5,
        vitamins: { "Folate": "71%", "Manganese": "73%" }
      },
      allergens: [],
      isPopular: false
    },
    {
      id: "tofu",
      name: createTranslatedContent("Tofu", "टोफू", "டோஃபு"),
      description: createTranslatedContent(
        "Plant-based protein made from condensed soy milk",
        "संघनित सोया दूध से बना पौधे आधारित प्रोटीन",
        "அடர்த்தியான சோயா பாலில் இருந்து தயாரிக்கப்பட்ட தாவர அடிப்படையிலான புரதம்"
      ),
      origin: "East Asia",
      price: 2.89,
      image: "https://images.unsplash.com/photo-1584728719759-08de25683d2d?auto=format&fit=crop&q=80",
      category: ["protein", "vegan", "global"],
      nutrition: {
        calories: 76,
        carbs: 1.9,
        protein: 8,
        fat: 4.8,
        fiber: 0.3,
        vitamins: { "Calcium": "17%", "Iron": "17%" }
      },
      allergens: ["soy"],
      isPopular: false
    },
    {
      id: "almonds",
      name: createTranslatedContent("Almonds", "बादाम", "பாதாம்"),
      description: createTranslatedContent(
        "Nutrient-dense tree nuts with healthy fats",
        "स्वस्थ वसा के साथ पोषक तत्व युक्त पेड़ के अखरोट",
        "ஆரோக்கியமான கொழுப்புகளுடன் ஊட்டச்சத்து நிறைந்த மர கொட்டைகள்"
      ),
      origin: "Middle East",
      price: 7.99,
      image: "https://images.unsplash.com/photo-1574053105251-88f982725750?auto=format&fit=crop&q=80",
      category: ["nuts", "protein"],
      nutrition: {
        calories: 579,
        carbs: 21.6,
        protein: 21.2,
        fat: 49.9,
        fiber: 12.5,
        vitamins: { "Vitamin E": "170%", "Magnesium": "80%" }
      },
      allergens: ["tree nuts"],
      isPopular: true
    },
    {
      id: "lentils",
      name: createTranslatedContent("Lentils", "दाल", "பருப்பு"),
      description: createTranslatedContent(
        "Quick-cooking legumes with high protein and fiber",
        "उच्च प्रोटीन और फाइबर के साथ त्वरित पकाने वाली फलियां",
        "அதிக புரதம் மற்றும் நார்ச்சத்து கொண்ட விரைவாக சமைக்கும் பருப்பு வகைகள்"
      ),
      origin: "South Asia",
      price: 2.29,
      image: "https://images.unsplash.com/photo-1611575330633-551852a8a1af?auto=format&fit=crop&q=80",
      category: ["protein", "legumes", "indian"],
      nutrition: {
        calories: 116,
        carbs: 20,
        protein: 9,
        fat: 0.4,
        fiber: 8,
        vitamins: { "Folate": "90%", "Iron": "37%" }
      },
      allergens: [],
      isPopular: true
    },
  ];

  // Generate a large dataset by multiplying existing items
  // Meat data from around the world
  const meats = [
    {
      id: "beef_steak",
      name: createTranslatedContent("Beef Steak", "बीफ स्टेक", "மாட்டிறைச்சி ஸ்டேக்"),
      description: createTranslatedContent(
        "Premium cut of beef, rich in protein and flavor",
        "बीफ का प्रीमियम कट, प्रोटीन और स्वाद से भरपूर",
        "மாட்டிறைச்சியின் பிரீமியம் கட், புரதம் மற்றும் சுவையில் வளமானது"
      ),
      origin: "Global",
      price: 12.99,
      image: "https://images.unsplash.com/photo-1594041680711-594a305999de?auto=format&fit=crop&q=80",
      category: ["meat", "protein", "non_vegetarian"],
      nutrition: {
        calories: 277,
        carbs: 0,
        protein: 26,
        fat: 19,
        fiber: 0,
        vitamins: { "B12": "70%", "Zinc": "42%", "Iron": "15%" }
      },
      allergens: [],
      isPopular: true
    },
    {
      id: "lamb_chops",
      name: createTranslatedContent("Lamb Chops", "लैम्ब चॉप्स", "ஆட்டிறைச்சி சாப்ஸ்"),
      description: createTranslatedContent(
        "Tender cuts of lamb meat, often prepared with herbs and spices",
        "मेमने के नरम कट, अक्सर जड़ी-बूटियों और मसालों के साथ तैयार किए जाते हैं",
        "ஆட்டிறைச்சியின் மென்மையான துண்டுகள், பெரும்பாலும் மூலிகைகள் மற்றும் மசாலாக்களுடன் தயாரிக்கப்படுகிறது"
      ),
      origin: "Middle East, Mediterranean",
      price: 14.99,
      image: "https://images.unsplash.com/photo-1619022706178-dc4f0ba3ed65?auto=format&fit=crop&q=80",
      category: ["meat", "protein", "non_vegetarian", "middle_eastern"],
      nutrition: {
        calories: 310,
        carbs: 0,
        protein: 22,
        fat: 24,
        fiber: 0,
        vitamins: { "B12": "50%", "Zinc": "30%", "Iron": "12%" }
      },
      allergens: [],
      isPopular: false
    },
    {
      id: "pork_belly",
      name: createTranslatedContent("Pork Belly", "सूअर का पेट", "பன்றி வயிறு"),
      description: createTranslatedContent(
        "Fatty cut of pork used in various cuisines for its rich flavor",
        "अपने समृद्ध स्वाद के लिए विभिन्न व्यंजनों में उपयोग किया जाने वाला सूअर का वसायुक्त कट",
        "அதன் வளமான சுவைக்காக பல்வேறு உணவு வகைகளில் பயன்படுத்தப்படும் பன்றியின் கொழுப்பு துண்டு"
      ),
      origin: "East Asia, Europe",
      price: 9.99,
      image: "https://images.unsplash.com/photo-1624538008140-5c1c91bfac2e?auto=format&fit=crop&q=80",
      category: ["meat", "protein", "non_vegetarian", "asian", "european"],
      nutrition: {
        calories: 520,
        carbs: 0,
        protein: 9,
        fat: 53,
        fiber: 0,
        vitamins: { "B1": "60%", "B12": "15%", "Selenium": "27%" }
      },
      allergens: [],
      isPopular: true
    },
    {
      id: "venison",
      name: createTranslatedContent("Venison", "हिरण का मांस", "மான் இறைச்சி"),
      description: createTranslatedContent(
        "Lean game meat with a rich, earthy flavor",
        "समृद्ध, मिट्टी के स्वाद वाला दुबला शिकार का मांस",
        "வளமான, மண் போன்ற சுவையுடன் கூடிய மெலிந்த விளையாட்டு இறைச்சி"
      ),
      origin: "North America, Europe",
      price: 16.99,
      image: "https://images.unsplash.com/photo-1574484284002-952d92456975?auto=format&fit=crop&q=80",
      category: ["meat", "protein", "non_vegetarian", "game"],
      nutrition: {
        calories: 175,
        carbs: 0,
        protein: 34,
        fat: 3.5,
        fiber: 0,
        vitamins: { "B12": "33%", "Iron": "37%", "Zinc": "28%" }
      },
      allergens: [],
      isPopular: false
    },
    {
      id: "wagyu_beef",
      name: createTranslatedContent("Wagyu Beef", "वाग्यू बीफ", "வாக்யு மாட்டிறைச்சி"),
      description: createTranslatedContent(
        "Premium Japanese beef known for its intense marbling and tenderness",
        "तीव्र मार्बलिंग और कोमलता के लिए जाना जाने वाला प्रीमियम जापानी बीफ",
        "அதன் தீவிர மார்பிளிங் மற்றும் மென்மைக்கு பெயர் பெற்ற பிரீமியம் ஜப்பானிய மாட்டிறைச்சி"
      ),
      origin: "Japan",
      price: 45.99,
      image: "https://images.unsplash.com/photo-1607116667981-ff437035388c?auto=format&fit=crop&q=80",
      category: ["meat", "protein", "non_vegetarian", "japanese", "premium"],
      nutrition: {
        calories: 310,
        carbs: 0,
        protein: 22,
        fat: 25,
        fiber: 0,
        vitamins: { "B12": "65%", "Zinc": "35%", "Iron": "20%" },
        minerals: { "Phosphorus": "22%", "Selenium": "35%", "Potassium": "8%" },
        omega3: 0.1,
        omega6: 0.4,
        collagen: 2.8
      },
      healthBenefits: [
        createTranslatedContent(
          "Rich source of high-quality protein for muscle growth and repair",
          "मांसपेशियों के विकास और मरम्मत के लिए उच्च गुणवत्ता वाले प्रोटीन का समृद्ध स्रोत",
          "தசை வளர்ச்சி மற்றும் மறுசீரமைப்புக்கான உயர்தர புரதத்தின் வளமான ஆதாரம்"
        ),
        createTranslatedContent(
          "Contains conjugated linoleic acid (CLA) which may have anti-cancer properties",
          "इसमें कॉन्जुगेटेड लिनोलिक एसिड (CLA) होता है जिसमें कैंसर-रोधी गुण हो सकते हैं",
          "புற்றுநோய் எதிர்ப்பு பண்புகளைக் கொண்டிருக்கக்கூடிய இணைந்த லினோலிக் அமிலம் (CLA) உள்ளது"
        ),
        createTranslatedContent(
          "High in B vitamins that support energy production and brain function",
          "बी विटामिन में उच्च जो ऊर्जा उत्पादन और मस्तिष्क के कार्य का समर्थन करता है",
          "ஆற்றல் உற்பத்தி மற்றும் மூளைச் செயல்பாட்டை ஆதரிக்கும் பி வைட்டமின்கள் அதிகம் உள்ளது"
        )
      ],
      recommendedIntake: createTranslatedContent(
        "The American Heart Association recommends limiting red meat to 1-2 servings per week of 3 oz (85g) portions",
        "अमेरिकन हार्ट एसोसिएशन 3 औंस (85 ग्राम) हिस्सों के प्रति सप्ताह 1-2 सर्विंग्स तक रेड मीट को सीमित करने की सलाह देता है",
        "அமெரிக்க இதய சங்கம் 3 அவுன்ஸ் (85கி) அளவுகளில் வாரத்திற்கு 1-2 பரிமாறல்களுக்கு சிவப்பு இறைச்சியை வரம்புக்குட்படுத்த பரிந்துரைக்கிறது"
      ),
      allergens: [],
      isPopular: true
    }
  ];

  // Seafood data from around the world
  const seafood = [
    {
      id: "atlantic_salmon",
      name: createTranslatedContent("Atlantic Salmon", "अटलांटिक सामन", "அட்லாண்டிக் சாமன்"),
      description: createTranslatedContent(
        "Rich, oily fish packed with omega-3 fatty acids",
        "ओमेगा-3 फैटी एसिड से भरपूर समृद्ध, तैलीय मछली",
        "ஒமேகா-3 கொழுப்பு அமிலங்கள் நிறைந்த வளமான, எண்ணெய்ப்பசை மீன்"
      ),
      origin: "North Atlantic Ocean",
      price: 12.99,
      image: "https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?auto=format&fit=crop&q=80",
      category: ["seafood", "protein", "non_vegetarian", "fish"],
      nutrition: {
        calories: 208,
        carbs: 0,
        protein: 22,
        fat: 13,
        fiber: 0,
        vitamins: { "B12": "106%", "D": "66%", "B6": "38%" },
        minerals: { "Selenium": "57%", "Phosphorus": "28%", "Potassium": "18%" },
        omega3: 2.6,
        omega6: 0.2,
        antioxidants: { "Astaxanthin": "high" }
      },
      healthBenefits: [
        createTranslatedContent(
          "Supports heart health by lowering triglycerides and reducing inflammation",
          "ट्राइग्लिसराइड्स को कम करके और सूजन को कम करके हृदय स्वास्थ्य का समर्थन करता है",
          "டிரைகிளிசரைடுகளைக் குறைப்பதன் மூலமும், அழற்சியைக் குறைப்பதன் மூலமும் இதய ஆரோக்கியத்தை ஆதரிக்கிறது"
        ),
        createTranslatedContent(
          "Promotes brain health and cognitive function throughout life",
          "जीवन भर मस्तिष्क के स्वास्थ्य और संज्ञानात्मक कार्य को बढ़ावा देता है",
          "வாழ்க்கை முழுவதும் மூளை ஆரோக்கியத்தையும் அறிவாற்றல் செயல்பாட்டையும் மேம்படுத்துகிறது"
        ),
        createTranslatedContent(
          "May reduce risk factors for several chronic diseases",
          "कई पुरानी बीमारियों के जोखिम कारकों को कम कर सकता है",
          "பல நாள்பட்ட நோய்களுக்கான ஆபத்து காரணிகளைக் குறைக்கலாம்"
        )
      ],
      recommendedIntake: createTranslatedContent(
        "The American Heart Association recommends eating fatty fish like salmon at least twice per week",
        "अमेरिकन हार्ट एसोसिएशन सप्ताह में कम से कम दो बार सामन जैसी वसायुक्त मछली खाने की सलाह देता है",
        "அமெரிக்க இதய சங்கம் வாரத்திற்கு குறைந்தது இரண்டு முறையாவது சாமன் போன்ற கொழுப்புள்ள மீன்களை உண்ண பரிந்துரைக்கிறது"
      ),
      allergens: ["fish"],
      isPopular: true
    },
    {
      id: "tiger_prawns",
      name: createTranslatedContent("Tiger Prawns", "टाइगर प्रॉन", "டைகர் இறால்"),
      description: createTranslatedContent(
        "Large, flavorful shrimp with distinctive striped shells",
        "विशिष्ट धारीदार खोल के साथ बड़े, स्वादिष्ट झींगे",
        "தனித்துவமான கோடுகளுடன் கூடிய பெரிய, சுவையான இறால்"
      ),
      origin: "Indo-Pacific Ocean",
      price: 18.99,
      image: "https://images.unsplash.com/photo-1565680018485-43c7688faf7e?auto=format&fit=crop&q=80",
      category: ["seafood", "protein", "non_vegetarian", "shellfish", "asian"],
      nutrition: {
        calories: 120,
        carbs: 0,
        protein: 24,
        fat: 2,
        fiber: 0,
        vitamins: { "B12": "80%", "Selenium": "78%", "Copper": "30%" }
      },
      allergens: ["shellfish"],
      isPopular: true
    },
    {
      id: "octopus",
      name: createTranslatedContent("Octopus", "ऑक्टोपस", "ஆக்டோபஸ்"),
      description: createTranslatedContent(
        "Tender seafood popular in Mediterranean and Asian cuisines",
        "भूमध्य और एशियाई व्यंजनों में लोकप्रिय कोमल समुद्री भोजन",
        "மெடிட்டரேனியன் மற்றும் ஆசிய உணவுகளில் பிரபலமான மென்மையான கடல் உணவு"
      ),
      origin: "Mediterranean, Pacific Ocean",
      price: 16.99,
      image: "https://images.unsplash.com/photo-1565722625536-55bdb21c969a?auto=format&fit=crop&q=80",
      category: ["seafood", "protein", "non_vegetarian", "mediterranean", "asian"],
      nutrition: {
        calories: 140,
        carbs: 4,
        protein: 25,
        fat: 2,
        fiber: 0,
        vitamins: { "B12": "360%", "Iron": "45%", "Copper": "168%" }
      },
      allergens: ["mollusk"],
      isPopular: false
    },
    {
      id: "snow_crab",
      name: createTranslatedContent("Snow Crab", "स्नो क्रैब", "ஸ்னோ நண்டு"),
      description: createTranslatedContent(
        "Sweet, delicate crab meat from cold northern waters",
        "ठंडे उत्तरी पानी से मीठा, नाजुक केकड़ा मांस",
        "குளிர்ந்த வடக்கு நீரில் இருந்து இனிப்பு, நாசுக்கான நண்டு இறைச்சி"
      ),
      origin: "North Atlantic, North Pacific",
      price: 22.99,
      image: "https://images.unsplash.com/photo-1559737558-2f5a35f4523b?auto=format&fit=crop&q=80",
      category: ["seafood", "protein", "non_vegetarian", "shellfish", "premium"],
      nutrition: {
        calories: 120,
        carbs: 0,
        protein: 26,
        fat: 1.5,
        fiber: 0,
        vitamins: { "B12": "233%", "Zinc": "40%", "Copper": "68%" }
      },
      allergens: ["shellfish"],
      isPopular: true
    },
    {
      id: "tuna_sashimi",
      name: createTranslatedContent("Tuna Sashimi", "टूना सशिमी", "டுனா சாஷிமி"),
      description: createTranslatedContent(
        "Raw, high-grade tuna slices popular in Japanese cuisine",
        "जापानी व्यंजनों में लोकप्रिय कच्चे, उच्च-ग्रेड टूना के टुकड़े",
        "ஜப்பானிய உணவில் பிரபலமான, உயர்தர கச்சா டுனா துண்டுகள்"
      ),
      origin: "Japan",
      price: 24.99,
      image: "https://images.unsplash.com/photo-1579871494447-9811cf80d66c?auto=format&fit=crop&q=80",
      category: ["seafood", "protein", "non_vegetarian", "japanese", "raw", "premium"],
      nutrition: {
        calories: 180,
        carbs: 0,
        protein: 39,
        fat: 1,
        fiber: 0,
        vitamins: { "B12": "120%", "Selenium": "167%", "B6": "53%" }
      },
      allergens: ["fish"],
      isPopular: true
    }
  ];

  // Poultry data from around the world
  const poultry = [
    {
      id: "chicken_breast",
      name: createTranslatedContent("Chicken Breast", "चिकन ब्रेस्ट", "கோழி மார்பு"),
      description: createTranslatedContent(
        "Lean, versatile cut of chicken, high in protein and low in fat",
        "दुबला, बहुमुखी चिकन कट, प्रोटीन में उच्च और वसा में कम",
        "மெலிந்த, பன்முக பயன்பாட்டு கோழி துண்டு, அதிக புரதம் மற்றும் குறைந்த கொழுப்பு"
      ),
      origin: "Global",
      price: 5.99,
      image: "https://images.unsplash.com/photo-1604503468506-a8da13d82791?auto=format&fit=crop&q=80",
      category: ["poultry", "protein", "non_vegetarian"],
      nutrition: {
        calories: 165,
        carbs: 0,
        protein: 31,
        fat: 3.6,
        fiber: 0,
        vitamins: { "B6": "30%", "B3": "70%", "Phosphorus": "20%" }
      },
      allergens: [],
      isPopular: true
    },
    {
      id: "duck_breast",
      name: createTranslatedContent("Duck Breast", "बत्तख का सीना", "வாத்து மார்பு"),
      description: createTranslatedContent(
        "Rich, flavorful poultry with a crispy skin when cooked properly",
        "सही से पकाए जाने पर कुरकुरी त्वचा के साथ समृद्ध, स्वादिष्ट पोल्ट्री",
        "சரியாக சமைக்கப்படும்போது கிரிஸ்பி தோலுடன் வளமான, சுவையான கோழி வகை"
      ),
      origin: "France, China",
      price: 12.99,
      image: "https://images.unsplash.com/photo-1619301679082-fbb1dd0adb93?auto=format&fit=crop&q=80",
      category: ["poultry", "protein", "non_vegetarian", "french", "chinese"],
      nutrition: {
        calories: 250,
        carbs: 0,
        protein: 19,
        fat: 19,
        fiber: 0,
        vitamins: { "B12": "28%", "Iron": "25%", "Selenium": "33%" }
      },
      allergens: [],
      isPopular: false
    },
    {
      id: "turkey_leg",
      name: createTranslatedContent("Turkey Leg", "टर्की लेग", "வான்கோழி கால்"),
      description: createTranslatedContent(
        "Flavorful dark meat from turkey, often slow-cooked for tenderness",
        "टर्की से स्वादिष्ट डार्क मीट, अक्सर कोमलता के लिए धीमी आंच पर पकाया जाता है",
        "வான்கோழியின் சுவையான கருப்பு இறைச்சி, பெரும்பாலும் மென்மைக்காக மெதுவாக சமைக்கப்படுகிறது"
      ),
      origin: "North America",
      price: 4.99,
      image: "https://images.unsplash.com/photo-1606502973842-f64bc2785fe5?auto=format&fit=crop&q=80",
      category: ["poultry", "protein", "non_vegetarian", "american"],
      nutrition: {
        calories: 210,
        carbs: 0,
        protein: 28,
        fat: 10,
        fiber: 0,
        vitamins: { "B6": "35%", "B12": "15%", "Zinc": "20%" }
      },
      allergens: [],
      isPopular: true
    },
    {
      id: "quail",
      name: createTranslatedContent("Quail", "बटेर", "காடை"),
      description: createTranslatedContent(
        "Small game bird with delicate, flavorful meat",
        "नाजुक, स्वादिष्ट मांस वाला छोटा शिकार पक्षी",
        "நாசுக்கான, சுவையான இறைச்சி கொண்ட சிறிய விளையாட்டு பறவை"
      ),
      origin: "Europe, Asia",
      price: 9.99,
      image: "https://images.unsplash.com/photo-1592153964820-a029c80a8191?auto=format&fit=crop&q=80",
      category: ["poultry", "protein", "non_vegetarian", "game", "premium"],
      nutrition: {
        calories: 180,
        carbs: 0,
        protein: 25,
        fat: 8,
        fiber: 0,
        vitamins: { "Iron": "30%", "B12": "25%", "Phosphorus": "22%" }
      },
      allergens: [],
      isPopular: false
    },
    {
      id: "tandoori_chicken",
      name: createTranslatedContent("Tandoori Chicken", "तंदूरी चिकन", "தந்தூரி கோழி"),
      description: createTranslatedContent(
        "Indian specialty of chicken marinated in yogurt and spices, cooked in a clay oven",
        "दही और मसालों में मैरिनेटेड चिकन का भारतीय विशेष व्यंजन, मिट्टी के तंदूर में पकाया जाता है",
        "தயிர் மற்றும் மசாலாக்களில் ஊறவைக்கப்பட்ட கோழி, களிமண் அடுப்பில் சமைக்கப்பட்ட இந்திய சிறப்பு உணவு"
      ),
      origin: "India",
      price: 8.99,
      image: "https://images.unsplash.com/photo-1610057099431-d73a1c9d2f2f?auto=format&fit=crop&q=80",
      category: ["poultry", "protein", "non_vegetarian", "indian", "spicy"],
      nutrition: {
        calories: 210,
        carbs: 2,
        protein: 32,
        fat: 8,
        fiber: 0,
        vitamins: { "B6": "28%", "B3": "65%", "B12": "12%" }
      },
      allergens: ["dairy"],
      isPopular: true
    }
  ];

  // Process all items to ensure they match the FoodItemClient type exactly
  const processItem = (item: any): FoodItemClient => {
    // Make sure vitamins is a proper Record<string, string>
    if (item.nutrition && item.nutrition.vitamins) {
      const vitamins: Record<string, string> = {};
      Object.entries(item.nutrition.vitamins).forEach(([key, value]) => {
        if (value !== undefined) {
          vitamins[key] = value as string;
        }
      });
      item.nutrition.vitamins = vitamins;
    }
    
    return item as FoodItemClient;
  };
  
  const baseItems: FoodItemClient[] = [
    ...fruits.map(processItem),
    ...vegetables.map(processItem),
    ...spices.map(processItem),
    ...grains.map(processItem),
    ...dairy.map(processItem),
    ...proteins.map(processItem),
    ...meats.map(processItem),
    ...seafood.map(processItem),
    ...poultry.map(processItem)
  ];
  
  // Function to create variations of food items
  const createVariations = (item: any, count: number): FoodItemClient[] => {
    const variations: FoodItemClient[] = [];
    
    for (let i = 1; i <= count; i++) {
      // Make sure vitamins is a proper Record<string, string>
      if (item.nutrition && item.nutrition.vitamins) {
        const vitamins: Record<string, string> = {};
        Object.entries(item.nutrition.vitamins).forEach(([key, value]) => {
          if (value !== undefined) {
            vitamins[key] = value as string;
          }
        });
        item.nutrition.vitamins = vitamins;
      }
      
      const variation: FoodItemClient = {
        ...item,
        id: `${item.id}_${i}`,
        price: parseFloat((item.price * (0.9 + Math.random() * 0.4)).toFixed(2)),
        isPopular: Math.random() > 0.8,
        image: getRandomImage(item.category[0]) || item.image,
      };
      
      variations.push(variation);
    }
    
    return variations;
  };
  
  // Generate variations for each base item
  let allItems: FoodItemClient[] = [];
  baseItems.forEach(item => {
    // Each base item creates 35-40 variations to reach ~1000 items
    const variationCount = Math.floor(35 + Math.random() * 5);
    const variations = createVariations(item, variationCount);
    allItems = [...allItems, item, ...variations];
  });
  
  // Shuffle the array to mix categories
  const shuffleArray = (array: any[]) => {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  };
  
  // Return a shuffled subset of items (up to 1000)
  return shuffleArray(allItems).slice(0, 1000);
};