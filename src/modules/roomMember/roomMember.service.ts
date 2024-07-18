import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { RoomMember, type RoomMemberAttributes } from 'src/models/roommember';
import { CreateRoomMemberDto } from './dto/create.dto';
import { DestroyOptions, type CreateOptions } from 'sequelize';

@Injectable()
export class RoomMemberService {
  constructor(
    @InjectModel(RoomMember)
    private readonly roomMemberModel: typeof RoomMember,
  ) {}

  public async create(
    payload: CreateRoomMemberDto,
    opts?: CreateOptions<RoomMemberAttributes>,
  ) {
    return await this.roomMemberModel.create(payload, opts);
  }

  public async findOneByUserIdAndRoomId(roomId: number, userId: string) {
    return await this.roomMemberModel.findOne({
      where: { roomId, userId },
    });
  }

  public async removeMember(
    roomId: number,
    userId: string,
    opts?: DestroyOptions<RoomMemberAttributes>,
  ) {
    return await this.roomMemberModel.destroy({
      ...opts,
      where: { roomId, userId },
    });
  }
}
