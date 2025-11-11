import { GoogleGenAI, Modality, Type } from "@google/genai";

if (!process.env.API_KEY) {
  // In a real app, you'd show this to the user in a more friendly way.
  // For this project, we assume the key is set up.
  console.warn("API_KEY environment variable is not set. The app will not work.");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

interface PatternDetails {
  weaveType?: string;
  texture?: string;
  scale?: string;
  fabricType?: string;
}

export const generatePatternImage = async (prompt: string, details: PatternDetails = {}): Promise<string | null> => {
  if (!prompt.trim()) {
    return null;
  }
  
  if (!process.env.API_KEY) {
    throw new Error("API Key is not configured. Please set the API_KEY environment variable.");
  }
  
  try {
    let fullPrompt = `Generate a seamless, repeating textile pattern based on this description: "${prompt}". The image should be a high-quality, print-ready pattern. Focus on the pattern itself, making it tileable.`;
    
    if (details.fabricType?.trim()) {
        fullPrompt += ` The pattern should be rendered as if it were on a high-quality ${details.fabricType} fabric, accurately showing its characteristic texture, sheen, and drape.`
    }
    if (details.weaveType?.trim()) {
      fullPrompt += ` The weave type should be ${details.weaveType}.`;
    }
    if (details.texture?.trim()) {
      fullPrompt += ` The texture should look ${details.texture}.`;
    }
    if (details.scale?.trim()) {
      fullPrompt += ` The scale of the pattern elements should be ${details.scale}.`;
    }
    
    const response = await ai.models.generateImages({
        model: 'imagen-4.0-generate-001',
        prompt: fullPrompt,
        config: {
          numberOfImages: 1,
          outputMimeType: 'image/png',
          aspectRatio: '1:1',
        },
    });

    if (response.generatedImages && response.generatedImages.length > 0) {
        return response.generatedImages[0].image.imageBytes;
    }
    return null;

  } catch (error) {
    console.error("Error generating pattern:", error);
    if (error instanceof Error && error.message.includes('API key not valid')) {
       throw new Error("The configured API key is not valid. Please check your configuration.");
    }
    throw new Error("Failed to generate the pattern from Gemini.");
  }
};

export const generatePromptIdeas = async (): Promise<string[]> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: 'Generate 3 diverse, creative, and inspiring prompts for textile design for Indian fashion. Return as a JSON array of strings.',
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.STRING
          }
        }
      }
    });
    const jsonString = response.text.trim();
    return JSON.parse(jsonString);
  } catch (error) {
    console.error("Error generating prompt ideas:", error);
    throw new Error("Failed to generate new ideas from Gemini.");
  }
}

export const enhancePrompt = async (prompt: string): Promise<string> => {
   if (!prompt.trim()) return prompt;
   try {
     const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
            systemInstruction: "You are a professional fashion and textile design assistant. Refine the user's prompt into a vivid, detailed, and professional description for an AI image generator. Focus on keywords for patterns, textures, colors, and artistic style. Return only the enhanced prompt.",
        }
     });
     return response.text;
   } catch (error) {
     console.error("Error enhancing prompt:", error);
     throw new Error("Failed to enhance the prompt using Gemini.");
   }
}

export const analyzeImage = async (imageBase64: string): Promise<string> => {
  try {
    const imagePart = {
      inlineData: {
        mimeType: 'image/png', // Assuming png, could be dynamic
        data: imageBase64,
      },
    };
    const textPart = {
      text: "Describe this textile pattern in detail. Identify the main motifs, color palette, style (e.g., geometric, floral, abstract), and any noticeable texture or weave. Create a descriptive prompt that an AI image generator could use to recreate this design."
    };
     const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: { parts: [imagePart, textPart] },
     });
     return response.text;
  } catch(e) {
    console.error("Error analyzing image:", e);
    throw new Error("Failed to analyze the image using Gemini.");
  }
};

