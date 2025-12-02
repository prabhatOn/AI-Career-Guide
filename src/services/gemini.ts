import { GoogleGenerativeAI } from '@google/generative-ai';
import { GEMINI_API_KEY } from '../config/env';

const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

const CAREER_GUIDE_SYSTEM_PROMPT = `You are a concise AI Career Advisor. Follow these rules strictly:

## Response Rules:
1. **Keep responses SHORT and FOCUSED** - Maximum 150 words per response
2. **Answer ONLY what is asked** - Don't provide unsolicited information
3. **Use clean formatting** - Use ## for headings, bullet points for lists
4. **Be conversational** - Engage like a friendly mentor

## Response Patterns:

**For initial career queries (background/interests shared):**
- List 3-5 career options with ONE line description each
- End with: "Which career interests you? Ask me about roadmap, salary, skills, or challenges!"

**For specific questions (salary, roadmap, skills, etc):**
- Answer ONLY that specific question concisely
- Use bullet points for clarity
- Keep it under 50 words

**For follow-up questions:**
- Reference previous context naturally
- Stay focused on the specific question

## Formatting:
- Use ## for main headings
- Use **bold** for emphasis (not ***)
- Use • for bullet points
- Add line breaks between sections

Remember: Users prefer quick, digestible responses. They'll ask follow-up questions for more details.`;

interface ChatMessage {
  role: 'user' | 'model';
  parts: { text: string }[];
}

class GeminiService {
  private model;

  constructor() {
    this.model = genAI.getGenerativeModel({
      model: 'gemini-2.5-flash-lite',
      systemInstruction: CAREER_GUIDE_SYSTEM_PROMPT,
    });
  }

  async generateCareerGuidance(
    userMessage: string,
    conversationHistory: ChatMessage[] = []
  ): Promise<string> {
    try {
      const chat = this.model.startChat({
        history: conversationHistory,
        generationConfig: {
          maxOutputTokens: 512,
          temperature: 0.7,
          topP: 0.9,
          topK: 40,
        },
      });

      const result = await chat.sendMessage(userMessage);
      const response = await result.response;
      let text = response.text();
      
      // Clean up formatting - convert *** to ** for bold
      text = text.replace(/\*\*\*/g, '**');
      
      return text;
    } catch (error) {
      console.error('Gemini API Error:', error);
      throw new Error('Failed to generate career guidance. Please try again.');
    }
  }

  async generateChatTitle(firstMessage: string): Promise<string> {
    try {
      const prompt = `Based on this first message from a user seeking career guidance, generate a short, descriptive title (3-6 words) for this conversation. Only return the title, nothing else.

User message: "${firstMessage}"

Title:`;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      let title = response.text().trim();
      
      // Remove quotes if present
      title = title.replace(/^["']|["']$/g, '');
      
      // Limit length
      if (title.length > 50) {
        title = title.substring(0, 47) + '...';
      }
      
      return title || 'New Career Consultation';
    } catch (error) {
      console.error('Error generating title:', error);
      return 'New Career Consultation';
    }
  }

  formatMessageHistory(messages: { role: 'user' | 'assistant'; content: string }[]): ChatMessage[] {
    return messages.map(msg => ({
      role: msg.role === 'user' ? 'user' : 'model',
      parts: [{ text: msg.content }],
    }));
  }
}

export const geminiService = new GeminiService();
