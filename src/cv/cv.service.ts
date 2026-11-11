import { ConflictException, ForbiddenException, Injectable } from '@nestjs/common';
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

  async createForUser({ skillIds, ...fields }: CreateCvDto, user: Pick<UserEntity, 'id'>): Promise<CvEntity> {
    await this.assertCinAvailable(fields.cin);
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
    const cv = await this.findOne(id);
    this.assertOwner(cv, user);
    if (fields.cin !== undefined && fields.cin !== cv.cin) await this.assertCinAvailable(fields.cin);
    const skills = skillIds === undefined ? cv.skills : await this.skillService.findByIds(skillIds);
    const updated = await this.repository.preload({ id, ...fields, skills });
    if (!updated) this.notFound(id);
    return this.repository.save(updated);
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

  private async assertCinAvailable(cin: number): Promise<void> {
    if (await this.repository.count({ where: { cin } })) {
      throw new ConflictException(`Un Cv avec le CIN ${cin} existe déjà.`);
    }
  }
}
