import { GoogleGenAI } from "@google/genai";
import { resolveAccurateFoodImage, getFoodImageMetadata } from "@shared/foodImageResolver";

export interface GenerateFoodImageParams {
  foodName: string;
  prompt?: string;
  aspectRatio?: "1:1" | "4:3" | "16:9" | "3:4";
  brandingText?: string;
  webUrl?: string;
  educationalMode?: boolean;
}

export interface EditFoodImageParams {
  foodName: string;
  base64Image?: string;
  imageUrl?: string;
  editPrompt: string;
  aspectRatio?: "1:1" | "4:3" | "16:9" | "3:4";
  brandingText?: string;
  webUrl?: string;
}

export interface ImageStudioResponse {
  success: boolean;
  imageUrl: string;
  modelUsed: string;
  promptUsed: string;
  brandingText: string;
  webUrl: string;
  isAiGenerated: boolean;
  message?: string;
}

const getGeminiClient = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return null;
  return new GoogleGenAI({ apiKey });
};

/**
 * Generate a new high-quality food photograph using Gemini 3.1 Flash Image.
 */
export async function generateFoodStudioImage(params: GenerateFoodImageParams): Promise<ImageStudioResponse> {
  const { foodName, prompt, aspectRatio = "1:1", brandingText = "NutriGlobe Educational Database", webUrl = "www.nutriglobe.org", educationalMode = true } = params;

  const defaultPrompt = prompt && prompt.trim().length > 0 
    ? prompt 
    : `Ultra-realistic professional studio photograph of fresh ${foodName} centered on a seamless light neutral studio background. Sharp focus, vibrant natural colors, macro surface texture, professional lighting, suitable for a scientific nutrition encyclopedia and educational database. No text, no hands, no watermarks.`;

  const ai = getGeminiClient();

  if (ai) {
    try {
      // Try using gemini-3.1-flash-image
      const response = await ai.models.generateContent({
        model: 'gemini-3.1-flash-image',
        contents: {
          parts: [{ text: defaultPrompt }]
        },
        config: {
          imageConfig: {
            aspectRatio,
            imageSize: "1K"
          }
        }
      });

      if (response.candidates?.[0]?.content?.parts) {
        for (const part of response.candidates[0].content.parts) {
          if (part.inlineData && part.inlineData.data) {
            const mimeType = part.inlineData.mimeType || 'image/png';
            const base64Url = `data:${mimeType};base64,${part.inlineData.data}`;
            return {
              success: true,
              imageUrl: base64Url,
              modelUsed: "gemini-3.1-flash-image",
              promptUsed: defaultPrompt,
              brandingText,
              webUrl,
              isAiGenerated: true,
              message: "Successfully generated high-resolution food image using Gemini 3.1 Flash Image."
            };
          }
        }
      }
    } catch (err: any) {
      console.warn("[FoodImageStudio] Gemini API generation error, falling back to curated resolution:", err?.message || err);
    }
  }

  // Cross-reference with verified reliable food database
  const meta = getFoodImageMetadata(foodName, foodName);
  const selectedUrl = meta.imageUrl || resolveAccurateFoodImage(foodName, foodName);

  return {
    success: true,
    imageUrl: selectedUrl,
    modelUsed: `Verified Food Photography (${meta.attribution || 'USDA / Wikimedia'})`,
    promptUsed: defaultPrompt,
    brandingText,
    webUrl,
    isAiGenerated: false,
    message: `Using high-precision photography asset for ${foodName} (${meta.license || 'Public Domain / CC-BY-SA'})`
  };
}

/**
 * Edit an existing food image using text prompt instructions with Gemini 3.1 Flash Image.
 */
export async function editFoodStudioImage(params: EditFoodImageParams): Promise<ImageStudioResponse> {
  const { foodName, base64Image, imageUrl, editPrompt, aspectRatio = "1:1", brandingText = "NutriGlobe Educational Database", webUrl = "www.nutriglobe.org" } = params;

  const fullPrompt = `Edit the food photograph of ${foodName}. Instruction: ${editPrompt}. Maintain natural lighting, clean aesthetic, realistic textures suitable for an educational nutrition database.`;

  const ai = getGeminiClient();

  if (ai && base64Image) {
    try {
      // Clean base64 string if data URL prefix exists
      const cleanBase64 = base64Image.replace(/^data:image\/(png|jpeg|jpg|webp);base64,/, '');
      const mimeType = base64Image.includes('data:image/png') ? 'image/png' : 'image/jpeg';

      const response = await ai.models.generateContent({
        model: 'gemini-3.1-flash-image',
        contents: {
          parts: [
            {
              inlineData: {
                data: cleanBase64,
                mimeType
              }
            },
            {
              text: fullPrompt
            }
          ]
        },
        config: {
          imageConfig: {
            aspectRatio,
            imageSize: "1K"
          }
        }
      });

      if (response.candidates?.[0]?.content?.parts) {
        for (const part of response.candidates[0].content.parts) {
          if (part.inlineData && part.inlineData.data) {
            const resMime = part.inlineData.mimeType || 'image/png';
            const editedBase64Url = `data:${resMime};base64,${part.inlineData.data}`;
            return {
              success: true,
              imageUrl: editedBase64Url,
              modelUsed: "gemini-3.1-flash-image (Image-to-Image Edit)",
              promptUsed: fullPrompt,
              brandingText,
              webUrl,
              isAiGenerated: true,
              message: "Successfully edited food image using Gemini 3.1 Flash Image."
            };
          }
        }
      }
    } catch (err: any) {
      console.warn("[FoodImageStudio] Image editing error:", err?.message || err);
    }
  }

  // Fallback: If base64Image or API key unavailable, generate a newly prompted image
  return generateFoodStudioImage({
    foodName,
    prompt: editPrompt,
    aspectRatio,
    brandingText,
    webUrl
  });
}
