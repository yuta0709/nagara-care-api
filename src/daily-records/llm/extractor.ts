import { ChatPromptTemplate } from '@langchain/core/prompts';
import { ChatOpenAI } from '@langchain/openai';
import { dailyRecordSchema } from './schema';
import { DailyRecord } from '@prisma/client';

export async function extractData(
  transcript: string,
  currentState: DailyRecord,
) {
  const promptTemplate = ChatPromptTemplate.fromMessages([
    [
      'system',
      'あなたは介護施設の日常記録を作成するアシスタントです。\n\n' +
        '介護士が話した内容の文字起こしテキストを最後まで読んでから、日常記録を作成してください。\n' +
        '日常記録は以下のスキーマに厳密に従って作成してください。\n' +
        '- 特記事項（上記の項目では表現できない重要な情報のみを記載）\n' +
        '- 日常の状態（普通、注意、警告）\n\n' +
        '特記事項には、食事の様子や介助の状況など、他のフィールドでは表現できない情報のみを記入してください。\n' +
        '**文字起こし内で明確に言及されているフィールドについてのみ値を設定し、言及されていないフィールドはnullにしてください**\n' +
        '現在の記録状態について、特に変更がなさそうであれば引き継いでください。',
    ],
    ['user', `現在の記録状態: {currentState}\n\n` + `文字起こし: {transcript}`],
  ]);

  const llm = new ChatOpenAI({
    model: 'gpt-4o-mini',
    temperature: 0,
  });
  const structured_llm = llm.withStructuredOutput(dailyRecordSchema);
  const prompt = await promptTemplate.invoke({
    currentState: JSON.stringify(currentState),
    transcript: transcript,
  });
  const response = await structured_llm.invoke(prompt);
  return response;
}
