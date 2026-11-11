import { IsString } from 'class-validator';
import { validationMessages as messages } from './validation-messages';

export class LoginDto {
  @IsString({ message: messages.usernameString })
  username: string;

  @IsString({ message: messages.passwordString })
  password: string;
}
