import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SkillModule } from '../skill/skill.module';
import { CvController } from './cv.controller';
import { CvService } from './cv.service';
import { CvEntity } from './entities/cv.entity';

@Module({
  imports: [TypeOrmModule.forFeature([CvEntity]), SkillModule],
  controllers: [CvController],
  providers: [CvService],
  exports: [CvService],
})
export class CvModule {}
