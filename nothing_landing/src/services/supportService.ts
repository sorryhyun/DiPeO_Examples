import { apiClient } from '../utils/apiClient';

export interface SupportMessage {
  text: string;
  sessionId: string;
}

export interface SupportReply {
  message: string;
  timestamp: string;
  agent: string;
}

const generateFallbackReply = (_message: string): SupportReply => {
  const fallbackResponses = [
    "Thank you for reaching out about absolutely nothing. We appreciate your void inquiry.",
    "Your message about nothing has been received into the digital abyss. We'll respond with equal nothing.",
    "We understand your concern about nothing. Rest assured, we're doing nothing about it.",
    "Your nothing-related query is important to us. We'll address it with our finest nothing.",
    "Thank you for contacting Nothing Support. We're here to help you with all your nothing needs."
  ];
  
  const randomResponse = fallbackResponses[Math.floor(Math.random() * fallbackResponses.length)];
  
  return {
    message: randomResponse,
    timestamp: new Date().toISOString(),
    agent: "Void Bot"
  };
};

const sendMessage = async (supportMessage: SupportMessage): Promise<SupportReply> => {
  try {
    const response = await apiClient.post('/api/support/nothing', {
      text: supportMessage.text,
      sessionId: supportMessage.sessionId
    });

    return {
      message: response.data.message || response.data.reply,
      timestamp: response.data.timestamp || new Date().toISOString(),
      agent: response.data.agent || 'Nothing Support'
    };
  } catch (error) {
    console.warn('Support service API failed, using fallback response:', error);
    return generateFallbackReply(supportMessage.text);
  }
};

export default {
  sendMessage
};
