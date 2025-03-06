import { ChatMessage } from '@langchain/core/messages';
import { ChatOpenAI } from '@langchain/openai';

export async function getAiResponse(messages: ChatMessage[]) {
  const model = new ChatOpenAI({ model: 'gpt-4o-mini' });
  const response = await model.invoke(messages);
  return response.content;
}
