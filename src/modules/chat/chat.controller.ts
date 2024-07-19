import {
  BadGatewayException,
  BadRequestException,
  Body,
  Controller,
  HttpCode,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { BaseController } from 'src/base/controller.base';
import { ChatService } from './chat.service';
import { ChatGateway } from '../ws/chat.gateway';
import { ImageKitService } from 'src/third-party/imagekit/imagekit.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { RateLimitGuard } from 'src/middlewares/global/rateLimit.middleware';
import { UserMe } from '../user/decorators/me.decorator';
import { RoomChatService } from '../chatRoom/roomChat.service';
import { ChatContext } from '../chatRoom/decorators/context.decorator';
import { type RoomChatAttributes } from 'src/models/roomchat';
import { ChatValidation } from './chat.validation';
import { CHAT_FILE_FOLDER } from './chat.constant';
import { CreateChatDto } from './dto/create.dto';

@Controller('chat')
export class ChatController extends BaseController {
  constructor(
    private readonly chatService: ChatService,
    private readonly chatGateway: ChatGateway,
    private readonly imagekitService: ImageKitService,
    private readonly roomChatService: RoomChatService,
    private readonly chatValidation: ChatValidation,
  ) {
    super();
  }

  @Post(':id')
  @HttpCode(201)
  @UseGuards(
    new RateLimitGuard({
      windowMs: 1 * 60 * 1000,
      max: 30,
      message: 'Too many requests from this IP, please try again in 1 minute.',
    }),
  )
  @UseInterceptors(
    FileInterceptor('file', {
      limits: {
        fileSize: 10 * 1024 * 1024,
      },
    }),
  )
  public async create(
    @UploadedFile() rawFile: Express.Multer.File | null,
    @UserMe('id') userId: string,
    @Body() payload: any,
    @ChatContext('roomChat') roomChat: RoomChatAttributes,
  ) {
    const { message } = await this.chatValidation.createChatValidation(payload);
    const chat = new CreateChatDto({
      message,
      senderId: userId,
      roomId: roomChat.id,
    });

    if (!chat.message && !rawFile)
      throw new BadRequestException('chat message or file id is required');

    if (rawFile) {
      const {
        file: { buffer, originalname },
      } = await this.chatValidation.validateChatImage({ file: rawFile });

      const upload = await this.imagekitService.uploadFile({
        file: buffer,
        fileName: originalname,
        folder: CHAT_FILE_FOLDER,
        useUniqueFileName: true,
      });
      if (!upload) throw new BadGatewayException('failed to upload file');

      chat.updateImage(upload.url, upload.fileId);
    }

    return this.sendResponseBody({
      code: 201,
      message: 'success',
      data: await this.chatService.create(chat),
    });
  }
}
