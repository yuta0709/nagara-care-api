import { IsNotEmpty, IsString } from 'class-validator';

export class MessageCreateInputDto {
  @IsNotEmpty()
  @IsString()
  content: string;
}
