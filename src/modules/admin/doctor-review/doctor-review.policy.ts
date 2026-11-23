import { Policy } from '@nestjs/authorization';
import { AuthUser } from '../../auth/shared/auth-user';
import { UserRole } from '../../../common/enums';

@Policy()
export class DoctorReviewPolicy {
  canReview(user: AuthUser | null): boolean {
    return user?.role === UserRole.SUPER_ADMIN;
  }
}
