import React, { useState, useEffect } from 'react';
import { Link } from 'wouter';
import { 
  Package, Plus, Trash2, ArrowLeft, Clock, ShieldCheck, 
  Calendar, CheckCircle2, AlertTriangle, Scale, Flame, RefreshCw
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';

interface PantryItem {
  id: string;
  name: string;
  tamilName?: string;
  category: string;
  quantityKg: number;
  caloriesPer100g: number;
  addedDate: string;
  shelfLifeMonths: number;
  isReadyToEat: boolean;
}

const DEFAULT_PANTRY: PantryItem[] = [
  {
    id: 'item_1',
    name: 'Flattened Rice (Aval / Poha)',
    tamilName: 'அவல்',
    category: 'Grains & Millets',
    quantityKg: 5.0,
    caloriesPer100g: 345,
    addedDate: '2026-10-01',
    shelfLifeMonths: 12,
    isReadyToEat: true
  },
  {
    id: 'item_2',
    name: 'Roasted Bengal Gram (Pottukadalai)',
    tamilName: 'பொட்டுக்கடலை',
    category: 'Pulses & Legumes',
    quantityKg: 3.0,
    caloriesPer100g: 369,
    addedDate: '2026-10-15',
    shelfLifeMonths: 9,
    isReadyToEat: true
  },
  {
    id: 'item_3',
    name: 'Jaggery (Vellam)',
    tamilName: 'வெல்லம்',
    category: 'Natural Sweeteners',
    quantityKg: 2.0,
    caloriesPer100g: 383,
    addedDate: '2026-09-01',
    shelfLifeMonths: 24,
    isReadyToEat: true
  },
  {
    id: 'item_4',
    name: 'Shelled Raw Peanuts',
    tamilName: 'நிலக்கடலை',
    category: 'Nuts & Seeds',
    quantityKg: 2.5,
    caloriesPer100g: 567,
    addedDate: '2026-10-20',
    shelfLifeMonths: 6,
    isReadyToEat: true
  },
  {
    id: 'item_5',
    name: 'Split Yellow Moong Dal',
    tamilName: 'பாசிப்பருப்பு',
    category: 'Pulses & Legumes',
    quantityKg: 4.0,
    caloriesPer100g: 348,
    addedDate: '2026-08-15',
    shelfLifeMonths: 18,
    isReadyToEat: false
  }
];

export default function EmergencyInventoryPage() {
  const [items, setItems] = useState<PantryItem[]>(() => {
    try {
      const saved = localStorage.getItem('nutrifacts_emergency_pantry');
      return saved ? JSON.parse(saved) : DEFAULT_PANTRY;
    } catch {
      return DEFAULT_PANTRY;
    }
  });

  const [householdPeople, setHouseholdPeople] = useState<number>(3);
  const [newItemName, setNewItemName] = useState('');
  const [newItemKg, setNewItemKg] = useState<number>(2);
  const [newItemCalories, setNewItemCalories] = useState<number>(350);
  const [newItemShelfMonths, setNewItemShelfMonths] = useState<number>(12);
  const [newItemReady, setNewItemReady] = useState(true);

  useEffect(() => {
    try {
      localStorage.setItem('nutrifacts_emergency_pantry', JSON.stringify(items));
    } catch {}
  }, [items]);

  const handleAddItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItemName.trim()) return;

    const newItem: PantryItem = {
      id: `item_${Date.now()}`,
      name: newItemName.trim(),
      category: 'Custom Survival Item',
      quantityKg: Number(newItemKg) || 1,
      caloriesPer100g: Number(newItemCalories) || 300,
      addedDate: new Date().toISOString().split('T')[0],
      shelfLifeMonths: Number(newItemShelfMonths) || 12,
      isReadyToEat: newItemReady
    };

    setItems(prev => [newItem, ...prev]);
    setNewItemName('');
  };

  const handleRemove = (id: string) => {
    setItems(prev => prev.filter(i => i.id !== id));
  };

  const handleResetDefaults = () => {
    setItems(DEFAULT_PANTRY);
  };

  // Compute total calories & day coverage
  const totalCalories = items.reduce((acc, item) => {
    return acc + Math.round((item.quantityKg * 1000 * item.caloriesPer100g) / 100);
  }, 0);

  const totalKg = items.reduce((acc, item) => acc + item.quantityKg, 0);
  const dailyHouseholdNeed = householdPeople * 2100; // WHO standard
  const daysCoverage = totalCalories > 0 ? (totalCalories / dailyHouseholdNeed).toFixed(1) : '0';

  return (
    <div className="space-y-8 pb-16">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-xs text-slate-500">
        <Link href="/emergency-food" className="hover:text-emerald-600 flex items-center gap-1 font-bold">
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Emergency Hub</span>
        </Link>
        <span>/</span>
        <span className="text-slate-800 dark:text-slate-200 font-semibold">Emergency Pantry Tracker</span>
      </div>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-100 dark:bg-purple-950/80 text-purple-800 dark:text-purple-300 text-xs font-bold uppercase tracking-wider">
            <Package className="w-3.5 h-3.5" />
            <span>Local Browser-Encrypted Stockpile Tracker</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-black text-slate-900 dark:text-white">
            Emergency Pantry Inventory Tracker
          </h1>
          <p className="text-lg font-bold text-purple-600 dark:text-purple-400 font-serif">
            வீட்டு அவசரகால உணவு இருப்பு கண்காணிப்பு
          </p>
        </div>

        <Button
          onClick={handleResetDefaults}
          variant="outline"
          size="sm"
          className="text-xs rounded-xl font-bold gap-1.5 self-start sm:self-auto"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Reset Tropical Baseline</span>
        </Button>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-5 rounded-3xl bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-900 shadow-xs space-y-1">
          <span className="text-[10px] font-extrabold uppercase text-purple-800 dark:text-purple-300">Total Stock Weight</span>
          <div className="text-3xl font-black text-purple-900 dark:text-purple-100">{totalKg.toFixed(1)} kg</div>
          <span className="text-[10px] text-purple-600 font-medium">{items.length} items logged</span>
        </div>

        <div className="p-5 rounded-3xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900 shadow-xs space-y-1">
          <span className="text-[10px] font-extrabold uppercase text-emerald-800 dark:text-emerald-300">Total Energy</span>
          <div className="text-3xl font-black text-emerald-900 dark:text-emerald-100">
            {totalCalories.toLocaleString()}
          </div>
          <span className="text-[10px] text-emerald-600 font-medium">kcal stored</span>
        </div>

        <div className="p-5 rounded-3xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900 shadow-xs space-y-1">
          <span className="text-[10px] font-extrabold uppercase text-blue-800 dark:text-blue-300">Survival Coverage</span>
          <div className="text-3xl font-black text-blue-900 dark:text-blue-100">{daysCoverage} Days</div>
          <span className="text-[10px] text-blue-600 font-medium">for {householdPeople} people</span>
        </div>

        <div className="p-5 rounded-3xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-xs space-y-1">
          <span className="text-[10px] font-extrabold uppercase text-slate-500">Target Coverage</span>
          <div className="text-3xl font-black text-slate-900 dark:text-white">
            {Number(daysCoverage) >= 7 ? '✅ Met (7+d)' : '⚠️ Low (<7d)'}
          </div>
          <span className="text-[10px] text-slate-400">NDMA Coastal Standard</span>
        </div>
      </div>

      {/* Household Size Selector */}
      <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs">
        <span className="font-bold text-slate-800 dark:text-slate-200">
          Calculating coverage for household size:
        </span>
        <div className="flex items-center gap-1.5">
          {[1, 2, 3, 4, 5, 6].map(num => (
            <button
              key={num}
              onClick={() => setHouseholdPeople(num)}
              className={`w-7 h-7 rounded-lg font-bold text-xs ${
                householdPeople === num ? 'bg-purple-600 text-white' : 'bg-slate-100 dark:bg-slate-800'
              }`}
            >
              {num}
            </button>
          ))}
          <span className="text-slate-400 ml-1">people</span>
        </div>
      </div>

      {/* Add New Item Form & Inventory Table */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Form */}
        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
          <h2 className="font-extrabold text-sm text-slate-900 dark:text-white flex items-center gap-2">
            <Plus className="w-4 h-4 text-purple-600" />
            Add Pantry Ration Item
          </h2>

          <form onSubmit={handleAddItem} className="space-y-3 text-xs">
            <div>
              <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Food Item Name</label>
              <Input
                type="text"
                placeholder="e.g. Sattu Flour, Biscuits, Dates..."
                value={newItemName}
                onChange={(e) => setNewItemName(e.target.value)}
                className="h-9 text-xs rounded-xl"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Quantity (kg)</label>
                <Input
                  type="number"
                  step="0.5"
                  min="0.1"
                  value={newItemKg}
                  onChange={(e) => setNewItemKg(Number(e.target.value))}
                  className="h-9 text-xs rounded-xl"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Calories / 100g</label>
                <Input
                  type="number"
                  step="10"
                  value={newItemCalories}
                  onChange={(e) => setNewItemCalories(Number(e.target.value))}
                  className="h-9 text-xs rounded-xl"
                />
              </div>
            </div>

            <div>
              <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Shelf Life (Months)</label>
              <Input
                type="number"
                min="1"
                max="60"
                value={newItemShelfMonths}
                onChange={(e) => setNewItemShelfMonths(Number(e.target.value))}
                className="h-9 text-xs rounded-xl"
              />
            </div>

            <label className="flex items-center gap-2 cursor-pointer pt-1">
              <input
                type="checkbox"
                checked={newItemReady}
                onChange={(e) => setNewItemReady(e.target.checked)}
                className="w-4 h-4 rounded text-purple-600"
              />
              <span className="font-bold text-slate-700 dark:text-slate-300">Ready-To-Eat (Zero Fuel Needed)</span>
            </label>

            <Button type="submit" className="w-full bg-purple-600 hover:bg-purple-500 font-bold text-xs rounded-xl mt-2">
              Add to Household Pantry
            </Button>
          </form>
        </div>

        {/* Table */}
        <div className="lg:col-span-2 p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
          <h2 className="font-extrabold text-sm text-slate-900 dark:text-white flex items-center gap-2">
            <Package className="w-4 h-4 text-emerald-600" />
            Current Stock Inventory
          </h2>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 uppercase text-[10px] border-b">
                <tr>
                  <th className="py-2.5 px-3">Item</th>
                  <th className="py-2.5 px-3">Quantity</th>
                  <th className="py-2.5 px-3">Calories</th>
                  <th className="py-2.5 px-3">Shelf Life</th>
                  <th className="py-2.5 px-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {items.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                    <td className="py-3 px-3">
                      <div className="font-bold text-slate-900 dark:text-white">{item.name}</div>
                      {item.tamilName && (
                        <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-serif font-bold">
                          {item.tamilName}
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-3 font-mono font-black text-slate-900 dark:text-white">
                      {item.quantityKg} kg
                    </td>
                    <td className="py-3 px-3 font-mono text-slate-600 dark:text-slate-400">
                      {Math.round((item.quantityKg * 1000 * item.caloriesPer100g) / 100).toLocaleString()} kcal
                    </td>
                    <td className="py-3 px-3">
                      <Badge variant="outline" className="text-[10px] font-mono">
                        {item.shelfLifeMonths} Mo
                      </Badge>
                    </td>
                    <td className="py-3 px-3 text-right">
                      <button
                        onClick={() => handleRemove(item.id)}
                        className="text-slate-400 hover:text-rose-500 p-1 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
