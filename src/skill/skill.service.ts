import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { CrudService } from '../common/crud/crud.service';
import { CreateSkillDto } from './dto/create-skill.dto';
import { SkillEntity } from './entities/skill.entity';

@Injectable()
export class SkillService extends CrudService<SkillEntity> {
  constructor(@InjectRepository(SkillEntity) repository: Repository<SkillEntity>) {
    super(repository, 'Skill');
  }

  async create(dto: CreateSkillDto): Promise<SkillEntity> {
    const existing = await this.repository.findOneBy({ designation: dto.designation });
    if (existing) {
      throw new ConflictException(`La skill ${dto.designation} existe déjà.`);
    }
    return super.create(dto);
  }

  async findByIds(ids: number[]): Promise<SkillEntity[]> {
    const uniqueIds = [...new Set(ids)];
    if (!uniqueIds.length) return [];
    const skills = await this.repository.findBy({ id: In(uniqueIds) });
    const missing = uniqueIds.filter((id) => !skills.some((skill) => skill.id === id));
    if (missing.length) {
      throw new NotFoundException(`Skills introuvables : ${missing.join(', ')}.`);
    }
    return skills;
  }
}
