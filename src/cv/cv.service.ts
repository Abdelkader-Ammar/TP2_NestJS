import { ConflictException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CrudService } from '../common/crud/crud.service';
import { SkillService } from '../skill/skill.service';
import { UserEntity } from '../user/entities/user.entity';
import { CreateCvDto } from './dto/create-cv.dto';
import { UpdateCvDto } from './dto/update-cv.dto';
import { CvEntity } from './entities/cv.entity';

@Injectable()
export class CvService extends CrudService<CvEntity> {
  constructor(
    @InjectRepository(CvEntity) repository: Repository<CvEntity>,
    private readonly skillService: SkillService,
  ) {
    super(repository, 'Cv');
  }

  async createForUser({ skillIds, ...fields }: CreateCvDto, user: Pick<UserEntity, 'id'>): Promise<CvEntity> {
    await this.assertCinAvailable(fields.cin);
    const skills = await this.skillService.findByIds(skillIds ?? []);
    return this.create({ ...fields, skills, userId: user.id });
  }

  private async assertCinAvailable(cin: number): Promise<void> {
    if (await this.repository.count({ where: { cin } })) {
      throw new ConflictException(`Un Cv avec le CIN ${cin} existe déjà.`);
    }
  }
}
