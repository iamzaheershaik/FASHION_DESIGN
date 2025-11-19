import { GoogleGenAI, Modality, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { action, payload } = req.body;

  if (!process.env.API_KEY) {
    return res.status(500).json({ error: "Server API_KEY not configured" });
  }

  try {
    let result;

    switch (action) {
      case 'generatePatternImage': {
        const { prompt, details } = payload;
        let fullPrompt = `Generate a seamless, repeating textile pattern based on this description: "${prompt}". The image should be a high-quality, print-ready pattern. Focus on the pattern itself, making it tileable.`;

        if (details.fabricType?.trim()) fullPrompt += ` The pattern should be rendered as if it were on a high-quality ${details.fabricType} fabric, accurately showing its characteristic texture, sheen, and drape.`;
        if (details.weaveType?.trim()) fullPrompt += ` The weave type should be ${details.weaveType}.`;
        if (details.texture?.trim()) fullPrompt += ` The texture should look ${details.texture}.`;
        if (details.scale?.trim()) fullPrompt += ` The scale of the pattern elements should be ${details.scale}.`;

        const response = await ai.models.generateImages({
          model: 'imagen-4.0-generate-001',
          prompt: fullPrompt,
          config: { numberOfImages: 1, outputMimeType: 'image/png', aspectRatio: '1:1' },
        });

        result = response.generatedImages?.[0]?.image?.imageBytes || null;
        break;
      }

      case 'extractColorPalette': {
        const { imageBase64 } = payload;
        const response = await ai.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: {
            parts: [
              { inlineData: { mimeType: 'image/png', data: imageBase64 } },
              { text: "Analyze this image and extract the 5 most dominant and defining colors. Return them as a JSON array with a creative 'name' for the color (e.g., 'Midnight Silk', 'Sunset Gold') and the 'hex' code." }
            ]
          },
          config: {
            responseMimeType: "application/json",
            responseSchema: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: { name: { type: Type.STRING }, hex: { type: Type.STRING } }
              }
            }
          }
        });
        result = JSON.parse(response.text.trim());
        break;
      }

      case 'generatePromptIdeas': {
        const response = await ai.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: 'Generate 3 diverse, creative, and inspiring prompts for textile design for Indian fashion. Return as a JSON array of strings.',
          config: {
            responseMimeType: "application/json",
            responseSchema: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            }
          }
        });
        result = JSON.parse(response.text.trim());
        break;
      }

      case 'enhancePrompt': {
        const { prompt } = payload;
        const response = await ai.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: prompt,
          config: {
            systemInstruction: "You are a professional fashion and textile design assistant. Refine the user's prompt into a vivid, detailed, and professional description for an AI image generator. Focus on keywords for patterns, textures, colors, and artistic style. Return only the enhanced prompt.",
          }
        });
        result = response.text;
        break;
      }

      case 'analyzeImage': {
        const { imageBase64 } = payload;
        const response = await ai.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: {
            parts: [
              { inlineData: { mimeType: 'image/png', data: imageBase64 } },
              { text: "Describe this textile pattern in detail. Identify the main motifs, color palette, style (e.g., geometric, floral, abstract), and any noticeable texture or weave. Create a descriptive prompt that an AI image generator could use to recreate this design." }
            ]
          },
        });
        result = response.text;
        break;
      }

      case 'generateBorderPromptFromImage': {
        const { imageBase64 } = payload;
        const response = await ai.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: {
            parts: [
              { inlineData: { mimeType: 'image/png', data: imageBase64 } },
              { text: "Analyze this textile pattern in detail. Based on its motifs, color palette, and style, create a short, descriptive text prompt for an AI image generator to create a complementary and matching *border* or *lining* design. The border prompt should describe elements like intricate embroidery, trim, or edge patterns that would stylistically match the main fabric. For example, if the main fabric is floral, the border could be a delicate vine pattern. Return only the new prompt for the border design." }
            ]
          },
        });
        result = response.text;
        break;
      }

      case 'virtualTryOn': {
        const { topMaterial, bottomMaterial, borderMaterial, outfit, neckType, modelSize, cameraView, wearingStyle, fabricType, environment, pose, addAccessories } = payload;

        const parts = [];
        let textPrompt = `Show a photorealistic image of a beautiful Indian woman with a ${modelSize} body type as a model. She is wearing a stylish ${outfit} with a ${neckType} neck.`;

        if (fabricType && fabricType !== 'Auto') {
          textPrompt += ` The outfit is made from a high-quality ${fabricType} fabric. The drape, folds, and light reflection on the clothing must accurately represent this material.`
        }

        const lowerCaseStyle = wearingStyle.toLowerCase();
        if (wearingStyle && !lowerCaseStyle.includes('standard')) {
           // (Logic abbreviated: Pass specific draping instructions same as original service)
           textPrompt += ` The outfit is styled in the ${wearingStyle}.`;
        }

        if (topMaterial) {
          parts.push({ inlineData: { mimeType: 'image/png', data: topMaterial } });
          textPrompt += ` The top/blouse of the outfit must be made *exclusively* from the first provided pattern image.`;
        }

        parts.push({ inlineData: { mimeType: 'image/png', data: bottomMaterial } });
        if (topMaterial) {
          textPrompt += ` The bottom/saree/lehenga/main body of the outfit must be made *exclusively* from the second provided pattern image. The patterns should not be mixed or blended.`;
        } else {
          textPrompt += ` The entire outfit should be covered in the provided textile pattern.`;
        }

        if (borderMaterial) {
          parts.push({ inlineData: { mimeType: 'image/png', data: borderMaterial } });
          textPrompt += ` The final provided image is a border pattern. This border pattern must be applied to the edges of the outfit, such as the hem of the sleeves, the neckline, the hem of a skirt/lehenga, or the pallu/dupatta edges. It should act as a decorative trim and should not cover the main body of the fabric.`;
        }

        textPrompt += ` The model should be posed in a '${pose}' stance.`;
        if (addAccessories) textPrompt += ' Style the model with appropriate and elegant accessories (like jewelry, shoes, handbag) that complement the outfit and the occasion.';
        textPrompt += ` Place the model in a '${environment}' environment. The lighting, shadows, and mood must be consistent with this setting.`;
        textPrompt += ` This should be a ${cameraView} shot. The final image must be ultra-realistic and high-fashion.`;
        
        parts.push({ text: textPrompt });

        const response = await ai.models.generateContent({
          model: 'gemini-2.5-flash-image',
          contents: { parts },
          config: { responseModalities: [Modality.IMAGE, Modality.TEXT] },
        });

        // Find image part
        for (const part of response.candidates[0].content.parts) {
            if (part.inlineData) {
                result = part.inlineData.data;
                break;
            }
        }
        break;
      }

      case 'recolorImage': {
        const { patternBase64, colorPrompt } = payload;
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash-image',
            contents: {
                parts: [
                    { inlineData: { mimeType: 'image/png', data: patternBase64 } },
                    { text: `Recolor the provided image using this new color palette: "${colorPrompt}". It is crucial to maintain the original pattern, structure, and details exactly. Only change the colors.` }
                ]
            },
            config: { responseModalities: [Modality.IMAGE, Modality.TEXT] },
        });
        for (const part of response.candidates[0].content.parts) {
            if (part.inlineData) {
                result = part.inlineData.data;
                break;
            }
        }
        break;
      }

      case 'getTrendForecasts': {
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
        result = JSON.parse(response.text.trim());
        break;
      }

      case 'getSustainableSuggestions': {
        const { fabricType } = payload;
        if (!fabricType || fabricType === 'Auto') { result = null; break; }
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
        result = JSON.parse(response.text.trim());
        break;
      }

      case 'generateTechPack': {
        const { imageBase64, details } = payload;
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: { 
                parts: [
                    { inlineData: { mimeType: 'image/png', data: imageBase64 } }, 
                    { text: `You are a fashion production assistant. Analyze the provided image of a model wearing an outfit and the details below. Generate a technical specification sheet (tech pack). Extract the main colors and provide their approximate HEX codes. Details: ${JSON.stringify(details)}` }
                ]
            },
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        outfit_name: { type: Type.STRING },
                        description: { type: Type.STRING },
                        fabric_recommendation: { type: Type.STRING },
                        color_palette: {
                            type: Type.ARRAY,
                            items: {
                                type: Type.OBJECT,
                                properties: { name: { type: Type.STRING }, hex: { type: Type.STRING } }
                            }
                        },
                        construction_notes: { type: Type.ARRAY, items: { type: Type.STRING } }
                    }
                }
            }
        });
        result = JSON.parse(response.text.trim());
        break;
      }

      case 'generateEcommerceCopy': {
        const { details } = payload;
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: `You are an expert e-commerce copywriter for a luxury fashion brand. Based on the following outfit details, write a compelling product page. Details: ${JSON.stringify(details)}`,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        title: { type: Type.STRING },
                        description: { type: Type.STRING },
                        keywords: { type: Type.ARRAY, items: { type: Type.STRING } }
                    }
                }
            }
        });
        result = JSON.parse(response.text.trim());
        break;
      }

      default:
        return res.status(400).json({ error: "Invalid action" });
    }

    res.status(200).json({ success: true, data: result });

  } catch (error) {
    console.error("API Error:", error);
    res.status(500).json({ success: false, error: error.message || "Internal Server Error" });
  }
}