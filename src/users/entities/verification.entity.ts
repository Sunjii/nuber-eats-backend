import { Field, InputType, ObjectType } from '@nestjs/graphql';
import { CoreEntity } from 'src/common/entities/core.entity';
import { Column, Entity, JoinColumn, OneToOne } from 'typeorm';
import { User } from './user.entity';

@InputType({ isAbstract: true })
@ObjectType()
@Entity()
export class Verification extends CoreEntity {
  // Verification has only one User
  // User has only one Verification

  @Column()
  @Field((tpye) => String)
  code: string;

  @OneToOne((type) => User)
  @JoinColumn()
  user: User;
}
