import { Resolver, Query, Args } from '@nestjs/graphql';
import { UseGuards, UnauthorizedException } from '@nestjs/common';
import { ProductionDashboardService } from './production-dashboard.service';
import { DashboardResponse } from './types';
import { JwtAuthGuard } from '../../iam/auth/guards/jwt-auth.guard';
import { CurrentUser } from '../../iam/auth/decorators/current-user.decorator';
import { User } from '../../iam/users/entities/user.entity';
import { ValidRoles } from '../../iam/auth/enums/valid-roles.enum';

@Resolver()
export class ProductionDashboardResolver {
  private readonly clientRoles = [
    ValidRoles.customer,
    ValidRoles.finalCustomer,
  ];

  constructor(
    private readonly productionDashboardService: ProductionDashboardService,
  ) {}

  @Query(() => DashboardResponse, { name: 'productionDashboard' })
  @UseGuards(JwtAuthGuard)
  async getProductionDashboard(
    @Args('company', { type: () => String, nullable: true }) company?: string,
    @Args('plant', { type: () => String, nullable: true }) plant?: string,
    @Args('quoteId', { type: () => String, nullable: true }) quoteId?: string,
    @CurrentUser() currentUser?: User,
  ): Promise<DashboardResponse> {
    this.validateClientAccess(currentUser!, company);

    return this.productionDashboardService.getDashboardSummary(
      company,
      plant,
      currentUser,
      quoteId,
    );
  }

  private validateClientAccess(
    currentUser: User,
    requestedCompany?: string,
  ): void {
    const isClient = currentUser.roles.some((role) =>
      this.clientRoles.includes(role as ValidRoles),
    );

    if (!isClient) {
      return;
    }

    const userCompanyId = currentUser.companyContact?.companyId;

    if (!userCompanyId) {
      throw new UnauthorizedException(
        'Client user does not have an associated company',
      );
    }

    if (requestedCompany && requestedCompany !== userCompanyId) {
      throw new UnauthorizedException(
        'You are not authorized to access data from this company',
      );
    }
  }
}
