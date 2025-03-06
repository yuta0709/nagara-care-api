import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import { MessageOutputDto } from './message.output.dto';

export class ThreadOutputDto {
  @ApiProperty()
  @Expose()
  uid: string;

  @ApiProperty()
  @Expose()
  title: string;

  @ApiProperty()
  @Expose()
  createdByUid: string;

  @ApiProperty()
  @Expose()
  createdAt: Date;

  @ApiProperty()
  @Expose()
  updatedAt: Date;

  @ApiProperty({ type: [MessageOutputDto] })
  @Expose()
  messages: MessageOutputDto[];
}
