import React, { useState, useEffect } from 'react';
import { 
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter 
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { 
  UserNutritionProfile, 
  updateUserNutritionProfile, 
  getUserNutritionProfile 
} from '@/lib/idb';
import { 
  Flame, Dumbbell, Wheat, Droplets, HeartPulse, Check, Sparkles, AlertTriangle 
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface PersonalizationGoalsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onProfileUpdated: (profile: UserNutritionProfile) => void;
  currentProfile: UserNutritionProfile;
}

const DIETARY_FOCUS_OPTIONS: {
  id: UserNutritionProfile['dietaryFocus'];
  label: string;
  desc: string;
  defaultCal: number;
  defaultP: number;
  defaultC: number;
  defaultF: number;
  defaultFib: number;
}[] = [
  {
    id: 'balanced',
    label: 'Balanced Wellness',
    desc: 'Standard healthy distribution for sustained energy and health',
    defaultCal: 2000,
    defaultP: 75,
    defaultC: 250,
    defaultF: 65,
    defaultFib: 30
  },
  {
    id: 'high-protein',
    label: 'High Protein & Fitness',
    desc: 'Optimized for muscle maintenance, recovery, and satiety',
    defaultCal: 2200,
    defaultP: 130,
    defaultC: 200,
    defaultF: 65,
    defaultFib: 32
  },
  {
    id: 'plant-based',
    label: 'Plant-Based / Vegan',
    desc: 'Rich in phytonutrients, fiber, and antioxidant-packed whole foods',
    defaultCal: 1950,
    defaultP: 70,
    defaultC: 280,
    defaultF: 55,
    defaultFib: 40
  },
  {
    id: 'low-carb',
    label: 'Low Carb / Ketogenic',
    desc: 'Lower carbohydrate ceiling with healthy dietary fats',
    defaultCal: 1850,
    defaultP: 95,
    defaultC: 60,
    defaultF: 110,
    defaultFib: 25
  },
  {
    id: 'heart-health',
    label: 'Cardiovascular & Longevity',
    desc: 'High Omega-3s, soluble fiber, and low saturated fat targets',
    defaultCal: 1900,
    defaultP: 80,
    defaultC: 240,
    defaultF: 50,
    defaultFib: 38
  },
  {
    id: 'gut-health',
    label: 'Gut Health & Digestion',
    desc: 'Prebiotic and probiotic dense with elevated fiber goals',
    defaultCal: 1950,
    defaultP: 75,
    defaultC: 260,
    defaultF: 58,
    defaultFib: 42
  }
];

const COMMON_ALLERGENS = [
  'Gluten', 'Peanuts', 'Tree Nuts', 'Dairy', 'Soy', 'Shellfish', 'Eggs', 'Sesame'
];

export function PersonalizationGoalsModal({
  isOpen,
  onClose,
  onProfileUpdated,
  currentProfile
}: PersonalizationGoalsModalProps) {
  const { toast } = useToast();
  const [formData, setFormData] = useState<UserNutritionProfile>(currentProfile);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setFormData(currentProfile);
    }
  }, [isOpen, currentProfile]);

  const handleFocusSelect = (focusId: UserNutritionProfile['dietaryFocus']) => {
    const selected = DIETARY_FOCUS_OPTIONS.find(o => o.id === focusId);
    if (selected) {
      setFormData(prev => ({
        ...prev,
        dietaryFocus: focusId,
        calorieTarget: selected.defaultCal,
        proteinTarget: selected.defaultP,
        carbsTarget: selected.defaultC,
        fatTarget: selected.defaultF,
        fiberTarget: selected.defaultFib
      }));
    }
  };

  const toggleAllergen = (allergen: string) => {
    setFormData(prev => {
      const exists = prev.allergens.includes(allergen);
      return {
        ...prev,
        allergens: exists 
          ? prev.allergens.filter(a => a !== allergen)
          : [...prev.allergens, allergen]
      };
    });
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const saved = await updateUserNutritionProfile({
        displayName: formData.displayName.trim() || 'Health Explorer',
        calorieTarget: Number(formData.calorieTarget) || 2000,
        proteinTarget: Number(formData.proteinTarget) || 75,
        carbsTarget: Number(formData.carbsTarget) || 250,
        fatTarget: Number(formData.fatTarget) || 65,
        fiberTarget: Number(formData.fiberTarget) || 30,
        dietaryFocus: formData.dietaryFocus,
        allergens: formData.allergens
      });

      onProfileUpdated(saved);
      toast({
        title: 'Goals Updated',
        description: 'Personalized nutrition targets saved to your local storage profile.'
      });
      onClose();
    } catch (err) {
      console.error('Failed to update nutrition profile:', err);
      toast({
        title: 'Save Failed',
        description: 'Could not write to local storage profile.',
        variant: 'destructive'
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold flex items-center gap-2 text-slate-900 dark:text-white">
            <Sparkles className="w-5 h-5 text-emerald-600" />
            Personalize Nutrition Goals & Targets
          </DialogTitle>
          <DialogDescription className="text-sm text-slate-600 dark:text-slate-400">
            Set your daily targets and dietary preferences. These values dynamically power your personalized nutrition insights.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSave} className="space-y-6 pt-2">
          {/* Display Name */}
          <div className="space-y-1.5">
            <Label htmlFor="displayName" className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              Profile Display Name
            </Label>
            <Input
              id="displayName"
              value={formData.displayName}
              onChange={(e) => setFormData(prev => ({ ...prev, displayName: e.target.value }))}
              placeholder="e.g. Alex Health"
              className="h-9"
            />
          </div>

          {/* Dietary Focus Archetype */}
          <div className="space-y-2">
            <Label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              Primary Dietary Archetype
            </Label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {DIETARY_FOCUS_OPTIONS.map(option => {
                const isSelected = formData.dietaryFocus === option.id;
                return (
                  <button
                    key={option.id}
                    type="button"
                    onClick={() => handleFocusSelect(option.id)}
                    className={`text-left p-3 rounded-xl border text-xs transition-all relative ${
                      isSelected
                        ? 'border-emerald-500 bg-emerald-50/70 dark:bg-emerald-950/40 shadow-sm ring-1 ring-emerald-500'
                        : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-slate-300 dark:hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between font-bold text-slate-900 dark:text-white">
                      <span>{option.label}</span>
                      {isSelected && <Check className="w-4 h-4 text-emerald-600 shrink-0" />}
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">
                      {option.desc}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Daily Calorie & Macronutrient Targets */}
          <div className="space-y-3 p-4 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 flex items-center gap-1.5">
              <Flame className="w-4 h-4 text-amber-500" />
              Daily Intake Targets (RDA)
            </h4>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <div>
                <Label htmlFor="calorieTarget" className="text-[11px] text-slate-600 dark:text-slate-400 flex items-center gap-1">
                  <Flame className="w-3 h-3 text-amber-500" /> Calories (kcal)
                </Label>
                <Input
                  id="calorieTarget"
                  type="number"
                  min="1000"
                  max="5000"
                  value={formData.calorieTarget}
                  onChange={(e) => setFormData(prev => ({ ...prev, calorieTarget: Number(e.target.value) }))}
                  className="h-9 mt-1"
                  required
                />
              </div>

              <div>
                <Label htmlFor="proteinTarget" className="text-[11px] text-slate-600 dark:text-slate-400 flex items-center gap-1">
                  <Dumbbell className="w-3 h-3 text-blue-500" /> Protein (g)
                </Label>
                <Input
                  id="proteinTarget"
                  type="number"
                  min="20"
                  max="300"
                  value={formData.proteinTarget}
                  onChange={(e) => setFormData(prev => ({ ...prev, proteinTarget: Number(e.target.value) }))}
                  className="h-9 mt-1"
                  required
                />
              </div>

              <div>
                <Label htmlFor="carbsTarget" className="text-[11px] text-slate-600 dark:text-slate-400 flex items-center gap-1">
                  <Wheat className="w-3 h-3 text-amber-600" /> Carbs (g)
                </Label>
                <Input
                  id="carbsTarget"
                  type="number"
                  min="20"
                  max="600"
                  value={formData.carbsTarget}
                  onChange={(e) => setFormData(prev => ({ ...prev, carbsTarget: Number(e.target.value) }))}
                  className="h-9 mt-1"
                  required
                />
              </div>

              <div>
                <Label htmlFor="fatTarget" className="text-[11px] text-slate-600 dark:text-slate-400 flex items-center gap-1">
                  <Droplets className="w-3 h-3 text-rose-500" /> Total Fat (g)
                </Label>
                <Input
                  id="fatTarget"
                  type="number"
                  min="15"
                  max="200"
                  value={formData.fatTarget}
                  onChange={(e) => setFormData(prev => ({ ...prev, fatTarget: Number(e.target.value) }))}
                  className="h-9 mt-1"
                  required
                />
              </div>

              <div>
                <Label htmlFor="fiberTarget" className="text-[11px] text-slate-600 dark:text-slate-400 flex items-center gap-1">
                  <HeartPulse className="w-3 h-3 text-emerald-500" /> Fiber (g)
                </Label>
                <Input
                  id="fiberTarget"
                  type="number"
                  min="10"
                  max="100"
                  value={formData.fiberTarget}
                  onChange={(e) => setFormData(prev => ({ ...prev, fiberTarget: Number(e.target.value) }))}
                  className="h-9 mt-1"
                  required
                />
              </div>
            </div>
          </div>

          {/* Allergen Sensitivity Warnings */}
          <div className="space-y-2">
            <Label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
              <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
              Allergen Avoidance Alerts
            </Label>
            <p className="text-[11px] text-slate-500">
              Select any ingredients you avoid. Your dashboard will cross-reference your saved favorite foods for warnings.
            </p>
            <div className="flex flex-wrap gap-1.5 pt-1">
              {COMMON_ALLERGENS.map(allergen => {
                const isSelected = formData.allergens.includes(allergen);
                return (
                  <button
                    key={allergen}
                    type="button"
                    onClick={() => toggleAllergen(allergen)}
                    className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors ${
                      isSelected
                        ? 'bg-rose-500 text-white border-rose-600 shadow-sm'
                        : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    {allergen}
                  </button>
                );
              })}
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-0 pt-2 border-t border-slate-100 dark:border-slate-800">
            <Button type="button" variant="outline" onClick={onClose} disabled={isSaving}>
              Cancel
            </Button>
            <Button type="submit" className="bg-emerald-600 hover:bg-emerald-700 text-white" disabled={isSaving}>
              {isSaving ? 'Saving...' : 'Apply & Save Targets'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
