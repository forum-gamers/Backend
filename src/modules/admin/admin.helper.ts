import { Injectable } from '@nestjs/common';
import type { AdminDivision } from 'src/interfaces/model.interface';
import type { AdminFeature } from './admin.interface';
import { ADMIN_ACCESS } from './admin.constant';

@Injectable()
export class AdminHelper {
  public validateAdminAccess(
    division: AdminDivision,
    feature: AdminFeature,
  ): boolean {
    return (
      ADMIN_ACCESS?.[division]?.has('*') ||
      ADMIN_ACCESS?.[division]?.has(feature)
    );
  }
}
