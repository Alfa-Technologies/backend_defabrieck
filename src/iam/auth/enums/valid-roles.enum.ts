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

  finance = 'finance',
  rh = 'rh',
  quality = 'quality',

  user = 'user',
}

registerEnumType(ValidRoles, {
  name: 'ValidRoles',
  description: 'User roles in the system',
});
