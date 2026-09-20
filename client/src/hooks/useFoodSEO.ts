import { useEffect } from 'react';
import type { FoodItemClient } from '@shared/schema';
import { useTranslation } from './useTranslation';

const DEFAULT_TITLE = 'NutriFacts - Global Multilingual Clinical Nutrition Facts & Calorie Engine';
const DEFAULT_DESC = 'NutriFacts is a WHO-standard multilingual clinical nutrition engine, providing RDA calculations, food nutrition facts, BMR & TDEE calculators, and evidence-based health articles in 45+ global languages.';
const DEFAULT_IMAGE = 'https://images.unsplash.com/photo-1498837167922-ddd27525d352?auto=format&fit=crop&w=1200&q=80';

/**
 * Dynamically updates document head meta tags, Open Graph, Twitter Cards,
 * Canonical URL, and Schema.org JSON-LD for food detail views and search engine crawlability.
 */
export function useFoodSEO(food: FoodItemClient | null | undefined, isDetailActive: boolean = true) {
  const { t, language } = useTranslation();

  useEffect(() => {
    if (!food || !isDetailActive) {
      return;
    }

    const foodName = t(food.name) || food.id;
    const category = Array.isArray(food.category) ? food.category.join(', ') : (food.category || 'General Food');
    const calories = food.nutrition?.calories ?? 0;
    const protein = food.nutrition?.protein ?? 0;
    const carbs = food.nutrition?.carbs ?? 0;
    const fat = food.nutrition?.fat ?? 0;
    const fiber = food.nutrition?.fiber ?? 0;
    const imageUrl = food.image || food.imageUrl || DEFAULT_IMAGE;
    const foodSlug = (food.id || '').toLowerCase().replace(/_/g, '-');
    const foodUrl = typeof window !== 'undefined' ? `${window.location.origin}/food/${encodeURIComponent(foodSlug)}` : `https://nutrifacts.app/food/${foodSlug}`;

    // 1. Dynamic Page Title
    const newTitle = `${foodName} Nutrition Facts, Calories & Health Benefits | NutriFacts`;
    document.title = newTitle;

    // 2. Dynamic Description & Keywords
    const benefitsSummary = food.healthBenefits && food.healthBenefits.length > 0 
      ? ` Key benefits: ${food.healthBenefits.map(b => t(b)).slice(0, 2).join('; ')}.`
      : '';
    const newDesc = `${foodName} (${category}): ${calories} kcal, ${protein}g protein, ${carbs}g carbs, ${fat}g fat, ${fiber}g fiber per 100g.${benefitsSummary} Verified clinical RDA and dietary guidelines in 45+ languages.`;
    const newKeywords = `${foodName}, ${foodName} nutrition, ${foodName} calories, ${foodName} health benefits, ${foodName} carbs, ${foodName} protein, ${category}, clinical nutrition, RDA values`;

    // Helper to safely set or create meta tags
    const setMetaTag = (attrName: 'name' | 'property', attrValue: string, content: string) => {
      let element = document.querySelector(`meta[${attrName}="${attrValue}"]`) as HTMLMetaElement | null;
      if (!element) {
        element = document.createElement('meta');
        element.setAttribute(attrName, attrValue);
        document.head.appendChild(element);
      }
      element.setAttribute('content', content);
    };

    // Standard Meta Tags
    setMetaTag('name', 'description', newDesc);
    setMetaTag('name', 'keywords', newKeywords);
    setMetaTag('name', 'author', 'NutriFacts Clinical Nutrition Editorial Board');
    setMetaTag('name', 'robots', 'index, follow, max-image-preview:large, max-snippet:-1');

    // Open Graph Tags
    setMetaTag('property', 'og:type', 'article');
    setMetaTag('property', 'og:title', newTitle);
    setMetaTag('property', 'og:description', newDesc);
    setMetaTag('property', 'og:image', imageUrl);
    setMetaTag('property', 'og:url', foodUrl);
    setMetaTag('property', 'og:site_name', 'NutriFacts');

    // Twitter Card Tags
    setMetaTag('name', 'twitter:card', 'summary_large_image');
    setMetaTag('name', 'twitter:title', newTitle);
    setMetaTag('name', 'twitter:description', newDesc);
    setMetaTag('name', 'twitter:image', imageUrl);

    // Canonical Link
    let canonicalLink = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
    if (!canonicalLink) {
      canonicalLink = document.createElement('link');
      canonicalLink.setAttribute('rel', 'canonical');
      document.head.appendChild(canonicalLink);
    }
    canonicalLink.setAttribute('href', foodUrl);

    // 3. Schema.org JSON-LD Structured Data for Google Rich Results & Knowledge Graph
    const scriptId = 'food-json-ld-structured-data';
    let scriptElement = document.getElementById(scriptId) as HTMLScriptElement | null;
    if (!scriptElement) {
      scriptElement = document.createElement('script');
      scriptElement.id = scriptId;
      scriptElement.type = 'application/ld+json';
      document.head.appendChild(scriptElement);
    }

    const structuredData = {
      '@context': 'https://schema.org',
      '@graph': [
        {
          '@type': 'Product',
          '@id': `${foodUrl}#product`,
          name: foodName,
          category: category,
          image: [imageUrl],
          description: newDesc,
          inLanguage: language,
          offers: {
            '@type': 'AggregateOffer',
            priceCurrency: 'USD',
            price: '0.00',
            offerCount: 1,
            availability: 'https://schema.org/InStock',
          },
          additionalProperty: [
            {
              '@type': 'PropertyValue',
              name: 'Origin',
              value: food.origin || 'Global',
            },
            {
              '@type': 'PropertyValue',
              name: 'Category',
              value: category,
            },
          ],
        },
        {
          '@type': 'NutritionInformation',
          '@id': `${foodUrl}#nutrition`,
          name: `${foodName} Nutrition Facts`,
          servingSize: '100 g',
          calories: `${calories} calories`,
          carbohydrateContent: `${carbs} g`,
          proteinContent: `${protein} g`,
          fatContent: `${fat} g`,
          fiberContent: `${fiber} g`,
        },
        {
          '@type': 'ItemPage',
          '@id': foodUrl,
          url: foodUrl,
          name: newTitle,
          description: newDesc,
          isPartOf: {
            '@type': 'WebSite',
            name: 'NutriFacts',
            url: typeof window !== 'undefined' ? window.location.origin : 'https://nutrifacts.app',
          },
          primaryImageOfPage: {
            '@type': 'ImageObject',
            url: imageUrl,
          },
        },
      ],
    };

    scriptElement.text = JSON.stringify(structuredData, null, 2);

    // Cleanup when closing / navigating away
    return () => {
      document.title = DEFAULT_TITLE;
      setMetaTag('name', 'description', DEFAULT_DESC);
      setMetaTag('property', 'og:title', DEFAULT_TITLE);
      setMetaTag('property', 'og:description', DEFAULT_DESC);
      setMetaTag('property', 'og:image', DEFAULT_IMAGE);
      setMetaTag('property', 'og:type', 'website');
      setMetaTag('name', 'twitter:title', DEFAULT_TITLE);
      setMetaTag('name', 'twitter:description', DEFAULT_DESC);
      setMetaTag('name', 'twitter:image', DEFAULT_IMAGE);

      if (scriptElement && scriptElement.parentNode) {
        scriptElement.parentNode.removeChild(scriptElement);
      }
    };
  }, [food, isDetailActive, language, t]);
}
