import { Module } from '@nestjs/common';
import { APP_FILTER } from '@nestjs/core';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { UniqueViolationFilter } from './common/filters/unique-violation.filter';
import { CvEntity } from './cv/entities/cv.entity';
import { CvModule } from './cv/cv.module';
import { SkillEntity } from './skill/entities/skill.entity';
import { SkillModule } from './skill/skill.module';
import { UserEntity } from './user/entities/user.entity';
import { UserModule } from './user/user.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        url: configService.get<string>('DATABASE_URL'),
        entities: [UserEntity, CvEntity, SkillEntity],
        synchronize: true,
      }),
    }),
    UserModule,
    SkillModule,
    CvModule,
    AuthModule,
  ],
  providers: [{ provide: APP_FILTER, useClass: UniqueViolationFilter }],
})
export class AppModule {}
