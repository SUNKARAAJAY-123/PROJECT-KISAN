import { GoogleGenAI, Type, Chat, GenerateContentResponse } from "@google/genai";

if (!process.env.API_KEY) {
  throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const languageMap: { [key: string]: string } = {
  en: 'English',
  te: 'Telugu',
  hi: 'Hindi',
  ta: 'Tamil',
  bn: 'Bengali',
  mr: 'Marathi',
  gu: 'Gujarati',
  kn: 'Kannada',
  ml: 'Malayalam',
  pa: 'Punjabi',
};

const diagnosisSchema = {
  type: Type.OBJECT,
  properties: {
    diseaseName: { type: Type.STRING, description: "The common name of the plant disease." },
    description: { type: Type.STRING, description: "A brief description of the disease." },
    symptoms: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: "A list of key symptoms."
    },
    remedies: {
      type: Type.OBJECT,
      properties: {
        organic: {
          type: Type.ARRAY,
          items: { type: Type.STRING },
          description: "A list of organic treatment methods."
        },
        chemical: {
          type: Type.ARRAY,
          items: { type: Type.STRING },
          description: "A list of chemical treatment methods."
        },
      },
    },
    fertilizers: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          name: { type: Type.STRING, description: "Fertilizer name." },
          description: { type: Type.STRING, description: "Fertilizer description and why it's recommended." },
          price: { type: Type.STRING, description: "Estimated price or price range (e.g., '₹500 per 50kg bag')." },
        },
        required: ["name", "description", "price"]
      },
      description: "Recommended fertilizers with price and reason."
    },
    error: { type: Type.STRING, description: "An error message if no disease is identified.", nullable: true },
  },
  required: ["diseaseName", "description", "symptoms", "remedies"]
};

const weatherSchema = {
    type: Type.OBJECT,
    properties: {
        location: { type: Type.STRING, description: "The city and country of the forecast, e.g., 'Bengaluru, India'." },
        current: {
            type: Type.OBJECT,
            properties: {
                temp_c: { type: Type.NUMBER, description: "Current temperature in Celsius." },
                condition: { type: Type.STRING, description: "A short, one or two word description of the weather condition, e.g., 'Sunny', 'Partly cloudy', 'Rain'." },
                humidity: { type: Type.NUMBER, description: "Humidity percentage, from 0 to 100." },
                wind_kph: { type: Type.NUMBER, description: "Wind speed in kilometers per hour." },
            },
        },
        forecast: {
            type: Type.ARRAY,
            description: "A 5-day weather forecast.",
            items: {
                type: Type.OBJECT,
                properties: {
                    day: { type: Type.STRING, description: "The day of the week (e.g., 'Monday'). Must be in the specified language." },
                    high_c: { type: Type.NUMBER, description: "Maximum temperature for the day in Celsius." },
                    low_c: { type: Type.NUMBER, description: "Minimum temperature for the day in Celsius." },
                    condition: { type: Type.STRING, description: "A short, one or two word description of the forecast condition for the day." },
                }
            }
        },
        error: { type: Type.STRING, description: "An error message if the location is not found.", nullable: true },
    },
    required: ["location", "current", "forecast"]
};


function detectMimeType(base64Data: string): string {
  if (base64Data.startsWith('/9j/')) return 'image/jpeg';
  if (base64Data.startsWith('iVBORw0KGgo')) return 'image/png';
  if (base64Data.startsWith('UklGR')) return 'image/webp';
  return 'image/jpeg'; // default fallback
}

export async function diagnoseCrop(base64ImageData: string, language: string = 'en') {
  if (!base64ImageData || typeof base64ImageData !== 'string') {
    return { error: "Invalid image data provided" };
  }

  try {
    const mimeType = detectMimeType(base64ImageData);
    const imagePart = {
      inlineData: {
        mimeType,
        data: base64ImageData,
      },
    };

    const langName = languageMap[language] || 'English';
    const textPart = {
      text: `You are an expert plant pathologist. Analyze the provided image of a plant leaf. Identify the disease and provide a detailed diagnosis in JSON format.\n\nIMPORTANT: The JSON MUST include a 'fertilizers' field (array of 1-3 objects), each with 'name', 'description', and 'price' (in INR). If you cannot recommend a fertilizer, return an empty array for 'fertilizers'.\n\nAll text content in the JSON (diseaseName, description, symptoms, remedies, fertilizers) must be in ${langName}. For the 'fertilizers' field, recommend 1-3 fertilizers (organic or chemical) that can help solve the issue, include a short description and an estimated price in INR, and recommend the best option for the farmer. If you cannot confidently identify a disease, state that in the 'error' field in ${langName}.`,
    };

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: { parts: [imagePart, textPart] },
      config: {
          responseMimeType: "application/json",
          responseSchema: diagnosisSchema,
      }
    });

  const jsonText = response.text.trim();
  console.log('Gemini raw response:', jsonText); // Debug: log raw response
  return JSON.parse(jsonText);
  } catch (e) {
    console.error("Error in crop diagnosis:", e);
    return { error: "Could not analyze the image. Please try again with a clearer image." };
  }
}

