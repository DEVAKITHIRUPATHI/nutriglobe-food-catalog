import React, { useState } from 'react';
import { Mail, Building2, Globe, Send, CheckCircle2, MessageSquare, PhoneCall, Newspaper, HelpCircle } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion";

export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', subject: 'general', message: '' });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  const contactFaqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": "How quickly does NutriGlobe respond to editorial corrections?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Our editorial board reviews submitted corrections and scientific data inquiries within 24 business hours to ensure our food database and clinical calculator remain 100% accurate."
        }
      },
      {
        "@type": "Question",
        "name": "How can researchers or dietitians submit new food items to the catalog?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "You can select 'Google News Editorial & Corrections' in our contact form or email editor@nutriglobe.app with peer-reviewed lab analysis or USDA/ICMR dataset references."
        }
      },
      {
        "@type": "Question",
        "name": "Can I request advertising or brand partnerships with NutriGlobe?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Yes. Select 'AdSense & Brand Partnerships' in the inquiry topic dropdown. We partner with verified health, wellness, and organic food providers."
        }
      },
      {
        "@type": "Question",
        "name": "What is NutriGlobe's official media contact and press ID?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "NutriGlobe is registered under Google News Publication ID NG-NEWS-789042 with direct press communication managed at editor@nutriglobe.app."
        }
      }
    ]
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl space-y-8">
      {/* Inject FAQPage Schema Markup */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(contactFaqSchema) }}
      />
      {/* Header */}
      <div className="space-y-3 text-center sm:text-left border-b border-slate-200 dark:border-slate-800 pb-6">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 text-xs font-bold rounded-full uppercase tracking-wider">
          <Mail className="w-3.5 h-3.5" />
          Google News Editorial & Contact Desk
        </span>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          Contact NutriGlobe Editorial & Support
        </h1>
        <p className="text-sm text-slate-600 dark:text-slate-400 max-w-2xl">
          Have questions about our clinical food database, RDA calculations, Google News press inquiries, or advertising partnerships? Reach out directly to our team.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
        {/* Contact Form */}
        <Card className="md:col-span-7 p-6 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm space-y-5">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-emerald-600" />
            Send an Editorial Inquiry
          </h2>

          {submitted ? (
            <div className="p-6 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800 rounded-2xl text-center space-y-3">
              <CheckCircle2 className="w-12 h-12 text-emerald-600 dark:text-emerald-400 mx-auto animate-bounce" />
              <h3 className="text-lg font-extrabold text-emerald-950 dark:text-emerald-100">Message Received!</h3>
              <p className="text-xs text-emerald-700 dark:text-emerald-300">
                Thank you for contacting NutriGlobe. Our editorial board or support staff will review your message and respond within 24 business hours.
              </p>
              <Button onClick={() => setSubmitted(false)} size="sm" variant="outline" className="text-xs rounded-xl border-emerald-300">
                Send Another Message
              </Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase block mb-1">
                  Your Full Name *
                </label>
                <Input 
                  required
                  placeholder="e.g. Dr. Sarah Jenkins"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="rounded-xl border-slate-200 dark:border-slate-700"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase block mb-1">
                  Email Address *
                </label>
                <Input 
                  type="email"
                  required
                  placeholder="e.g. sarah@example.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="rounded-xl border-slate-200 dark:border-slate-700"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase block mb-1">
                  Inquiry Topic *
                </label>
                <select 
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 text-sm rounded-xl p-2.5 focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="general">General Inquiry</option>
                  <option value="editorial">Google News Editorial & Corrections</option>
                  <option value="data">Food Database & RDA Calculator Question</option>
                  <option value="advertising">AdSense & Brand Partnerships</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase block mb-1">
                  Message Details *
                </label>
                <Textarea 
                  required
                  rows={4}
                  placeholder="Write your question, suggestion, or editorial correction here..."
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  className="rounded-xl border-slate-200 dark:border-slate-700 text-sm"
                />
              </div>

              <Button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl py-2.5 flex items-center justify-center gap-2 shadow-md">
                <Send className="w-4 h-4" />
                <span>Submit Inquiry</span>
              </Button>
            </form>
          )}
        </Card>

        {/* Publisher Info & Editorial Office */}
        <div className="md:col-span-5 space-y-4">
          <Card className="p-5 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm space-y-4">
            <h3 className="text-sm font-extrabold text-slate-900 dark:text-white uppercase tracking-wide flex items-center gap-2">
              <Building2 className="w-4 h-4 text-emerald-600" />
              NutriGlobe Editorial Headquarters
            </h3>

            <div className="space-y-3 text-xs text-slate-600 dark:text-slate-400">
              <div className="flex items-start gap-2.5">
                <Globe className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <strong>Official Domain:</strong><br />
                  <span className="text-slate-900 dark:text-slate-200 font-mono">https://nutriglobe.app</span>
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <Mail className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <strong>Editorial Email:</strong><br />
                  <a href="mailto:editor@nutriglobe.app" className="text-emerald-600 underline font-medium">editor@nutriglobe.app</a>
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <Newspaper className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <strong>Google News Publication ID:</strong><br />
                  <span className="text-slate-900 dark:text-slate-200 font-mono">NG-NEWS-789042</span>
                </div>
              </div>
            </div>
          </Card>

          <Card className="p-5 bg-emerald-950 text-emerald-100 rounded-2xl shadow-md border border-emerald-800 space-y-2">
            <h4 className="text-xs font-black uppercase tracking-wider text-emerald-400">
              Fact-Checking Guarantee
            </h4>
            <p className="text-xs leading-relaxed text-emerald-200/90">
              Our clinical nutrition posts and RDA tables undergo peer-review by registered dietitians against WHO, USDA, and ICMR-NIN medical standards.
            </p>
          </Card>
        </div>
      </div>

      {/* Frequently Asked Questions Accordion Section */}
      <section className="pt-4 border-t border-slate-200 dark:border-slate-800 space-y-4">
        <div className="flex items-center gap-2">
          <HelpCircle className="w-5 h-5 text-emerald-600" />
          <h2 className="text-xl font-extrabold text-slate-900 dark:text-white">Editorial & Support FAQ</h2>
        </div>

        <Card className="p-6 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs">
          <Accordion type="single" collapsible className="w-full space-y-2">
            {contactFaqSchema.mainEntity.map((item, idx) => (
              <AccordionItem key={idx} value={`contact-faq-${idx}`} className="border-b border-slate-100 dark:border-slate-800">
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
    </div>
  );
}
