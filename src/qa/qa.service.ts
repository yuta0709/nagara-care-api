import {
  HttpException,
  HttpStatus,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import {
  CreateQaSessionDto,
  CreateQuestionAnswerDto,
  ExtractQaPairsDto,
  UpdateQuestionAnswerDto,
  UpsertQuestionAnswersDto,
} from './dtos';
import { extractQuestionsAndAnswers } from './lllm/extractor';
import { QaSessionOutputDto } from './dtos/qa-session.output.dto';
import { QaSessionListOutputDto } from './dtos/qa-session-list.output.dto';
import { plainToInstance } from 'class-transformer';
import { User } from '@prisma/client';
import { ExtractQaPairsOutputDto } from './dtos/extract-qa-pairs.output.dto';
import { TranscriptionInputDto } from './dtos/transcription.input.dto';

@Injectable()
export class QaService {
  constructor(private readonly prisma: PrismaService) {}

  async createQaSession(createQaSessionDto: CreateQaSessionDto, user: User) {
    return this.prisma.qaSession.create({
      data: {
        userUid: user.uid,
        title: createQaSessionDto.title,
      },
    });
  }

  async findQaSession(uid: string) {
    const qaSession = await this.prisma.qaSession.findUnique({
      where: { uid },
      include: {
        questionAnswers: true,
      },
    });

    if (!qaSession) {
      throw new NotFoundException(`QAセッション(ID: ${uid})が見つかりません`);
    }

    return plainToInstance(QaSessionOutputDto, qaSession);
  }

  async findQaSessionsByUser(user: User): Promise<QaSessionListOutputDto> {
    const qaSessions = await this.prisma.qaSession.findMany({
      where: { userUid: user.uid },
      include: {
        questionAnswers: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
    return plainToInstance(QaSessionListOutputDto, {
      items: qaSessions,
      total: qaSessions.length,
    });
  }

  async deleteQaSession(uid: string) {
    // 存在確認
    await this.findQaSession(uid);

    return this.prisma.qaSession.delete({
      where: { uid },
    });
  }

  async addQuestionAnswer(createQuestionAnswerDto: CreateQuestionAnswerDto) {
    // QAセッションの存在確認
    await this.findQaSession(createQuestionAnswerDto.qaSessionUid);

    return this.prisma.questionAnswer.create({
      data: {
        qaSessionUid: createQuestionAnswerDto.qaSessionUid,
        question: createQuestionAnswerDto.question,
        answer: createQuestionAnswerDto.answer,
      },
    });
  }

  async updateQuestionAnswer(
    uid: string,
    updateQuestionAnswerDto: UpdateQuestionAnswerDto,
    user: User,
  ) {
    // 質問回答の存在確認
    const questionAnswer = await this.prisma.questionAnswer.findUnique({
      where: { uid },
      include: {
        qaSession: true,
      },
    });

    if (!questionAnswer) {
      throw new NotFoundException(`質問回答(ID: ${uid})が見つかりません`);
    }

    if (questionAnswer.qaSession.userUid !== user.uid) {
      throw new HttpException(
        '質問回答の更新権限がありません',
        HttpStatus.FORBIDDEN,
      );
    }

    return this.prisma.questionAnswer.update({
      where: { uid },
      data: {
        question: updateQuestionAnswerDto.question,
        answer: updateQuestionAnswerDto.answer,
      },
    });
  }

  async deleteQuestionAnswer(uid: string) {
    // 質問回答の存在確認
    const questionAnswer = await this.prisma.questionAnswer.findUnique({
      where: { uid },
    });

    if (!questionAnswer) {
      throw new NotFoundException(`質問回答(ID: ${uid})が見つかりません`);
    }

    return this.prisma.questionAnswer.delete({
      where: { uid },
    });
  }

  async upsertQuestionAnswers(
    uid: string,
    upsertQuestionAnswersDto: UpsertQuestionAnswersDto,
    user: User,
  ) {
    const { questionAnswers } = upsertQuestionAnswersDto;

    // QAセッションの存在確認
    const session = await this.prisma.qaSession.findUnique({
      where: { uid },
      include: {
        user: true,
      },
    });

    if (!session) {
      throw new NotFoundException(`QAセッション(ID: ${uid})が見つかりません`);
    }

    if (session.userUid !== user.uid) {
      throw new HttpException(
        'QAセッションの更新権限がありません',
        HttpStatus.FORBIDDEN,
      );
    }

    // 質問回答の存在確認
    const existingQuestionAnswers = await this.prisma.questionAnswer.findMany({
      where: { qaSessionUid: uid },
    });

    // トランザクションを使用して、既存の質問回答を削除し、新しい質問回答を作成する
    const qaSession = await this.prisma.$transaction(async (prisma) => {
      // 既存の質問回答を削除
      await prisma.questionAnswer.deleteMany({
        where: { qaSessionUid: uid },
      });

      // 新しい質問回答を作成
      for (const qa of questionAnswers) {
        await prisma.questionAnswer.create({
          data: {
            qaSessionUid: uid,
            question: qa.question,
            answer: qa.answer,
          },
        });
      }

      // 更新されたQAセッションを返す
      return prisma.qaSession.findUnique({
        where: { uid },
        include: {
          questionAnswers: true,
        },
      });
    });

    return plainToInstance(QaSessionOutputDto, qaSession);
  }

  async extractQaPairs(uid: string, user: User) {
    const session = await this.prisma.qaSession.findUnique({
      where: { uid },
      include: {
        questionAnswers: true,
      },
    });

    if (!session) {
      throw new NotFoundException(`QAセッション(ID: ${uid})が見つかりません`);
    }

    if (session.userUid !== user.uid) {
      throw new HttpException(
        'QAセッションの更新権限がありません',
        HttpStatus.FORBIDDEN,
      );
    }

    return plainToInstance(
      ExtractQaPairsOutputDto,
      extractQuestionsAndAnswers(session.transcription),
    );
  }

  async updateTranscription(
    uid: string,
    transcriptionInputDto: TranscriptionInputDto,
    user: User,
  ) {
    // QAセッションの存在確認
    const session = await this.prisma.qaSession.findUnique({
      where: { uid },
      include: {
        user: true,
      },
    });

    if (!session) {
      throw new NotFoundException(`QAセッション(ID: ${uid})が見つかりません`);
    }

    if (session.userUid !== user.uid) {
      throw new HttpException(
        'QAセッションの更新権限がありません',
        HttpStatus.FORBIDDEN,
      );
    }

    return this.prisma.qaSession.update({
      where: { uid },
      data: { transcription: transcriptionInputDto.transcription },
    });
  }
}
