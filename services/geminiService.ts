import { GoogleGenAI } from "@google/genai";

// Initialize Gemini Client
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const generateEventDescription = async (eventName: string, details: string): Promise<string> => {
  try {
    const prompt = `
      Você é um especialista em marketing esportivo para a empresa PickleballBH.
      Escreva uma descrição curta, emocionante e convidativa (máximo de 3 parágrafos curtos) para um álbum de fotos de um evento de Pickleball.
      
      Nome do Evento: ${eventName}
      Detalhes adicionais: ${details}
      
      Use emojis relacionados a esportes e energia. O tom deve ser profissional mas vibrante.
      Retorne APENAS o texto da descrição.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        temperature: 0.8,
      }
    });

    return response.text || "Descrição não disponível no momento.";
  } catch (error) {
    console.error("Erro ao gerar descrição com Gemini:", error);
    return "Não foi possível gerar a descrição automática. Por favor, tente novamente.";
  }
};
