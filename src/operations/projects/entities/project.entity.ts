import { ObjectType, Field, ID, Float, Int } from '@nestjs/graphql';
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  OneToMany,
  OneToOne,
} from 'typeorm';
import GraphQLJSON from 'graphql-type-json';
import { Company } from '../../../crm/companies/entities/company.entity';
import { Plant } from '../../../crm/plants/entities/plant.entity';
import { ReportType } from '../../../catalogs/report-types/entities/report-type.entity';
import { CompanyContact } from '../../../crm/company-contacts/entities/company-contact.entity';
import { ProjectReportConfig } from '../../project-report-config/entities/project-report-config.entity';
import { ProjectPart } from '../../project-parts/entities/project-part.entity';
import { ProjectStatus } from '../../constants/project-status.enum';
import { ProjectProcessFlow } from './project-process-flow.entity';
import { ProjectLog } from './project-log.entity';
import { Shift } from '../../shifts/entities/shift.entity';
import { Employee } from '../../../iam/employees/entities/employee.entity';

@ObjectType()
@Entity({ name: 'projects' })
export class Project {
  @Field(() => ID)
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Company, { lazy: true })
  @JoinColumn({ name: 'customer_id' })
  @Field(() => Company)
  customer: Company;

  @Column('text', { name: 'customer_id' })
  customerId: string;

  @ManyToOne(() => Company, { lazy: true })
  @JoinColumn({ name: 'final_customer_id' })
  @Field(() => Company)
  finalCustomer: Company;

  @Column('text', { name: 'final_customer_id' })
  finalCustomerId: string;

  @ManyToOne(() => Plant, { lazy: true })
  @JoinColumn({ name: 'plant_id' })
  @Field(() => Plant)
  plant: Plant;

  @Column('text', { name: 'plant_id' })
  plantId: string;

  @ManyToOne(() => ReportType, { lazy: true })
  @JoinColumn({ name: 'report_type_id' })
  @Field(() => ReportType)
  reportType: ReportType;

  @Column('text', { name: 'report_type_id' })
  reportTypeId: string;

  @ManyToOne(() => CompanyContact, { lazy: true })
  @JoinColumn({ name: 'customer_contact_id' })
  @Field(() => CompanyContact)
  customerContact: CompanyContact;

  @Column('text', { name: 'customer_contact_id' })
  customerContactId: string;

  @ManyToOne(() => CompanyContact, { lazy: true })
  @JoinColumn({ name: 'final_customer_contact_id' })
  @Field(() => CompanyContact)
  finalCustomerContact: CompanyContact;

  @Column('text', { name: 'final_customer_contact_id' })
  finalCustomerContactId: string;

  @ManyToOne(() => Employee, { lazy: true })
  @JoinColumn({ name: 'internal_lead_id' })
  @Field(() => Employee)
  internalLead: Employee;

  @Column('text', { name: 'internal_lead_id' })
  internalLeadId: string;

  @Field(() => String)
  @Column({
    type: 'text',
    default: ProjectStatus.DRAFT,
  })
  status: ProjectStatus;

  @Field(() => String, { nullable: true })
  @Column('text', { nullable: true })
  activeRejectionReason?: string;

  @Field(() => Date, { nullable: true })
  @Column('timestamptz', { nullable: true })
  customerSignedAt?: Date;

  @Field(() => Date, { nullable: true })
  @Column('timestamptz', { nullable: true })
  finalCustomerSignedAt?: Date;

  @Field(() => Date, { nullable: true })
  @Column('timestamptz', { nullable: true })
  internalSignedAt?: Date;

  @Field(() => String, { nullable: true })
  @Column('text', { nullable: true })
  customerSignatureUrl?: string;

  @Field(() => String, { nullable: true })
  @Column('text', { nullable: true })
  finalCustomerSignatureUrl?: string;

  @Field(() => String, { nullable: true })
  @Column('text', { nullable: true })
  internalSignatureUrl?: string;

  @Field(() => String)
  @Column('text')
  jobDescription: string;

  @Field(() => String)
  @Column('text')
  scope: string;

  @Field(() => String, { nullable: true })
  @Column('date', { nullable: true })
  startDate?: Date;

  @Field(() => String, { nullable: true })
  @Column('date', { nullable: true })
  endDateEst?: Date;

  @Field(() => Int)
  @Column('int')
  inspectorsAssigned: number;

  @Field(() => String, { nullable: true })
  @Column('text', { default: 'N/A', nullable: true })
  inspectionVerificationText?: string;

  @Field(() => String)
  @Column('timestamptz')
  cleanPointDate: Date;

  @Field(() => Boolean)
  @Column('bool', { default: false })
  requiresRework: boolean;

  @Field(() => String, { nullable: true })
  @Column('text', { nullable: true })
  reworkVerificationText?: string;

  @Field(() => GraphQLJSON)
  @Column('jsonb')
  verificationMethods: any;

  @Field(() => GraphQLJSON)
  @Column('jsonb')
  environmentConditions: any;

  @Field(() => GraphQLJSON)
  @Column('jsonb')
  requiredShifts: any;

  @Field(() => Float, { nullable: true })
  @Column('decimal', { nullable: true })
  unitPrice?: number;

  @Field(() => Int, { nullable: true })
  @Column('int', { nullable: true })
  pieceCount?: number;

  @Field(() => String, { nullable: true })
  @Column('text', { nullable: true })
  billingType?: string;

  @Field(() => Boolean)
  @Column('bool', { default: true })
  isActive: boolean;

  @Field(() => String)
  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @Field(() => String)
  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;

  @OneToOne(() => ProjectReportConfig, (config) => config.project)
  reportConfig: ProjectReportConfig;

  @OneToMany(() => ProjectLog, (log) => log.project, { lazy: true })
  @Field(() => [ProjectLog], { nullable: true })
  logs?: ProjectLog[];

  @OneToMany(() => ProjectPart, (part) => part.project)
  parts: ProjectPart[];

  @OneToMany(() => Shift, (shift) => shift.project, {
    lazy: true,
    cascade: true,
  })
  @Field(() => [Shift], { nullable: true })
  shifts?: Shift[];

  @OneToMany(() => ProjectProcessFlow, (flow) => flow.project, {
    lazy: true,
    cascade: true,
  })
  @Field(() => [ProjectProcessFlow], { nullable: true })
  processFlows?: ProjectProcessFlow[];
}
