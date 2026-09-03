import { useState, useContext } from 'react';
import { useTranslation } from '@/hooks/useTranslation';
import { AppContext } from '@/contexts/AppContext';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CheckCircle2, Info, Bot, Sparkles, Send, Loader2, Scale } from 'lucide-react';
import { AmazonAdBanner } from '@/components/ads/AmazonAdBanner';
import { AdBanner } from '@/components/ads/AdBanner';

import { FoodGridSkeleton } from '@/components/ui/PageSkeleton';
import { D3BmiScaleChart } from '@/components/nutrition/D3BmiScaleChart';

export default function Nutrition() {
  const { getLocalizedText } = useTranslation();
  const { language, isLoading: appLoading } = useContext(AppContext);

  if (appLoading) {
    return (
      <div className="container mx-auto px-4 py-8 space-y-6">
        <FoodGridSkeleton count={4} />
      </div>
    );
  }
  const [aiPrompt, setAiPrompt] = useState('');
  const [aiResponse, setAiResponse] = useState<string | null>(null);
  const [isAiLoading, setIsAiLoading] = useState(false);

  const sampleQuestions = [
    "What are the best iron-rich food sources for vegetarians?",
    "How much protein do I need daily for muscle recovery?",
    "Explain the health benefits of Turmeric and Amla.",
    "What foods help reduce inflammation and boost immunity?"
  ];

  const handleAskAi = async (questionToAsk?: string) => {
    const promptToUse = questionToAsk || aiPrompt;
    if (!promptToUse.trim()) return;

    try {
      setIsAiLoading(true);
      if (questionToAsk) setAiPrompt(questionToAsk);

      const res = await fetch('/api/ai/nutrition-assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: promptToUse, lang: language }),
      });

      const data = await res.json();
      if (res.ok) {
        setAiResponse(data.answer);
      } else {
        setAiResponse(data.error || 'Failed to fetch response from AI assistant.');
      }
    } catch (err: any) {
      setAiResponse(err.message || 'Error connecting to AI assistant.');
    } finally {
      setIsAiLoading(false);
    }
  };

  // Sample data for macronutrients distribution chart
  const macroData = [
    { name: getLocalizedText('food.carbs'), value: 55 },
    { name: getLocalizedText('food.protein'), value: 20 },
    { name: getLocalizedText('food.fat'), value: 25 },
  ];

  // Colors for the pie chart
  const COLORS = ['#FF9800', '#4CAF50', '#E91E63'];

  // Sample data for daily value chart
  const dailyValueData = [
    { 
      name: 'A', 
      actual: 80, 
      recommended: 100 
    },
    { 
      name: 'C', 
      actual: 120, 
      recommended: 100 
    },
    { 
      name: 'D', 
      actual: 40, 
      recommended: 100 
    },
    { 
      name: 'E', 
      actual: 75, 
      recommended: 100 
    },
    { 
      name: 'Calcium', 
      actual: 60, 
      recommended: 100 
    },
    { 
      name: 'Iron', 
      actual: 90, 
      recommended: 100 
    },
  ];

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">{getLocalizedText('nutrition.understanding')}</h1>
      
      <p className="text-lg mb-8">
        {getLocalizedText('nutrition.description')}
      </p>
      
      <Tabs defaultValue="bmi-scale">
        <TabsList className="mb-8 flex flex-wrap">
          <TabsTrigger value="bmi-scale" className="flex items-center gap-1.5 font-bold">
            <Scale className="h-4 w-4 text-emerald-600 dark:text-emerald-400" /> D3.js WHO BMI Scale
          </TabsTrigger>
          <TabsTrigger value="basics">Nutrition Basics</TabsTrigger>
          <TabsTrigger value="macronutrients">Macronutrients</TabsTrigger>
          <TabsTrigger value="micronutrients">Vitamins & Minerals</TabsTrigger>
          <TabsTrigger value="ai-assistant" className="flex items-center gap-1.5">
            <Sparkles className="h-4 w-4 text-emerald-500" /> AI Nutrition Advisor
          </TabsTrigger>
        </TabsList>

        <TabsContent value="bmi-scale" className="space-y-6">
          <D3BmiScaleChart />
        </TabsContent>

        <TabsContent value="ai-assistant">
          <Card className="border-emerald-200 dark:border-emerald-900 shadow-sm">
            <CardHeader className="bg-emerald-50/50 dark:bg-emerald-950/20">
              <CardTitle className="flex items-center text-emerald-700 dark:text-emerald-300 gap-2">
                <Bot className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                Gemini Powered AI Nutrition Advisor
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Ask personalized dietary questions, macro breakdowns, micronutrient advice, or dietary suggestions in your active language ({language.toUpperCase()}).
              </p>

              <div className="flex gap-2">
                <Input
                  type="text"
                  placeholder="e.g. What are the best protein sources for a vegetarian diet?"
                  value={aiPrompt}
                  onChange={(e) => setAiPrompt(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAskAi()}
                  className="flex-1"
                />
                <Button 
                  onClick={() => handleAskAi()} 
                  disabled={isAiLoading || !aiPrompt.trim()}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white"
                >
                  {isAiLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                </Button>
              </div>

              {/* Sample Quick Questions */}
              <div>
                <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 block mb-2">Suggested Queries:</span>
                <div className="flex flex-wrap gap-2">
                  {sampleQuestions.map((q, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleAskAi(q)}
                      className="text-xs bg-gray-100 hover:bg-emerald-100 dark:bg-gray-800 dark:hover:bg-emerald-950 text-gray-700 dark:text-gray-300 px-3 py-1.5 rounded-full border border-gray-200 dark:border-gray-700 transition-colors text-left"
                    >
                      {q}
                    </button>
                  ))}
                </div>
              </div>

              {/* AI Output Box */}
              {isAiLoading && (
                <div className="p-4 bg-emerald-50 dark:bg-emerald-950/30 rounded-lg flex items-center gap-3 text-emerald-700 dark:text-emerald-300 text-sm animate-pulse">
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Analyzing nutritional profile with Gemini AI...
                </div>
              )}

              {aiResponse && !isAiLoading && (
                <div className="p-4 bg-gray-50 dark:bg-gray-800/80 rounded-lg border border-gray-200 dark:border-gray-700">
                  <h4 className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider mb-2 flex items-center gap-1">
                    <Sparkles className="h-3.5 w-3.5" /> Nutrition Advice
                  </h4>
                  <div className="text-sm leading-relaxed whitespace-pre-wrap text-gray-800 dark:text-gray-200">
                    {aiResponse}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="basics">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <span className="mr-2">Serving Size</span>
                  <Info className="h-4 w-4 text-gray-400" />
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="mb-4">
                  All nutritional values are based on a specific serving size. Always check the serving size when comparing foods, as it can vary significantly between products.
                </p>
                <div className="flex items-center bg-amber-50 dark:bg-amber-950 rounded p-3">
                  <div className="mr-3 text-amber-600 dark:text-amber-400">
                    <CheckCircle2 className="h-5 w-5" />
                  </div>
                  <p className="text-sm text-amber-700 dark:text-amber-300">
                    NutriGlobe presents nutrition facts per 100g for easy comparison between different foods.
                  </p>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <span className="mr-2">Calories</span>
                  <Info className="h-4 w-4 text-gray-400" />
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="mb-4">
                  Calories measure the energy your body gets from food. Your calorie needs depend on age, sex, weight, height, and activity level.
                </p>
                <div className="bg-gray-100 dark:bg-gray-800 p-3 rounded">
                  <h4 className="font-semibold mb-1">Average daily needs:</h4>
                  <ul className="text-sm list-disc pl-5 space-y-1">
                    <li>Adult women: 1,600–2,400 calories</li>
                    <li>Adult men: 2,000–3,000 calories</li>
                    <li>Active individuals may need more</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </div>
          
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Reading a Nutrition Label</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="md:flex gap-8 items-center">
                <div className="md:w-1/3 mb-6 md:mb-0">
                  <img 
                    src="https://images.unsplash.com/photo-1615485500704-8e990f9900f7?auto=format&fit=crop&q=80" 
                    alt="Nutrition label example" 
                    className="rounded-lg shadow-md"
                  />
                </div>
                <div className="md:w-2/3">
                  <ol className="space-y-3">
                    <li className="flex items-start">
                      <span className="flex-shrink-0 flex items-center justify-center h-6 w-6 rounded-full bg-primary-100 dark:bg-primary-900 text-primary-600 dark:text-primary-300 font-medium mr-2">1</span>
                      <p><span className="font-semibold">Check serving sizes</span> - All nutrition information is based on one serving</p>
                    </li>
                    <li className="flex items-start">
                      <span className="flex-shrink-0 flex items-center justify-center h-6 w-6 rounded-full bg-primary-100 dark:bg-primary-900 text-primary-600 dark:text-primary-300 font-medium mr-2">2</span>
                      <p><span className="font-semibold">Look at calories</span> - Consider how they fit into your daily needs</p>
                    </li>
                    <li className="flex items-start">
                      <span className="flex-shrink-0 flex items-center justify-center h-6 w-6 rounded-full bg-primary-100 dark:bg-primary-900 text-primary-600 dark:text-primary-300 font-medium mr-2">3</span>
                      <p><span className="font-semibold">Understand % Daily Value</span> - Shows how much a nutrient contributes to a 2,000 calorie daily diet</p>
                    </li>
                    <li className="flex items-start">
                      <span className="flex-shrink-0 flex items-center justify-center h-6 w-6 rounded-full bg-primary-100 dark:bg-primary-900 text-primary-600 dark:text-primary-300 font-medium mr-2">4</span>
                      <p><span className="font-semibold">Check key nutrients</span> - Aim for more fiber, vitamins and minerals, and less added sugars, sodium and saturated fats</p>
                    </li>
                  </ol>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="macronutrients">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <Card>
              <CardHeader>
                <CardTitle>Balanced Macronutrient Distribution</CardTitle>
              </CardHeader>
              <CardContent className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={macroData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {macroData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => `${value}%`} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Understanding Macronutrients</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-3 border-l-4 border-orange-500 bg-orange-50 dark:bg-orange-950">
                    <h4 className="font-semibold text-orange-700 dark:text-orange-300">Carbohydrates (4 calories/g)</h4>
                    <p className="text-sm mt-1">Primary energy source. Choose complex carbs (whole grains, fruits, vegetables) over refined options.</p>
                  </div>
                  <div className="p-3 border-l-4 border-green-500 bg-green-50 dark:bg-green-950">
                    <h4 className="font-semibold text-green-700 dark:text-green-300">Protein (4 calories/g)</h4>
                    <p className="text-sm mt-1">Essential for building and repairing tissues. Found in meat, dairy, legumes, and certain vegetables.</p>
                  </div>
                  <div className="p-3 border-l-4 border-pink-500 bg-pink-50 dark:bg-pink-950">
                    <h4 className="font-semibold text-pink-700 dark:text-pink-300">Fats (9 calories/g)</h4>
                    <p className="text-sm mt-1">Important for hormone production and nutrient absorption. Focus on unsaturated fats from plants and fish.</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
          
          <Card>
            <CardHeader>
              <CardTitle>Regional Dietary Patterns</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold text-lg mb-2">Indian Diet</h3>
                  <ul className="list-disc pl-5 space-y-2">
                    <li><span className="font-medium">Carbohydrates:</span> Higher (60-70%) from rice, wheat, millets</li>
                    <li><span className="font-medium">Protein:</span> Moderate (10-15%) primarily from legumes, dairy</li>
                    <li><span className="font-medium">Fats:</span> Lower (15-25%) from ghee, coconut, oils</li>
                    <li><span className="text-primary-600 dark:text-primary-400 font-medium">Specialty foods:</span> Turmeric, amla, jackfruit</li>
                  </ul>
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-2">Western Diet</h3>
                  <ul className="list-disc pl-5 space-y-2">
                    <li><span className="font-medium">Carbohydrates:</span> Lower (45-55%) emphasis on whole grains</li>
                    <li><span className="font-medium">Protein:</span> Higher (15-25%) from various animal sources</li>
                    <li><span className="font-medium">Fats:</span> Moderate (25-35%) with focus on healthy fats</li>
                    <li><span className="text-primary-600 dark:text-primary-400 font-medium">Specialty foods:</span> Quinoa, kale, avocado</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="micronutrients">
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Daily Value Percentage</CardTitle>
            </CardHeader>
            <CardContent className="h-[400px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={dailyValueData}
                  margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar name="% of Daily Value" dataKey="actual" fill="#4CAF50" />
                  <Bar name="Recommended (100%)" dataKey="recommended" fill="#E0E0E0" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <Card>
              <CardHeader>
                <CardTitle>Essential Vitamins</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  <li className="p-2 bg-gray-50 dark:bg-gray-800 rounded">
                    <span className="font-semibold">Vitamin A:</span> Vision, immune function, reproduction
                    <div className="text-xs text-gray-500 mt-1">Found in: Carrots, sweet potatoes, spinach, mango</div>
                  </li>
                  <li className="p-2 bg-gray-50 dark:bg-gray-800 rounded">
                    <span className="font-semibold">Vitamin C:</span> Antioxidant, immune support, collagen production
                    <div className="text-xs text-gray-500 mt-1">Found in: Citrus fruits, amla (700% DV!), bell peppers</div>
                  </li>
                  <li className="p-2 bg-gray-50 dark:bg-gray-800 rounded">
                    <span className="font-semibold">Vitamin D:</span> Bone health, immune function, mood regulation
                    <div className="text-xs text-gray-500 mt-1">Found in: Sunlight exposure, fatty fish, fortified foods</div>
                  </li>
                  <li className="p-2 bg-gray-50 dark:bg-gray-800 rounded">
                    <span className="font-semibold">Vitamin K:</span> Blood clotting, bone health
                    <div className="text-xs text-gray-500 mt-1">Found in: Kale (684% DV!), spinach, broccoli</div>
                  </li>
                </ul>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Essential Minerals</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  <li className="p-2 bg-gray-50 dark:bg-gray-800 rounded">
                    <span className="font-semibold">Calcium:</span> Bone and teeth health, muscle function
                    <div className="text-xs text-gray-500 mt-1">Found in: Dairy products, paneer, leafy greens</div>
                  </li>
                  <li className="p-2 bg-gray-50 dark:bg-gray-800 rounded">
                    <span className="font-semibold">Iron:</span> Oxygen transport in blood, energy production
                    <div className="text-xs text-gray-500 mt-1">Found in: Red meat, spinach, lentils, fortified foods</div>
                  </li>
                  <li className="p-2 bg-gray-50 dark:bg-gray-800 rounded">
                    <span className="font-semibold">Magnesium:</span> Muscle and nerve function, energy production
                    <div className="text-xs text-gray-500 mt-1">Found in: Nuts, seeds, whole grains, dark chocolate</div>
                  </li>
                  <li className="p-2 bg-gray-50 dark:bg-gray-800 rounded">
                    <span className="font-semibold">Potassium:</span> Blood pressure regulation, muscle contraction
                    <div className="text-xs text-gray-500 mt-1">Found in: Bananas, potatoes, avocados, yogurt</div>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
          
          <Card>
            <CardHeader>
              <CardTitle>Superfoods in Indian and Global Cuisine</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 bg-amber-50 dark:bg-amber-950 rounded-lg">
                  <h3 className="font-semibold text-amber-700 dark:text-amber-300 mb-2">Turmeric</h3>
                  <p className="text-sm mb-2">Powerful anti-inflammatory and antioxidant properties from curcumin.</p>
                  <div className="text-xs text-amber-600 dark:text-amber-400">
                    Key nutrients: Vitamins B6, C, manganese
                  </div>
                </div>
                <div className="p-4 bg-green-50 dark:bg-green-950 rounded-lg">
                  <h3 className="font-semibold text-green-700 dark:text-green-300 mb-2">Amla (Indian Gooseberry)</h3>
                  <p className="text-sm mb-2">One of the richest natural sources of Vitamin C (700% DV per 100g).</p>
                  <div className="text-xs text-green-600 dark:text-green-400">
                    Key nutrients: Vitamins C, A, iron, calcium
                  </div>
                </div>
                <div className="p-4 bg-purple-50 dark:bg-purple-950 rounded-lg">
                  <h3 className="font-semibold text-purple-700 dark:text-purple-300 mb-2">Quinoa</h3>
                  <p className="text-sm mb-2">Complete protein with all nine essential amino acids.</p>
                  <div className="text-xs text-purple-600 dark:text-purple-400">
                    Key nutrients: Protein, fiber, magnesium, B vitamins
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Google AdSense In-Content Responsive Banner */}
      <AdBanner slot="4005006007" format="auto" className="my-6" />

      {/* Amazon Associate Deals for Nutrition & Health Supplements */}
      <AmazonAdBanner 
        format="banner" 
        category="supplements" 
        maxItems={2} 
        title="Featured Amazon Organic Supplements & Health Products" 
      />
    </div>
  );
}
