import { GoogleGenAI, Type } from "@google/genai";
import { MetabolicData, ImpactLevel } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
const USDA_API_KEY = 'kFIhQB4ocoktiQJdg3A9RuN9og8VGeVrUUZAqfh7';

async function fetchUSDANutrition(foodQuery: string) {
  try {
    const response = await fetch(
      `https://api.nal.usda.gov/fdc/v1/foods/search?api_key=${USDA_API_KEY}&query=${encodeURIComponent(foodQuery)}&pageSize=1`
    );
    const data = await response.json();
    if (data.foods && data.foods.length > 0) {
      const food = data.foods[0];
      const getNutrient = (id: number) => 
        food.foodNutrients.find((n: any) => n.nutrientId === id || n.nutrientNumber === id.toString())?.value || 0;
      return {
        totalCarbs: getNutrient(1005),
        sugars: getNutrient(2000) || getNutrient(1008),
        fiber: getNutrient(1079),
      };
    }
  } catch (error) {
    console.error("USDA_LINK_FAILURE:", error);
  }
  return null;
}

export const analyzeFoodImage = async (base64Image: string, metabolicContext: MetabolicData): Promise<MetabolicData['scan']> => {
  const model = 'gemini-3-flash-preview';
  
  const prompt = `ACT AS AR_HUD_ANALYZER v0.2. Analyze food image for a PRE-DIABETIC user.
  CURRENT GLUCOSE: ${metabolicContext.glucose.value} mg/dL.
  
  1. Identify food (MAX 2 WORDS).
  2. Estimate impact_level: "LOW" | "MED" | "HIGH".
  3. Estimate delta_glucose: potential rise in mg/dL (min and max) if consumed.
  4. Estimate Carbs, Sugars, Fiber.

  FORMAT: STRICT JSON.`;

  const response = await ai.models.generateContent({
    model,
    contents: {
      parts: [
        { text: prompt },
        { inlineData: { mimeType: 'image/jpeg', data: base64Image } },
      ],
    },
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          food_name: { type: Type.STRING },
          impact_level: { type: Type.STRING, enum: ["LOW", "MED", "HIGH"] },
          delta_glucose_min: { type: Type.NUMBER },
          delta_glucose_max: { type: Type.NUMBER },
          est_carbs: { type: Type.NUMBER },
          est_sugars: { type: Type.NUMBER },
          est_fiber: { type: Type.NUMBER }
        },
        required: ['food_name', 'impact_level', 'delta_glucose_min', 'delta_glucose_max', 'est_carbs', 'est_sugars', 'est_fiber']
      }
    }
  });

  const aiResult = JSON.parse(response.text?.trim() || '{}');
  const usdaData = await fetchUSDANutrition(aiResult.food_name);

  return {
    state: 'COMPLETE',
    impact_level: aiResult.impact_level as ImpactLevel,
    delta_glucose_min: aiResult.delta_glucose_min,
    delta_glucose_max: aiResult.delta_glucose_max,
    carbs_grams: usdaData?.totalCarbs ?? aiResult.est_carbs,
    sugars_grams: usdaData?.sugars ?? aiResult.est_sugars,
    fiber_grams: usdaData?.fiber ?? aiResult.est_fiber,
    food_name: aiResult.food_name
  };
};

export const chatWithAssistant = async (query: string, metabolic: MetabolicData): Promise<string> => {
  const model = 'gemini-3-flash-preview';
  const context = metabolic.scan.state === 'COMPLETE' 
    ? `User just scanned: ${metabolic.scan.food_name}. Impact: ${metabolic.scan.impact_level}. Carbs: ${metabolic.scan.carbs_grams}g.`
    : "No food scanned yet.";

  const prompt = `ACT AS GLYCO_ADVISOR v1.0. 
  CONTEXT: ${context}
  USER_QUERY: ${query}
  
  RULES:
  1. Be tactical and brief.
  2. Max 60 characters.
  3. Focus on pre-diabetic safety.
  4. Persona: AR HUD Voice Assistant.
  
  RESPONSE STYLE: "ADVICE: [YOUR_TEXT]"`;

  const response = await ai.models.generateContent({
    model,
    contents: prompt
  });

  return response.text?.trim() || "ADVICE: NO_SIGNAL";
};
