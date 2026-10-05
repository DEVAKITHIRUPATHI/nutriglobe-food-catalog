import { useEffect } from 'react';
import type { FoodItemClient } from '@shared/schema';
import { toCanonicalSlug, getProductionCanonicalUrl, PRODUCTION_DOMAIN } from '@shared/canonicalSlug';
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
    if (!isDetailActive) {
      return;
    }

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

    // Helper to update canonical link
    const setCanonical = (url: string) => {
      let canonicalLink = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
      if (!canonicalLink) {
        canonicalLink = document.createElement('link');
        canonicalLink.setAttribute('rel', 'canonical');
        document.head.appendChild(canonicalLink);
      }
      canonicalLink.setAttribute('href', url);
    };

    // Handle 404 / Missing Food cleanly without indexing invalid URLs
    if (!food) {
      document.title = 'Food Item Not Found (404) | NutriFacts';
      setMetaTag('name', 'description', 'The requested food cultivar or item could not be found in the NutriFacts clinical database.');
      setMetaTag('name', 'robots', 'noindex, nofollow');
      setMetaTag('property', 'og:title', 'Food Item Not Found (404) | NutriFacts');
      setMetaTag('property', 'og:description', 'The requested food cultivar or item could not be found in the NutriFacts clinical database.');
      setCanonical(`${PRODUCTION_DOMAIN}/foods`);

      const existingScript = document.getElementById('food-json-ld-structured-data');
      if (existingScript && existingScript.parentNode) {
        existingScript.parentNode.removeChild(existingScript);
      }
      return;
    }

    const foodName = t(food.name) || food.id;
    const primaryCategory = Array.isArray(food.category) ? (food.category[0] || 'Food') : (food.category || 'Food');
    const categoryString = Array.isArray(food.category) ? food.category.join(', ') : (food.category || 'General Food');
    const calories = food.nutrition?.calories ?? 0;
    const protein = food.nutrition?.protein ?? 0;
    const carbs = food.nutrition?.carbs ?? 0;
    const fat = food.nutrition?.fat ?? 0;
    const fiber = food.nutrition?.fiber ?? 0;
    const imageUrl = food.image || food.imageUrl || DEFAULT_IMAGE;
    const foodSlug = toCanonicalSlug(food.id || '');
    const foodUrl = getProductionCanonicalUrl(foodSlug);

    // 1. Dynamic Page Title
    const newTitle = `${foodName} Nutrition Facts, Calories & Health Benefits | NutriFacts`;
    document.title = newTitle;

    // 2. Dynamic Description & Keywords (no keyword stuffing, natural and clinical)
    const benefitsSummary = food.healthBenefits && food.healthBenefits.length > 0 
      ? ` Key benefits: ${food.healthBenefits.map(b => t(b)).slice(0, 2).join('; ')}.`
      : '';
    const newDesc = `${foodName} (${categoryString}): ${calories} kcal, ${protein}g protein, ${carbs}g carbs, ${fat}g fat, ${fiber}g fiber per 100g.${benefitsSummary} Verified clinical RDA and dietary guidelines in 45+ languages.`;
    const newKeywords = `${foodName}, ${foodName} nutrition facts, ${foodName} calories, ${foodName} protein, ${primaryCategory}, WHO RDA values`;

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

    // Canonical Tag (Pure canonical HTTPS production URL without query/tracking parameters)
    setCanonical(foodUrl);

    // 3. Schema.org JSON-LD Structured Data: Educational ItemPage with NutritionInformation & BreadcrumbList
    // Note: No fabricated commercial product properties (no fake prices, offers, availability, or ratings)
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
          '@type': 'ItemPage',
          '@id': foodUrl,
          url: foodUrl,
          name: newTitle,
          description: newDesc,
          inLanguage: language,
          isPartOf: {
            '@type': 'WebSite',
            name: 'NutriFacts',
            url: PRODUCTION_DOMAIN,
          },
          primaryImageOfPage: {
            '@type': 'ImageObject',
            url: imageUrl,
          },
          mainEntity: {
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
          about: {
            '@type': 'Thing',
            name: foodName,
            description: newDesc,
            additionalProperty: [
              {
                '@type': 'PropertyValue',
                name: 'Origin',
                value: food.origin || 'Global',
              },
              {
                '@type': 'PropertyValue',
                name: 'Category',
                value: primaryCategory,
              },
            ],
          },
        },
        {
          '@type': 'BreadcrumbList',
          '@id': `${foodUrl}#breadcrumbs`,
          itemListElement: [
            {
              '@type': 'ListItem',
              position: 1,
              name: 'Home',
              item: `${PRODUCTION_DOMAIN}/`,
            },
            {
              '@type': 'ListItem',
              position: 2,
              name: 'Foods',
              item: `${PRODUCTION_DOMAIN}/foods`,
            },
            {
              '@type': 'ListItem',
              position: 3,
              name: primaryCategory,
              item: `${PRODUCTION_DOMAIN}/foods?category=${encodeURIComponent(primaryCategory.toLowerCase())}`,
            },
            {
              '@type': 'ListItem',
              position: 4,
              name: foodName,
              item: foodUrl,
            },
          ],
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

export default useFoodSEO;
