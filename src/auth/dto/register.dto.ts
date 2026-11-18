import { IsEmail, IsString, Length, MaxLength, MinLength } from 'class-validator';
import { validationMessages as messages } from './validation-messages';

export class RegisterDto {
  @IsString({ message: messages.usernameString })
  @Length(3, 50, { message: messages.usernameLength })
  username: string;

  @IsEmail({}, { message: messages.emailInvalid })
  email: string;

  @IsString({ message: messages.passwordString })
  @MinLength(8, { message: messages.passwordLength })
  @MaxLength(72, { message: messages.passwordLength })
  password: string;
}
