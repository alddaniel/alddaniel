/**
 * @fileoverview Service for Gemini API interactions.
 * This service uses the GoogleGenAI client with an API key provided
 * via the `process.env.API_KEY` environment variable.
 */
// FIX: Import GenerateContentResponse to provide explicit type information for the API response.
import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import type { Appointment, Interaction, User } from '../types';
import { sendAppointmentUpdateEmail } from './notificationService';

const apiKey = process.env.API_KEY;
// Initialize the AI client only if the API key is available.
const ai = apiKey ? new GoogleGenAI({ apiKey }) : null;

/**
 * Generates a concise and professional summary for a business meeting.
 * @param appointment The appointment object to summarize.
 * @param languageName The language for the AI to respond in (e.g., "Portuguese", "English").
 * @param locale The locale for date formatting (e.g., "pt-BR", "en-US").
 * @returns A promise that resolves to the summary string in markdown format.
 */
export const generateMeetingSummary = async (appointment: Appointment, languageName: string, locale: string): Promise<string> => {
  if (!ai) {
    const errorMessage = "AI service is not configured. Please provide a VITE_API_KEY environment variable.";
    console.error(errorMessage);
    return `Failed to generate summary: ${errorMessage}`;
  }
  try {
    const prompt = `
      Generate a concise and professional summary for the following business meeting.
      The summary must be in markdown format with the following sections:
      - **Objective**: The main purpose of the meeting.
      - **Key Discussion Points**: Bullet points of the main topics discussed.
      - **Action Items**: Bullet points of assigned tasks, including who is responsible (if mentioned).
      - **Next Steps**: A brief conclusion on what happens next.
      
      The response must be in ${languageName}.

      Meeting Details:
      - Title: ${appointment.title}
      - Description: ${appointment.description}
      - Participants: ${appointment.participants.map(p => p.name).join(', ')}
      - Date: ${appointment.start.toLocaleDateString(locale)}
    `;

    // FIX: Explicitly type the response object and access the `.text` property directly as per the latest SDK guidelines.
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });
    
    return response.text;
  } catch (error: any) {
    console.error("Erro ao gerar o resumo da reunião:", error);
    return `Failed to generate summary. An error occurred with the AI service. Error: ${error.message}`;
  }
};

/**
 * Analyzes customer interactions and appointments to provide strategic CRM insights.
 * @param interactions A list of interaction objects with the customer.
 * @param appointments A list of appointment objects with the customer.
 * @param customerName The name of the customer for context.
 * @param users A list of all users to map userId to user name.
 * @param languageName The language for the AI to respond in (e.g., "Portuguese", "English").
 * @param locale The locale for date formatting (e.g., "pt-BR", "en-US").
 * @returns A promise that resolves to a markdown string with the CRM analysis.
 */
export const analyzeCustomerInteractions = async (
  interactions: Interaction[],
  appointments: Appointment[],
  customerName: string,
  users: User[],
  languageName: string,
  locale: string
): Promise<string> => {
  if (!ai) {
    const errorMessage = "AI service is not configured. Please provide a VITE_API_KEY environment variable.";
    console.error(errorMessage);
    return `Failed to generate analysis: ${errorMessage}`;
  }
  try {
    const userMap = new Map(users.map(u => [u.id, u.name]));
    
    const formattedInteractions = interactions.length > 0
      ? interactions
          .map(int => `- Date: ${int.date.toLocaleString(locale)}, Type: ${int.type}, Logged by: ${userMap.get(int.userId) || 'Unknown User'}\n  - Notes: ${int.notes}`)
          .join('\n\n')
      : 'No interactions logged.';

    const formattedAppointments = appointments.length > 0
        ? appointments
            .sort((a, b) => a.start.getTime() - b.start.getTime())
            .map(app => `- Date: ${app.start.toLocaleString(locale)}, Title: ${app.title}, Status: ${app.status}`)
            .join('\n')
        : 'No appointments scheduled.';

    const prompt = `
      Act as a senior CRM analyst. Your goal is to provide actionable insights to improve appointment management and strengthen the relationship with the customer '${customerName}'.
      Analyze the following interaction and appointment history. Provide a concise, professional, and strategic CRM analysis in markdown format. The response must be in ${languageName}.

      Your analysis must have these sections:
      - **Engagement Level**: A one-sentence summary of the customer's health (e.g., Highly Engaged, Stable, At Risk). Base this on the frequency and recency of interactions and appointments.
      - **Main Topics**: Bullet points identifying recurring subjects from interactions and appointment titles. What does this customer care about most?
      - **Appointment Analysis**: Briefly analyze their appointment history. Are they proactive in scheduling? What is the primary purpose of their meetings (e.g., sales, support, strategic planning)?
      - **Next Best Action (Appointment-focused)**: Recommend one smart, concrete action for the team, focused on scheduling a meaningful appointment. For example: "Schedule a 15-minute follow-up call next week to discuss Project X's success" or "Propose a Q2 strategy meeting to address recurring concerns about topic Y."

      Interaction History (most recent first):
      ${formattedInteractions}

      Appointment History (all past and future, sorted by date):
      ${formattedAppointments}
    `;

    const response: GenerateContentResponse = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });
    
    return response.text;
  } catch (error: any) {
    console.error("Erro ao analisar interações com IA:", error);
    return `Failed to generate analysis. An error occurred with the AI service. Error: ${error.message}`;
  }
};

export { sendAppointmentUpdateEmail };