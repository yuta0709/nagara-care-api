import { FoodRecord, Resident, MealTime, BeverageType } from '@prisma/client';

export function formatFoodRecord(record: FoodRecord, resident: Resident) {
  // 食事時間の日本語表記
  const mealTimeJa = {
    [MealTime.BREAKFAST]: '朝食',
    [MealTime.LUNCH]: '昼食',
    [MealTime.DINNER]: '夕食',
  };

  // 飲み物の種類の日本語表記
  const beverageTypeJa = {
    [BeverageType.WATER]: '水',
    [BeverageType.TEA]: 'お茶',
    [BeverageType.OTHER]: 'その他',
  };

  // 日付のフォーマット
  const formattedDate = record.recordedAt.toLocaleDateString('ja-JP', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  // 時間のフォーマット
  const formattedTime = record.recordedAt.toLocaleTimeString('ja-JP', {
    hour: '2-digit',
    minute: '2-digit',
  });

  return `
${resident.familyName} ${resident.givenName}さん（${resident.familyNameFurigana} ${resident.givenNameFurigana}）の食事記録

【記録日時】${formattedDate} ${formattedTime}
【食事区分】${mealTimeJa[record.mealTime]}
【摂取量】
 - 主食: ${record.mainCoursePercentage}%
 - 副食: ${record.sideDishPercentage}%
 - 汁物: ${record.soupPercentage}%
【飲み物】
 - 種類: ${beverageTypeJa[record.beverageType]}
 - 量: ${record.beverageVolume}ml
${record.notes ? `【備考】\n${record.notes}` : ''}
${record.transcription ? `【音声文字起こし】\n${record.transcription}` : ''}
  `;
}
