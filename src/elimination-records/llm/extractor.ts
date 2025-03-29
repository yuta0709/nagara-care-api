import { ChatPromptTemplate } from '@langchain/core/prompts';
import { ChatOpenAI } from '@langchain/openai';
import { EliminationSchema } from './schema';
import { EliminationRecord } from '@prisma/client';

export async function extractData(
  transcript: string,
  currentState: EliminationRecord,
) {
  const promptTemplate = ChatPromptTemplate.fromMessages([
    [
      'system',
      'あなたは介護施設の排泄記録を作成するアシスタントです。\n\n' +
        '介護士が話した内容の文字起こしテキストを最後まで読んでから、排泄記録を作成してください。\n' +
        '排泄記録は以下のスキーマに厳密に従って作成してください。\n' +
        '- 排泄方法（トイレやオムツなどの排泄方法などの情報のみを記載）\n' +
        '- 便の有無（True or False）\n' +
        '- 便失禁の有無（True or False）\n' +
        '- 便の性状（便の内容や症状についての情報のみを記載、ブリストルスケール（硬便、正常便、軟便）などの情報は優先度高く記載）\n' +
        '- 便の量（g）\n' +
        '- 尿の有無（True or False）\n' +
        '- 尿失禁の有無（True or False）\n' +
        '- 便の性状（尿の内容や症状についての情報のみを記載、色の情報や血尿などの情報は優先度高く記載）\n' +
        '- 尿量（ml）\n' +
        '- 備考（上記の項目では表現できない重要な情報のみを記載）\n\n' +
        '便の症状や尿の症状には、ブリストルスケール（硬便、正常便、軟便）や尿の色の情報や血尿などの情報など便の症状や尿の症状に関連しているのものみ記入してください\n' +
        '備考には、排泄の様子や介助の状況など、他のフィールドでは表現できない情報のみを記入してください。\n' +
        '便や尿の有無、便や尿の症状、量など、他のフィールドで表現できる情報は備考に含めないでください。\n' +
        '**文字起こし内で明確に言及されているフィールドについてのみ値を設定し、言及されていないフィールドは0などではなく、nullにしてください**\n' +
        '現在の記録状態について、特に変更がなさそうであれば引き継いでください。',
    ],
    ['user', `現在の記録状態: {currentState}\n\n` + `文字起こし: {transcript}`],
  ]);

  const llm = new ChatOpenAI({
    model: 'gpt-4o-mini',
    temperature: 0,
  });
  const structured_llm = llm.withStructuredOutput(EliminationSchema);
  const prompt = await promptTemplate.invoke({
    currentState: JSON.stringify(currentState),
    transcript: transcript,
  });
  const response = await structured_llm.invoke(prompt);
  return response;
}
