import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { CommonModule } from './common/common.module';
import { CvEntity } from './cv/entities/cv.entity';
import { CvModule } from './cv/cv.module';
import { SkillEntity } from './skill/entities/skill.entity';
import { SkillModule } from './skill/skill.module';
import { UserEntity } from './user/entities/user.entity';
import { UserModule } from './user/user.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    CommonModule,
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
  ],
})
export class AppModule {}
