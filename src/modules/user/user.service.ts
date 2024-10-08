import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { User, type UserAttributes } from '../../models/user';
import { Op, type UpdateOptions, type CreateOptions } from 'sequelize';
import { v4 } from 'uuid';
import { CreateUser } from './dto/create.dto';
import encryption from '../../utils/global/encryption.utils';
import { BlockUserDto } from '../admin/dto/blockUser.dto';

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
    { username, email, password }: CreateUser,
    opts?: CreateOptions<UserAttributes>,
  ) {
    return await this.userModel.create(
      {
        id: v4(),
        username,
        email,
        password,
        status: 'active',
      },
      opts,
    );
  }

  public async changePassword(
    password: string,
    id: string,
    opts?: UpdateOptions<UserAttributes>,
  ) {
    return await this.userModel.update(
      { password: encryption.hashData(password) },
      { ...opts, where: { id } },
    );
  }

  public async findByEmail(email: string) {
    return await this.userModel.findOne({
      where: { email },
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

  public async findByIdentifier(identifier: string) {
    return await this.userModel.findOne({
      where: {
        [Op.or]: {
          username: identifier,
          email: identifier,
        },
      },
    });
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

  public async getByQuery(obj: Partial<UserAttributes>) {
    return await this.userModel.findAll({
      where: {
        [Op.or]: Object.keys(obj).map((el) => ({ [el]: obj[el] })),
      },
    });
  }

  public async editBio(
    id: string,
    bio: string,
    opts?: UpdateOptions<UserAttributes>,
  ) {
    return await this.userModel.update({ bio }, { ...opts, where: { id } });
  }

  public async block(
    { userId, reason, blockedBy }: BlockUserDto,
    opts?: UpdateOptions<UserAttributes>,
  ) {
    return await this.userModel.update(
      { blockReason: reason, isBlocked: true, blockedBy },
      { ...opts, where: { id: userId } },
    );
  }

  public async unBlock(id: string, opts?: UpdateOptions<UserAttributes>) {
    return await this.userModel.update(
      { blockReason: null, blockedBy: null, isBlocked: false },
      { ...opts, where: { id } },
    );
  }
}
