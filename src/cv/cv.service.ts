import { ForbiddenException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CrudService } from '../common/crud/crud.service';
import { SkillService } from '../skill/skill.service';
import { UserEntity } from '../user/entities/user.entity';
import { isAdmin } from '../user/roles';
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

  // Un CIN déjà utilisé est rejeté par la contrainte unique et converti en 409 par UniqueViolationFilter.
  async createForUser({ skillIds, ...fields }: CreateCvDto, user: Pick<UserEntity, 'id'>): Promise<CvEntity> {
    const skills = await this.skillService.findByIds(skillIds ?? []);
    return this.create({ ...fields, skills, userId: user.id });
  }

  findAllForUser(user: UserEntity): Promise<CvEntity[]> {
    if (isAdmin(user)) return this.findAll();
    return this.repository.find({ where: { userId: user.id } });
  }

  async findOneForUser(id: number, user: UserEntity): Promise<CvEntity> {
    const cv = await this.findOne(id);
    if (!isAdmin(user)) this.assertOwner(cv, user);
    return cv;
  }

  async updateForUser(id: number, { skillIds, ...fields }: UpdateCvDto, user: UserEntity): Promise<CvEntity> {
    this.assertOwner(await this.findOne(id), user);
    const skills = skillIds === undefined ? undefined : await this.skillService.findByIds(skillIds);
    return this.update(id, { ...fields, ...(skills && { skills }) });
  }

  async removeForUser(id: number, user: UserEntity): Promise<void> {
    this.assertOwner(await this.findOne(id), user);
    await this.remove(id);
  }

  private assertOwner(cv: CvEntity, user: UserEntity): void {
    if (cv.userId !== user.id) {
      throw new ForbiddenException(`Le Cv ${cv.id} appartient à un autre utilisateur.`);
    }
  }
}
