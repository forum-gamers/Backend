import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { ChatRead } from 'src/models/chatread';
import { ChatReadService } from './chatRead.service';

@Module({
  imports: [SequelizeModule.forFeature([ChatRead])],
  providers: [ChatReadService],
  exports: [ChatReadService],
})
export class ChatReadModule {}
