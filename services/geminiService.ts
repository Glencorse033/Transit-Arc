import { GoogleGenAI, Type } from "@google/genai";
import { TransitRoute, AnalyticsData } from "../types";

const apiKey = process.env.API_KEY || "";
const ai = new GoogleGenAI({ apiKey });

// Helper to get image based on destination type
const getDestinationImage = (type: string): string => {
  const images: Record<string, string> = {
    'URBAN': 'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=800&q=80', // City
    'NATURE': 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=800&q=80', // Mountains/Nature
    'COASTAL': 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&q=80', // Beach
    'AIRPORT': 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=800&q=80', // Airport
    'SUBURBAN': 'https://images.unsplash.com/photo-1580674285054-bed31e145f59?w=800&q=80', // Street
  };
  return images[type] || images['URBAN'];
};

export const generateRoutes = async (city: string): Promise<TransitRoute[]> => {
  try {
    const model = "gemini-2.5-flash";
    const prompt = `Generate 5 realistic public transit routes for ${city}. 
    Include a mix of Bus, Metro, and Train. 
    Prices should be reasonable (between 1.5 and 15.0 USDC).
    Classify the destination vibe as one of: URBAN, NATURE, COASTAL, AIRPORT, SUBURBAN.
    Return JSON only.`;

    const response = await ai.models.generateContent({
      model,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              id: { type: Type.STRING },
              name: { type: Type.STRING },
              origin: { type: Type.STRING },
              destination: { type: Type.STRING },
              price: { type: Type.NUMBER },
              schedule: { type: Type.STRING },
              type: { type: Type.STRING, enum: ['BUS', 'TRAIN', 'METRO', 'FERRY'] },
              destinationType: { type: Type.STRING, enum: ['URBAN', 'NATURE', 'COASTAL', 'AIRPORT', 'SUBURBAN'] }
            },
            required: ["id", "name", "origin", "destination", "price", "schedule", "type", "destinationType"]
          }
        }
      }
    });

    const text = response.text;
    if (!text) return [];
    
    const rawRoutes = JSON.parse(text);
    return rawRoutes.map((r: any) => ({
      ...r,
      imageUrl: getDestinationImage(r.destinationType)
    })) as TransitRoute[];

  } catch (error) {
    console.error("Gemini Route Gen Error:", error);
    // Fallback data
    return [
      { 
        id: "r1", 
        name: "Metro Blue Line", 
        origin: "Central Station", 
        destination: "Airport Terminal 1", 
        price: 5.50, 
        schedule: "Every 5 mins", 
        type: "METRO",
        imageUrl: getDestinationImage('AIRPORT')
      },
      { 
        id: "r2", 
        name: "Bus 101", 
        origin: "Downtown", 
        destination: "North Hills", 
        price: 2.00, 
        schedule: "Every 15 mins", 
        type: "BUS",
        imageUrl: getDestinationImage('URBAN')
      },
      { 
        id: "r3", 
        name: "Coastal Ferry", 
        origin: "Pier 4", 
        destination: "Island City", 
        price: 12.00, 
        schedule: "Every 1 hour", 
        type: "FERRY",
        imageUrl: getDestinationImage('COASTAL')
      },
      { 
        id: "r4", 
        name: "Train Express X", 
        origin: "Union Station", 
        destination: "Pine Valley", 
        price: 8.50, 
        schedule: "Every 30 mins", 
        type: "TRAIN",
        imageUrl: getDestinationImage('NATURE')
      },
    ];
  }
};

export const generateAnalytics = async (): Promise<AnalyticsData> => {
  try {
    const model = "gemini-2.5-flash";
    const prompt = `Generate mock analytics data for a transit operator dashboard.
    Includes daily revenue for the last 7 days, popular routes, total revenue, and active riders.
    Return JSON only.`;

    const response = await ai.models.generateContent({
      model,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            dailyRevenue: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  date: { type: Type.STRING },
                  amount: { type: Type.NUMBER }
                }
              }
            },
            popularRoutes: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  name: { type: Type.STRING },
                  ticketsSold: { type: Type.NUMBER }
                }
              }
            },
            totalRevenue: { type: Type.NUMBER },
            activeRiders: { type: Type.NUMBER }
          }
        }
      }
    });

    const text = response.text;
    if (!text) throw new Error("No data");
    return JSON.parse(text) as AnalyticsData;
  } catch (error) {
    console.error("Gemini Analytics Gen Error:", error);
    return {
      dailyRevenue: [
        { date: "Mon", amount: 1200 },
        { date: "Tue", amount: 1450 },
        { date: "Wed", amount: 1100 },
        { date: "Thu", amount: 1600 },
        { date: "Fri", amount: 2100 },
        { date: "Sat", amount: 2400 },
        { date: "Sun", amount: 1800 },
      ],
      popularRoutes: [
        { name: "Metro Blue Line", ticketsSold: 850 },
        { name: "Bus 101", ticketsSold: 420 },
        { name: "Express Train A", ticketsSold: 310 },
      ],
      totalRevenue: 15420.50,
      activeRiders: 342,
    };
  }
};

export const generateVaultInsights = async (balance: number, points: number): Promise<string> => {
  try {
    const model = "gemini-2.5-flash";
    const prompt = `You are a financial advisor for a crypto transit app called "Transit Arc".
    The user has a Vault balance of ${balance} USDC and ${points} loyalty points.
    Write a short, punchy 1-sentence tip on how they can maximize their rewards (e.g., locking for longer, depositing more for the next NFT tier).
    Tier thresholds: Bronze ($50), Silver ($200), Gold ($500).
    Keep it encouraging.`;
    
    const response = await ai.models.generateContent({
      model, 
      contents: prompt
    });
    return response.text || "Deposit more to earn higher yield and exclusive NFTs!";
  } catch (e) {
    return "Lock your USDC for 90 days to earn 2x points multiplier!";
  }
};