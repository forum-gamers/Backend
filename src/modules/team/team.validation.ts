import { Injectable } from '@nestjs/common';
import { BaseValidation } from 'src/base/validation.base';
import * as yup from 'yup';
import type { CreateTeamProps } from './team.interface';

@Injectable()
export class TeamValidation extends BaseValidation {
  public validateCreateTeam = async (data: any) =>
    await this.validate<CreateTeamProps>(
      yup.object().shape({
        name: yup.string().required(),
        description: yup
          .string()
          .transform((_, v: string) => (!!v ? v?.trim() : v))
          .test(
            'is valid text',
            'description must be between 3 and 160 characters and can only contain letters, numbers, and basic punctuation.',
            (val) =>
              !val || /^(?=.*\S)[a-zA-Z0-9.,!?'"()\-\n ]{3,160}$/.test(val),
          )
          .nullable()
          .optional(),
        isPublic: yup
          .boolean()
          .transform(Boolean)
          .default(true)
          .nullable()
          .optional(),
      }),
      data,
    );
}
