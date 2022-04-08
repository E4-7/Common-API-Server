import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  UpdateDateColumn,
} from 'typeorm';
import { Exams } from './exam.entity';
import { Users } from '../../users/entities/user.entity';

@Index('UserId', ['UserId'], {})
@Entity('examusers')
export class ExamUsers {
  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column('int', { primary: true, name: 'ExamId' })
  ExamId: number;

  @Column('int', { primary: true, name: 'UserId' })
  UserId: number;

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
