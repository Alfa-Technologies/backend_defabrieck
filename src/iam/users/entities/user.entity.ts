import { ObjectType, Field, ID } from '@nestjs/graphql';
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  OneToOne,
  JoinColumn,
} from 'typeorm';
import { ValidRoles } from '../../auth/enums/valid-roles.enum';
import { Employee } from '../../employees/entities/employee.entity';
import { CompanyContact } from '../../../crm/company-contacts/entities/company-contact.entity';

@ObjectType()
@Entity({ name: 'users' })
export class User {
  @Field(() => ID)
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Field(() => String)
  @Column('text', { unique: true })
  email: string;

  @Field(() => [ValidRoles])
  @Column('text', { array: true, default: [ValidRoles.user] })
  roles: ValidRoles[];

  @Field(() => Boolean)
  @Column('bool', { default: true })
  isActive: boolean;

  @Field(() => String, { nullable: true })
  @Column('text', { nullable: true, unique: true })
  firebaseUid?: string;

  @Field(() => String, { nullable: true })
  @Column('text', { nullable: true })
  createdBy?: string;

  @Field(() => String, { nullable: true })
  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @Field(() => String, { nullable: true })
  @Column('text', { nullable: true })
  lastUpdateBy?: string;

  @Field(() => String, { nullable: true })
  @UpdateDateColumn({ type: 'timestamptz' })
  lastUpdate: Date;

  @OneToOne(() => Employee, { nullable: true })
  @JoinColumn({ name: 'employee_id' })
  @Field(() => Employee, { nullable: true })
  employee?: Employee;

  @Column({ name: 'employee_id', nullable: true })
  employeeId?: string;

  @OneToOne(() => CompanyContact, { nullable: true })
  @JoinColumn({ name: 'company_contact_id' })
  @Field(() => CompanyContact, { nullable: true })
  companyContact?: CompanyContact;

  @Column({ name: 'company_contact_id', nullable: true })
  companyContactId?: string;
}
