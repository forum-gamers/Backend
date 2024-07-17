export class CreateTagsDto {
  public readonly tags: string[];
  constructor(text: string) {
    let modified = text;

    for (const char of "!@#$%^&*)(_=+?.,;:'")
      modified = modified.split(char).join(' ');

    this.tags = modified.split(' ').filter(Boolean);
  }
}
