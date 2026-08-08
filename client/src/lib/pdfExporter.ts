import jsPDF from 'jspdf';

export interface PdfExportData {
  age: number;
  sex: string;
  heightCm: number;
  weightKg: number;
  activity: string;
  goal: string;
  bmi: number;
  bmiCategory: string;
  bmiRisk: string;
  minHealthyWeight: number;
  maxHealthyWeight: number;
  idealHealthyWeight: number;
  weightControlAction: 'lose' | 'gain' | 'maintain';
  weightDifferenceKg: number;
  bmr: number;
  tdee: number;
  targetCalories: number;
  proteinGrams: number;
  proteinCal: number;
  carbGrams: number;
  carbCal: number;
  fatGrams: number;
  fatCal: number;
  fiberGrams: number;
  waterLiters: number;
  waterGlasses: number;
  lifeStageNote: string;
  rda: {
    calciumRda: number;
    ironRda: number;
    vitaminDRda: number;
    vitaminCRda: number;
    b12Rda: number;
    folateRda: number;
    potassiumRda: number;
    sodiumLimitMg: number;
    zincRda: number;
    magRda: number;
  };
  recommendedFoods?: { name: string; category?: string[]; protein?: number; calories?: number }[];
}

export function exportNutritionCalculatorPDF(data: PdfExportData) {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth(); // 210mm
  const margin = 15;
  let y = margin;

  // Header Banner Background
  doc.setFillColor(15, 23, 42); // slate-900
  doc.rect(0, 0, pageWidth, 28, 'F');

  // Accent Line
  doc.setFillColor(16, 185, 129); // emerald-500
  doc.rect(0, 28, pageWidth, 2, 'F');

  // Title Text
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.text('NutriGlobe Clinical & Educational Report', margin, 12);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(167, 243, 208); // emerald-200
  doc.text('Comprehensive Caloric, BMI, TDEE & Recommended Dietary Allowance Summary', margin, 18);

  const today = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  doc.setTextColor(203, 213, 225);
  doc.text(`Generated: ${today}`, pageWidth - margin - 35, 18);

  y = 38;

  // 1. Biometric Profile Box
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(margin, y, pageWidth - 2 * margin, 24, 3, 3, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(15, 23, 42);
  doc.text('1. Patient Biometric Profile', margin + 4, y + 6);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(71, 85, 105);

  const sexFormatted = data.sex.replace('_', ' ').toUpperCase();
  const activityFormatted = data.activity.replace('_', ' ').toUpperCase();
  const goalFormatted = data.goal.replace('_', ' ').toUpperCase();

  doc.text(`Age: ${data.age} yrs   |   Sex/Stage: ${sexFormatted}   |   Height: ${data.heightCm} cm   |   Weight: ${data.weightKg} kg`, margin + 4, y + 12);
  doc.text(`Activity Level: ${activityFormatted}   |   Health Goal: ${goalFormatted}`, margin + 4, y + 18);

  y += 30;

  // 2. Calculated Biometric Indicators Table
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(15, 23, 42);
  doc.text('2. Calculated Core Biometric Indicators', margin, y);

  y += 4;

  const colWidth = (pageWidth - 2 * margin - 9) / 4;
  const metrics = [
    { label: 'BMI Index', val: `${data.bmi}`, sub: data.bmiCategory, color: [16, 185, 129] },
    { label: 'Basal Metabolic Rate', val: `${data.bmr} kcal`, sub: 'BMR (Mifflin-St Jeor)', color: [59, 130, 246] },
    { label: 'Total Energy (TDEE)', val: `${data.tdee} kcal`, sub: 'Daily Maintenance', color: [245, 158, 11] },
    { label: 'Target Calorie Intake', val: `${data.targetCalories} kcal`, sub: 'Goal Adjusted Target', color: [16, 185, 129] },
  ];

  metrics.forEach((m, idx) => {
    const x = margin + idx * (colWidth + 3);
    doc.setFillColor(241, 245, 249);
    doc.setDrawColor(203, 213, 225);
    doc.roundedRect(x, y, colWidth, 22, 2, 2, 'FD');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(100, 116, 139);
    doc.text(m.label, x + colWidth / 2, y + 5, { align: 'center' });

    doc.setFontSize(12);
    doc.setTextColor(15, 23, 42);
    doc.text(m.val, x + colWidth / 2, y + 12, { align: 'center' });

    doc.setFontSize(7);
    doc.setTextColor(m.color[0], m.color[1], m.color[2]);
    doc.text(m.sub, x + colWidth / 2, y + 18, { align: 'center' });
  });

  y += 28;

  // 3. WHO Healthy Weight & Weight Control Analysis
  doc.setFillColor(236, 253, 245);
  doc.setDrawColor(167, 243, 208);
  doc.roundedRect(margin, y, pageWidth - 2 * margin, 20, 3, 3, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(4, 120, 87);
  doc.text('WHO Optimal Healthy Weight Target Range:', margin + 4, y + 6);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.text(`${data.minHealthyWeight} kg – ${data.maxHealthyWeight} kg (Ideal Midpoint ~${data.idealHealthyWeight} kg)`, margin + 85, y + 6);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(6, 95, 70);
  doc.text(`Clinical Life-Stage Guidance: ${data.lifeStageNote}`, margin + 4, y + 13, { maxWidth: pageWidth - 2 * margin - 8 });

  y += 26;

  // 4. Target Macronutrients & Hydration
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(15, 23, 42);
  doc.text('3. Target Macronutrient Breakdown & Hydration Goal', margin, y);

  y += 4;

  // Macro Table Header
  const macroColW = (pageWidth - 2 * margin) / 4;
  doc.setFillColor(15, 23, 42);
  doc.rect(margin, y, pageWidth - 2 * margin, 7, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(255, 255, 255);
  doc.text('Nutrient Category', margin + 4, y + 5);
  doc.text('Grams / Target', margin + macroColW + 4, y + 5);
  doc.text('Energy Value', margin + macroColW * 2 + 4, y + 5);
  doc.text('% Caloric Share', margin + macroColW * 3 + 4, y + 5);

  y += 7;

  const proteinPct = Math.round((data.proteinCal / data.targetCalories) * 100);
  const fatPct = Math.round((data.fatCal / data.targetCalories) * 100);
  const carbPct = Math.max(0, 100 - proteinPct - fatPct);

  const rows = [
    { name: 'Protein', grams: `${data.proteinGrams} g`, cal: `${data.proteinCal} kcal`, pct: `${proteinPct}%` },
    { name: 'Carbohydrates', grams: `${data.carbGrams} g`, cal: `${data.carbCal} kcal`, pct: `${carbPct}%` },
    { name: 'Healthy Fats', grams: `${data.fatGrams} g`, cal: `${Math.round(data.fatCal)} kcal`, pct: `${fatPct}%` },
    { name: 'Dietary Fiber', grams: `${data.fiberGrams} g`, cal: 'Non-caloric bulk', pct: 'N/A' },
    { name: 'Daily Water Intake', grams: `${data.waterLiters} Liters`, cal: `${data.waterGlasses} Glasses (250ml)`, pct: 'Hydration Goal' },
  ];

  rows.forEach((r, idx) => {
    const isEven = idx % 2 === 0;
    doc.setFillColor(isEven ? 255 : 248, isEven ? 255 : 250, isEven ? 255 : 252);
    doc.rect(margin, y, pageWidth - 2 * margin, 6, 'F');

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(30, 41, 59);

    doc.text(r.name, margin + 4, y + 4.5);
    doc.text(r.grams, margin + macroColW + 4, y + 4.5);
    doc.text(r.cal, margin + macroColW * 2 + 4, y + 4.5);
    doc.text(r.pct, margin + macroColW * 3 + 4, y + 4.5);

    y += 6;
  });

  doc.setDrawColor(226, 232, 240);
  doc.line(margin, y, pageWidth - margin, y);

  y += 8;

  // 5. Recommended Dietary Allowances (RDA) Table
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(15, 23, 42);
  doc.text('4. Recommended Dietary Allowances (RDA Micronutrients)', margin, y);

  y += 4;

  const rdaItems = [
    { label: 'Calcium', val: `${data.rda.calciumRda} mg` },
    { label: 'Iron', val: `${data.rda.ironRda} mg` },
    { label: 'Vitamin D', val: `${data.rda.vitaminDRda} IU` },
    { label: 'Vitamin C', val: `${data.rda.vitaminCRda} mg` },
    { label: 'Vitamin B12', val: `${data.rda.b12Rda} mcg` },
    { label: 'Folate (B9)', val: `${data.rda.folateRda} mcg` },
    { label: 'Potassium', val: `${data.rda.potassiumRda} mg` },
    { label: 'Sodium Limit', val: `< ${data.rda.sodiumLimitMg} mg` },
    { label: 'Zinc', val: `${data.rda.zincRda} mg` },
    { label: 'Magnesium', val: `${data.rda.magRda} mg` },
  ];

  const rdaBoxWidth = (pageWidth - 2 * margin - 12) / 5;
  rdaItems.forEach((item, index) => {
    const row = Math.floor(index / 5);
    const col = index % 5;
    const rx = margin + col * (rdaBoxWidth + 3);
    const ry = y + row * 12;

    doc.setFillColor(241, 245, 249);
    doc.setDrawColor(226, 232, 240);
    doc.roundedRect(rx, ry, rdaBoxWidth, 10, 1.5, 1.5, 'FD');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.setTextColor(71, 85, 105);
    doc.text(item.label, rx + rdaBoxWidth / 2, ry + 4, { align: 'center' });

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.setTextColor(16, 185, 129);
    doc.text(item.val, rx + rdaBoxWidth / 2, ry + 8, { align: 'center' });
  });

  y += 28;

  // 6. Food Suggestions & Clinical Footer
  if (data.recommendedFoods && data.recommendedFoods.length > 0) {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(15, 23, 42);
    doc.text('5. Suggested Food Items for Selected Goal', margin, y);

    y += 4;
    const foodNames = data.recommendedFoods.map((f) => f.name).join(' • ');
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(51, 65, 85);
    doc.text(foodNames, margin, y, { maxWidth: pageWidth - 2 * margin });
    y += 10;
  }

  // Footer Disclaimer
  doc.setDrawColor(226, 232, 240);
  doc.line(margin, 280, pageWidth - margin, 280);

  doc.setFont('helvetica', 'italic');
  doc.setFontSize(7.5);
  doc.setTextColor(148, 163, 184);
  doc.text(
    'Disclaimer: NutriGlobe Clinical Database reports are for educational & informational purposes. Always consult a licensed healthcare professional for medical diagnosis.',
    pageWidth / 2,
    285,
    { align: 'center' }
  );

  // Save the document
  doc.save(`NutriGlobe_Nutrition_Report_${data.bmiCategory.replace(/\s+/g, '_')}.pdf`);
}
