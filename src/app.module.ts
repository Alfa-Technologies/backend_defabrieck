import { join } from 'path';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { ConfigModule } from '@nestjs/config';
import { Module } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

import { GraphQLModule } from '@nestjs/graphql';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ApolloServerPluginLandingPageLocalDefault } from '@apollo/server/plugin/landingPage/default';
import depthLimit from 'graphql-depth-limit';

import { SnakeNamingStrategy } from 'typeorm-naming-strategies';

// IAM Modules
import { UsersModule } from './iam/users/users.module';
import { AuthModule } from './iam/auth/auth.module';
import { EmployeesModule } from './iam/employees/employees.module';

// CRM Modules
import { CompaniesModule } from './crm/companies/companies.module';
import { PlantsModule } from './crm/plants/plants.module';
import { CompanyContactsModule } from './crm/company-contacts/company-contacts.module';

// Catalogs Modules
import { ReportTypesModule } from './catalogs/report-types/report-types.module';
import { PartCatalogModule } from './catalogs/part-catalog/part-catalog.module';
import { VisualAidDocumentsModule } from './catalogs/visual-aid-documents/visual-aid-documents.module';
import { VisualAidItemsModule } from './catalogs/visual-aid-items/visual-aid-items.module';
import { DefectTypesModule } from './catalogs/defect-types/defect-types.module';
import { DowntimeReasonsModule } from './catalogs/downtime-reasons/downtime-reasons.module';

// Operations Modules
import { ProjectsModule } from './operations/projects/projects.module';
import { ProjectPartsModule } from './operations/project-parts/project-parts.module';
import { ProjectReportConfigModule } from './operations/project-report-config/project-report-config.module';
import { LotsModule } from './operations/lots/lots.module';
import { ShiftsModule } from './operations/shifts/shifts.module';
import { PersonnelAssignmentsModule } from './operations/personnel-assignments/personnel-assignments.module';
import { DowntimeLogsModule } from './operations/downtime-logs/downtime-logs.module';
import { QualityAuditsModule } from './operations/quality-audits/quality-audits.module';
import { PpeChecksModule } from './operations/ppe-checks/ppe-checks.module';
import { AttendanceModule } from './operations/attendance/attendance.module';

// Common Modules
import { NotificationsModule } from './common/notifications/notifications.module';
import { TemplatesModule } from './common/templates/templates.module';

// Utils
import { formatError } from './common/utils';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),

    GraphQLModule.forRootAsync({
      driver: ApolloDriver,
      imports: [AuthModule],
      inject: [JwtService],
      useFactory: async (jwtService: JwtService) => ({
        autoSchemaFile: join(process.cwd(), 'src/schema.gql'),
        playground: false,
        introspection: true,
        plugins: [ApolloServerPluginLandingPageLocalDefault()],

        validationRules: [depthLimit(5)],
        context: ({ req }) => ({ req }),

        formatError,
      }),
    }),

    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST,
      port: +process.env.DB_PORT!,
      database: process.env.DB_NAME,
      username: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      url: process.env.DB_URL,
      ssl:
        process.env.DB_SSL === 'true'
          ? {
              rejectUnauthorized: false,
            }
          : false,
      autoLoadEntities: true,
      synchronize: true,
      namingStrategy: new SnakeNamingStrategy(),
    }),

    // IAM Modules
    UsersModule,
    AuthModule,
    EmployeesModule,

    // CRM Modules
    CompaniesModule,
    PlantsModule,
    CompanyContactsModule,

    // Catalogs Modules
    ReportTypesModule,
    PartCatalogModule,
    VisualAidDocumentsModule,
    VisualAidItemsModule,
    DefectTypesModule,
    DowntimeReasonsModule,

    // Operations Modules
    ProjectsModule,
    ProjectPartsModule,
    ProjectReportConfigModule,
    LotsModule,
    ShiftsModule,
    PersonnelAssignmentsModule,
    DowntimeLogsModule,
    QualityAuditsModule,
    PpeChecksModule,
    AttendanceModule,

    // Common Modules
    NotificationsModule,
    TemplatesModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
