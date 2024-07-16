import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { DestroyOptions } from 'sequelize';
import {
  ReplyComment,
  type ReplyCommentAttributes,
} from 'src/models/replycomment';

@Injectable()
export class ReplyService {
  constructor(
    @InjectModel(ReplyComment)
    private readonly replyCommentModel: typeof ReplyComment,
  ) {}

  public async deleteAllByCommentId(
    commentId: number,
    opts?: DestroyOptions<ReplyCommentAttributes>,
  ) {
    return await this.replyCommentModel.destroy({
      ...opts,
      where: { commentId },
    });
  }

  public async deleteAllByPostId(
    postId: number,
    opts?: DestroyOptions<ReplyCommentAttributes>,
  ) {
    return await this.replyCommentModel.destroy({
      ...opts,
      where: { postId },
    });
  }
}