export const generateBorderPromptFromImage = async (imageBase64: string): Promise<string> => {
  try {
    const imagePart = {
      inlineData: {
        mimeType: 'image/png',
        data: imageBase64,
      },
    };
    const textPart = {
      text: "Analyze this textile pattern in detail. Based on its motifs, color palette, and style, create a short, descriptive text prompt for an AI image generator to create a complementary and matching *border* or *lining* design. The border prompt should describe elements like intricate embroidery, trim, or edge patterns that would stylistically match the main fabric. For example, if the main fabric is floral, the border could be a delicate vine pattern. Return only the new prompt for the border design."
    };
     const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: { parts: [imagePart, textPart] },
     });
     return response.text;
  } catch(e) {
    console.error("Error generating border prompt from image:", e);
    throw new Error("Failed to generate a border prompt using Gemini.");
  }
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
  if (!bottomMaterial || !outfit || !neckType) {
    return null;
  }

  if (!process.env.API_KEY) {
    throw new Error("API Key is not configured.");
  }

  try {
    const parts = [];
    let textPrompt = `Show a photorealistic image of a beautiful Indian woman with a ${modelSize} body type as a model. She is wearing a stylish ${outfit} with a ${neckType} neck.`;

    if (fabricType && fabricType !== 'Auto') {
        textPrompt += ` The outfit is made from a high-quality ${fabricType} fabric. The drape, folds, and light reflection on the clothing must accurately represent this material.`
    }
    
    const lowerCaseStyle = wearingStyle.toLowerCase();
    if (wearingStyle && !lowerCaseStyle.includes('standard')) {
      if (outfit === 'Saree with Blouse') {
        if (wearingStyle === 'Gujarati (Seedha Pallu)') {
            textPrompt += ` The saree is draped in the traditional Gujarati Seedha Pallu style, where the decorative pallu comes from the back, over the RIGHT shoulder, and hangs down in the front. This is the reverse of the common Nivi drape.`;
        } else {
            textPrompt += ` The saree is draped in the traditional ${wearingStyle}.`;
        }
      } else {
        textPrompt += ` The outfit is worn in the ${wearingStyle}.`;
      }
    }

    if (topMaterial) {
      parts.push({ inlineData: { mimeType: 'image/png', data: topMaterial } });
      textPrompt += ` The top/blouse of the outfit must be made *exclusively* from the first provided pattern image.`;
    }

    parts.push({ inlineData: { mimeType: 'image/png', data: bottomMaterial } });
    if (topMaterial) {
      textPrompt += ` The bottom/saree/lehenga part of the outfit must be made *exclusively* from the second provided pattern image. The patterns should not be mixed or blended.`;
    } else {
      textPrompt += ` The entire outfit should be covered in the provided textile pattern.`;
    }

    if (borderMaterial) {
        parts.push({ inlineData: { mimeType: 'image/png', data: borderMaterial } });
        textPrompt += ` The final provided image is a border pattern. This border pattern must be applied to the edges of the outfit, such as the hem of the sleeves, the neckline, the hem of a skirt/lehenga, or the pallu of the saree. It should act as a decorative trim and should not cover the main body of the fabric.`;
    }
    
    textPrompt += ` The model should be posed in a '${pose}' stance.`;

    if (addAccessories) {
        textPrompt += ' Style the model with appropriate and elegant accessories (like jewelry, shoes, handbag) that complement the outfit and the occasion.'
    }

    textPrompt += ` Place the model in a '${environment}' environment. The lighting, shadows, and mood must be consistent with this setting.`;
    
    textPrompt += ` This should be a ${cameraView} shot. The final image must be ultra-realistic and high-fashion.`;
    parts.push({ text: textPrompt });

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: { parts },
      config: {
        responseModalities: [Modality.IMAGE, Modality.TEXT],
      },
    });

    for (const part of response.candidates[0].content.parts) {
      if (part.inlineData) {
        return part.inlineData.data;
      }
    }
    return null;
  } catch (error) {
    console.error("Error visualizing pattern on model:", error);
    if (error instanceof Error && error.message.includes('API key not valid')) {
      throw new Error("The configured API key is not valid. Please check your configuration.");
    }
    throw new Error("Failed to visualize the pattern from Gemini.");
  }
};

