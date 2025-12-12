import { streamResponse } from '@libs/ai';

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

export async function POST(req: Request) {
  try {
    const body = await req.json();
    console.log('Request body:', body);
    
    const { messages, provider, model } = body;
    
    // Validate messages
    if (!messages || !Array.isArray(messages)) {
      console.error('Invalid messages:', messages);
      return new Response('Invalid messages format', { status: 400 });
    }
    
    console.log('Processing request:', { 
      messagesCount: messages.length, 
      provider: provider || 'openai', 
      model: model || 'default' 
    });
    
    return streamResponse({
      messages,
      provider,
      model
    });
  } catch (error) {
    console.error('API route error:', error);
    return new Response('Internal server error', { status: 500 });
  }
} 