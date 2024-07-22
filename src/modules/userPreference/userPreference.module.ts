import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { UserPreferences } from 'src/models/userpreference';
import { UserPreferenceService } from './userPreference.service';

@Module({
  imports: [SequelizeModule.forFeature([UserPreferences])],
  providers: [UserPreferenceService],
  exports: [UserPreferenceService],
})
export class UserPreferenceModule {}
