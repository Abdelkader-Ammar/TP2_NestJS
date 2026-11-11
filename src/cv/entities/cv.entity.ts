import { Column, Entity, JoinColumn, JoinTable, ManyToMany, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { TimestampEntity } from '../../common/entities/timestamp.entity';
import { SkillEntity } from '../../skill/entities/skill.entity';
import { UserEntity } from '../../user/entities/user.entity';

@Entity('cvs')
export class CvEntity extends TimestampEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 50 })
  name: string;

  @Column({ length: 50 })
  firstname: string;

  @Column({ type: 'int' })
  age: number;

  @Column({ type: 'int', unique: true })
  cin: number;

  @Column({ length: 100 })
  job: string;

  @Column()
  path: string;

  @Column()
  userId: number;

  @ManyToOne(() => UserEntity, (user) => user.cvs, { onDelete: 'CASCADE', nullable: false })
  @JoinColumn({ name: 'userId' })
  user: UserEntity;

  @ManyToMany(() => SkillEntity, (skill) => skill.cvs, { eager: true })
  @JoinTable({ name: 'cv_skills' })
  skills: SkillEntity[];
}
