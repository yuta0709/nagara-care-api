import { HumanMessage, SystemMessage } from '@langchain/core/messages';
import { ChatOpenAI } from '@langchain/openai';

export async function summarize(transcription: string) {
  const model = new ChatOpenAI({
    model: 'gpt-4o-mini',
    temperature: 0,
  });
  const messages = [
    new SystemMessage(
      `あなたは介護アセスメントの専門家です。以下の会話は、介護アセスメントの際の利用者、利用者家族、介護士間のやり取りの文字起こしです。
    日本語でアセスメントの要約を作成してください。要約は簡潔かつ具体的に、重要なポイントを箇条書きで示し、Markdown形式で出力してください。`,
    ),
    new HumanMessage(transcription),
  ];

  const result = await model.invoke(messages);
  return result.content;
}
