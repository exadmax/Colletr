import { GoogleGenAI, Type } from "@google/genai";
import { Condition, ConsoleType, CollectionType } from "../types";

// Lazy initialization to avoid throwing error when API key is not set
let ai: GoogleGenAI | null = null;

const getAI = (): GoogleGenAI => {
  if (!ai) {
    const apiKey = process.env.API_KEY;
    if (!apiKey) {
      throw new Error("API Key não configurada. Por favor, configure a variável de ambiente GEMINI_API_KEY.");
    }
    ai = new GoogleGenAI({ apiKey });
  }
  return ai;
};

// Helper to clean JSON string from Markdown code blocks
const cleanJsonString = (str: string): string => {
  return str.replace(/```json\n?|```/g, '').trim();
};

export const identifyConsoleFromImage = async (base64Image: string, contextType: CollectionType): Promise<{ name: string; manufacturer: string; type: ConsoleType }> => {
  try {
    let contextPrompt = "";
    
    switch (contextType) {
        case CollectionType.GAMES:
            contextPrompt = "Identifique este JOGO de videogame (cartucho, disco ou caixa). O campo 'type' deve ser 'Jogo'.";
            break;
        case CollectionType.ACCESSORIES:
            contextPrompt = "Identifique este ACESSÓRIO de videogame (controle, cabo, periférico). O campo 'type' deve ser 'Acessório'.";
            break;
        case CollectionType.CONSOLES:
        default:
            contextPrompt = "Identifique este CONSOLE de videogame. O campo 'type' deve ser 'Mesa' ou 'Portátil'.";
            break;
    }

    const response = await getAI().models.generateContent({
      model: "gemini-2.5-flash",
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: "image/jpeg",
              data: base64Image,
            },
          },
          {
            text: `${contextPrompt} Retorne apenas JSON com os campos: 'name' (nome do item), 'manufacturer' (fabricante ou publisher), e 'type' (enum: 'Mesa', 'Portátil', 'Jogo', 'Acessório', 'Outro').`,
          },
        ],
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            name: { type: Type.STRING },
            manufacturer: { type: Type.STRING },
            type: { type: Type.STRING, enum: ["Mesa", "Portátil", "Jogo", "Acessório", "Outro"] },
          },
          required: ["name", "manufacturer", "type"],
        },
      },
    });

    const text = response.text;
    if (!text) throw new Error("Sem resposta da IA");
    
    const data = JSON.parse(cleanJsonString(text));
    
    // Map string to Enum
    let mappedType = ConsoleType.OTHER;
    if (data.type === "Mesa") mappedType = ConsoleType.HOME;
    if (data.type === "Portátil") mappedType = ConsoleType.HANDHELD;
    if (data.type === "Jogo") mappedType = ConsoleType.GAME;
    if (data.type === "Acessório") mappedType = ConsoleType.ACCESSORY;

    return {
      name: data.name,
      manufacturer: data.manufacturer,
      type: mappedType
    };

  } catch (error) {
    console.error("Erro ao identificar item:", error);
    throw error;
  }
};

export const getMarketValuation = async (itemName: string, condition: Condition): Promise<{ min: number; max: number; avg: number; reasoning: string; sources: string[] }> => {
  try {
    const prompt = `
      Atue como um especialista em avaliação de videogames retrô.
      Pesquise o valor de mercado ATUAL (hoje) para o item: "${itemName}" na condição: "${condition}".
      
      Pesquise em sites como eBay, MercadoLivre Brasil, PriceCharting e lojas especializadas.
      Considere apenas listagens vendidas recentemente ou preços médios atuais.
      
      Retorne APENAS um bloco JSON válido (sem texto extra antes ou depois) com o seguinte formato:
      {
        "min": number (preço mínimo encontrado em R$),
        "max": number (preço máximo encontrado em R$),
        "avg": number (preço médio estimado em R$),
        "reasoning": "string curta explicando a base de preço (ex: baseado em 3 vendas no ML)",
      }
      Converta todos os preços para Reais (BRL).
    `;

    const response = await getAI().models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }],
      },
    });

    const text = response.text;
    const grounding = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
    
    const sources: string[] = [];
    if (grounding) {
      grounding.forEach(chunk => {
        if (chunk.web?.uri) sources.push(chunk.web.uri);
      });
    }

    if (!text) throw new Error("Sem resposta de avaliação");

    // Extract JSON from potential markdown text
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
       return { min: 0, max: 0, avg: 0, reasoning: "Não foi possível estruturar os preços. Tente novamente.", sources };
    }

    const parsed = JSON.parse(jsonMatch[0]);

    return {
      min: parsed.min || 0,
      max: parsed.max || 0,
      avg: parsed.avg || 0,
      reasoning: parsed.reasoning || "Estimativa baseada em busca online.",
      sources: sources.slice(0, 3) // Top 3 sources
    };

  } catch (error) {
    console.error("Erro na avaliação:", error);
    return {
        min: 0, 
        max: 0, 
        avg: 0, 
        reasoning: "Erro ao conectar com serviço de preços.", 
        sources: []
    };
  }
};
