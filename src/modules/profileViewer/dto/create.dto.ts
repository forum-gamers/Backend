export class CreateProfileViewerDto {
  public readonly targetId: string;
  public readonly viewerId: string;
  constructor({ targetId, viewerId }: CreateProfileViewerDtoProps) {
    this.targetId = targetId;
    this.viewerId = viewerId;
  }
}

export interface CreateProfileViewerDtoProps {
  targetId: string;
  viewerId: string;
}
