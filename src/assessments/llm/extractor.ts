import { ChatPromptTemplate } from '@langchain/core/prompts';
import { ChatOpenAI } from '@langchain/openai';
import { assessmentSchema } from './schema';
import { Assessment } from '@prisma/client';

export async function extractData(
  transcript: string,
  currentState: Assessment,
) {
  const promptTemplate = ChatPromptTemplate.fromMessages([
    [
      'system',
      'あなたは介護施設のアセスメント記録を作成するアシスタントです。\n\n' +
        '介護士が話した内容の文字起こしテキストを最後まで読んでから、アセスメント記録を作成してください。\n' +
        'アセスメント記録はスキーマに厳密に従って作成してください。\n\n' +
        '**文字起こし内で明確に言及されているフィールドについてのみ値を設定し、言及されていないフィールドは空文字などではなく、nullにしてください**\n' +
        '現在の記録状態について、特に変更がなさそうであれば引き継いでください。',
    ],
    ['user', `現在の記録状態: {currentState}\n\n` + `文字起こし: {transcript}`],
  ]);

  const llm = new ChatOpenAI({
    model: 'gpt-4o-mini',
    temperature: 0,
  });
  const structured_llm = llm.withStructuredOutput(assessmentSchema);
  const prompt = await promptTemplate.invoke({
    currentState: JSON.stringify(currentState),
    transcript: transcript,
  });
  const response = await structured_llm.invoke(prompt);
  return response;
}
