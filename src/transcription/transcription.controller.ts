import {
  Body,
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { TranscriptionService } from './transcription.service';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { TranscriptAudioInputDto } from './dtos/transcript-audio.input.dto';
import { Authorize } from 'src/auth/roles.guard';
import { Express } from 'express';

@ApiTags('transcription')
@Controller('transcription')
@Authorize()
@ApiBearerAuth('JWT-auth')
export class TranscriptionController {
  constructor(private readonly transcriptionService: TranscriptionService) {}

  @Post()
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('audio'))
  @ApiOperation({
    summary: '音声ファイルを文字起こしする',
    operationId: 'transcribeAudio',
  })
  @ApiBody({
    description: 'audio file',
    type: TranscriptAudioInputDto,
  })
  @ApiResponse({
    status: 200,
    description: '文字起こしが成功した場合',
    type: String,
  })
  async transcribe(
    @UploadedFile() audio: Express.Multer.File,
    @Body() body: TranscriptAudioInputDto,
  ) {
    const file = new File([audio.buffer], audio.originalname, {
      type: audio.mimetype,
    });
    const transcription = await this.transcriptionService.transcribe(file);
    return transcription;
  }
}
