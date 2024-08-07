export interface CreateHistoryDtoProps {
  userId: string;
  searchedText: string;
}

export class CreateHistoryDto {
  userId: string;
  searchedText: string;

  constructor({ userId, searchedText }: CreateHistoryDtoProps) {
    this.userId = userId;
    this.searchedText = searchedText;
  }
}
