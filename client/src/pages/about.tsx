import { useTranslation } from '@/hooks/useTranslation';
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Leaf, Globe, Database, Wifi, Languages, ShoppingCart, HelpCircle, ShieldCheck } from 'lucide-react';
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion";

import { useContext } from 'react';
import { AppContext } from '@/contexts/AppContext';
import { GenericPageSkeleton } from '@/components/ui/PageSkeleton';

export default function About() {
  const { getLocalizedText } = useTranslation();
  const { isLoading: appLoading } = useContext(AppContext);

  if (appLoading) {
    return <GenericPageSkeleton />;
  }

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": "What is NutriGlobe and what food databases does it use?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "NutriGlobe is a comprehensive global and Indian regional nutrition platform. It integrates verified data from USDA FoodData Central, WHO guidelines, FSSAI, and ICMR-NIN standards to provide accurate BMR, TDEE, macro, and micro-nutrient profiles."
        }
      },
      {
        "@type": "Question",
        "name": "Are NutriGlobe's RDA and calorie recommendations clinically verified?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Yes. NutriGlobe utilizes WHO and ICMR clinical equations (Mifflin-St Jeor formula adjusted for activity levels and life stages such as pregnancy and lactation) to calculate precise caloric and nutrient targets."
        }
      },
      {
        "@type": "Question",
        "name": "Does NutriGlobe support offline usage and multilingual food search?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Yes. Essential food database records and clinical calculator functionality are stored locally on your device for full offline access in English, Hindi, and Tamil."
        }
      },
      {
        "@type": "Question",
        "name": "Which regional Indian ingredients are covered in NutriGlobe?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "NutriGlobe features extensive coverage of traditional Indian millets (ragi, bajra, jowar), pulses, spices, localized greens, and authentic dish recipes with complete micro-nutrient breakdowns."
        }
      }
    ]
  };

  return (
    <div className="max-w-4xl mx-auto space-y-12">
      {/* Inject FAQPage Schema Markup */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />

      <div>
        <h1 className="text-3xl font-bold mb-2">{getLocalizedText('nav.about')}</h1>
      </div>
      
      <section className="mb-12">
        <div className="bg-gradient-to-r from-primary-500 to-primary-600 rounded-xl p-8 text-white">
          <div className="flex flex-col md:flex-row items-center gap-6">
            <div className="md:w-2/3">
              <h2 className="text-2xl font-bold mb-4">About NutriGlobe</h2>
              <p className="mb-6">
                NutriGlobe brings together nutrition information for foods from around the world, with a 
                special focus on Indian regional ingredients. Our mission is to make nutrition facts 
                accessible to everyone in their preferred language, whether they're online or offline.
              </p>
              <div className="flex items-center">
                <Leaf className="h-10 w-10 mr-4 bg-white text-primary-500 p-2 rounded-full" />
                <div>
                  <h3 className="font-semibold text-lg">Nutrition for Everyone</h3>
                  <p className="text-sm text-green-50">Accessible, multilingual, accurate information</p>
                </div>
              </div>
            </div>
            <div className="md:w-1/3">
              <img 
                src="https://images.unsplash.com/photo-1490818387583-1baba5e638af?auto=format&fit=crop&q=80" 
                alt="Fresh fruits and vegetables" 
                className="w-full h-48 object-cover rounded-lg shadow-lg"
              />
            </div>
          </div>
        </div>
      </section>
      
      <section className="mb-12">
        <h2 className="text-2xl font-semibold mb-6">Our Features</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-start">
                <div className="bg-primary-100 p-3 rounded-full mr-4 dark:bg-primary-900">
                  <Globe className="h-6 w-6 text-primary-500" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-1">Global & Indian Foods</h3>
                  <p className="text-gray-600 dark:text-gray-300">
                    Explore nutrition facts for foods from India and around the world, with detailed 
                    information about regional specialties and superfoods.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-start">
                <div className="bg-orange-100 p-3 rounded-full mr-4 dark:bg-orange-900">
                  <Languages className="h-6 w-6 text-orange-500" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-1">Multilingual Support</h3>
                  <p className="text-gray-600 dark:text-gray-300">
                    Access all information in English, Hindi, and Tamil. We believe nutrition information 
                    should be available in the language you're most comfortable with.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-start">
                <div className="bg-blue-100 p-3 rounded-full mr-4 dark:bg-blue-900">
                  <Wifi className="h-6 w-6 text-blue-500" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-1">Offline Access</h3>
                  <p className="text-gray-600 dark:text-gray-300">
                    NutriGlobe works even without an internet connection. All essential nutrition data is 
                    stored on your device for use anywhere, anytime.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-start">
                <div className="bg-pink-100 p-3 rounded-full mr-4 dark:bg-pink-900">
                  <ShoppingCart className="h-6 w-6 text-pink-500" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-1">Shopping Made Easy</h3>
                  <p className="text-gray-600 dark:text-gray-300">
                    Create shopping lists of nutritious foods, save favorites, and prepare for healthier 
                    meal planning with our easy-to-use interface.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
      
      <section className="mb-12">
        <h2 className="text-2xl font-semibold mb-6">Our Data Sources</h2>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-start mb-6">
              <div className="bg-gray-100 p-3 rounded-full mr-4 dark:bg-gray-800">
                <Database className="h-6 w-6 text-gray-500" />
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-1">Reliable Nutrition Information</h3>
                <p className="text-gray-600 dark:text-gray-300">
                  Our nutrition data comes from verified scientific sources, including:
                </p>
              </div>
            </div>
            
            <Tabs defaultValue="global">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="global">Global Standards</TabsTrigger>
                <TabsTrigger value="indian">Indian Sources</TabsTrigger>
              </TabsList>
              <TabsContent value="global" className="py-4">
                <ul className="space-y-3">
                  <li className="flex items-start">
                    <span className="w-2 h-2 bg-primary-500 rounded-full mt-2 mr-2"></span>
                    <div>
                      <span className="font-medium">USDA FoodData Central</span>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Comprehensive database of nutrition information for thousands of foods
                      </p>
                    </div>
                  </li>
                  <li className="flex items-start">
                    <span className="w-2 h-2 bg-primary-500 rounded-full mt-2 mr-2"></span>
                    <div>
                      <span className="font-medium">WHO Nutrition Guidelines</span>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        International standards for daily nutrient requirements and recommendations
                      </p>
                    </div>
                  </li>
                  <li className="flex items-start">
                    <span className="w-2 h-2 bg-primary-500 rounded-full mt-2 mr-2"></span>
                    <div>
                      <span className="font-medium">Peer-Reviewed Research</span>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Latest findings from nutrition science and health research
                      </p>
                    </div>
                  </li>
                </ul>
              </TabsContent>
              <TabsContent value="indian" className="py-4">
                <ul className="space-y-3">
                  <li className="flex items-start">
                    <span className="w-2 h-2 bg-primary-500 rounded-full mt-2 mr-2"></span>
                    <div>
                      <span className="font-medium">FSSAI (Food Safety and Standards Authority of India)</span>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Official standards and nutritional information for Indian foods
                      </p>
                    </div>
                  </li>
                  <li className="flex items-start">
                    <span className="w-2 h-2 bg-primary-500 rounded-full mt-2 mr-2"></span>
                    <div>
                      <span className="font-medium">ICMR (Indian Council of Medical Research)</span>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Dietary guidelines and nutritional requirements for Indian population
                      </p>
                    </div>
                  </li>
                  <li className="flex items-start">
                    <span className="w-2 h-2 bg-primary-500 rounded-full mt-2 mr-2"></span>
                    <div>
                      <span className="font-medium">National Institute of Nutrition</span>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Research-based nutritional values for traditional Indian foods
                      </p>
                    </div>
                  </li>
                </ul>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </section>
      
      <section className="mb-12">
        <h2 className="text-2xl font-semibold mb-6">Our Team</h2>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          <Card>
            <CardContent className="p-6 text-center">
              <div className="w-24 h-24 bg-gray-200 rounded-full mx-auto mb-4"></div>
              <h3 className="font-semibold">Dr. Ananya Sharma</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">Nutrition Director</p>
              <p className="text-sm mt-2">
                PhD in Nutritional Sciences with 15+ years of research experience in global food patterns.
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6 text-center">
              <div className="w-24 h-24 bg-gray-200 rounded-full mx-auto mb-4"></div>
              <h3 className="font-semibold">Rajiv Patel</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">Technology Lead</p>
              <p className="text-sm mt-2">
                Tech expert focused on creating accessible digital nutrition resources for diverse populations.
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6 text-center">
              <div className="w-24 h-24 bg-gray-200 rounded-full mx-auto mb-4"></div>
              <h3 className="font-semibold">Priya Lakshmi</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">Cultural Nutrition Specialist</p>
              <p className="text-sm mt-2">
                Specializes in traditional Indian foods and their nutritional profiles across various regions.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>
      
      {/* Frequently Asked Questions Section (Matching FAQPage Schema) */}
      <section className="mb-12">
        <div className="flex items-center gap-2 mb-6">
          <HelpCircle className="w-6 h-6 text-emerald-600" />
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">Frequently Asked Questions</h2>
        </div>

        <Card className="p-6 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 rounded-2xl">
          <Accordion type="single" collapsible className="w-full space-y-2">
            {faqSchema.mainEntity.map((item, idx) => (
              <AccordionItem key={idx} value={`item-${idx}`} className="border-b border-slate-100 dark:border-slate-800">
                <AccordionTrigger className="text-sm font-bold text-slate-900 dark:text-slate-100 hover:text-emerald-600 text-left py-3">
                  {item.name}
                </AccordionTrigger>
                <AccordionContent className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed pb-3">
                  {item.acceptedAnswer.text}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </Card>
      </section>

      <section>
        <Card className="bg-gray-50 dark:bg-gray-800 border-0">
          <CardContent className="p-8 text-center">
            <h2 className="text-2xl font-semibold mb-4">Have Questions?</h2>
            <p className="mb-6 max-w-2xl mx-auto">
              We're always looking to improve our nutrition database and application. If you have questions, 
              suggestions, or feedback, please don't hesitate to reach out to our team.
            </p>
            <div className="flex justify-center">
              <a 
                href="mailto:contact@nutriglobe.org" 
                className="bg-primary-500 hover:bg-primary-600 text-white px-6 py-3 rounded-lg inline-flex items-center transition-colors"
              >
                Contact Us
              </a>
            </div>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
