import { Injectable } from '@nestjs/common';
import { OpenAI } from 'openai';

@Injectable()
export class TranscriptionService {
  async transcribe(audio: File) {
    const client = new OpenAI();
    const file = new File([audio], 'audio.mp3', { type: 'audio/mpeg' });
    const transcription = await client.audio.transcriptions.create({
      model: 'gpt-4o-mini-transcribe',
      file,
      prompt: '"gpt-4o-mini"',
    });
    return transcription.text;
  }
}
