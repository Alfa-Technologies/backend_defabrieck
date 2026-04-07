import { registerEnumType } from '@nestjs/graphql';

export enum ValidRoles {
  superUser = 'superUser',
  admin = 'admin',

  finalCustomer = 'finalCustomer',
  customer = 'customer',

  director = 'director',
  manager = 'manager',
  coordinator = 'coordinator',
  supervisor = 'supervisor',
  operator = 'operator',

  user = 'user',
}

registerEnumType(ValidRoles, {
  name: 'ValidRoles',
  description: 'User roles in the system',
});
