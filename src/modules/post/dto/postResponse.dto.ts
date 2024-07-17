export class PostResponse {
  id: number;
  userId: string;
  text: string;
  media: string;
  allowComment: boolean;
  createdAt: Date;
  updatedAt: Date;
  privacy: string;
  countLike: number;
  countComment: number;
  countShare: number;
  isLiked: boolean;
  isShared: boolean;
  totalData: number;
}
