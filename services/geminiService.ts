
interface PatternDetails {
  weaveType?: string;
  texture?: string;
  scale?: string;
  fabricType?: string;
}

// Helper to call the backend API
const callApi = async (action: string, payload: any) => {
  try {
    const response = await fetch('/api/gemini', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ action, payload }),
    });

    const result = await response.json();

    if (!response.ok || !result.success) {
      throw new Error(result.error || 'Failed to connect to FashionAI server');
    }

    return result.data;
  } catch (error) {
    console.error(`Error in ${action}:`, error);
    throw error; // Re-throw so components can handle it
  }
};

export const generatePatternImage = async (prompt: string, details: PatternDetails = {}): Promise<string | null> => {
  if (!prompt.trim()) return null;
  return callApi('generatePatternImage', { prompt, details });
};

export const extractColorPalette = async (imageBase64: string): Promise<{name: string, hex: string}[]> => {
  return callApi('extractColorPalette', { imageBase64 });
};

export const generatePromptIdeas = async (): Promise<string[]> => {
  return callApi('generatePromptIdeas', {});
};

export const enhancePrompt = async (prompt: string): Promise<string> => {
  if (!prompt.trim()) return prompt;
  return callApi('enhancePrompt', { prompt });
};

export const analyzeImage = async (imageBase64: string): Promise<string> => {
  return callApi('analyzeImage', { imageBase64 });
};

export const generateBorderPromptFromImage = async (imageBase64: string): Promise<string> => {
  return callApi('generateBorderPromptFromImage', { imageBase64 });
};

export const virtualTryOn = async (
    topMaterial: string | null, 
    bottomMaterial: string, 
    borderMaterial: string | null, 
    outfit: string, 
    neckType: string, 
    modelSize: string, 
    cameraView: string, 
    wearingStyle: string, 
    fabricType: string,
    environment: string,
    pose: string,
    addAccessories: boolean
): Promise<string | null> => {
  if (!bottomMaterial || !outfit || !neckType) return null;
  return callApi('virtualTryOn', {
    topMaterial, bottomMaterial, borderMaterial, outfit, neckType, modelSize, cameraView, wearingStyle, fabricType, environment, pose, addAccessories
  });
};

export const recolorImage = async (patternBase64: string, colorPrompt: string): Promise<string | null> => {
  if (!patternBase64 || !colorPrompt.trim()) return null;
  return callApi('recolorImage', { patternBase64, colorPrompt });
};

export const getTrendForecasts = async () => {
    return callApi('getTrendForecasts', {});
};

export const getSustainableSuggestions = async (fabricType: string) => {
    return callApi('getSustainableSuggestions', { fabricType });
};

export const generateTechPack = async (imageBase64: string, details: object) => {
    return callApi('generateTechPack', { imageBase64, details });
};

export const generateEcommerceCopy = async (details: object) => {
    return callApi('generateEcommerceCopy', { details });
};
