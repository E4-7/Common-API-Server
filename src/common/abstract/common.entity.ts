import {CreateDateColumn, PrimaryGeneratedColumn, UpdateDateColumn,} from 'typeorm';

export abstract class CommonEntity {
  @PrimaryGeneratedColumn({type: 'int', name: 'id'})
  id: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
