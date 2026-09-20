import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { 
  MessageSquare, ThumbsUp, Sparkles, ShieldCheck, 
  Send, Search, PlusCircle, CheckCircle2, User, ChevronDown, ChevronUp, Flame, HeartPulse
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface ForumComment {
  id: string;
  author: string;
  isDietitian: boolean;
  avatarColor: string;
  content: string;
  timestamp: string;
}

interface ForumThread {
  id: string;
  title: string;
  content: string;
  category: string;
  author: string;
  authorRole?: string;
  timestamp: string;
  upvotes: number;
  userUpvoted?: boolean;
  tags: string[];
  comments: ForumComment[];
}

const INITIAL_THREADS: ForumThread[] = [
  {
    id: 'thread-1',
    title: 'Optimal timing for high-protein meals: before or after resistance workouts?',
    content: 'Is the "anabolic window" truly within 45 minutes of training, or does total daily protein intake across 4-5 evenly spaced meals matter significantly more for hypertrophy and muscle protein synthesis?',
    category: 'High Protein & Fitness',
    author: 'Dr. Emily Vance, RD',
    authorRole: 'Sports Nutritionist',
    timestamp: '3 hours ago',
    upvotes: 42,
    tags: ['Protein Synthesis', 'Workout Nutrition', 'Hypertrophy'],
    comments: [
      {
        id: 'c1',
        author: 'Dr. Emily Vance, RD',
        isDietitian: true,
        avatarColor: 'from-emerald-500 to-teal-600',
        content: 'Clinical meta-analyses show total daily protein (1.6 to 2.2g per kg bodyweight) distributed across 3 to 5 meals with ~0.4g/kg per meal is the primary driver. The 45-minute window is flexible; focus on daily targets and leucine threshold.',
        timestamp: '2 hours ago'
      },
      {
        id: 'c2',
        author: 'Marcus Cole',
        isDietitian: false,
        avatarColor: 'from-blue-500 to-indigo-600',
        content: 'I noticed great recovery improvements by pairing whey or pea protein with a fast-digesting carb right after squats.',
        timestamp: '1 hour ago'
      }
    ]
  },
  {
    id: 'thread-2',
    title: 'Fermented foods vs probiotic capsules: Which is superior for the gut microbiome?',
    content: 'Between homemade kefir, kimchi, sauerkraut, and standardized 50-billion CFU capsules, what does the clinical literature show regarding diversity and long-term strain colonization?',
    category: 'Gut Health & Probiotics',
    author: 'Sunil Rao',
    timestamp: '6 hours ago',
    upvotes: 38,
    tags: ['Gut Microbiome', 'Fermented Foods', 'Prebiotics'],
    comments: [
      {
        id: 'c3',
        author: 'Dr. Ananya Sharma, Ph.D.',
        isDietitian: true,
        avatarColor: 'from-purple-500 to-pink-600',
        content: 'Whole fermented foods provide not just live cultures, but their bioactive metabolites (postbiotics like butyrate, acetate) and complex matrix fibers that shield bacteria through gastric acid. A combination of diverse foods (kefir + fermented vegetables) typically outperforms single isolated pills.',
        timestamp: '4 hours ago'
      }
    ]
  },
  {
    id: 'thread-3',
    title: 'Managing post-prandial glycemic spikes with resistant starches and fiber preloads',
    content: 'Has anyone tested cooling cooked rice or potatoes (retrograded starch) with a continuous glucose monitor (CGM)? The impact on satiety and blood sugar stabilization is fascinating.',
    category: 'Diabetes & Metabolism',
    author: 'Kavita Patel',
    timestamp: '12 hours ago',
    upvotes: 56,
    tags: ['Glycemic Index', 'Resistant Starch', 'CGM'],
    comments: [
      {
        id: 'c4',
        author: 'Dr. Rajiv Menon, MD',
        isDietitian: true,
        avatarColor: 'from-teal-500 to-emerald-700',
        content: 'Cooling cooked starch causes amylose to re-align into a crystalline structure resistant to amylase enzyme breakdown. This lowers glycemic index by 20-35% and fuels Bifidobacteria in the colon.',
        timestamp: '9 hours ago'
      }
    ]
  },
  {
    id: 'thread-4',
    title: 'Curcumin absorption: Black pepper (piperine) synergy and healthy fats',
    content: 'Why is raw turmeric alone poorly absorbed, and what is the optimal clinical ratio with piperine and coconut or mustard oil to increase bioavailability by up to 2000%?',
    category: 'Ayurveda & Spices',
    author: 'Aarav Deshmukh',
    timestamp: '1 day ago',
    upvotes: 64,
    tags: ['Turmeric', 'Curcumin', 'Bioavailability', 'Piperine'],
    comments: [
      {
        id: 'c5',
        author: 'Dr. Priya Nambiar, BAMS',
        isDietitian: true,
        avatarColor: 'from-amber-500 to-orange-600',
        content: 'Piperine inhibits hepatic and intestinal glucuronidation of curcumin, which otherwise excretes it before absorption. Always consume turmeric lightly warmed in lipid media (ghee, olive oil, or coconut oil) with freshly cracked black pepper.',
        timestamp: '18 hours ago'
      }
    ]
  }
];

const CATEGORIES = [
  'All Discussions',
  'High Protein & Fitness',
  'Gut Health & Probiotics',
  'Diabetes & Metabolism',
  'Ayurveda & Spices',
  'Weight Loss & Satiety',
  'Micronutrients & Vitamins'
];

export function CommunityForumView() {
  const { toast } = useToast();
  const [threads, setThreads] = useState<ForumThread[]>(INITIAL_THREADS);
  const [selectedCategory, setSelectedCategory] = useState<string>('All Discussions');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isPosting, setIsPosting] = useState<boolean>(false);
  const [expandedThreads, setExpandedThreads] = useState<Record<string, boolean>>({
    'thread-1': true,
    'thread-2': true
  });

  // New Thread Form States
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState('High Protein & Fitness');
  const [newContent, setNewContent] = useState('');
  const [newAuthor, setNewAuthor] = useState('');

  // Reply Drafts
  const [replyDrafts, setReplyDrafts] = useState<Record<string, string>>({});

  // Filtered threads
  const filteredThreads = useMemo(() => {
    return threads.filter(t => {
      const matchCat = selectedCategory === 'All Discussions' || t.category === selectedCategory;
      const q = searchQuery.toLowerCase().trim();
      const matchQuery = !q || 
        t.title.toLowerCase().includes(q) || 
        t.content.toLowerCase().includes(q) ||
        t.tags.some(tag => tag.toLowerCase().includes(q));
      return matchCat && matchQuery;
    });
  }, [threads, selectedCategory, searchQuery]);

  // Upvote Handler
  const handleUpvote = (threadId: string) => {
    setThreads(prev => prev.map(t => {
      if (t.id === threadId) {
        const isVoted = t.userUpvoted;
        return {
          ...t,
          upvotes: isVoted ? t.upvotes - 1 : t.upvotes + 1,
          userUpvoted: !isVoted
        };
      }
      return t;
    }));
  };

  // Toggle comments
  const toggleComments = (threadId: string) => {
    setExpandedThreads(prev => ({
      ...prev,
      [threadId]: !prev[threadId]
    }));
  };

  // Submit New Discussion
  const handleCreateThread = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newContent.trim()) {
      toast({
        title: 'Missing Fields',
        description: 'Please provide both a discussion title and question details.',
        variant: 'destructive'
      });
      return;
    }

    const created: ForumThread = {
      id: `thread-${Date.now()}`,
      title: newTitle.trim(),
      content: newContent.trim(),
      category: newCategory,
      author: newAuthor.trim() || 'Community Member',
      timestamp: 'Just now',
      upvotes: 1,
      userUpvoted: true,
      tags: [newCategory.split(' ')[0], 'NutritionCommunity'],
      comments: []
    };

    setThreads(prev => [created, ...prev]);
    setExpandedThreads(prev => ({ ...prev, [created.id]: true }));
    setNewTitle('');
    setNewContent('');
    setNewAuthor('');
    setIsPosting(false);

    toast({
      title: 'Discussion Published',
      description: 'Your nutrition question has been posted to the community feed.'
    });
  };

  // Submit Reply
  const handleAddReply = (threadId: string) => {
    const text = (replyDrafts[threadId] || '').trim();
    if (!text) return;

    const newComment: ForumComment = {
      id: `c-${Date.now()}`,
      author: 'You',
      isDietitian: false,
      avatarColor: 'from-emerald-600 to-teal-700',
      content: text,
      timestamp: 'Just now'
    };

    setThreads(prev => prev.map(t => {
      if (t.id === threadId) {
        return {
          ...t,
          comments: [...t.comments, newComment]
        };
      }
      return t;
    }));

    setReplyDrafts(prev => ({ ...prev, [threadId]: '' }));
    toast({
      title: 'Reply Added',
      description: 'Your contribution has been added to the discussion.'
    });
  };

  return (
    <div id="community-forum-view" className="space-y-6">
      {/* Forum Header Hero Card */}
      <Card className="border border-slate-200/90 dark:border-slate-800 shadow-sm bg-gradient-to-r from-slate-900 via-teal-950 to-slate-900 text-white rounded-2xl overflow-hidden">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-teal-500/20 text-teal-300 border border-teal-500/30">
                  <MessageSquare className="w-5 h-5" />
                </div>
                <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                  Clinical Nutrition &amp; Community Forum
                </h2>
              </div>
              <p className="text-xs text-teal-200/80 max-w-2xl leading-relaxed">
                Peer-reviewed inquiries, dietary strategies, bio-active synergy discussions, and verified clinical guidance from registered dietitians and nutritionists.
              </p>
            </div>

            <Button
              onClick={() => setIsPosting(!isPosting)}
              className="bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-black text-xs rounded-xl shadow-md gap-1.5 h-10 px-4 self-start md:self-auto shrink-0"
            >
              <PlusCircle className="w-4 h-4" />
              <span>{isPosting ? 'Cancel Post' : 'Ask Question / Post Topic'}</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* New Topic Creation Form (Collapsible) */}
      {isPosting && (
        <Card className="border-2 border-emerald-500/80 shadow-lg rounded-2xl bg-white dark:bg-slate-900 overflow-hidden animate-in fade-in slide-in-from-top-4 duration-300">
          <CardHeader className="bg-emerald-50/60 dark:bg-emerald-950/40 p-5 border-b border-emerald-100 dark:border-emerald-900/60">
            <CardTitle className="text-base font-black text-emerald-900 dark:text-emerald-200 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-emerald-600" />
              Start a New Community Nutrition Discussion
            </CardTitle>
            <CardDescription className="text-xs text-slate-500">
              Share a question, diet synergy finding, or inquiry for clinical experts and community members.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            <form onSubmit={handleCreateThread} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    Discussion Title / Question *
                  </label>
                  <Input
                    required
                    placeholder="e.g., Does soaking legumes eliminate all lectins and phytates?"
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    className="h-10 text-xs rounded-xl border-slate-300 dark:border-slate-700"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    Category Focus *
                  </label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    className="w-full h-10 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 text-slate-900 dark:text-white"
                  >
                    {CATEGORIES.filter(c => c !== 'All Discussions').map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Detailed Inquiry or Background Information *
                </label>
                <Textarea
                  required
                  rows={4}
                  placeholder="Provide context, dietary background, or specific foods you are inquiring about..."
                  value={newContent}
                  onChange={(e) => setNewContent(e.target.value)}
                  className="text-xs rounded-xl border-slate-300 dark:border-slate-700"
                />
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
                <Input
                  placeholder="Your Name / Handle (Optional)"
                  value={newAuthor}
                  onChange={(e) => setNewAuthor(e.target.value)}
                  className="h-9 text-xs rounded-xl border-slate-300 dark:border-slate-700 max-w-xs"
                />
                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsPosting(false)}
                    className="flex-1 sm:flex-initial h-9 text-xs rounded-xl"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    className="flex-1 sm:flex-initial h-9 text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl gap-1.5"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Publish Topic</span>
                  </Button>
                </div>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Search & Topic Categories Filter Bar */}
      <div className="space-y-3">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <Input
            placeholder="Search discussions by keyword, food, nutrient, or symptom..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 h-10 text-xs rounded-xl border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs"
          />
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
          {CATEGORIES.map((cat) => {
            const isSelected = selectedCategory === cat;
            return (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap border transition-all ${
                  isSelected
                    ? 'bg-emerald-600 text-white border-emerald-500 shadow-sm'
                    : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:border-slate-300'
                }`}
              >
                {cat}
              </button>
            );
          })}
        </div>
      </div>

      {/* Forum Threads Feed */}
      <div className="space-y-4">
        {filteredThreads.length === 0 ? (
          <div className="text-center py-16 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-8">
            <MessageSquare className="w-10 h-10 text-slate-400 mx-auto mb-2" />
            <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">No discussions found</h3>
            <p className="text-xs text-slate-500 mt-1">Try adjusting your search query or select another category filter.</p>
          </div>
        ) : (
          filteredThreads.map((thread) => {
            const isExpanded = !!expandedThreads[thread.id];
            return (
              <Card 
                key={thread.id} 
                className="border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-2xl shadow-sm hover:border-emerald-400/60 dark:hover:border-emerald-500/40 transition-all overflow-hidden"
              >
                <CardContent className="p-5 sm:p-6 space-y-4">
                  {/* Top Category & Meta */}
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <Badge className="bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 text-[11px] font-bold">
                        {thread.category}
                      </Badge>
                      <span className="text-xs text-slate-400">•</span>
                      <span className="text-xs text-slate-500">{thread.timestamp}</span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => handleUpvote(thread.id)}
                        className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold border transition-all ${
                          thread.userUpvoted
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-300 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-700 shadow-xs'
                            : 'bg-slate-50 text-slate-600 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700 hover:border-slate-300'
                        }`}
                      >
                        <ThumbsUp className="w-3.5 h-3.5" />
                        <span>{thread.upvotes}</span>
                      </button>
                    </div>
                  </div>

                  {/* Thread Title & Content */}
                  <div className="space-y-1.5">
                    <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white tracking-tight leading-snug">
                      {thread.title}
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                      {thread.content}
                    </p>
                  </div>

                  {/* Tags & Author Footnote */}
                  <div className="flex flex-wrap items-center justify-between gap-3 pt-1 border-t border-slate-100 dark:border-slate-800">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-[10px] font-bold text-slate-700 dark:text-slate-200">
                        {thread.author.charAt(0)}
                      </div>
                      <div className="text-xs">
                        <span className="font-bold text-slate-800 dark:text-slate-200">{thread.author}</span>
                        {thread.authorRole && (
                          <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold ml-1">
                            ({thread.authorRole})
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <div className="hidden sm:flex items-center gap-1">
                        {thread.tags.map(tag => (
                          <span key={tag} className="text-[10px] text-slate-400 dark:text-slate-500 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md">
                            #{tag}
                          </span>
                        ))}
                      </div>

                      <button
                        onClick={() => toggleComments(thread.id)}
                        className="flex items-center gap-1 text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline"
                      >
                        <span>{thread.comments.length} Responses</span>
                        {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>

                  {/* Expanded Comments & Verified Dietitian Answers */}
                  {isExpanded && (
                    <div className="pt-3 border-t border-slate-100 dark:border-slate-800 space-y-3">
                      {thread.comments.map((c) => (
                        <div 
                          key={c.id} 
                          className={`p-3.5 rounded-xl border text-xs space-y-2 ${
                            c.isDietitian
                              ? 'bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-200/90 dark:border-emerald-800'
                              : 'bg-slate-50/70 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <div className={`w-5 h-5 rounded-full bg-gradient-to-r ${c.avatarColor} text-white flex items-center justify-center text-[9px] font-bold`}>
                                {c.author.charAt(0)}
                              </div>
                              <span className="font-bold text-slate-900 dark:text-white">{c.author}</span>
                              {c.isDietitian && (
                                <Badge className="bg-emerald-600 text-white text-[9px] font-extrabold px-1.5 py-0 gap-1 rounded">
                                  <ShieldCheck className="w-2.5 h-2.5" />
                                  Verified Dietitian
                                </Badge>
                              )}
                            </div>
                            <span className="text-[10px] text-slate-400">{c.timestamp}</span>
                          </div>
                          <p className="text-slate-700 dark:text-slate-300 leading-relaxed text-xs">
                            {c.content}
                          </p>
                        </div>
                      ))}

                      {/* Reply Input */}
                      <div className="flex gap-2 pt-1">
                        <Input
                          placeholder="Write a clinical insight or response..."
                          value={replyDrafts[thread.id] || ''}
                          onChange={(e) => setReplyDrafts(prev => ({ ...prev, [thread.id]: e.target.value }))}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              handleAddReply(thread.id);
                            }
                          }}
                          className="h-9 text-xs rounded-xl border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
                        />
                        <Button
                          size="sm"
                          onClick={() => handleAddReply(thread.id)}
                          className="h-9 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl px-3 shrink-0"
                        >
                          <Send className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
}
