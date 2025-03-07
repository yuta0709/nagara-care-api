import { DailyRecord, User, DailyStatus, Resident } from '@prisma/client';

export function formatDailyRecord(record: DailyRecord, resident: Resident) {
  // 日常状態の日本語表記
  const dailyStatusJa = {
    [DailyStatus.NORMAL]: '普通',
    [DailyStatus.WARNING]: '注意',
    [DailyStatus.ALERT]: '警告',
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
${resident.familyName} ${resident.givenName}さん（${resident.familyNameFurigana} ${resident.givenNameFurigana}）の日常記録

【記録日時】${formattedDate} ${formattedTime}
${record.dailyStatus ? `【状態】${dailyStatusJa[record.dailyStatus]}` : ''}
${record.notes ? `【備考】\n${record.notes}` : ''}
${record.transcription ? `【音声文字起こし】\n${record.transcription}` : ''}
  `;
}
