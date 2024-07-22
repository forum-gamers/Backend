import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import {
  type UserPreferenceAttributes,
  UserPreferences,
} from 'src/models/userpreference';
import { CreateUserPreferenceDto } from './dto/create.dto';
import { type CreateOptions } from 'sequelize';

@Injectable()
export class UserPreferenceService {
  constructor(
    @InjectModel(UserPreferences)
    private readonly userPreferenceModel: typeof UserPreferences,
  ) {}

  public async create(
    payload: CreateUserPreferenceDto,
    opts?: CreateOptions<UserPreferenceAttributes>,
  ) {
    return await this.userPreferenceModel.create(payload, opts);
  }
}
