import encryption from '../../../utils/global/encryption.utils';

export class GetByQueryPayload<T extends Object = {}> {
  constructor(obj: T) {
    for (const [key, value] of Object.entries(obj))
      if (typeof value === 'string') this[key] = encryption.encrypt(value);
  }
}
