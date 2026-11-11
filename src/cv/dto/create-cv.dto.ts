import { Type } from 'class-transformer';
import { IsArray, IsInt, IsNotEmpty, IsOptional, IsString, Length, Max, Min } from 'class-validator';
import { validationMessages as messages } from './validation-messages';

export class CreateCvDto {
  @IsString({ message: messages.nameString })
  @Length(2, 50, { message: messages.nameLength })
  name: string;

  @IsString({ message: messages.firstnameString })
  @Length(2, 50, { message: messages.firstnameLength })
  firstname: string;

  @Type(() => Number)
  @IsInt({ message: messages.age })
  @Min(16, { message: messages.age })
  @Max(100, { message: messages.age })
  age: number;

  @Type(() => Number)
  @IsInt({ message: messages.cin })
  @Min(1, { message: messages.cin })
  @Max(99999999, { message: messages.cin })
  cin: number;

  @IsString({ message: messages.jobString })
  @Length(2, 100, { message: messages.jobLength })
  job: string;

  @IsString({ message: messages.path })
  @IsNotEmpty({ message: messages.path })
  path: string;

  @IsOptional()
  @IsArray({ message: messages.skillIds })
  @IsInt({ each: true, message: messages.skillIds })
  skillIds?: number[];
}
