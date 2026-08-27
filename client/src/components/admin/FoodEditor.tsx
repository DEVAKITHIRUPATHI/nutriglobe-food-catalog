import React, { useState, useEffect, useContext } from 'react';
import { AppContext } from '@/contexts/AppContext';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { LazyImage } from '@/components/ui/LazyImage';
import { 
  Save, Plus, Trash2, RefreshCw, Sparkles, Image as ImageIcon, 
  Check, AlertCircle, Search, Edit3, ShieldCheck, Flame, Scale, Globe
} from 'lucide-react';
import type { FoodItemClient, ImageSourceType, ImageVerifiedStatus } from '@shared/schema';

interface FoodEditorProps {
  initialFoodId?: string;
  onSaveSuccess?: (food: FoodItemClient) => void;
}

export const FoodEditor: React.FC<FoodEditorProps> = ({ initialFoodId, onSaveSuccess }) => {
  const { foods, addFoodItem, updateFoodItem, deleteFoodItem, refreshFoods } = useContext(AppContext);

  const [selectedFoodId, setSelectedFoodId] = useState<string>(initialFoodId || 'new');
  const [searchQuery, setSearchQuery] = useState('');
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Form Fields State
  const [id, setId] = useState('');
  const [nameEn, setNameEn] = useState('');
  const [nameHi, setNameHi] = useState('');
  const [nameTa, setNameTa] = useState('');
  const [descEn, setDescEn] = useState('');
  const [descHi, setDescHi] = useState('');
  const [descTa, setDescTa] = useState('');
  const [origin, setOrigin] = useState('Global');
  const [categoriesStr, setCategoriesStr] = useState('fruits, healthy');
  const [price, setPrice] = useState('2.99');

  // Nutritional Data Fields (per 100g)
  const [calories, setCalories] = useState('60');
  const [protein, setProtein] = useState('1.0');
  const [carbs, setCarbs] = useState('15.0');
  const [fat, setFat] = useState('0.2');
  const [fiber, setFiber] = useState('2.0');
  const [sugar, setSugar] = useState('10.0');
  const [sodium, setSodium] = useState('2.0');
  const [potassium, setPotassium] = useState('150.0');
  const [calcium, setCalcium] = useState('20.0');
  const [iron, setIron] = useState('0.5');
  const [vitaminC, setVitaminC] = useState('10.0');
  const [vitaminA, setVitaminA] = useState('50.0');
  const [glycemicIndex, setGlycemicIndex] = useState('45');
  const [waterContent, setWaterContent] = useState('85');

  // Image & Sourcing Fields
  const [imageUrl, setImageUrl] = useState('');
  const [imageSourceType, setImageSourceType] = useState<ImageSourceType>('wikimedia');
  const [imageLicense, setImageLicense] = useState('CC-BY-SA 4.0');
  const [imageAttribution, setImageAttribution] = useState('Admin Sourced');
  const [imageVerifiedStatus, setImageVerifiedStatus] = useState<ImageVerifiedStatus>('verified');

  // Load food data into form when selected food changes
  useEffect(() => {
    if (selectedFoodId === 'new') {
      const generatedId = `food_${Date.now().toString(36)}`;
      setId(generatedId);
      setNameEn('');
      setNameHi('');
      setNameTa('');
      setDescEn('');
      setDescHi('');
      setDescTa('');
      setOrigin('Global');
      setCategoriesStr('fruits, superfood');
      setPrice('2.99');

      setCalories('70');
      setProtein('1.2');
      setCarbs('16.0');
      setFat('0.3');
      setFiber('2.5');
      setSugar('12.0');
      setSodium('2.0');
      setPotassium('180.0');
      setCalcium('15.0');
      setIron('0.4');
      setVitaminC('12.0');
      setVitaminA('40.0');
      setGlycemicIndex('40');
      setWaterContent('86');

      setImageUrl('https://images.unsplash.com/photo-1553279768-865429fa0078?auto=format&fit=crop&q=80');
      setImageSourceType('wikimedia');
      setImageLicense('CC-BY-SA 4.0');
      setImageAttribution('Wikimedia Commons');
      setImageVerifiedStatus('verified');
    } else {
      const food = foods.find((f) => f.id === selectedFoodId);
      if (food) {
        setId(food.id);
        setNameEn(food.name?.en || '');
        setNameHi(food.name?.hi || '');
        setNameTa(food.name?.ta || '');
        setDescEn(food.description?.en || '');
        setDescHi(food.description?.hi || '');
        setDescTa(food.description?.ta || '');
        setOrigin(food.origin || 'Global');
        setCategoriesStr((food.category || []).join(', '));
        setPrice(food.price !== undefined ? String(food.price) : '2.99');

        const n = (food.nutrition || {}) as any;
        setCalories(n.calories !== undefined ? String(n.calories) : '0');
        setProtein(n.protein !== undefined ? String(n.protein) : '0');
        setCarbs(n.carbs !== undefined ? String(n.carbs) : '0');
        setFat(n.fat !== undefined ? String(n.fat) : '0');
        setFiber(n.fiber !== undefined ? String(n.fiber) : '0');
        setSugar(n.sugar !== undefined ? String(n.sugar) : '0');
        setSodium(n.sodium !== undefined ? String(n.sodium) : '0');
        setPotassium(n.potassium !== undefined ? String(n.potassium) : '0');
        setCalcium(n.calcium !== undefined ? String(n.calcium) : '0');
        setIron(n.iron !== undefined ? String(n.iron) : '0');
        setVitaminC(n.vitaminC !== undefined ? String(n.vitaminC) : '0');
        setVitaminA(n.vitaminA !== undefined ? String(n.vitaminA) : '0');
        setGlycemicIndex(n.glycemicIndex !== undefined ? String(n.glycemicIndex) : '0');
        setWaterContent(n.waterContent !== undefined ? String(n.waterContent) : '80');

        const img = food.imageUrl || food.image || '';
        setImageUrl(img);
        setImageSourceType(food.imageSourceType || 'wikimedia');
        setImageLicense(food.imageLicense || 'CC-BY-SA 4.0');
        setImageAttribution(food.imageAttribution || 'Verified Source');
        setImageVerifiedStatus(food.imageVerifiedStatus || 'verified');
      }
    }
    setSuccessMessage(null);
    setErrorMessage(null);
  }, [selectedFoodId, foods]);

  // Filtered foods for dropdown/search
  const filteredFoods = foods.filter((f) => {
    const q = searchQuery.toLowerCase();
    const name = (f.name?.en || '').toLowerCase();
    const id = f.id.toLowerCase();
    return name.includes(q) || id.includes(q);
  });

  // Handle Form Submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessMessage(null);
    setErrorMessage(null);

    if (!nameEn.trim()) {
      setErrorMessage('English food name is required.');
      return;
    }

    setIsSaving(true);

    const categoriesArray = categoriesStr
      .split(',')
      .map((c) => c.trim().toLowerCase())
      .filter(Boolean);

    const formattedFood: FoodItemClient = {
      id: id.trim() || `food_${Date.now().toString(36)}`,
      name: {
        en: nameEn.trim(),
        hi: nameHi.trim() || nameEn.trim(),
        ta: nameTa.trim() || nameEn.trim(),
      },
      description: {
        en: descEn.trim(),
        hi: descHi.trim() || descEn.trim(),
        ta: descTa.trim() || descEn.trim(),
      },
      origin: origin.trim() || 'Global',
      category: categoriesArray.length > 0 ? categoriesArray : ['nutrition'],
      price: parseFloat(price) || 2.99,
      nutrition: {
        calories: parseFloat(calories) || 0,
        protein: parseFloat(protein) || 0,
        carbs: parseFloat(carbs) || 0,
        fat: parseFloat(fat) || 0,
        fiber: parseFloat(fiber) || 0,
        vitamins: {
          'Vitamin A': vitaminA ? `${vitaminA}%` : '10%',
          'Vitamin C': vitaminC ? `${vitaminC}%` : '15%',
        },
        minerals: {
          'Iron': iron ? `${iron}mg` : '1.5mg',
          'Calcium': calcium ? `${calcium}mg` : '30mg',
          'Potassium': potassium ? `${potassium}mg` : '200mg',
          'Sodium': sodium ? `${sodium}mg` : '10mg',
        },
        sugar: parseFloat(sugar) || 0,
        sodium: parseFloat(sodium) || 0,
        potassium: parseFloat(potassium) || 0,
        calcium: parseFloat(calcium) || 0,
        iron: parseFloat(iron) || 0,
        vitaminC: parseFloat(vitaminC) || 0,
        vitaminA: parseFloat(vitaminA) || 0,
        glycemicIndex: parseFloat(glycemicIndex) || 0,
        waterContent: parseFloat(waterContent) || 80,
      } as any,
      imageUrl: imageUrl.trim(),
      image: imageUrl.trim(),
      imageSourceType,
      imageLicense,
      imageAttribution: imageAttribution.trim(),
      imageVerifiedStatus,
      allergens: ['vegan', 'gluten-free'],
      isPopular: false,
    };

    try {
      if (selectedFoodId === 'new') {
        const saved = await addFoodItem(formattedFood);
        setSelectedFoodId(saved.id);
        setSuccessMessage(`Successfully created "${saved.name.en}"! Real-time updates applied instantly.`);
        if (onSaveSuccess) onSaveSuccess(saved);
      } else {
        const updated = await updateFoodItem(selectedFoodId, formattedFood);
        if (updated) {
          setSuccessMessage(`Successfully updated "${updated.name.en}"! Real-time updates synced across application.`);
          if (onSaveSuccess) onSaveSuccess(updated);
        } else {
          setSuccessMessage(`Updated local record for "${formattedFood.name.en}" instantly.`);
        }
      }
    } catch (err: any) {
      setErrorMessage(err?.message || 'Failed to save food record. Please check values and try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (selectedFoodId === 'new') return;
    if (!window.confirm(`Are you sure you want to delete this food item?`)) return;

    setIsSaving(true);
    try {
      await deleteFoodItem(selectedFoodId);
      setSelectedFoodId('new');
      setSuccessMessage('Food record deleted successfully.');
    } catch (err: any) {
      setErrorMessage(err?.message || 'Failed to delete record.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="w-full max-w-6xl mx-auto space-y-6 p-4 sm:p-6 bg-slate-50 dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
              <Edit3 className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
              <span>Real-Time Clinical Food Editor</span>
            </h2>
            <Badge className="bg-emerald-600 text-white font-bold text-xs uppercase px-2.5 py-0.5">
              Admin Live Sync
            </Badge>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Edit comprehensive WHO/USDA macronutrients, micronutrients, multilingual translations, and image URLs with instant context synchronization.
          </p>
        </div>

        <Button
          onClick={() => setSelectedFoodId('new')}
          variant={selectedFoodId === 'new' ? 'default' : 'outline'}
          className={selectedFoodId === 'new' ? 'bg-emerald-600 hover:bg-emerald-700 text-white font-bold' : 'font-bold'}
        >
          <Plus className="w-4 h-4 mr-1.5" />
          Create New Food Item
        </Button>
      </div>

      {/* Select Food Bar */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700">
        <div>
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
            Search Existing Food Records ({foods.length} items)
          </label>
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
            <Input
              type="text"
              placeholder="Search by name or ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 text-xs"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
            Select Food Record to Edit
          </label>
          <select
            value={selectedFoodId}
            onChange={(e) => setSelectedFoodId(e.target.value)}
            className="w-full h-9 rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-1 text-xs font-semibold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
          >
            <option value="new">➕ Add New Food Item (Blank Template)</option>
            {filteredFoods.map((f) => (
              <option key={f.id} value={f.id}>
                {f.name?.en || f.id} ({f.origin || 'Global'}) — {f.nutrition?.calories || 0} kcal
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Feedback Banners */}
      {successMessage && (
        <div className="p-3.5 bg-emerald-500/10 border border-emerald-500/30 rounded-xl flex items-center gap-2.5 text-emerald-800 dark:text-emerald-300 text-xs font-bold animate-in fade-in">
          <Check className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {errorMessage && (
        <div className="p-3.5 bg-rose-500/10 border border-rose-500/30 rounded-xl flex items-center gap-2.5 text-rose-800 dark:text-rose-300 text-xs font-bold animate-in fade-in">
          <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Main Form */}
      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2 Cols wide on desktop): Core Details & Nutrition */}
        <div className="lg:col-span-2 space-y-6">
          {/* Section 1: Basic & Multilingual Identification */}
          <Card className="border border-slate-200 dark:border-slate-800 shadow-xs">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-bold flex items-center gap-2 text-slate-900 dark:text-white">
                <Globe className="w-4 h-4 text-emerald-600" />
                1. Basic Details & Multilingual Names
              </CardTitle>
              <CardDescription className="text-xs">
                Provide food identification and translations in supported global languages.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    English Name *
                  </label>
                  <Input
                    value={nameEn}
                    onChange={(e) => setNameEn(e.target.value)}
                    placeholder="e.g. Alphonso Mango"
                    required
                    className="text-xs font-semibold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Hindi Name (हिन्दी)
                  </label>
                  <Input
                    value={nameHi}
                    onChange={(e) => setNameHi(e.target.value)}
                    placeholder="e.g. अल्फोंसो आम"
                    className="text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Tamil Name (தமிழ்)
                  </label>
                  <Input
                    value={nameTa}
                    onChange={(e) => setNameTa(e.target.value)}
                    placeholder="e.g. அல்போன்சா மாம்பழம்"
                    className="text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Origin / Country
                  </label>
                  <Input
                    value={origin}
                    onChange={(e) => setOrigin(e.target.value)}
                    placeholder="e.g. India, Mexico, Global"
                    className="text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Categories (comma separated)
                  </label>
                  <Input
                    value={categoriesStr}
                    onChange={(e) => setCategoriesStr(e.target.value)}
                    placeholder="e.g. fruits, indian, superfood"
                    className="text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Price Estimate ($)
                  </label>
                  <Input
                    type="number"
                    step="0.01"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    className="text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  English Description & Clinical Notes
                </label>
                <Textarea
                  value={descEn}
                  onChange={(e) => setDescEn(e.target.value)}
                  placeholder="Rich in beta-carotene, vitamin C, dietary fiber and antioxidants..."
                  rows={2}
                  className="text-xs"
                />
              </div>
            </CardContent>
          </Card>

          {/* Section 2: Comprehensive Nutritional Data per 100g */}
          <Card className="border border-slate-200 dark:border-slate-800 shadow-xs">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-bold flex items-center gap-2 text-slate-900 dark:text-white">
                <Flame className="w-4 h-4 text-amber-500" />
                2. Clinical Nutritional Profile (per 100g serving)
              </CardTitle>
              <CardDescription className="text-xs">
                WHO / USDA FoodData Central standards for BMR, TDEE, and RDA calculations.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Core Macros */}
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 p-3 bg-slate-100 dark:bg-slate-800/60 rounded-xl">
                <div>
                  <label className="block text-[11px] font-extrabold text-amber-700 dark:text-amber-400 mb-1">
                    Energy (kcal)
                  </label>
                  <Input
                    type="number"
                    step="0.1"
                    value={calories}
                    onChange={(e) => setCalories(e.target.value)}
                    className="text-xs font-bold bg-white dark:bg-slate-900"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-extrabold text-rose-700 dark:text-rose-400 mb-1">
                    Protein (g)
                  </label>
                  <Input
                    type="number"
                    step="0.1"
                    value={protein}
                    onChange={(e) => setProtein(e.target.value)}
                    className="text-xs font-bold bg-white dark:bg-slate-900"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-extrabold text-sky-700 dark:text-sky-400 mb-1">
                    Carbs (g)
                  </label>
                  <Input
                    type="number"
                    step="0.1"
                    value={carbs}
                    onChange={(e) => setCarbs(e.target.value)}
                    className="text-xs font-bold bg-white dark:bg-slate-900"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-extrabold text-emerald-700 dark:text-emerald-400 mb-1">
                    Fat (g)
                  </label>
                  <Input
                    type="number"
                    step="0.1"
                    value={fat}
                    onChange={(e) => setFat(e.target.value)}
                    className="text-xs font-bold bg-white dark:bg-slate-900"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-extrabold text-purple-700 dark:text-purple-400 mb-1">
                    Fiber (g)
                  </label>
                  <Input
                    type="number"
                    step="0.1"
                    value={fiber}
                    onChange={(e) => setFiber(e.target.value)}
                    className="text-xs font-bold bg-white dark:bg-slate-900"
                  />
                </div>
              </div>

              {/* Micronutrients & Electrolytes */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Sugar (g)
                  </label>
                  <Input
                    type="number"
                    step="0.1"
                    value={sugar}
                    onChange={(e) => setSugar(e.target.value)}
                    className="text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Sodium (mg)
                  </label>
                  <Input
                    type="number"
                    step="0.1"
                    value={sodium}
                    onChange={(e) => setSodium(e.target.value)}
                    className="text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Potassium (mg)
                  </label>
                  <Input
                    type="number"
                    step="0.1"
                    value={potassium}
                    onChange={(e) => setPotassium(e.target.value)}
                    className="text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Calcium (mg)
                  </label>
                  <Input
                    type="number"
                    step="0.1"
                    value={calcium}
                    onChange={(e) => setCalcium(e.target.value)}
                    className="text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Iron (mg)
                  </label>
                  <Input
                    type="number"
                    step="0.1"
                    value={iron}
                    onChange={(e) => setIron(e.target.value)}
                    className="text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Vitamin C (mg)
                  </label>
                  <Input
                    type="number"
                    step="0.1"
                    value={vitaminC}
                    onChange={(e) => setVitaminC(e.target.value)}
                    className="text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Vitamin A (IU)
                  </label>
                  <Input
                    type="number"
                    step="0.1"
                    value={vitaminA}
                    onChange={(e) => setVitaminA(e.target.value)}
                    className="text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Glycemic Index (GI)
                  </label>
                  <Input
                    type="number"
                    step="1"
                    value={glycemicIndex}
                    onChange={(e) => setGlycemicIndex(e.target.value)}
                    className="text-xs"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column (1 Col wide): Image & Sourcing & Submit */}
        <div className="space-y-6">
          {/* Section 3: Image URL & Verification */}
          <Card className="border border-slate-200 dark:border-slate-800 shadow-xs">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-bold flex items-center gap-2 text-slate-900 dark:text-white">
                <ImageIcon className="w-4 h-4 text-sky-500" />
                3. Image URL & Verification
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Image Live Preview Box */}
              <div className="relative aspect-4/3 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800">
                <LazyImage
                  src={imageUrl || 'https://images.unsplash.com/photo-1498837167922-ddd27525d352?auto=format&fit=crop&q=80'}
                  alt={nameEn || 'Food preview'}
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-2 left-2">
                  <Badge className="bg-slate-900/80 text-white backdrop-blur-md text-[10px] uppercase font-bold">
                    {imageSourceType}
                  </Badge>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Image URL
                </label>
                <Input
                  type="text"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  placeholder="https://..."
                  className="text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Source Provider
                  </label>
                  <select
                    value={imageSourceType}
                    onChange={(e) => setImageSourceType(e.target.value as ImageSourceType)}
                    className="w-full h-8 rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-2 text-xs"
                  >
                    <option value="wikimedia">Wikimedia Commons</option>
                    <option value="unsplash">Unsplash</option>
                    <option value="usda">USDA FoodData</option>
                    <option value="ai_generated">AI Studio Generated</option>
                    <option value="user_upload">Admin Upload</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Status
                  </label>
                  <select
                    value={imageVerifiedStatus}
                    onChange={(e) => setImageVerifiedStatus(e.target.value as ImageVerifiedStatus)}
                    className="w-full h-8 rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-2 text-xs"
                  >
                    <option value="verified">Verified ✅</option>
                    <option value="pending">Pending ⏳</option>
                    <option value="flagged">Flagged 🚩</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  License & Attribution
                </label>
                <Input
                  type="text"
                  value={imageAttribution}
                  onChange={(e) => setImageAttribution(e.target.value)}
                  placeholder="e.g. Photo by John Doe / CC-BY"
                  className="text-xs"
                />
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="space-y-3 pt-2">
            <Button
              type="submit"
              disabled={isSaving}
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold h-11 text-sm shadow-md"
            >
              {isSaving ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  Saving & Syncing Context...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  {selectedFoodId === 'new' ? 'Create Food Item' : 'Save & Sync Real-Time Updates'}
                </>
              )}
            </Button>

            {selectedFoodId !== 'new' && (
              <Button
                type="button"
                variant="destructive"
                onClick={handleDelete}
                disabled={isSaving}
                className="w-full font-bold h-9 text-xs"
              >
                <Trash2 className="w-3.5 h-3.5 mr-1.5" />
                Delete Food Item
              </Button>
            )}
          </div>
        </div>
      </form>
    </div>
  );
};
