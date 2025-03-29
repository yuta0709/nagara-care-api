import { ChatPromptTemplate } from '@langchain/core/prompts';
import { ChatOpenAI } from '@langchain/openai';
import { foodRecordSchema } from './schema';
import { FoodRecord } from '@prisma/client';

export async function extractData(
  transcript: string,
  currentState: FoodRecord,
) {
  const promptTemplate = ChatPromptTemplate.fromMessages([
    [
      'system',
      'あなたは介護施設の食事記録を作成するアシスタントです。\n\n' +
        '介護士が話した内容の文字起こしテキストを最後まで読んでから、食事記録を作成してください。\n' +
        '食事記録は以下のスキーマに厳密に従って作成してください。\n' +
        '- 食事の時間帯（朝食、昼食、夕食）\n' +
        '- 主食の摂取率（0-100%）\n' +
        '- 副食の摂取率（0-100%）\n' +
        '- 汁物の摂取率（0-100%）\n' +
        '- 飲み物の種類（水、お茶、その他）\n' +
        '- 飲み物の摂取量（ml）\n' +
        '- 特記事項（上記の項目では表現できない重要な情報のみを記載）\n\n' +
        '特記事項には、食事の様子や介助の状況など、他のフィールドでは表現できない情報のみを記入してください。\n' +
        '摂取率や飲み物の量など、他のフィールドで表現できる情報は特記事項に含めないでください。\n' +
        '**文字起こし内で明確に言及されているフィールドについてのみ値を設定し、言及されていないフィールドは0などではなく、nullにしてください**\n' +
        '現在の記録状態について、特に変更がなさそうであれば引き継いでください。',
    ],
    ['user', `現在の記録状態: {currentState}\n\n` + `文字起こし: {transcript}`],
  ]);

  const llm = new ChatOpenAI({
    model: 'gpt-4o-mini',
    temperature: 0,
  });
  const structured_llm = llm.withStructuredOutput(foodRecordSchema);
  const prompt = await promptTemplate.invoke({
    currentState: JSON.stringify(currentState),
    transcript: transcript,
  });
  const response = await structured_llm.invoke(prompt);
  return response;
}
