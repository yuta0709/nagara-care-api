import { ChatMessage } from '@langchain/core/messages';
import { ChatOpenAI } from '@langchain/openai';

export async function getAiResponse(messages: ChatMessage[]) {
  const model = new ChatOpenAI({ model: 'gpt-4o-mini' });
  const systemMessage = new ChatMessage({
    role: 'system',
    content:
      'あなたは介護施設に特化したRAGモデルです。[Context]には介護施設のデータベースから取得したデータが入っています。[User]には利用者の質問が入っています。[User]の質問に対して、[Context]を参照して回答してください。',
  });
  const response = await model.invoke([systemMessage, ...messages]);
  return response.content;
}
