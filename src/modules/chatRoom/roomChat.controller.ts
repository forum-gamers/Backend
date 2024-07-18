import {
  BadGatewayException,
  Body,
  ConflictException,
  Controller,
  HttpCode,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { RoomChatService } from './roomChat.service';
import { RoomChatValidation } from './roomChat.validation';
import { UserMe } from '../user/decorators/me.decorator';
import { CreateRoomChatDto } from './dto/create.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { ImageKitService } from 'src/third-party/imagekit/imagekit.service';
import { Sequelize } from 'sequelize-typescript';
import { ROOM_CHAT_IMAGE_FOLDER } from './roomChat.constant';
import { RoomMemberService } from '../roomMember/roomMember.service';
import { CreateRoomMemberDto } from '../roomMember/dto/create.dto';
import { BaseController } from 'src/base/controller.base';

@Controller('room-chat')
export class RoomChatController extends BaseController {
  constructor(
    private readonly roomChatService: RoomChatService,
    private readonly roomChatValidation: RoomChatValidation,
    private readonly imagekitService: ImageKitService,
    private readonly sequelize: Sequelize,
    private readonly roomMemberService: RoomMemberService,
  ) {
    super();
  }

  @Post()
  @HttpCode(201)
  @UseInterceptors(
    FileInterceptor('file', {
      limits: {
        fileSize: 2 * 1024 * 1024, //2mb
      },
    }),
  )
  public async create(
    @Body() payload: any,
    @UserMe('id') userId: string,
    @UploadedFile() rawFile: Express.Multer.File | null,
  ) {
    const { name, description, users } =
      await this.roomChatValidation.validateCreateRoom(payload, userId);

    const roomPayload = new CreateRoomChatDto({
      name,
      description,
      type: users.length > 2 ? 'group' : 'private',
      owner: userId,
    });

    if (
      roomPayload.type === 'private' &&
      (
        await this.roomChatService.findExistingPrivateRoomChat([
          userId,
          users.filter((el) => el !== userId)[0],
        ])
      ).length
    )
      throw new ConflictException('room already exist');

    if (rawFile && roomPayload.type === 'group') {
      if (await this.roomChatService.findGroupByName(roomPayload.name))
        throw new ConflictException('room already exist');

      const {
        file: { originalname, buffer },
      } = await this.roomChatValidation.validateCreateRoomChatImage({
        file: rawFile,
      });

      const upload = await this.imagekitService.uploadFile({
        file: buffer,
        fileName: originalname,
        useUniqueFileName: true,
        folder: ROOM_CHAT_IMAGE_FOLDER,
      });
      if (!upload) throw new BadGatewayException('upload image failed');
      roomPayload.updateImage(upload.url, upload.fileId);
    }

    const transaction = await this.sequelize.transaction();
    try {
      const room = await this.roomChatService.create(roomPayload, {
        transaction,
      });
      console.log({ users });
      await Promise.all(
        users.map(
          async (el) =>
            await this.roomMemberService.create(
              new CreateRoomMemberDto({
                roomId: room.id,
                role: el === userId ? 'owner' : 'member',
                userId: el,
              }),
              { transaction },
            ),
        ),
      );

      await transaction.commit();
      return this.sendResponseBody({
        message: 'successfully created',
        data: room,
        code: 201,
      });
    } catch (err) {
      if (roomPayload.imageId)
        this.imagekitService.bulkDelete([roomPayload.imageId]);
      await transaction.rollback();
      throw err;
    }
  }
}
