import { IsString, Length } from 'class-validator';
import { validationMessages as messages } from './validation-messages';

export class CreateSkillDto {
  @IsString({ message: messages.designationString })
  @Length(2, 50, { message: messages.designationLength })
  designation: string;
}
