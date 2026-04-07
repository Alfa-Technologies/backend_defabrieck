import { Resolver, Query, Mutation, Args, ID } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { TemplatesService } from './templates.service';
import { Template } from './entities/template.entity';
import { CreateTemplateInput } from './dto/create-template.input';
import { UpdateTemplateInput } from './dto/update-template.input';
import { JwtAuthGuard } from '../../iam/auth/guards/jwt-auth.guard';
import { PaginationArgs } from '../dto/args/pagination.args';

@Resolver(() => Template)
@UseGuards(JwtAuthGuard)
export class TemplatesResolver {
  constructor(private readonly templatesService: TemplatesService) {}

  @Mutation(() => Template)
  createTemplate(
    @Args('createTemplateInput') createInput: CreateTemplateInput,
  ): Promise<Template> {
    return this.templatesService.create(createInput);
  }

  @Query(() => [Template], { name: 'templates' })
  findAll(@Args() paginationArgs: PaginationArgs): Promise<Template[]> {
    return this.templatesService.findAll(paginationArgs);
  }

  @Query(() => Template, { name: 'templateByCode' })
  findByCode(
    @Args('code', { type: () => String }) code: string,
  ): Promise<Template> {
    return this.templatesService.findByCode(code);
  }

  @Mutation(() => Template)
  updateTemplate(
    @Args('updateTemplateInput') updateInput: UpdateTemplateInput,
  ): Promise<Template> {
    return this.templatesService.update(updateInput.id, updateInput);
  }

  @Mutation(() => Template)
  removeTemplate(
    @Args('id', { type: () => ID }) id: string,
  ): Promise<Template> {
    return this.templatesService.remove(id);
  }
}
