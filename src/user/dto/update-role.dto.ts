import { IsString, Length, Matches } from 'class-validator';
import { validationMessages as messages } from './validation-messages';

export class UpdateRoleDto {
  @IsString({ message: messages.roleString })
  @Length(2, 30, { message: messages.roleLength })
  @Matches(/^[a-z0-9_-]+$/, { message: messages.rolePattern })
  role: string;
}
