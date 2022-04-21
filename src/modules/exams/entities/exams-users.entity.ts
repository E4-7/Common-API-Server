import { Column, Entity, Index, JoinColumn, ManyToOne } from 'typeorm';
import { Exams } from './exams.entity';
import { Users } from '../../users/entities/users.entity';
import { CommonDateEntity } from '../../../common/abstract/common-date.entity';

@Index('UserId', ['UserId'], {})
@Index('ExamId', ['ExamId'], {})
@Entity('examusers')
export class ExamUsers extends CommonDateEntity {
  @Column('varchar', { primary: true, name: 'ExamId', length: 200 })
  ExamId: string;

  @Column('varchar', { primary: true, name: 'UserId', length: 200 })
  UserId: string;

  @ManyToOne(() => Exams, (exams) => exams.ExamUsers, {
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  })
  @JoinColumn([{ name: 'ExamId', referencedColumnName: 'id' }])
  Exam: Exams;

  @ManyToOne(() => Users, (users) => users.ExamUsers, {
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  })
  @JoinColumn([{ name: 'UserId', referencedColumnName: 'id' }])
  User: Users;
}
