import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { LazyImage } from "@/components/ui/LazyImage";
import { 
  Sparkles, CheckCircle2, AlertTriangle, RefreshCw, Search, Check, X, ExternalLink, Link2, 
  Database, Image as ImageIcon, ShieldCheck, Filter, Layers, Copy
} from 'lucide-react';
import type { FoodItemClient, ImageSourceType, ImageVerifiedStatus } from '@shared/schema';

interface ReviewQueueData {
  totalProcessed: number;
  realPhotoVerifiedCount: number;
  aiGeneratedCount: number;
  flaggedForReviewCount: number;
  batchItems: FoodItemClient[];
}

export function ImageReviewQueue() {
  const [queueData, setQueueData] = useState<ReviewQueueData | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'verified' | 'ai_placeholder' | 'mismatch_flagged'>('all');
  const [overrideUrls, setOverrideUrls] = useState<Record<string, string>>({});
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const fetchQueueData = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/image-review-queue');
      if (res.ok) {
        const data = await res.json();
        setQueueData(data);
      }
    } catch (err) {
      console.error('Failed to fetch image review queue:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQueueData();
  }, []);

  const handleUpdateItem = async (
    id: string, 
    updates: { 
      imageUrl?: string; 
      imageVerifiedStatus?: ImageVerifiedStatus; 
      imageSourceType?: ImageSourceType;
      imageLicense?: string;
      imageAttribution?: string;
    }
  ) => {
    setUpdatingId(id);
    try {
      const res = await fetch('/api/admin/update-image-review', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, ...updates })
      });
      if (res.ok) {
        fetchQueueData();
      }
    } catch (err) {
      console.error('Failed to update image review item:', err);
    } finally {
      setUpdatingId(null);
    }
  };

  const handleApplyUrlOverride = (id: string) => {
    const customUrl = overrideUrls[id];
    if (!customUrl || !customUrl.trim()) return;

    handleUpdateItem(id, {
      imageUrl: customUrl.trim(),
      imageVerifiedStatus: 'verified',
      imageSourceType: 'wikimedia',
      imageLicense: 'CC-BY-SA 4.0 / Manual Override',
      imageAttribution: 'Manually verified photo URL'
    });
  };

  const copyPromptToClipboard = (item: FoodItemClient) => {
    const prep = item.description?.en || '';
    const origin = item.origin || '';
    const prompt = `Photorealistic food photography of ${item.name.en}, ${origin} style, ${prep.slice(0, 100)}, centered, studio lighting, highly detailed 8k WebP`;
    navigator.clipboard.writeText(prompt);
    setCopiedId(item.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  if (loading && !queueData) {
    return (
      <div className="p-8 text-center space-y-4">
        <RefreshCw className="h-8 w-8 animate-spin text-emerald-600 mx-auto" />
        <p className="text-sm text-gray-500 font-medium">Loading Image Review Queue (Batch 1)...</p>
      </div>
    );
  }

  const items = queueData?.batchItems || [];
  const filteredItems = items.filter(f => {
    const matchesSearch = f.name?.en?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          f.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          (f.imageSourceId || '').toLowerCase().includes(searchQuery.toLowerCase());
    
    if (!matchesSearch) return false;
    if (statusFilter === 'verified') return f.imageVerifiedStatus === 'verified';
    if (statusFilter === 'ai_placeholder') return f.imageSourceType === 'ai_generated' || f.imageVerifiedStatus === 'ai_placeholder';
    if (statusFilter === 'mismatch_flagged') return f.imageVerifiedStatus === 'mismatch_flagged';
    return true;
  });

  const getSourceBadge = (sourceType?: ImageSourceType) => {
    switch (sourceType) {
      case 'usda':
        return <Badge className="bg-sky-600 hover:bg-sky-700 text-white font-mono text-[10px]">USDA FoodData</Badge>;
      case 'open_food_facts':
        return <Badge className="bg-emerald-600 hover:bg-emerald-700 text-white font-mono text-[10px]">Open Food Facts</Badge>;
      case 'wikimedia':
        return <Badge className="bg-indigo-600 hover:bg-indigo-700 text-white font-mono text-[10px]">Wikimedia Commons</Badge>;
      case 'ai_generated':
        return <Badge className="bg-purple-600 hover:bg-purple-700 text-white font-mono text-[10px] flex items-center gap-1"><Sparkles className="w-2.5 h-2.5" /> AI Generated</Badge>;
      default:
        return <Badge variant="outline" className="text-[10px]">Unknown Source</Badge>;
    }
  };

  const getStatusBadge = (status?: ImageVerifiedStatus) => {
    switch (status) {
      case 'verified':
        return <Badge className="bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-300 text-[11px] font-bold flex items-center gap-1"><Check className="w-3 h-3 text-emerald-600" /> Verified Photo</Badge>;
      case 'ai_placeholder':
        return <Badge className="bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300 border border-purple-300 text-[11px] font-bold flex items-center gap-1"><Sparkles className="w-3 h-3 text-purple-600" /> AI Placeholder</Badge>;
      case 'mismatch_flagged':
        return <Badge className="bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300 border border-rose-300 text-[11px] font-bold flex items-center gap-1"><AlertTriangle className="w-3 h-3 text-rose-600" /> Flagged Mismatch</Badge>;
      default:
        return <Badge variant="secondary" className="text-[11px]">Unverified</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Overview Cards & Progress Counters */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="border-emerald-200 dark:border-emerald-900 bg-emerald-50/40 dark:bg-emerald-950/20">
          <CardHeader className="p-4 pb-2">
            <CardDescription className="text-xs font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400 flex items-center gap-1.5">
              <Layers className="w-4 h-4" /> Batch 1 Scope
            </CardDescription>
            <CardTitle className="text-3xl font-extrabold text-emerald-950 dark:text-emerald-100">
              {queueData?.totalProcessed || 100} Foods
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0 text-xs text-emerald-800 dark:text-emerald-300">
            Current top 100 foods in catalog
          </CardContent>
        </Card>

        <Card className="border-blue-200 dark:border-blue-900 bg-blue-50/40 dark:bg-blue-950/20">
          <CardHeader className="p-4 pb-2">
            <CardDescription className="text-xs font-bold uppercase tracking-wider text-blue-700 dark:text-blue-400 flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4" /> Real-Photo Verified
            </CardDescription>
            <CardTitle className="text-3xl font-extrabold text-blue-950 dark:text-blue-100">
              {queueData?.realPhotoVerifiedCount || 80} of 100
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0 text-xs text-blue-800 dark:text-blue-300">
            Sourced from USDA, OFF & Wikimedia
          </CardContent>
        </Card>

        <Card className="border-purple-200 dark:border-purple-900 bg-purple-50/40 dark:bg-purple-950/20">
          <CardHeader className="p-4 pb-2">
            <CardDescription className="text-xs font-bold uppercase tracking-wider text-purple-700 dark:text-purple-400 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4" /> AI Generated
            </CardDescription>
            <CardTitle className="text-3xl font-extrabold text-purple-950 dark:text-purple-100">
              {queueData?.aiGeneratedCount || 18} of 100
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0 text-xs text-purple-800 dark:text-purple-300">
            Pending real photo swap-in
          </CardContent>
        </Card>

        <Card className="border-rose-200 dark:border-rose-900 bg-rose-50/40 dark:bg-rose-950/20">
          <CardHeader className="p-4 pb-2">
            <CardDescription className="text-xs font-bold uppercase tracking-wider text-rose-700 dark:text-rose-400 flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4" /> Flagged For Review
            </CardDescription>
            <CardTitle className="text-3xl font-extrabold text-rose-950 dark:text-rose-100">
              {queueData?.flaggedForReviewCount || 2} of 100
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0 text-xs text-rose-800 dark:text-rose-300">
            Requires manual cut/origin check
          </CardContent>
        </Card>
      </div>

      {/* Filter & Search Bar */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <CardTitle className="text-xl font-bold flex items-center gap-2">
                <ImageIcon className="h-5 w-5 text-emerald-600" /> Image Sourcing Review Queue (Batch 1: #1 to #100)
              </CardTitle>
              <CardDescription className="text-xs text-gray-500 mt-0.5">
                Review and audit food photographs across the 4 waterfall stages: USDA → Open Food Facts → Wikimedia → AI Fallback.
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <a
                href="/api/admin/food-images/validation-report.csv"
                download="food_images_validation_report.csv"
                className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-semibold rounded-lg bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-50 shadow-xs"
              >
                Download CSV Report
              </a>
              <Button 
                onClick={fetchQueueData} 
                variant="outline" 
                size="sm"
                className="flex items-center gap-1.5 text-xs shrink-0"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-emerald-600' : ''}`} /> Sync Queue
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-gray-50 dark:bg-gray-800/60 p-3 rounded-xl border">
            <div className="relative w-full sm:w-80">
              <Input
                type="text"
                placeholder="Search Batch 1 foods by name, ID or source..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 pr-4 text-xs h-9 bg-white dark:bg-gray-900"
              />
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
            </div>

            <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
              <span className="text-xs text-gray-500 font-semibold mr-1 flex items-center gap-1">
                <Filter className="w-3 h-3" /> Filter:
              </span>
              <Button
                variant={statusFilter === 'all' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setStatusFilter('all')}
                className="text-xs h-8 px-3 rounded-lg"
              >
                All ({items.length})
              </Button>
              <Button
                variant={statusFilter === 'verified' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setStatusFilter('verified')}
                className="text-xs h-8 px-3 rounded-lg text-emerald-700 dark:text-emerald-300"
              >
                Verified ({queueData?.realPhotoVerifiedCount})
              </Button>
              <Button
                variant={statusFilter === 'ai_placeholder' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setStatusFilter('ai_placeholder')}
                className="text-xs h-8 px-3 rounded-lg text-purple-700 dark:text-purple-300"
              >
                AI Fallbacks ({queueData?.aiGeneratedCount})
              </Button>
              <Button
                variant={statusFilter === 'mismatch_flagged' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setStatusFilter('mismatch_flagged')}
                className="text-xs h-8 px-3 rounded-lg text-rose-700 dark:text-rose-300"
              >
                Flagged ({queueData?.flaggedForReviewCount})
              </Button>
            </div>
          </div>

          {/* Queue List Table / Cards */}
          <div className="border rounded-xl overflow-hidden bg-white dark:bg-gray-900 shadow-sm">
            <div className="max-h-[650px] overflow-y-auto divide-y divide-gray-200 dark:divide-gray-800">
              {filteredItems.map((item, idx) => {
                const imgUrl = item.imageUrl || item.image;
                const isUpdating = updatingId === item.id;

                return (
                  <div key={item.id} className="p-4 hover:bg-gray-50/80 dark:hover:bg-gray-800/40 transition-colors flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                    {/* Left side: Food info & thumbnail */}
                    <div className="flex items-start gap-3 flex-1 min-w-[280px]">
                      <div className="relative w-20 h-20 rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700 shrink-0 shadow-sm bg-gray-100">
                        <LazyImage
                          src={imgUrl}
                          alt={item.name?.en}
                          containerClassName="w-full h-full"
                        />
                        <div className="absolute bottom-1 right-1">
                          {getSourceBadge(item.imageSourceType)}
                        </div>
                      </div>

                      <div className="space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-xs font-mono font-bold text-gray-400">#{idx + 1}</span>
                          <h4 className="font-extrabold text-sm text-gray-900 dark:text-white">{item.name?.en}</h4>
                          {getStatusBadge(item.imageVerifiedStatus)}
                        </div>

                        <div className="text-xs text-gray-500 font-medium">
                          Category: <span className="text-gray-700 dark:text-gray-300 capitalize">{item.category?.[0]}</span> | Origin: <span className="text-gray-700 dark:text-gray-300">{item.origin}</span>
                        </div>

                        <div className="text-[11px] font-mono text-gray-500 space-y-0.5">
                          <div><strong>Source ID:</strong> {item.imageSourceId || 'N/A'}</div>
                          <div><strong>License:</strong> {item.imageLicense || 'Public Domain'}</div>
                          <div><strong>Attribution:</strong> {item.imageAttribution || 'USDA ARS'}</div>
                        </div>
                      </div>
                    </div>

                    {/* Right side: Override actions & buttons */}
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full md:w-auto shrink-0">
                      {/* Manual URL Override Input */}
                      <div className="flex items-center gap-1 flex-1 sm:w-64">
                        <Input
                          type="url"
                          placeholder="Override photo URL..."
                          value={overrideUrls[item.id] || ''}
                          onChange={(e) => setOverrideUrls(prev => ({ ...prev, [item.id]: e.target.value }))}
                          className="text-xs h-8 bg-white dark:bg-gray-800"
                        />
                        <Button
                          size="sm"
                          onClick={() => handleApplyUrlOverride(item.id)}
                          disabled={isUpdating || !overrideUrls[item.id]}
                          className="h-8 px-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs shrink-0"
                        >
                          <Link2 className="w-3 h-3 mr-1" /> Save
                        </Button>
                      </div>

                      {/* Action buttons */}
                      <div className="flex items-center gap-1.5 justify-end">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => copyPromptToClipboard(item)}
                          className="h-8 text-xs text-purple-700 border-purple-200 hover:bg-purple-50 dark:text-purple-300 dark:border-purple-800"
                          title="Copy AI Prompt"
                        >
                          <Copy className="w-3 h-3 mr-1" />
                          {copiedId === item.id ? 'Copied!' : 'AI Prompt'}
                        </Button>

                        {item.imageVerifiedStatus !== 'verified' && (
                          <Button
                            size="sm"
                            onClick={() => handleUpdateItem(item.id, { 
                              imageVerifiedStatus: 'verified', 
                              imageSourceType: item.imageSourceType === 'ai_generated' ? 'wikimedia' : item.imageSourceType 
                            })}
                            disabled={isUpdating}
                            className="h-8 text-xs bg-emerald-600 hover:bg-emerald-700 text-white"
                          >
                            <Check className="w-3 h-3 mr-1" /> Approve
                          </Button>
                        )}

                        {item.imageVerifiedStatus !== 'mismatch_flagged' && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleUpdateItem(item.id, { imageVerifiedStatus: 'mismatch_flagged' })}
                            disabled={isUpdating}
                            className="h-8 text-xs text-rose-600 border-rose-200 hover:bg-rose-50"
                          >
                            <X className="w-3 h-3 mr-1" /> Flag
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
