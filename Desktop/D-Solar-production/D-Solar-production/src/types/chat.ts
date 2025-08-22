export interface Message {
  role: 'user' | 'assistant';
  content: string;
  source?: 'faq' | 'llm';
}

export interface ChatResponse {
  message: string;
  error?: string;
  source?: 'faq' | 'llm';
}

export interface ChatRequest {
  message: string;
  history: Message[];
} 