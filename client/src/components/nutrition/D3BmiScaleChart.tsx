import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Scale, Heart, Info, ArrowDown, Activity } from 'lucide-react';

export function D3BmiScaleChart() {
  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  // User input states for interactive visualization
  const [heightCm, setHeightCm] = useState<number>(170);
  const [weightKg, setWeightKg] = useState<number>(70);
  const [customBmi, setCustomBmi] = useState<number | null>(null);

  // Calculate BMI
  const calculatedBmi = parseFloat((weightKg / Math.pow(heightCm / 100, 2)).toFixed(1));
  const activeBmi = customBmi !== null ? customBmi : calculatedBmi;

  // Determine Category & Status
  const getBmiDetails = (bmi: number) => {
    if (bmi < 18.5) {
      return {
        category: 'Underweight',
        color: '#f59e0b', // amber-500
        bgColor: 'bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800 text-amber-700 dark:text-amber-300',
        badge: 'bg-amber-500 text-white',
        desc: 'Below optimal range (< 18.5). Nutritional enrichment recommended.',
      };
    } else if (bmi >= 18.5 && bmi < 25) {
      return {
        category: 'Normal Healthy Weight',
        color: '#10b981', // emerald-500
        bgColor: 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300',
        badge: 'bg-emerald-600 text-white',
        desc: 'Optimal metabolic range (18.5 – 24.9). Maintains lowest risk of chronic conditions.',
      };
    } else if (bmi >= 25 && bmi < 30) {
      return {
        category: 'Overweight',
        color: '#f97316', // orange-500
        bgColor: 'bg-orange-50 dark:bg-orange-950/40 border-orange-200 dark:border-orange-800 text-orange-700 dark:text-orange-300',
        badge: 'bg-orange-500 text-white',
        desc: 'Above healthy range (25.0 – 29.9). Mild risk increase for cardiovascular health.',
      };
    } else {
      return {
        category: 'Obesity Class (WHO)',
        color: '#f43f5e', // rose-500
        bgColor: 'bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300',
        badge: 'bg-rose-600 text-white',
        desc: 'Elevated clinical range (≥ 30.0). Dietary and physical activity modification recommended.',
      };
    }
  };

  const bmiInfo = getBmiDetails(activeBmi);

  // Render D3 Visualization
  useEffect(() => {
    if (!svgRef.current || !containerRef.current) return;

    const containerWidth = containerRef.current.clientWidth || 600;
    const height = 180;
    const margin = { top: 35, right: 30, bottom: 45, left: 30 };
    const width = containerWidth - margin.left - margin.right;

    // Clear previous SVG contents
    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    svg
      .attr('width', containerWidth)
      .attr('height', height)
      .attr('viewBox', `0 0 ${containerWidth} ${height}`);

    const g = svg.append('g').attr('transform', `translate(${margin.left},${margin.top})`);

    // Scale mapping BMI (12 to 40)
    const xScale = d3.scaleLinear().domain([12, 40]).range([0, width]);

    // Define WHO BMI Categories
    const zones = [
      { name: 'Underweight', min: 12, max: 18.5, color: '#f59e0b', label: '< 18.5' },
      { name: 'Normal', min: 18.5, max: 25, color: '#10b981', label: '18.5 - 24.9' },
      { name: 'Overweight', min: 25, max: 30, color: '#f97316', label: '25 - 29.9' },
      { name: 'Obese', min: 30, max: 40, color: '#f43f5e', label: '≥ 30' },
    ];

    const barHeight = 28;

    // Draw background zone rectangles
    zones.forEach((zone) => {
      const xStart = xScale(zone.min);
      const xEnd = xScale(zone.max);
      const zoneWidth = xEnd - xStart;

      // Zone bar
      g.append('rect')
        .attr('x', xStart)
        .attr('y', 0)
        .attr('width', Math.max(0, zoneWidth))
        .attr('height', barHeight)
        .attr('fill', zone.color)
        .attr('opacity', 0.85)
        .attr('rx', 4)
        .attr('ry', 4);

      // Zone text label inside bar if wide enough
      if (zoneWidth > 45) {
        g.append('text')
          .attr('x', xStart + zoneWidth / 2)
          .attr('y', barHeight / 2)
          .attr('dy', '0.35em')
          .attr('text-anchor', 'middle')
          .attr('fill', '#ffffff')
          .attr('font-size', '11px')
          .attr('font-weight', 'bold')
          .text(zone.name);
      }

      // Range text below bar
      g.append('text')
        .attr('x', xStart + zoneWidth / 2)
        .attr('y', barHeight + 16)
        .attr('text-anchor', 'middle')
        .attr('fill', '#64748b')
        .attr('font-size', '10px')
        .attr('font-weight', '600')
        .text(zone.label);
    });

    // D3 Bottom Axis for BMI numbers
    const xAxis = d3
      .axisBottom(xScale)
      .tickValues([12, 18.5, 25, 30, 35, 40])
      .tickFormat((d) => `${d}`);

    const xAxisGroup = g
      .append('g')
      .attr('transform', `translate(0, ${barHeight + 25})`)
      .call(xAxis);

    xAxisGroup.selectAll('text').attr('font-size', '10px').attr('font-weight', 'bold').attr('fill', '#475569');
    xAxisGroup.selectAll('line').attr('stroke', '#cbd5e1');
    xAxisGroup.select('.domain').attr('stroke', '#cbd5e1');

    // Ideal BMI Marker line (BMI = 21.7)
    const idealX = xScale(21.7);
    g.append('line')
      .attr('x1', idealX)
      .attr('y1', -8)
      .attr('x2', idealX)
      .attr('y2', barHeight + 8)
      .attr('stroke', '#059669')
      .attr('stroke-width', 2)
      .attr('stroke-dasharray', '3,3');

    g.append('text')
      .attr('x', idealX)
      .attr('y', -12)
      .attr('text-anchor', 'middle')
      .attr('fill', '#059669')
      .attr('font-size', '9px')
      .attr('font-weight', 'bold')
      .text('Ideal (21.7)');

    // User's BMI Pin Indicator (Clamped between 12 and 40 for rendering)
    const clampedBmi = Math.min(Math.max(activeBmi, 12), 40);
    const userX = xScale(clampedBmi);

    // Pin line extending vertically
    g.append('line')
      .attr('x1', userX)
      .attr('y1', -18)
      .attr('x2', userX)
      .attr('y2', barHeight + 4)
      .attr('stroke', bmiInfo.color)
      .attr('stroke-width', 3);

    // Pointer Circle / Pin Head
    g.append('circle')
      .attr('cx', userX)
      .attr('cy', -20)
      .attr('r', 8)
      .attr('fill', bmiInfo.color)
      .attr('stroke', '#ffffff')
      .attr('stroke-width', 2);

    // Text inside pin head or above pin
    g.append('text')
      .attr('x', userX)
      .attr('y', -32)
      .attr('text-anchor', 'middle')
      .attr('fill', bmiInfo.color)
      .attr('font-size', '12px')
      .attr('font-weight', '900')
      .text(`BMI ${activeBmi}`);

  }, [activeBmi, bmiInfo.color]);

  return (
    <Card className="border-emerald-200 dark:border-emerald-900 shadow-md rounded-2xl overflow-hidden">
      <CardHeader className="bg-gradient-to-r from-emerald-50 via-teal-50 to-slate-50 dark:from-emerald-950/40 dark:via-teal-950/40 dark:to-slate-900 border-b border-emerald-100 dark:border-emerald-900/60 p-5">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-emerald-600 text-white rounded-xl shadow-sm">
              <Activity className="h-5 w-5" />
            </div>
            <div>
              <CardTitle className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                D3.js WHO Scale BMI Visualizer
                <Badge className="bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 text-[10px] font-mono border-emerald-300">
                  D3 v7 Engine
                </Badge>
              </CardTitle>
              <CardDescription className="text-xs">
                Interactive WHO international BMI standard scale mapping and healthy range analysis
              </CardDescription>
            </div>
          </div>

          <Badge className={`px-3 py-1 text-xs font-extrabold rounded-full ${bmiInfo.badge}`}>
            {bmiInfo.category} (BMI {activeBmi})
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="p-5 space-y-6">
        {/* Interactive Biometric Controls */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-slate-50 dark:bg-slate-800/60 p-4 rounded-xl border border-slate-200 dark:border-slate-700">
          <div className="space-y-1.5">
            <Label htmlFor="d3Height" className="text-xs font-bold text-slate-700 dark:text-slate-300">
              Height (cm)
            </Label>
            <Input
              id="d3Height"
              type="number"
              min={100}
              max={230}
              value={heightCm}
              onChange={(e) => {
                setCustomBmi(null);
                setHeightCm(Number(e.target.value) || 170);
              }}
              className="rounded-xl font-bold text-sm bg-white dark:bg-slate-900"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="d3Weight" className="text-xs font-bold text-slate-700 dark:text-slate-300">
              Weight (kg)
            </Label>
            <Input
              id="d3Weight"
              type="number"
              min={30}
              max={250}
              value={weightKg}
              onChange={(e) => {
                setCustomBmi(null);
                setWeightKg(Number(e.target.value) || 70);
              }}
              className="rounded-xl font-bold text-sm bg-white dark:bg-slate-900"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="d3DirectBmi" className="text-xs font-bold text-slate-700 dark:text-slate-300">
              Direct BMI Value
            </Label>
            <Input
              id="d3DirectBmi"
              type="number"
              step="0.1"
              min={12}
              max={45}
              placeholder={`Calculated (${calculatedBmi})`}
              value={customBmi !== null ? customBmi : ''}
              onChange={(e) => {
                const val = e.target.value;
                if (val === '') {
                  setCustomBmi(null);
                } else {
                  setCustomBmi(Number(val));
                }
              }}
              className="rounded-xl font-bold text-sm bg-white dark:bg-slate-900"
            />
          </div>
        </div>

        {/* D3 Render Container */}
        <div ref={containerRef} className="w-full overflow-x-auto pt-4 pb-2 bg-white dark:bg-slate-900 rounded-xl">
          <svg ref={svgRef} className="mx-auto block max-w-full"></svg>
        </div>

        {/* Health Range Assessment Callout */}
        <div className={`p-4 rounded-xl border ${bmiInfo.bgColor} space-y-1 text-xs`}>
          <div className="flex items-center gap-2 font-bold text-sm">
            <Info className="h-4 w-4" />
            <span>Clinical Status: {bmiInfo.category} (BMI {activeBmi})</span>
          </div>
          <p className="leading-relaxed font-medium">{bmiInfo.desc}</p>
        </div>
      </CardContent>
    </Card>
  );
}
