import { Injectable } from '@nestjs/common';
import { OpenAI } from 'openai';
import * as ffmpeg from 'fluent-ffmpeg';
import { promisify } from 'util';
import { writeFile } from 'fs/promises';
import { join } from 'path';
import { tmpdir } from 'os';

@Injectable()
export class TranscriptionService {
  async transcribe(audio: File) {
    const client = new OpenAI();

    // 一時ファイルのパスを生成
    const inputPath = join(tmpdir(), `input-${Date.now()}.webm`);
    const outputPath = join(tmpdir(), `output-${Date.now()}.wav`);

    try {
      // FileオブジェクトからArrayBufferを取得
      const arrayBuffer = await audio.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      // アップロードされたファイルを一時ファイルとして保存
      await writeFile(inputPath, buffer);

      // WebMからWAVへの変換を実行
      await new Promise((resolve, reject) => {
        ffmpeg(inputPath)
          .toFormat('wav')
          .audioFrequency(16000) // サンプルレートを16kHzに設定
          .audioChannels(1) // モノラルに設定
          .on('end', resolve)
          .on('error', reject)
          .save(outputPath);
      });

      // 変換されたWAVファイルを読み込んでOpenAIに送信
      const file = await import('fs/promises').then((fs) =>
        fs.readFile(outputPath),
      );

      const transcription = await client.audio.transcriptions.create({
        model: 'whisper-1',
        file: new File([file], 'audio.wav', { type: 'audio/wav' }),
      });

      return transcription.text;
    } finally {
      // 一時ファイルの削除
      await Promise.all([
        import('fs/promises').then((fs) =>
          fs.unlink(inputPath).catch(() => {}),
        ),
        import('fs/promises').then((fs) =>
          fs.unlink(outputPath).catch(() => {}),
        ),
      ]);
    }
  }
}
