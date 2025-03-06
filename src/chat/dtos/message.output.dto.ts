import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';

export enum MessageRole {
  USER = 'USER',
  ASSISTANT = 'ASSISTANT',
}

export class MessageOutputDto {
  @ApiProperty()
  @Expose()
  uid: string;

  @ApiProperty()
  @Expose()
  threadUid: string;

  @ApiProperty()
  @Expose()
  content: string;

  @ApiProperty()
  @Expose()
  role: MessageRole;

  @ApiProperty()
  @Expose()
  createdAt: Date;

  @ApiProperty()
  @Expose()
  updatedAt: Date;
}
