import type { AdminAttributes } from '../models/admin';
import type { UserAttributes } from '../models/user';

export declare global {
  namespace Express {
    interface Request {
      user?: UserAttributes;
      admin?: AdminAttributes;
    }
  }
}
