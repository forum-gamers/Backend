import { Injectable } from '@nestjs/common';
import { ProfileViewerService } from './profileViewer.service';

@Injectable()
export class ProfileViewerHelper {
  constructor(private readonly profileViewerService: ProfileViewerService) {}
}
