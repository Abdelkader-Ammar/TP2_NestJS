import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CrudService } from '../common/crud/crud.service';
import { UserEntity } from './entities/user.entity';

@Injectable()
export class UserService extends CrudService<UserEntity> {
  constructor(@InjectRepository(UserEntity) repository: Repository<UserEntity>) {
    super(repository, 'Utilisateur');
  }

  findById(id: number): Promise<UserEntity | null> {
    return this.repository.findOne({ where: { id } });
  }

  findByUsername(username: string): Promise<UserEntity | null> {
    return this.repository.findOne({ where: { username } });
  }

  // password est en select: false, on le sélectionne explicitement avec le QueryBuilder.
  findByUsernameWithPassword(username: string): Promise<UserEntity | null> {
    return this.repository
      .createQueryBuilder('user')
      .select(['user.id', 'user.username', 'user.email', 'user.password', 'user.role'])
      .where('user.username = :username', { username })
      .getOne();
  }

  updateRole(id: number, role: string): Promise<UserEntity> {
    return this.update(id, { role });
  }
}
