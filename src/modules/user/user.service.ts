import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { User, type UserAttributes } from '../../models/user';
import { Op, type UpdateOptions, type CreateOptions } from 'sequelize';
import { v4 } from 'uuid';
import { CreateUser } from './dto/create.dto';
import encryption from '../../utils/encryption.utils';
import { GetByQueryPayload } from './dto/getByQueryPayload.dto';

@Injectable()
export class UserService {
  constructor(
    @InjectModel(User)
    private readonly userModel: typeof User,
  ) {}
  public async findOneById(id: string) {
    return await this.userModel.findOne({ where: { id } });
  }

  public async createOne(
    { username, email, password, phoneNumber }: CreateUser,
    opts?: CreateOptions<UserAttributes>,
  ) {
    return await this.userModel.create(
      {
        id: v4(),
        username,
        email,
        password,
        status: 'active',
        phoneNumber,
      },
      opts,
    );
  }

  public async findByEmail(email: string) {
    return await this.userModel.findOne({
      where: { email: encryption.encrypt(email) },
    });
  }

  public async findMultipleByIds(ids: string[]) {
    return await this.userModel.findAll({
      where: {
        id: { [Op.in]: ids },
      },
    });
  }

  public async changeProfile(
    id: string,
    imageUrl: string,
    imageId: string,
    opts?: UpdateOptions<UserAttributes>,
  ) {
    return await this.userModel.update(
      { imageId, imageUrl },
      { ...opts, where: { id } },
    );
  }

  public async changeBackground(
    id: string,
    backgroundImageUrl: string,
    backgroundImageId: string,
    opts?: UpdateOptions<UserAttributes>,
  ) {
    return await this.userModel.update(
      { backgroundImageId, backgroundImageUrl },
      { ...opts, where: { id } },
    );
  }

  public async activatedUser(id: string) {
    return await this.userModel.update({ isVerified: true }, { where: { id } });
  }

  public async getByQuery(obj: GetByQueryPayload) {
    return await this.userModel.findAll({
      where: {
        [Op.or]: Object.keys(obj).map((el) => ({ [el]: obj[el] })),
      },
    });
  }
}
