import { ChatPromptTemplate } from '@langchain/core/prompts';
import { ChatOpenAI } from '@langchain/openai';
import { questionAnswerResponseSchema } from './schema';
/**
 * 質疑応答の文字起こしから質問と回答のペアを抽出する
 * @param transcript 質疑応答の文字起こし
 * @returns 質問と回答の組の配列
 */
export async function extractQuestionsAndAnswers(transcript: string) {
  const promptTemplate = ChatPromptTemplate.fromMessages([
    [
      'system',
      `あなたは質疑応答の文字起こしテキストから質問と回答のペアを抽出する専門家です。
与えられた文字起こしから、すべての質問と回答のペアを抽出してください。

以下のルールに従ってください：
1. 質問と回答のペアを要約して抽出してください
2. 質問が明確に特定できる場合のみ抽出してください
3. 回答がない質問の場合は、回答をnullとしてください
4. 質問と回答は元の文脈を保持してください
5. だ、である調に書き換えてください
6. 文字起こしのミスと思われる部分は、適切に修正してください。
出力は質問と回答のペアの配列として構造化してください。`,
    ],
    ['user', `文字起こし: {transcript}`],
  ]);

  const llm = new ChatOpenAI({
    model: 'gpt-4o',
    temperature: 0,
  });
  const structured_llm = llm.withStructuredOutput(questionAnswerResponseSchema);
  const prompt = await promptTemplate.invoke({
    transcript: transcript,
  });
  const response = await structured_llm.invoke(prompt);
  return response;
}
