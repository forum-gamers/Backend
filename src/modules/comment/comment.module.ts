import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { PostComment } from 'src/models/postcomment';
import { PostModule } from '../post/post.module';
import { CommentService } from './comment.service';
import { CommentValidation } from './comment.validation';
import { CommentController } from './comment.controller';

@Module({
  imports: [SequelizeModule.forFeature([PostComment]), PostModule],
  providers: [CommentService, CommentValidation],
  controllers: [CommentController],
})
export class CommentModule {}
