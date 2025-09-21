/**
 * @fileoverview Service for Gemini API interactions.
 * This service uses the GoogleGenAI client with an API key provided
 * via the `process.env.API_KEY` environment variable.
 */
import { GoogleGenAI } from "@google/genai";
import type { Appointment, Interaction, User } from '../types';

// Assume process.env.API_KEY is available in the execution environment as per guidelines
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY! });

/**
 * Generates a concise and professional summary for a business meeting.
 * @param appointment The appointment object to summarize.
 * @returns A promise that resolves to the summary string in markdown format.
 */
export const generateMeetingSummary = async (appointment: Appointment): Promise<string> => {
  try {
    const prompt = `
      Gere um resumo conciso e profissional para a seguinte reunião de negócios.
      O resumo deve estar em formato markdown com as seguintes seções:
      - **Objetivo**: O propósito principal da reunião.
      - **Pontos Chave da Discussão**: Itens dos principais tópicos discutidos.
      - **Itens de Ação**: Itens das tarefas atribuídas, incluindo quem é o responsável (se mencionado).
      - **Próximos Passos**: Uma breve conclusão sobre o que acontece a seguir.

      Detalhes da Reunião:
      - Título: ${appointment.title}
      - Descrição: ${appointment.description}
      - Participantes: ${appointment.participants.map(p => p.name).join(', ')}
      - Data: ${appointment.start.toLocaleDateString('pt-BR')}
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });
    
    return response.text;
  } catch (error: any) {
    console.error("Erro ao gerar o resumo da reunião:", error);
    return `Falha ao gerar o resumo. Ocorreu um erro com o serviço de IA. Erro: ${error.message}`;
  }
};

/**
 * Analyzes customer interactions to provide strategic insights.
 * @param interactions A list of interaction objects with the customer.
 * @param customerName The name of the customer for context.
 * @param users A list of all users to map userId to user name.
 * @returns A promise that resolves to a markdown string with the analysis.
 */
export const analyzeCustomerInteractions = async (
  interactions: Interaction[],
  customerName: string,
  users: User[]
): Promise<string> => {
  try {
    const userMap = new Map(users.map(u => [u.id, u.name]));
    const formattedInteractions = interactions
      .map(int => `- Data: ${int.date.toLocaleString('pt-BR')}, Tipo: ${int.type}, Registrado por: ${userMap.get(int.userId) || 'Usuário Desconhecido'}\n  - Notas: ${int.notes}`)
      .join('\n\n');

    const prompt = `
      Analise o seguinte histórico de interações com o cliente '${customerName}'.
      O histórico está em ordem cronológica inversa (do mais recente para o mais antigo).
      Forneça uma análise concisa e estratégica em formato markdown com as seguintes seções:
      - **Sentimento Geral**: Avalie o sentimento geral do cliente (positivo, negativo, neutro) com base nas notas, explicando brevemente o porquê.
      - **Tópicos Principais**: Identifique os principais assuntos, necessidades ou problemas discutidos repetidamente.
      - **Oportunidades ou Riscos**: Aponte quaisquer oportunidades de venda, upsell, ou riscos de churn (cancelamento) que você possa inferir.
      - **Sugestão de Próximo Passo**: Recomende uma ação concreta e inteligente a ser tomada pela equipe para fortalecer o relacionamento ou resolver um problema.

      Histórico de Interações:
      ${formattedInteractions}
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });
    
    return response.text;
  } catch (error: any) {
    console.error("Erro ao analisar interações com IA:", error);
    return `Falha ao gerar a análise. Ocorreu um erro com o serviço de IA. Erro: ${error.message}`;
  }
};