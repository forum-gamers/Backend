import type { CommunityEventStatus } from 'src/models/communityevent';

export interface CreateCommunityEventDtoProps {
  title: string;
  description?: string;
  location: string;
  startTime: Date;
  endTime: Date | null;
  createdBy: string;
  isPublic: boolean;
  communityId: number;
}

export class CreateCommunityEventDto {
  public title: string;
  public description?: string;
  public location: string;
  public startTime: Date;
  public endTime: Date | null;
  public createdBy: string;
  public isPublic: boolean;
  public communityId: number;
  public status: CommunityEventStatus = 'scheduled';

  constructor(props: CreateCommunityEventDtoProps) {
    this.title = props.title;
    this.description = props.description;
    this.location = props.location;
    this.startTime = props.startTime;
    this.endTime = props.endTime;
    this.createdBy = props.createdBy;
    this.isPublic = props.isPublic;
    this.communityId = props.communityId;
  }
}
