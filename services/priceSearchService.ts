import { GoogleGenAI } from "@google/genai";
import { Condition } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export interface PriceSearchResult {
  min: number;
  max: number;
  avg: number;
  reasoning: string;
  sources: string[];
}

/**
 * Searches for item prices across multiple marketplaces:
 * - OLX
 * - Mercado Livre Brasil
 * - PriceCharting
 * - eBay
 * 
 * Returns the average price found across these sources.
 */
export const searchPriceAcrossMarketplaces = async (
  itemName: string, 
  condition: Condition
): Promise<PriceSearchResult> => {
  try {
    const prompt = `
      Atue como um especialista em avaliação de videogames retrô.
      Pesquise o valor de mercado ATUAL (hoje) para o item: "${itemName}" na condição: "${condition}".
      
      IMPORTANTE: Pesquise OBRIGATORIAMENTE nestes 4 sites:
      1. OLX Brasil (olx.com.br)
      2. Mercado Livre Brasil (mercadolivre.com.br)
      3. PriceCharting (pricecharting.com)
      4. eBay (ebay.com)
      
      Para cada site, busque listagens ativas ou vendas recentes.
      Considere o preço médio de cada plataforma.
      
      Retorne APENAS um bloco JSON válido (sem texto extra antes ou depois) com o seguinte formato:
      {
        "min": number (preço mínimo encontrado em R$),
        "max": number (preço máximo encontrado em R$),
        "avg": number (preço médio estimado calculado a partir das 4 fontes em R$),
        "reasoning": "string explicando quais sites você encontrou resultados e qual a média em cada um"
      }
      
      Converta todos os preços para Reais (BRL) se necessário.
      Se algum site não tiver resultados, mencione isso no reasoning.
    `;

    const response = await ai.models.generateContent({
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
       return { 
         min: 0, 
         max: 0, 
         avg: 0, 
         reasoning: "Não foi possível estruturar os preços. Tente novamente.", 
         sources 
       };
    }

    let parsed;
    try {
      parsed = JSON.parse(jsonMatch[0]);
    } catch (parseError) {
      console.error("Erro ao parsear JSON:", parseError);
      return {
        min: 0,
        max: 0,
        avg: 0,
        reasoning: "Erro ao processar resposta do serviço.",
        sources
      };
    }

    return {
      min: parsed.min || 0,
      max: parsed.max || 0,
      avg: parsed.avg || 0,
      reasoning: parsed.reasoning || "Estimativa baseada em busca online nos 4 sites solicitados.",
      sources: sources.slice(0, 10) // Return up to 10 sources
    };

  } catch (error) {
    console.error("Erro na busca de preços:", error);
    return {
        min: 0, 
        max: 0, 
        avg: 0, 
        reasoning: "Erro ao conectar com serviço de preços.", 
        sources: []
    };
  }
};
