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
    return this.repository.findOneBy({ id });
  }

  findByUsername(username: string): Promise<UserEntity | null> {
    return this.repository.findOneBy({ username });
  }

  findByUsernameWithPassword(username: string): Promise<UserEntity | null> {
    return this.repository
      .createQueryBuilder('user')
      .addSelect('user.password')
      .where('user.username = :username', { username })
      .getOne();
  }

  async existsByUsernameOrEmail(username: string, email: string): Promise<boolean> {
    const count = await this.repository.count({ where: [{ username }, { email }] });
    return count > 0;
  }

  updateRole(id: number, role: string): Promise<UserEntity> {
    return this.update(id, { role });
  }
}