export const recolorImage = async (patternBase64: string, colorPrompt: string): Promise<string | null> => {
  if (!patternBase64 || !colorPrompt.trim()) {
    return null;
  }

  if (!process.env.API_KEY) {
    throw new Error("API Key is not configured.");
  }

  try {
    const patternImagePart = {
      inlineData: {
        mimeType: 'image/png',
        data: patternBase64,
      },
    };

    const textPart = {
      text: `Recolor the provided image using this new color palette: "${colorPrompt}". It is crucial to maintain the original pattern, structure, and details exactly. Only change the colors.`,
    };

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: { parts: [patternImagePart, textPart] },
      config: {
        responseModalities: [Modality.IMAGE, Modality.TEXT],
      },
    });

    for (const part of response.candidates[0].content.parts) {
      if (part.inlineData) {
        return part.inlineData.data;
      }
    }
    return null;
  } catch (error) {
    console.error("Error recoloring image:", error);
    if (error instanceof Error && error.message.includes('API key not valid')) {
      throw new Error("The configured API key is not valid. Please check your configuration.");
    }
    throw new Error("Failed to recolor the image from Gemini.");
  }
};

export const getTrendForecasts = async () => {
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: "You are a fashion trend forecaster for WGSN. Based on current data, generate 4 diverse, actionable textile and pattern trend forecasts for the upcoming season in Indian fashion. For each trend, provide a 'name', a short 'description', and a 'prompt' that an AI image generator could use.",
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.ARRAY,
                    items: {
                        type: Type.OBJECT,
                        properties: {
                            name: { type: Type.STRING },
                            description: { type: Type.STRING },
                            prompt: { type: Type.STRING }
                        }
                    }
                }
            }
        });
        const jsonString = response.text.trim();
        return JSON.parse(jsonString);
    } catch (error) {
        console.error("Error fetching trend forecasts:", error);
        throw new Error("Failed to get trend forecasts from Gemini.");
    }
};

export const getSustainableSuggestions = async (fabricType: string) => {
    if (!fabricType || fabricType === 'Auto') return null;
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: `The user wants to use ${fabricType} for their design. Suggest 2 sustainable or ethical alternative fabrics. For each, provide its 'name' and a brief 'reason' explaining its benefit (e.g., lower water usage, cruelty-free).`,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.ARRAY,
                    items: {
                        type: Type.OBJECT,
                        properties: {
                            name: { type: Type.STRING },
                            reason: { type: Type.STRING }
                        }
                    }
                }
            }
        });
        const jsonString = response.text.trim();
        return JSON.parse(jsonString);
    } catch (error) {
        console.error("Error fetching sustainable suggestions:", error);
        // Don't throw, just return null as this is an enhancement, not a critical path
        return null;
    }
};

export const generateTechPack = async (imageBase64: string, details: object) => {
    try {
        const imagePart = { inlineData: { mimeType: 'image/png', data: imageBase64 } };
        const textPart = { text: `You are a fashion production assistant. Analyze the provided image of a model wearing an outfit and the details below. Generate a technical specification sheet (tech pack). Extract the main colors and provide their approximate HEX codes.
        Details: ${JSON.stringify(details, null, 2)}` };

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: { parts: [imagePart, textPart] },
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        outfit_name: { type: Type.STRING, description: "A catchy name for the outfit style." },
                        description: { type: Type.STRING, description: "A brief description of the outfit." },
                        fabric_recommendation: { type: Type.STRING, description: "Recommended fabric based on the visual drape and style." },
                        color_palette: {
                            type: Type.ARRAY,
                            items: {
                                type: Type.OBJECT,
                                properties: { name: { type: Type.STRING }, hex: { type: Type.STRING } }
                            }
                        },
                        construction_notes: {
                            type: Type.ARRAY,
                            items: { type: Type.STRING }
                        }
                    }
                }
            }
        });
        const jsonString = response.text.trim();
        return JSON.parse(jsonString);
    } catch (error) {
        console.error("Error generating tech pack:", error);
        throw new Error("Failed to generate tech pack from Gemini.");
    }
};

export const generateEcommerceCopy = async (details: object) => {
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: `You are an expert e-commerce copywriter for a luxury fashion brand. Based on the following outfit details, write a compelling product page.
            Details: ${JSON.stringify(details, null, 2)}`,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        title: { type: Type.STRING, description: "A captivating, SEO-friendly product title." },
                        description: { type: Type.STRING, description: "A rich, evocative product description (2-3 paragraphs)." },
                        keywords: { type: Type.ARRAY, items: { type: Type.STRING }, description: "An array of 5-7 relevant SEO keywords." }
                    }
                }
            }
        });
        const jsonString = response.text.trim();
        return JSON.parse(jsonString);
    } catch (error) {
        console.error("Error generating e-commerce copy:", error);
        throw new Error("Failed to generate e-commerce copy from Gemini.");
    }
};