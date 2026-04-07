import {
  Resolver,
  Query,
  Mutation,
  Args,
  ID,
  ResolveField,
  Parent,
} from '@nestjs/graphql';
import { ParseUUIDPipe } from '@nestjs/common';
import { VisualAidDocumentsService } from './visual-aid-documents.service';
import { VisualAidDocument } from './entities/visual-aid-document.entity';
import {
  CreateVisualAidDocumentInput,
  UpdateVisualAidDocumentInput,
} from './dto';
import { PaginationArgs } from '../../common/dto/args/pagination.args';
import { User } from '../../iam/users/entities/user.entity';
import { CurrentUser } from '../../iam/auth/decorators/current-user.decorator';
import { JwtAuthGuard } from '../../iam/auth/guards/jwt-auth.guard';
import { UseGuards } from '@nestjs/common';
import { VisualAidStatusGuard } from '../../common/guards/visual-aid-status.guard';
import { ProjectPart } from '../../operations/project-parts/entities/project-part.entity';
import { VisualAidLog } from '../../operations/projects/entities/visual-aid-log.entity';
import { VisualAidDocumentsLoader } from './visual-aid-documents.loader';

@Resolver(() => VisualAidDocument)
@UseGuards(JwtAuthGuard)
export class VisualAidDocumentsResolver {
  constructor(
    private readonly visualAidService: VisualAidDocumentsService,
    private readonly visualAidDocumentsLoader: VisualAidDocumentsLoader,
  ) {}

  @Mutation(() => VisualAidDocument, { name: 'createVisualAidDocument' })
  createVisualAidDocument(
    @Args('createVisualAidDocumentInput')
    createInput: CreateVisualAidDocumentInput,
    @CurrentUser() user: User,
  ): Promise<VisualAidDocument> {
    return this.visualAidService.create(createInput, user);
  }

  @Query(() => [VisualAidDocument], { name: 'visualAidDocuments' })
  findAll(
    @Args() paginationArgs: PaginationArgs,
  ): Promise<VisualAidDocument[]> {
    return this.visualAidService.findAll(paginationArgs);
  }

  @Query(() => VisualAidDocument, { name: 'visualAidDocument' })
  findOne(
    @Args('id', { type: () => ID }, ParseUUIDPipe) id: string,
  ): Promise<VisualAidDocument> {
    return this.visualAidService.findOne(id);
  }

  @Mutation(() => VisualAidDocument, { name: 'updateVisualAidDocument' })
  @UseGuards(VisualAidStatusGuard)
  updateVisualAidDocument(
    @Args('updateVisualAidDocumentInput')
    updateInput: UpdateVisualAidDocumentInput,
    @CurrentUser() user: User,
  ): Promise<VisualAidDocument> {
    return this.visualAidService.update(updateInput.id, updateInput, user);
  }

  @Mutation(() => VisualAidDocument, { name: 'removeVisualAidDocument' })
  removeVisualAidDocument(
    @Args('id', { type: () => ID }, ParseUUIDPipe) id: string,
    @Args('isActive', { type: () => Boolean, defaultValue: false })
    isActive: boolean,
    @CurrentUser() user: User,
  ): Promise<VisualAidDocument> {
    return this.visualAidService.remove(id, isActive, user);
  }

  @Mutation(() => VisualAidDocument, { name: 'signVisualAidAsCustomer' })
  signVisualAidAsCustomer(
    @Args('id', { type: () => ID }, ParseUUIDPipe) id: string,
    @Args('signatureUrl') signatureUrl: string,
    @CurrentUser() user: User,
  ): Promise<VisualAidDocument> {
    return this.visualAidService.signVisualAidAsCustomer(
      id,
      signatureUrl,
      user,
    );
  }

  @Mutation(() => VisualAidDocument, { name: 'signVisualAidAsFinalCustomer' })
  signVisualAidAsFinalCustomer(
    @Args('id', { type: () => ID }, ParseUUIDPipe) id: string,
    @Args('signatureUrl') signatureUrl: string,
    @CurrentUser() user: User,
  ): Promise<VisualAidDocument> {
    return this.visualAidService.signVisualAidAsFinalCustomer(
      id,
      signatureUrl,
      user,
    );
  }

  @Mutation(() => VisualAidDocument, { name: 'signVisualAidAsInternal' })
  signVisualAidAsInternal(
    @Args('id', { type: () => ID }, ParseUUIDPipe) id: string,
    @Args('signatureUrl') signatureUrl: string,
    @CurrentUser() user: User,
  ): Promise<VisualAidDocument> {
    return this.visualAidService.signVisualAidAsInternal(
      id,
      signatureUrl,
      user,
    );
  }

  @ResolveField(() => ProjectPart, { nullable: true })
  async projectPart(
    @Parent() document: VisualAidDocument,
  ): Promise<ProjectPart | null> {
    if (!document.projectPartId) {
      return null;
    }
    return this.visualAidDocumentsLoader.batchProjectParts.load(
      document.projectPartId,
    );
  }

  @ResolveField(() => [VisualAidLog], { nullable: true })
  async logs(@Parent() document: VisualAidDocument): Promise<VisualAidLog[]> {
    return this.visualAidDocumentsLoader.batchVisualAidLogs.load(document.id);
  }
}
