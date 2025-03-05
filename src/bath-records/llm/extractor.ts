import { ChatPromptTemplate } from '@langchain/core/prompts';
import { ChatOpenAI } from '@langchain/openai';
import { bathRecordSchema } from './schema';

export async function extractData(transcript: string) {
  const promptTemplate = ChatPromptTemplate.fromMessages([
    [
      'system',
      'あなたは介護施設の入浴記録を作成するアシスタントです。\n\n' +
        '介護士が話した内容の文字起こしテキストを最後まで読んでから、入浴記録を作成してください。\n' +
        '入浴記録は以下のスキーマに厳密に従って作成してください。\n' +
        '- 入浴方法（一般浴、機械浴、シャワー浴など）\n' +
        '- 特記事項（上記の項目では表現できない重要な情報のみを記載）\n\n' +
        '特記事項には、入浴時の様子や介助の状況など、他のフィールドでは表現できない情報のみを記入してください。\n' +
        '入浴方法など、他のフィールドで表現できる情報は特記事項に含めないでください。',
    ],
    ['human', `{transcription}`],
  ]);

  const llm = new ChatOpenAI({
    model: 'gpt-4o-mini',
    temperature: 0,
  });
  const structured_llm = llm.withStructuredOutput(bathRecordSchema);
  const prompt = await promptTemplate.invoke({
    transcription: transcript,
  });
  const response = await structured_llm.invoke(prompt);
  return response;
}
