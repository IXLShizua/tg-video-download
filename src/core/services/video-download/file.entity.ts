import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('files')
export class FileEntity {
  @PrimaryGeneratedColumn('increment')
  id!: number;

  @Column()
  file_id!: string;

  @Column()
  url!: string;
}
