import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { CrudService } from '../common/crud/crud.service';
import { SkillEntity } from './entities/skill.entity';

@Injectable()
export class SkillService extends CrudService<SkillEntity> {
  constructor(@InjectRepository(SkillEntity) repository: Repository<SkillEntity>) {
    super(repository, 'Skill');
  }

  async findByIds(ids: number[]): Promise<SkillEntity[]> {
    const uniqueIds = [...new Set(ids)];
    if (!uniqueIds.length) return [];
    const skills = await this.repository.find({ where: { id: In(uniqueIds) } });
    const missing = uniqueIds.filter((id) => !skills.some((skill) => skill.id === id));
    if (missing.length) {
      throw new NotFoundException(`Skills introuvables : ${missing.join(', ')}.`);
    }
    return skills;
  }
}
