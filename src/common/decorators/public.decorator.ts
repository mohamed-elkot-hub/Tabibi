import { SetMetadata } from '@nestjs/common';
import { Expose } from 'class-transformer';

export const IS_PUBLIC = 'IS_PUBLIC';

export const IsPublic = () => {
  return SetMetadata(IS_PUBLIC, true);
};
