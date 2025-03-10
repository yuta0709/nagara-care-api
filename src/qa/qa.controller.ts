import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { QaService } from './qa.service';
import {
  CreateQaSessionDto,
  CreateQuestionAnswerDto,
  ExtractQaPairsDto,
  UpdateQuestionAnswerDto,
  UpsertQuestionAnswersDto,
} from './dtos';
import { User, UserRole } from '@prisma/client';
import { User as UserDecorator } from 'src/users/user.decorator';
import { QaSessionListOutputDto } from './dtos/qa-session-list.output.dto';
import { QaSessionOutputDto } from './dtos/qa-session.output.dto';
import { QuestionAnswerOutputDto } from './dtos/question-answer.output.dto';
import { ExtractQaPairsOutputDto } from './dtos/extract-qa-pairs.output.dto';
import { Authorize } from 'src/auth/roles.guard';
import { TranscriptionInputDto } from './dtos/transcription.input.dto';

@Authorize([UserRole.GLOBAL_ADMIN, UserRole.TENANT_ADMIN, UserRole.CAREGIVER])
@ApiBearerAuth('JWT-auth')
@ApiTags('qa')
@Controller('qa')
export class QaController {
  constructor(private readonly qaService: QaService) {}

  @Post('sessions')
  @ApiOperation({
    operationId: 'createQaSession',
    summary: 'QAセッションを作成する',
  })
  @ApiResponse({
    status: 201,
    description: 'QAセッションが作成されました',
    type: QaSessionOutputDto,
  })
  async createQaSession(
    @Body() createQaSessionDto: CreateQaSessionDto,
    @UserDecorator() user: User,
  ) {
    return this.qaService.createQaSession(createQaSessionDto, user);
  }

  @Get('sessions/:uid')
  @ApiOperation({
    operationId: 'findQaSession',
    summary: 'QAセッションを取得する',
  })
  @ApiParam({ name: 'uid', description: 'QAセッションID' })
  @ApiResponse({
    status: 200,
    description: 'QAセッションが取得されました',
    type: QaSessionOutputDto,
  })
  @ApiResponse({ status: 404, description: 'QAセッションが見つかりません' })
  async findQaSession(@Param('uid') uid: string) {
    return this.qaService.findQaSession(uid);
  }

  @Get('sessions')
  @ApiOperation({
    operationId: 'findQaSessionsByUser',
    summary: 'ユーザーに紐づくQAセッション一覧を取得する',
  })
  @ApiResponse({
    status: 200,
    description: 'QAセッション一覧が取得されました',
    type: QaSessionListOutputDto,
  })
  async findQaSessionsByUser(@UserDecorator() user: User) {
    return this.qaService.findQaSessionsByUser(user);
  }

  @Delete('sessions/:uid')
  @ApiOperation({
    operationId: 'deleteQaSession',
    summary: 'QAセッションを削除する',
  })
  @ApiParam({ name: 'uid', description: 'QAセッションID' })
  @ApiResponse({ status: 200, description: 'QAセッションが削除されました' })
  @ApiResponse({ status: 404, description: 'QAセッションが見つかりません' })
  async deleteQaSession(@Param('uid') uid: string) {
    return this.qaService.deleteQaSession(uid);
  }

  @Post('question-answers')
  @ApiOperation({
    operationId: 'addQuestionAnswer',
    summary: 'QAセッションに質問回答を追加する',
  })
  @ApiResponse({
    status: 201,
    description: '質問回答が作成されました',
    type: QuestionAnswerOutputDto,
  })
  async addQuestionAnswer(
    @Body() createQuestionAnswerDto: CreateQuestionAnswerDto,
  ) {
    return this.qaService.addQuestionAnswer(createQuestionAnswerDto);
  }

  @Put('question-answers/:uid')
  @ApiOperation({
    operationId: 'updateQuestionAnswer',
    summary: '質問回答を更新する',
  })
  @ApiParam({ name: 'uid', description: '質問回答ID' })
  @ApiResponse({
    status: 200,
    description: '質問回答が更新されました',
    type: QuestionAnswerOutputDto,
  })
  @ApiResponse({ status: 404, description: '質問回答が見つかりません' })
  async updateQuestionAnswer(
    @Param('uid') uid: string,
    @UserDecorator() user: User,
    @Body() updateQuestionAnswerDto: UpdateQuestionAnswerDto,
  ) {
    return this.qaService.updateQuestionAnswer(
      uid,
      updateQuestionAnswerDto,
      user,
    );
  }

  @Delete('question-answers/:uid')
  @ApiOperation({
    operationId: 'deleteQuestionAnswer',
    summary: '質問回答を削除する',
  })
  @ApiParam({ name: 'uid', description: '質問回答ID' })
  @ApiResponse({ status: 200, description: '質問回答が削除されました' })
  @ApiResponse({ status: 404, description: '質問回答が見つかりません' })
  async deleteQuestionAnswer(@Param('uid') uid: string) {
    return this.qaService.deleteQuestionAnswer(uid);
  }

  @Post('sessions/:uid/upsert-question-answers')
  @ApiOperation({
    operationId: 'upsertQuestionAnswers',
    summary: 'QAセッションに紐づく質問回答を一括更新（置き換え）する',
  })
  @ApiResponse({
    status: 200,
    description: '質問回答が一括更新されました',
    type: QaSessionOutputDto,
  })
  @ApiResponse({ status: 404, description: 'QAセッションが見つかりません' })
  async upsertQuestionAnswers(
    @Param('uid') uid: string,
    @Body() upsertQuestionAnswersDto: UpsertQuestionAnswersDto,
    @UserDecorator() user: User,
  ) {
    return this.qaService.upsertQuestionAnswers(
      uid,
      upsertQuestionAnswersDto,
      user,
    );
  }

  @Get('sessions/:uid/extract')
  @ApiOperation({
    operationId: 'extractQaPairsFromTranscription',
    summary: '文字起こしから質問と回答のペアを抽出する',
  })
  @ApiParam({ name: 'uid', description: 'QAセッションID' })
  @ApiResponse({
    status: 200,
    description: '質問と回答のペアが抽出されました',
    type: ExtractQaPairsOutputDto,
  })
  async extractQaPairsFromTranscription(
    @Param('uid') uid: string,
    @UserDecorator() user: User,
  ) {
    return this.qaService.extractQaPairs(uid, user);
  }

  @Put('sessions/:uid/transcription')
  @ApiOperation({
    operationId: 'updateTranscription',
    summary: 'QAセッションの音声ファイルの文字起こしを更新する',
  })
  @ApiParam({ name: 'uid', description: 'QAセッションID' })
  @ApiResponse({
    status: 200,
    description: '音声ファイルの文字起こしが更新されました',
  })
  @ApiResponse({ status: 404, description: 'QAセッションが見つかりません' })
  async updateTranscription(
    @Param('uid') uid: string,
    @Body() transcriptionInputDto: TranscriptionInputDto,
    @UserDecorator() user: User,
  ) {
    return this.qaService.updateTranscription(uid, transcriptionInputDto, user);
  }
}
