import React, { useState, useRef, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Sparkles, Download, Wand2, Image as ImageIcon, Layers, RefreshCw, CheckCircle2, ShieldCheck, Globe, Tag, SlidersHorizontal, Loader2, Search, ExternalLink } from 'lucide-react';
import { FoodItemClient } from '@shared/schema';
import { getGoogleImageSearchUrl } from '@/lib/foodImageResolver';

interface FoodImageStudioModalProps {
  isOpen: boolean;
  onClose: () => void;
  foodItem?: FoodItemClient | null;
  onImageUpdated?: (newImageUrl: string) => void;
}

const getFoodNameString = (name: any): string => {
  if (!name) return 'Alphonso Mango';
  if (typeof name === 'string') return name;
  return name.en || name.hi || name.ta || name.es || name.fr || 'Alphonso Mango';
};

export const FoodImageStudioModal: React.FC<FoodImageStudioModalProps> = ({
  isOpen,
  onClose,
  foodItem,
  onImageUpdated
}) => {
  const [foodName, setFoodName] = useState<string>(() => getFoodNameString(foodItem?.name));
  const [prompt, setPrompt] = useState('');
  const [editPrompt, setEditPrompt] = useState('');
  const [mode, setMode] = useState<'generate' | 'edit'>('generate');
  const [currentImageUrl, setCurrentImageUrl] = useState(
    foodItem?.imageUrl || foodItem?.image || 'https://images.unsplash.com/photo-1553279768-865429fa0078?auto=format&fit=crop&w=1000&q=80'
  );
  
  // Branding overlay options
  const [brandingText, setBrandingText] = useState('NutriGlobe Clinical & Educational Database');
  const [webUrl, setWebUrl] = useState('www.nutriglobe.org');
  const [showWebUrlOverlay, setShowWebUrlOverlay] = useState(true);
  const [showEducationalBadge, setShowEducationalBadge] = useState(true);
  const [aspectRatio, setAspectRatio] = useState<'1:1' | '4:3' | '16:9' | '3:4'>('1:1');
  const [watermarkStyle, setWatermarkStyle] = useState<'banner' | 'corner' | 'badge'>('banner');

  const [isLoading, setIsLoading] = useState(false);
  const [modelInfo, setModelInfo] = useState<string>('gemini-3.1-flash-image');
  const [statusMessage, setStatusMessage] = useState<string>('');

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [canvasDataUrl, setCanvasDataUrl] = useState<string>('');

  useEffect(() => {
    if (foodItem) {
      setFoodName(getFoodNameString(foodItem.name));
      if (foodItem.imageUrl || foodItem.image) setCurrentImageUrl(foodItem.imageUrl || foodItem.image);
    }
  }, [foodItem]);

  // Render watermarked image onto Canvas whenever options change
  useEffect(() => {
    if (!currentImageUrl) return;

    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = currentImageUrl;
    img.onload = () => {
      const canvas = canvasRef.current || document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const width = img.naturalWidth || 1024;
      const height = img.naturalHeight || 1024;
      canvas.width = width;
      canvas.height = height;

      // Draw base image
      ctx.drawImage(img, 0, 0, width, height);

      if (showWebUrlOverlay) {
        if (watermarkStyle === 'banner') {
          // Bottom elegant banner
          const bannerHeight = Math.max(60, height * 0.08);
          ctx.fillStyle = 'rgba(15, 23, 42, 0.85)'; // Dark slate semi-transparent
          ctx.fillRect(0, height - bannerHeight, width, bannerHeight);

          // Top subtle border line
          ctx.fillStyle = '#10b981'; // Emerald 500
          ctx.fillRect(0, height - bannerHeight, width, 4);

          // Left text: Branding + Web URL
          ctx.fillStyle = '#ffffff';
          ctx.font = `bold ${Math.round(bannerHeight * 0.32)}px system-ui, sans-serif`;
          ctx.textAlign = 'left';
          ctx.textBaseline = 'middle';
          ctx.fillText(`🍃 ${brandingText}`, 20, height - bannerHeight / 2 - 2);

          // Right text: Web URL
          ctx.fillStyle = '#6ee7b7'; // Emerald 300
          ctx.font = `bold ${Math.round(bannerHeight * 0.30)}px monospace`;
          ctx.textAlign = 'right';
          ctx.fillText(webUrl, width - 20, height - bannerHeight / 2 - 2);
        } else if (watermarkStyle === 'corner') {
          // Bottom-Right pill watermark
          const padding = 20;
          const fontSize = Math.max(16, Math.round(width * 0.022));
          ctx.font = `bold ${fontSize}px system-ui, sans-serif`;
          const text = `🌐 ${webUrl} | ${brandingText}`;
          const textMetrics = ctx.measureText(text);
          const boxWidth = textMetrics.width + 30;
          const boxHeight = fontSize + 20;

          const x = width - boxWidth - padding;
          const y = height - boxHeight - padding;

          // Pill background
          ctx.fillStyle = 'rgba(6, 78, 59, 0.9)'; // Dark emerald
          ctx.beginPath();
          ctx.roundRect(x, y, boxWidth, boxHeight, 12);
          ctx.fill();
          ctx.strokeStyle = '#34d399';
          ctx.lineWidth = 2;
          ctx.stroke();

          // Pill text
          ctx.fillStyle = '#ffffff';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(text, x + boxWidth / 2, y + boxHeight / 2);
        } else if (watermarkStyle === 'badge') {
          // Top educational header + bottom URL
          const headerHeight = Math.max(48, height * 0.06);
          ctx.fillStyle = 'rgba(6, 78, 59, 0.9)';
          ctx.fillRect(0, 0, width, headerHeight);

          ctx.fillStyle = '#ffffff';
          ctx.font = `bold ${Math.round(headerHeight * 0.4)}px system-ui, sans-serif`;
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          const safeFoodName = typeof foodName === 'string' ? foodName : getFoodNameString(foodName);
          ctx.fillText(`EDUCATIONAL NUTRITION DATABASE • ${safeFoodName.toUpperCase()}`, width / 2, headerHeight / 2);

          // Bottom URL
          const footerHeight = Math.max(40, height * 0.05);
          ctx.fillStyle = 'rgba(15, 23, 42, 0.9)';
          ctx.fillRect(0, height - footerHeight, width, footerHeight);

          ctx.fillStyle = '#34d399';
          ctx.font = `bold ${Math.round(footerHeight * 0.45)}px monospace`;
          ctx.fillText(`Official Resource: ${webUrl}`, width / 2, height - footerHeight / 2);
        }
      }

      setCanvasDataUrl(canvas.toDataURL('image/jpeg', 0.92));
    };
  }, [currentImageUrl, brandingText, webUrl, showWebUrlOverlay, watermarkStyle, foodName]);

  const handleGenerate = async () => {
    setIsLoading(true);
    setStatusMessage('Generating realistic food photograph via Gemini 3.1 Flash Image...');
    try {
      const res = await fetch('/api/food-image-studio/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          foodName,
          prompt,
          aspectRatio,
          brandingText,
          webUrl
        })
      });
      const data = await res.json();
      if (data.success && data.imageUrl) {
        setCurrentImageUrl(data.imageUrl);
        setModelInfo(data.modelUsed || 'gemini-3.1-flash-image');
        setStatusMessage('Image generated successfully!');
      } else {
        setStatusMessage(data.message || 'Failed to generate image');
      }
    } catch (err: any) {
      console.error('Generation error:', err);
      setStatusMessage('Error generating image');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = async () => {
    if (!editPrompt.trim()) return;
    setIsLoading(true);
    setStatusMessage('Editing food image with text instructions via Gemini 3.1 Flash Image...');

    try {
      // Pass canvasDataUrl or currentImageUrl
      const res = await fetch('/api/food-image-studio/edit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          foodName,
          base64Image: canvasDataUrl || currentImageUrl,
          imageUrl: currentImageUrl,
          editPrompt,
          aspectRatio,
          brandingText,
          webUrl
        })
      });
      const data = await res.json();
      if (data.success && data.imageUrl) {
        setCurrentImageUrl(data.imageUrl);
        setModelInfo(data.modelUsed || 'gemini-3.1-flash-image');
        setStatusMessage('Image edited successfully!');
      } else {
        setStatusMessage(data.message || 'Failed to edit image');
      }
    } catch (err: any) {
      console.error('Edit error:', err);
      setStatusMessage('Error editing image');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownload = () => {
    const link = document.createElement('a');
    const safeFoodName = typeof foodName === 'string' ? foodName : getFoodNameString(foodName);
    link.download = `${safeFoodName.toLowerCase().replace(/\s+/g, '_')}_educational_image.jpg`;
    link.href = canvasDataUrl || currentImageUrl;
    link.click();
  };

  const handleApplyToApp = () => {
    if (onImageUpdated && (canvasDataUrl || currentImageUrl)) {
      onImageUpdated(canvasDataUrl || currentImageUrl);
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl p-0 overflow-hidden max-h-[92vh] flex flex-col bg-white dark:bg-slate-900 border-emerald-100 dark:border-emerald-900/50 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-4 px-6 bg-gradient-to-r from-emerald-800 via-teal-900 to-slate-900 text-white border-b border-emerald-700/50">
          <div className="flex items-center gap-2">
            <Wand2 className="h-5 w-5 text-amber-300 animate-bounce" />
            <DialogTitle className="text-lg font-black tracking-tight">
              AI Food Image Studio & Educational Editor
            </DialogTitle>
          </div>
          <Badge className="bg-emerald-500/20 text-emerald-200 border-emerald-400/40 text-xs px-3 py-1 font-mono">
            {modelInfo}
          </Badge>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            
            {/* Left Column: Interactive Controls */}
            <div className="lg:col-span-5 space-y-5">
              
              {/* Food Name & Mode Selector */}
              <div className="space-y-3 p-4 bg-emerald-50/50 dark:bg-emerald-950/20 rounded-2xl border border-emerald-100 dark:border-emerald-900/40">
                <div>
                  <Label className="text-xs font-bold text-gray-700 dark:text-gray-300">Target Food Item</Label>
                  <Input 
                    value={foodName} 
                    onChange={(e) => setFoodName(e.target.value)}
                    placeholder="Enter food name..."
                    className="mt-1 bg-white dark:bg-slate-800 border-emerald-200 font-semibold text-sm"
                  />
                  <div className="pt-1.5">
                    <a
                      href={getGoogleImageSearchUrl(foodName, foodItem?.category)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 hover:underline"
                    >
                      <Search className="h-3 w-3" />
                      <span>Search "{foodName} food" Real Photos on Google Images</span>
                      <ExternalLink className="h-2.5 w-2.5" />
                    </a>
                  </div>
                </div>

                <div className="flex gap-2 pt-1">
                  <Button
                    onClick={() => setMode('generate')}
                    variant={mode === 'generate' ? 'default' : 'outline'}
                    size="sm"
                    className={`flex-1 text-xs font-bold ${mode === 'generate' ? 'bg-emerald-600 text-white' : ''}`}
                  >
                    <Sparkles className="h-3.5 w-3.5 mr-1" />
                    New AI Image
                  </Button>
                  <Button
                    onClick={() => setMode('edit')}
                    variant={mode === 'edit' ? 'default' : 'outline'}
                    size="sm"
                    className={`flex-1 text-xs font-bold ${mode === 'edit' ? 'bg-teal-600 text-white' : ''}`}
                  >
                    <Wand2 className="h-3.5 w-3.5 mr-1" />
                    Edit Image
                  </Button>
                </div>
              </div>

              {/* Mode-Specific Prompting */}
              {mode === 'generate' ? (
                <div className="space-y-2">
                  <Label className="text-xs font-bold text-gray-700 dark:text-gray-300 flex items-center justify-between">
                    <span>AI Generation Prompt</span>
                    <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-mono">gemini-3.1-flash-image</span>
                  </Label>
                  <Textarea
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder={`e.g., Ultra-realistic photograph of fresh ${foodName}, macro view on clean white surface, natural daylight, crisp detail...`}
                    className="h-24 bg-white dark:bg-slate-800 text-xs"
                  />
                  <Button
                    onClick={handleGenerate}
                    disabled={isLoading || !(typeof foodName === 'string' ? foodName : String(foodName)).trim()}
                    className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs py-2.5 rounded-xl flex items-center justify-center gap-2 shadow"
                  >
                    {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4 text-amber-300" />}
                    Generate {typeof foodName === 'string' ? foodName : getFoodNameString(foodName)} Image
                  </Button>
                </div>
              ) : (
                <div className="space-y-2">
                  <Label className="text-xs font-bold text-gray-700 dark:text-gray-300 flex items-center justify-between">
                    <span>Editable Feature Instruction</span>
                    <span className="text-[10px] text-teal-600 dark:text-teal-400 font-mono">Image-to-Image AI Edit</span>
                  </Label>
                  <Textarea
                    value={editPrompt}
                    onChange={(e) => setEditPrompt(e.target.value)}
                    placeholder="e.g., Add fresh mint leaves and sliced cross section next to the food item, show macro texture details for education..."
                    className="h-24 bg-white dark:bg-slate-800 text-xs"
                  />
                  <Button
                    onClick={handleEdit}
                    disabled={isLoading || !editPrompt.trim()}
                    className="w-full bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs py-2.5 rounded-xl flex items-center justify-center gap-2 shadow"
                  >
                    {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Wand2 className="h-4 w-4 text-amber-300" />}
                    Apply AI Edit Instruction
                  </Button>
                </div>
              )}

              {/* Educational Branding & Watermark Customization */}
              <div className="p-4 bg-slate-50 dark:bg-slate-800/80 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-3">
                <div className="flex items-center justify-between border-b pb-2">
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                    <Globe className="h-4 w-4 text-emerald-600" />
                    Branding & Watermark
                  </span>
                  <label className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-300 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={showWebUrlOverlay}
                      onChange={(e) => setShowWebUrlOverlay(e.target.checked)}
                      className="rounded text-emerald-600 accent-emerald-600"
                    />
                    <span>Enable Overlay</span>
                  </label>
                </div>

                {showWebUrlOverlay && (
                  <div className="space-y-3 pt-1 text-xs">
                    <div>
                      <Label className="text-[11px] font-semibold text-gray-600 dark:text-gray-300">Website URL / Domain</Label>
                      <Input
                        value={webUrl}
                        onChange={(e) => setWebUrl(e.target.value)}
                        className="mt-1 bg-white dark:bg-slate-900 h-8 font-mono text-xs"
                      />
                    </div>

                    <div>
                      <Label className="text-[11px] font-semibold text-gray-600 dark:text-gray-300">Branding Text</Label>
                      <Input
                        value={brandingText}
                        onChange={(e) => setBrandingText(e.target.value)}
                        className="mt-1 bg-white dark:bg-slate-900 h-8 text-xs"
                      />
                    </div>

                    <div>
                      <Label className="text-[11px] font-semibold text-gray-600 dark:text-gray-300">Overlay Layout Style</Label>
                      <Select value={watermarkStyle} onValueChange={(val: any) => setWatermarkStyle(val)}>
                        <SelectTrigger className="mt-1 bg-white dark:bg-slate-900 h-8 text-xs">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="banner">Bottom Dark Banner with Emerald Trim</SelectItem>
                          <SelectItem value="corner">Bottom-Right Floating Pill Badge</SelectItem>
                          <SelectItem value="badge">Header Title + Footer Web URL Banner</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                )}
              </div>

              {statusMessage && (
                <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 rounded-xl text-xs font-medium border border-emerald-200 dark:border-emerald-800 flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
                  <span>{statusMessage}</span>
                </div>
              )}
            </div>

            {/* Right Column: High-Res Canvas Live Preview & Actions */}
            <div className="lg:col-span-7 space-y-4">
              <div className="relative rounded-2xl overflow-hidden border-2 border-emerald-200 dark:border-emerald-800/60 bg-slate-950 shadow-xl flex items-center justify-center min-h-[380px]">
                <canvas ref={canvasRef} className="hidden" />
                
                {canvasDataUrl || currentImageUrl ? (
                  <img
                    src={canvasDataUrl || currentImageUrl}
                    alt={foodName}
                    referrerPolicy="no-referrer"
                    className="w-full h-auto max-h-[460px] object-contain rounded-xl"
                  />
                ) : (
                  <div className="text-center p-8 text-slate-400 space-y-2">
                    <ImageIcon className="h-12 w-12 mx-auto text-slate-600 animate-pulse" />
                    <p className="text-xs font-semibold">No Image Preview Available</p>
                  </div>
                )}

                <div className="absolute top-3 left-3 bg-slate-900/80 backdrop-blur-md text-emerald-300 text-[10px] font-bold px-2.5 py-1 rounded-full border border-emerald-500/30 flex items-center gap-1 shadow">
                  <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
                  Live Watermarked Educational Export
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-3">
                <Button
                  onClick={handleDownload}
                  className="flex-1 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs py-2.5 rounded-xl flex items-center justify-center gap-2 border border-slate-700 shadow"
                >
                  <Download className="h-4 w-4 text-emerald-400" />
                  Download High-Res Image ({webUrl})
                </Button>

                {onImageUpdated && (
                  <Button
                    onClick={handleApplyToApp}
                    className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs py-2.5 rounded-xl flex items-center justify-center gap-2 shadow"
                  >
                    <CheckCircle2 className="h-4 w-4 text-amber-300" />
                    Apply Image to {foodName}
                  </Button>
                )}
              </div>
            </div>

          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
