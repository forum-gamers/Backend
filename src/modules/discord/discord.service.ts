import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import {
  DiscordProfile,
  type DiscordProfileAttributes,
} from 'src/models/discordprofile';
import { CreateDiscordProfileDto } from './dto/create.dto';
import { FindOptions, UpdateOptions, type CreateOptions } from 'sequelize';
import { UpdateDiscordProfileProps } from './discord.interface';

@Injectable()
export class DiscordService {
  constructor(
    @InjectModel(DiscordProfile)
    private readonly model: typeof DiscordProfile,
  ) {}

  public async create(
    payload: CreateDiscordProfileDto,
    opts?: CreateOptions<DiscordProfileAttributes>,
  ) {
    return await this.model.create(payload, opts);
  }

  public async updateData(
    id: string,
    {
      accessToken,
      refreshToken,
      tokenExpires,
      imageUrl,
      backgroundUrl,
    }: UpdateDiscordProfileProps,
    opts?: Omit<UpdateOptions<DiscordProfileAttributes>, 'where'>,
  ) {
    return await this.model.update(
      {
        accessToken,
        refreshToken,
        tokenExpires,
        imageUrl,
        backgroundUrl,
      },
      { ...opts, where: { id } },
    );
  }

  public async findByUserId(
    userId: string,
    opts?: Omit<FindOptions<DiscordProfileAttributes>, 'where'>,
  ) {
    return await this.model.findOne({ ...opts, where: { userId } });
  }
}