export async function getMarketPrices(query: string, language: string = 'en') {
  try {
    const langName = languageMap[language] || 'English';
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `Answer in ${langName} only. ${query}`,
      config: {
        systemInstruction: `You are an AI assistant for Indian farmers named 'Kisan Dost'.
        When asked about the price of a crop in a location, answer ONLY with the latest price (or say 'No data available' if you don't know). Do NOT add greetings, explanations, or extra information. Your answer must be extremely short, clear, and direct, in ${langName} only. Example: 'Tomato price in Gudlavalleru today: ₹X per kg.' If you don't know, say: 'No data available for tomato price in Gudlavalleru today.' Do not use markdown, lists, or bolding.`,
      }
    });
    return response.text;
  } catch (e) {
    console.error("Error fetching market prices:", e);
    return "Sorry, I couldn't fetch market prices right now. Please try again later.";
  }
}

export async function getGovtSchemes(query: string, language: string = 'en') {
  try {
    const langName = languageMap[language] || 'English';
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: query,
      config: {
        systemInstruction: `You are an expert on Indian government agricultural schemes, acting as 'Kisan Dost'. ALWAYS answer in the SHORTEST way possible, using very simple language, and never use more than 1-2 sentences. Your answer must be directly relevant to the user's query, with no extra information, no greetings, and no explanations. Do not use technical terms. Make sure your answer is easy for an illiterate farmer to understand.`,
      }
    });
    return response.text;
  } catch (e) {
    console.error("Error fetching government schemes:", e);
    return "Sorry, I couldn't fetch government scheme information right now. Please try again later.";
  }
}

export async function getWeatherForecast(query: string, language: string = 'en') {
  const langName = languageMap[language] || 'English';
  const prompt = `Get the current weather and a 5-day forecast for the following location: ${query}. Respond in JSON format. The names of the days in the forecast must be in ${langName}.\n\nAfter the forecast, provide a very short analysis (1-2 sentences only) in a new field called 'analysis' that summarizes the trend for the next 5 days based on today's weather. The 'analysis' field must be in ${langName}, and must be extremely short and easy to understand for a farmer. Do not add any extra information or explanation.`;

  const extendedWeatherSchema = {
    ...weatherSchema,
    properties: {
      ...weatherSchema.properties,
      analysis: { type: Type.STRING, description: "A brief analysis of the 5-day weather trend in the specified language." }
    }
  };

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: extendedWeatherSchema,
    }
  });

  try {
    const jsonText = response.text.trim();
    return JSON.parse(jsonText);
  } catch (e) {
    console.error("Error parsing weather JSON from Gemini:", e);
    return { error: "Could not get the weather forecast. Please check the location and try again." };
  }
}

export function createChat(language: string = 'en'): Chat {
  const langName = languageMap[language] || 'English';
  let systemInstruction = `You are Kisan Dost, a friendly AI farming assistant. Your personality is that of a knowledgeable friend from the village. You should communicate in ${langName}. Always be encouraging and helpful. Your goal is to make agricultural information accessible and easy to understand for farmers across India. ALWAYS answer in the SHORTEST way possible, using very simple language, and never use more than 1-2 sentences. Your answer must be directly relevant to the user's query, with no extra information, no greetings, and no explanations. Do not use technical terms. Make sure your answer is easy for an illiterate farmer to understand.`;
    
  if (language === 'hi') {
    systemInstruction = "You are Kisan Dost, a friendly AI farming assistant. Your personality is that of a knowledgeable friend from the village. You should communicate in a mix of simple English and Hindi (Hinglish). Always be encouraging and helpful. Your goal is to make agricultural information accessible and easy to understand for farmers across India. ALWAYS answer in the SHORTEST way possible, using very simple language, and never use more than 1-2 sentences. Your answer must be directly relevant to the user's query, with no extra information, no greetings, and no explanations. Do not use technical terms. Make sure your answer is easy for an illiterate farmer to understand.";
  }

  return ai.chats.create({
    model: 'gemini-2.5-flash',
    config: {
      systemInstruction: systemInstruction,
    }
  });
}

export async function sendMessage(chat: Chat, message: string): Promise<GenerateContentResponse> {
    return await chat.sendMessage({ message });
}