import { useState, useEffect, useContext } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { LazyImage } from "@/components/ui/LazyImage";
import { AppContext } from "@/contexts/AppContext";
import { 
  Upload, Save, Image as ImageIcon, Sparkles, Check, AlertCircle, RefreshCw, X, Link2
} from 'lucide-react';
import type { FoodItemClient, ImageSourceType, ImageVerifiedStatus } from '@shared/schema';

interface FoodEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  foodToEdit?: FoodItemClient | null;
  onSaveSuccess: (savedFood: FoodItemClient) => void;
}

export function FoodEditModal({ isOpen, onClose, foodToEdit, onSaveSuccess }: FoodEditModalProps) {
  const { addFoodItem, updateFoodItem } = useContext(AppContext);
  const isNew = !foodToEdit;

  const [id, setId] = useState('');
  const [nameEn, setNameEn] = useState('');
  const [nameHi, setNameHi] = useState('');
  const [nameTa, setNameTa] = useState('');
  const [descEn, setDescEn] = useState('');
  const [descHi, setDescHi] = useState('');
  const [descTa, setDescTa] = useState('');
  const [origin, setOrigin] = useState('');
  const [categoriesStr, setCategoriesStr] = useState('fruits, indian');
  const [price, setPrice] = useState('2.99');

  // Nutrition
  const [calories, setCalories] = useState('60');
  const [carbs, setCarbs] = useState('15');
  const [protein, setProtein] = useState('1.0');
  const [fat, setFat] = useState('0.2');
  const [fiber, setFiber] = useState('2.0');

  // Image & Sourcing
  const [imageUrl, setImageUrl] = useState('');
  const [imageSourceType, setImageSourceType] = useState<ImageSourceType>('wikimedia');
  const [imageLicense, setImageLicense] = useState('CC-BY-SA 4.0');
  const [imageAttribution, setImageAttribution] = useState('Wikimedia Commons');
  const [imageVerifiedStatus, setImageVerifiedStatus] = useState<ImageVerifiedStatus>('verified');

  const [saving, setSaving] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (foodToEdit) {
      setId(foodToEdit.id);
      setNameEn(foodToEdit.name?.en || '');
      setNameHi(foodToEdit.name?.hi || '');
      setNameTa(foodToEdit.name?.ta || '');
      setDescEn(foodToEdit.description?.en || '');
      setDescHi(foodToEdit.description?.hi || '');
      setDescTa(foodToEdit.description?.ta || '');
      setOrigin(foodToEdit.origin || 'India');
      setCategoriesStr((foodToEdit.category || []).join(', '));
      setPrice(foodToEdit.price ? String(foodToEdit.price) : '2.99');

      setCalories(foodToEdit.nutrition?.calories ? String(foodToEdit.nutrition.calories) : '60');
      setCarbs(foodToEdit.nutrition?.carbs ? String(foodToEdit.nutrition.carbs) : '15');
      setProtein(foodToEdit.nutrition?.protein ? String(foodToEdit.nutrition.protein) : '1.0');
      setFat(foodToEdit.nutrition?.fat ? String(foodToEdit.nutrition.fat) : '0.2');
      setFiber(foodToEdit.nutrition?.fiber ? String(foodToEdit.nutrition.fiber) : '2.0');

      const img = foodToEdit.imageUrl || foodToEdit.image || '';
      setImageUrl(img);
      setImageSourceType(foodToEdit.imageSourceType || 'wikimedia');
      setImageLicense(foodToEdit.imageLicense || 'CC-BY-SA 4.0');
      setImageAttribution(foodToEdit.imageAttribution || 'Admin Upload');
      setImageVerifiedStatus(foodToEdit.imageVerifiedStatus || 'verified');
    } else {
      // Defaults for new food item
      const newId = `food_${Date.now().toString(36)}`;
      setId(newId);
      setNameEn('');
      setNameHi('');
      setNameTa('');
      setDescEn('');
      setDescHi('');
      setDescTa('');
      setOrigin('India');
      setCategoriesStr('fruits, superfood');
      setPrice('2.99');
      setCalories('70');
      setCarbs('16');
      setProtein('1.2');
      setFat('0.3');
      setFiber('2.5');
      setImageUrl('https://images.unsplash.com/photo-1553279768-865429fa0078?auto=format&fit=crop&q=80');
      setImageSourceType('wikimedia');
      setImageLicense('CC-BY-SA 4.0');
      setImageAttribution('Admin Sourced');
      setImageVerifiedStatus('verified');
    }
    setError(null);
  }, [foodToEdit, isOpen]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 8 * 1024 * 1024) {
      setError('Image file must be smaller than 8MB');
      return;
    }

    setUploadingImage(true);
    const reader = new FileReader();
    reader.onload = (event) => {
      const base64Str = event.target?.result as string;
      if (base64Str) {
        setImageUrl(base64Str);
        setImageVerifiedStatus('verified');
        setImageSourceType('wikimedia');
        setImageAttribution(`Uploaded file: ${file.name}`);
      }
      setUploadingImage(false);
    };
    reader.onerror = () => {
      setError('Failed to read image file');
      setUploadingImage(false);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nameEn.trim()) {
      setError('English food name is required');
      return;
    }

    setSaving(true);
    setError(null);

    const categories = categoriesStr.split(',').map(c => c.trim().toLowerCase()).filter(Boolean);

    const foodPayload: FoodItemClient = {
      id: id.trim() || `food_${Date.now()}`,
      name: {
        en: nameEn.trim(),
        hi: nameHi.trim() || nameEn.trim(),
        ta: nameTa.trim() || nameEn.trim()
      },
      description: {
        en: descEn.trim() || `${nameEn.trim()} fresh high quality food item`,
        hi: descHi.trim() || nameEn.trim(),
        ta: descTa.trim() || nameEn.trim()
      },
      origin: origin.trim() || 'India',
      price: parseFloat(price) || 2.99,
      image: imageUrl.trim(),
      imageUrl: imageUrl.trim(),
      category: categories.length ? categories : ['general'],
      nutrition: {
        calories: parseFloat(calories) || 60,
        carbs: parseFloat(carbs) || 15,
        protein: parseFloat(protein) || 1,
        fat: parseFloat(fat) || 0.2,
        fiber: parseFloat(fiber) || 2
      },
      allergens: ['vegan', 'gluten-free'],
      isPopular: true,
      imageSourceType,
      imageSourceId: `admin-edit-${Date.now()}`,
      imageLicense,
      imageAttribution,
      imageVerifiedStatus,
      imageLastCheckedAt: new Date().toISOString()
    };

    try {
      let savedResult: FoodItemClient | null = null;
      if (isNew) {
        savedResult = await addFoodItem(foodPayload);
      } else {
        savedResult = await updateFoodItem(foodPayload.id, foodPayload);
      }

      onSaveSuccess(savedResult || foodPayload);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Error saving food item to central context');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-emerald-600" />
            {isNew ? 'Create New Food Record' : `Edit Food Item: ${foodToEdit?.name?.en}`}
          </DialogTitle>
          <DialogDescription className="text-xs text-gray-500">
            Saved changes update the global catalog in real-time and immediately reflect in the live application preview.
          </DialogDescription>
        </DialogHeader>

        {error && (
          <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-lg text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Section 1: Food Identifiers & Names */}
          <div className="space-y-3 bg-gray-50 dark:bg-gray-800/60 p-4 rounded-xl border">
            <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
              Basic Food Information
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">Food Canonical ID</label>
                <Input
                  type="text"
                  value={id}
                  onChange={(e) => setId(e.target.value)}
                  disabled={!isNew}
                  placeholder="e.g. mango_alphonso"
                  className="text-xs h-8 font-mono bg-white dark:bg-gray-900"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">Origin / Country</label>
                <Input
                  type="text"
                  value={origin}
                  onChange={(e) => setOrigin(e.target.value)}
                  placeholder="e.g. India (Ratnagiri, Maharashtra)"
                  className="text-xs h-8 bg-white dark:bg-gray-900"
                />
              </div>
            </div>

            {/* Language Names */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">English Name *</label>
                <Input
                  type="text"
                  required
                  value={nameEn}
                  onChange={(e) => setNameEn(e.target.value)}
                  placeholder="e.g. Alphonso Mango"
                  className="text-xs h-8 bg-white dark:bg-gray-900 font-bold"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">Hindi Name (हिन्दी)</label>
                <Input
                  type="text"
                  value={nameHi}
                  onChange={(e) => setNameHi(e.target.value)}
                  placeholder="e.g. हापुस आम"
                  className="text-xs h-8 bg-white dark:bg-gray-900"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">Tamil Name (தமிழ்)</label>
                <Input
                  type="text"
                  value={nameTa}
                  onChange={(e) => setNameTa(e.target.value)}
                  placeholder="e.g. ஆல்ஃபான்சோ மாம்பழம்"
                  className="text-xs h-8 bg-white dark:bg-gray-900"
                />
              </div>
            </div>

            {/* Categories & Price */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">Categories (Comma separated)</label>
                <Input
                  type="text"
                  value={categoriesStr}
                  onChange={(e) => setCategoriesStr(e.target.value)}
                  placeholder="e.g. fruits, indian, seasonal"
                  className="text-xs h-8 bg-white dark:bg-gray-900"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">Price ($ / 100g)</label>
                <Input
                  type="number"
                  step="0.01"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  placeholder="2.99"
                  className="text-xs h-8 bg-white dark:bg-gray-900"
                />
              </div>
            </div>

            {/* Descriptions */}
            <div>
              <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">English Description</label>
              <Textarea
                rows={2}
                value={descEn}
                onChange={(e) => setDescEn(e.target.value)}
                placeholder="Key nutritional features, culinary uses..."
                className="text-xs bg-white dark:bg-gray-900"
              />
            </div>
          </div>

          {/* Section 2: Nutrition Profile */}
          <div className="space-y-3 bg-gray-50 dark:bg-gray-800/60 p-4 rounded-xl border">
            <h4 className="text-xs font-bold uppercase tracking-wider text-blue-700 dark:text-blue-400">
              Nutritional Facts (per 100g serving)
            </h4>

            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
              <div>
                <label className="text-[11px] font-semibold text-gray-600 dark:text-gray-400">Calories (kcal)</label>
                <Input
                  type="number"
                  value={calories}
                  onChange={(e) => setCalories(e.target.value)}
                  className="text-xs h-8 bg-white dark:bg-gray-900"
                />
              </div>
              <div>
                <label className="text-[11px] font-semibold text-gray-600 dark:text-gray-400">Carbs (g)</label>
                <Input
                  type="number"
                  step="0.1"
                  value={carbs}
                  onChange={(e) => setCarbs(e.target.value)}
                  className="text-xs h-8 bg-white dark:bg-gray-900"
                />
              </div>
              <div>
                <label className="text-[11px] font-semibold text-gray-600 dark:text-gray-400">Protein (g)</label>
                <Input
                  type="number"
                  step="0.1"
                  value={protein}
                  onChange={(e) => setProtein(e.target.value)}
                  className="text-xs h-8 bg-white dark:bg-gray-900"
                />
              </div>
              <div>
                <label className="text-[11px] font-semibold text-gray-600 dark:text-gray-400">Fat (g)</label>
                <Input
                  type="number"
                  step="0.1"
                  value={fat}
                  onChange={(e) => setFat(e.target.value)}
                  className="text-xs h-8 bg-white dark:bg-gray-900"
                />
              </div>
              <div>
                <label className="text-[11px] font-semibold text-gray-600 dark:text-gray-400">Fiber (g)</label>
                <Input
                  type="number"
                  step="0.1"
                  value={fiber}
                  onChange={(e) => setFiber(e.target.value)}
                  className="text-xs h-8 bg-white dark:bg-gray-900"
                />
              </div>
            </div>
          </div>

          {/* Section 3: Image Upload & Sourcing Metadata */}
          <div className="space-y-3 bg-gray-50 dark:bg-gray-800/60 p-4 rounded-xl border">
            <h4 className="text-xs font-bold uppercase tracking-wider text-purple-700 dark:text-purple-400">
              Food Image & Sourcing Pipeline
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-center">
              {/* Image Preview Box */}
              <div className="relative w-full h-32 rounded-xl overflow-hidden border border-gray-300 dark:border-gray-700 bg-gray-100 flex items-center justify-center shrink-0">
                {imageUrl ? (
                  <LazyImage src={imageUrl} alt="Food Preview" containerClassName="w-full h-full" />
                ) : (
                  <div className="text-center p-2 text-gray-400 text-xs">
                    <ImageIcon className="w-6 h-6 mx-auto mb-1" /> No image preview
                  </div>
                )}
                {uploadingImage && (
                  <div className="absolute inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center text-white text-xs font-bold">
                    <RefreshCw className="w-5 h-5 animate-spin mr-1" /> Processing...
                  </div>
                )}
              </div>

              {/* Upload & URL Controls */}
              <div className="sm:col-span-2 space-y-2">
                <div>
                  <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">Upload New Food Image File</label>
                  <div className="flex items-center gap-2 mt-1">
                    <label className="cursor-pointer bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-3 py-1.5 rounded-lg flex items-center gap-1.5 shadow-sm">
                      <Upload className="w-3.5 h-3.5" /> Select Local File
                      <input type="file" accept="image/*" className="hidden" onChange={handleFileUpload} />
                    </label>
                    <span className="text-[11px] text-gray-400">PNG, JPG, WebP (Max 8MB)</span>
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">OR Direct Image Web URL</label>
                  <Input
                    type="url"
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    placeholder="https://..."
                    className="text-xs h-8 bg-white dark:bg-gray-900 mt-1 font-mono"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
              <div>
                <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">Source Type</label>
                <select
                  value={imageSourceType}
                  onChange={(e) => setImageSourceType(e.target.value as ImageSourceType)}
                  className="w-full h-8 text-xs rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-2"
                >
                  <option value="usda">USDA FoodData Central</option>
                  <option value="open_food_facts">Open Food Facts</option>
                  <option value="wikimedia">Wikimedia Commons</option>
                  <option value="ai_generated">AI Generated</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">License</label>
                <Input
                  type="text"
                  value={imageLicense}
                  onChange={(e) => setImageLicense(e.target.value)}
                  className="text-xs h-8 bg-white dark:bg-gray-900"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">Attribution</label>
                <Input
                  type="text"
                  value={imageAttribution}
                  onChange={(e) => setImageAttribution(e.target.value)}
                  className="text-xs h-8 bg-white dark:bg-gray-900"
                />
              </div>
            </div>
          </div>

          <DialogFooter className="pt-2">
            <Button type="button" variant="outline" onClick={onClose} disabled={saving} className="text-xs">
              Cancel
            </Button>
            <Button type="submit" disabled={saving} className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-5">
              {saving ? <RefreshCw className="w-3.5 h-3.5 animate-spin mr-1" /> : <Save className="w-3.5 h-3.5 mr-1" />}
              {isNew ? 'Save New Food Item' : 'Update Food Record'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
