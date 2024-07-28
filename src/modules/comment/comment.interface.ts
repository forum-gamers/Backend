import { CommentResponseDto } from './dto/commentResponse.dto';

export interface ICreateCommentProps {
  text: string;
}

export interface CommentResponseQueryResult {
  count: number;
  rows: CommentResponseDto[];
}
