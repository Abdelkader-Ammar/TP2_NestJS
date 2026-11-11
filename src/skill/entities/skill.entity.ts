import { Column, Entity, ManyToMany, PrimaryGeneratedColumn } from 'typeorm';
import { TimestampEntity } from '../../common/entities/timestamp.entity';
import { CvEntity } from '../../cv/entities/cv.entity';

@Entity('skills')
export class SkillEntity extends TimestampEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 50, unique: true })
  designation: string;

  @ManyToMany(() => CvEntity, (cv) => cv.skills)
  cvs: CvEntity[];
}
