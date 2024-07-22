import { CreateTagsDto } from 'src/modules/post/dto/createTags.dto';

export class CreateUserPreferenceDto {
  public readonly text: string[];
  public readonly userId: string;
  constructor({ text, userId }: CreateUserPreferenceDtoProps) {
    this.text = new CreateTagsDto(text).tags;
    this.userId = userId;
  }
}

export interface CreateUserPreferenceDtoProps {
  text: string;
  userId: string;
}
