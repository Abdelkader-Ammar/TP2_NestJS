import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UserEntity } from '../user/entities/user.entity';
import { DEFAULT_ROLE } from '../user/roles';
import { UserService } from '../user/user.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { JwtPayload } from './interfaces/jwt-payload.interface';
import { PublicUser } from './interfaces/public-user.interface';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
  ) {}

  // Les doublons username / email sont rejetés par les contraintes unique et convertis en 409 par UniqueViolationFilter.
  async register({ username, email, password }: RegisterDto): Promise<PublicUser> {
    const salt = await bcrypt.genSalt();
    const user = await this.userService.create({
      username,
      email,
      password: await bcrypt.hash(password, salt),
      role: DEFAULT_ROLE,
    });
    return { id: user.id, username: user.username, email: user.email, role: user.role };
  }

  async validateCredentials({ username, password }: LoginDto): Promise<UserEntity> {
    const user = await this.userService.findByUsernameWithPassword(username);
    if (!user || !(await bcrypt.compare(password, user.password))) {
      throw new UnauthorizedException('Identifiants invalides.');
    }
    return user;
  }

  async login(dto: LoginDto): Promise<{ access_token: string }> {
    const user = await this.validateCredentials(dto);
    const payload: JwtPayload = {
      userId: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
    };
    return { access_token: this.jwtService.sign(payload) };
  }
}
