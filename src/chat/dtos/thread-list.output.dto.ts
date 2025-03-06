import { ApiProperty } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';

export class ThreadListItemOutputDto {
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
}

export class ThreadListOutputDto {
  @ApiProperty({ type: [ThreadListItemOutputDto] })
  @Expose()
  items: ThreadListItemOutputDto[];

  @ApiProperty()
  @Expose()
  total: number;
}
