import type { AdminDivision } from 'src/interfaces/model.interface';
import type { AdminFeature } from './admin.interface';

export const ADMIN_ACCESS: Record<AdminDivision, Set<AdminFeature | '*'>> = {
  Director: new Set(['*']),
  IT: new Set(['*']),
  Finance: new Set(['blockUser', 'unBlockUser']),
  Marketing: new Set([]),
  'Third Party': new Set([]),
  'Customer Service': new Set([
    'blockPost',
    'blockUser',
    'unBlockPost',
    'unBlockUser',
  ]),
};
