import { Injectable, Scope } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { User } from '../users/entities/user.entity';
import DataLoader from 'dataloader';

@Injectable({ scope: Scope.REQUEST })
export class EmployeesLoader {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  public readonly batchUsers = new DataLoader<string, User | null>(
    async (userIds: readonly string[]) => {
      const users = await this.userRepository.find({
        where: { id: In([...userIds]) },
      });

      const userMap = new Map(users.map((user) => [user.id, user]));
      return userIds.map((id) => userMap.get(id) || null);
    },
  );
}
