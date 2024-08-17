import {
  Body,
  Controller,
  HttpCode,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
  HttpException,
  HttpStatus,
  Delete,
  Param,
  ParseUUIDPipe,
  NotFoundException,
  ForbiddenException,
  Patch,
  ConflictException,
} from '@nestjs/common';
import { BaseController } from 'src/base/controller.base';
import { TeamService } from './team.service';
import { TeamMemberService } from '../teamMember/teamMember.service';
import { RateLimitGuard } from 'src/middlewares/global/rateLimit.middleware';
import { UserMe } from '../user/decorators/me.decorator';
import { TeamValidation } from './team.validation';
import { FileInterceptor } from '@nestjs/platform-express';
import { FileValidationPipe } from 'src/utils/pipes/file.pipe';
import * as yup from 'yup';
import { SUPPORTED_IMAGE_TYPE } from 'src/constants/global.constant';
import { Sequelize } from 'sequelize-typescript';
import { CreateTeamDto } from './dto/create.dto';
import { ImageKitService } from 'src/third-party/imagekit/imagekit.service';
import { TEAM_IMAGE } from './team.constant';
import { CreateTeamMemberDto } from '../teamMember/dto/create.dto';
import { TeamFindByIdLocked } from './pipes/findById.locked.pipe';
import { type TeamAttributes } from 'src/models/team';
import { UserFindByIdPipe } from '../user/pipes/findById.pipe';
import { type UserAttributes } from 'src/models/user';

@Controller('team')
export class TeamController extends BaseController {
  constructor(
    private readonly teamService: TeamService,
    private readonly teamMemberService: TeamMemberService,
    private readonly teamValidation: TeamValidation,
    private readonly sequelize: Sequelize,
    private readonly imagekitService: ImageKitService,
  ) {
    super();
  }

  @Post()
  @HttpCode(201)
  @UseGuards(
    new RateLimitGuard({
      windowMs: 1 * 60 * 1000,
      max: 10,
      message: 'Too many requests from this IP, please try again in 1 minute.',
    }),
  )
  @UseInterceptors(
    FileInterceptor('file', {
      limits: {
        fieldSize: 2 * 1024 * 1024,
      },
    }),
  )
  public async createTeam(
    @Body() payload: any,
    @UserMe('id') userId: string,
    @UploadedFile(
      new FileValidationPipe({
        required: { value: true, errorMessage: 'file is required' },
        mimetype: yup
          .string()
          .oneOf([...SUPPORTED_IMAGE_TYPE], 'unsupported file')
          .required('mimetype is required'),
        size: yup
          .number()
          .max(2 * 1024 * 1024, 'max size 2mb')
          .required('size is required'),
      }),
    )
    file: Express.Multer.File | null,
  ) {
    const { name, description } =
      await this.teamValidation.validateCreateTeam(payload);

    if ((await this.teamService.countByOwner(userId)) >= 5)
      throw new HttpException('payment required', HttpStatus.PAYMENT_REQUIRED);

    const transaction = await this.sequelize.transaction();
    const data = new CreateTeamDto({
      name,
      description,
      owner: userId,
    });
    if (file) {
      const { url, fileId } = await this.imagekitService.uploadFile({
        file: file.buffer,
        fileName: file.originalname,
        useUniqueFileName: true,
        folder: TEAM_IMAGE,
      });
      data.addImage(url, fileId);
    }
    try {
      const team = await this.teamService.create(data, { transaction });
      await this.teamMemberService.create(
        new CreateTeamMemberDto({
          teamId: team.id,
          userId,
          status: true,
        }),
        { transaction },
      );

      await transaction.commit();
      return this.sendResponseBody({
        message: 'OK',
        code: 201,
        data: team.dataValues,
      });
    } catch (err) {
      await transaction.rollback();
      if (data?.imageId) this.imagekitService.bulkDelete([data.imageId]);
      throw err;
    }
  }

  @Delete(':teamId')
  @HttpCode(200)
  public async deleteTeam(
    @UserMe('id') userId: string,
    @Param('teamId', ParseUUIDPipe, TeamFindByIdLocked)
    team: TeamAttributes | null,
  ) {
    if (!team) throw new NotFoundException('team not found');

    if (team.owner !== userId) throw new ForbiddenException('forbidden');

    const transaction = await this.sequelize.transaction();
    try {
      await this.teamService.deleteById(team.id, { transaction });
      await this.teamMemberService.deleteByTeamId(team.id, { transaction });
      await transaction.commit();

      if (team.imageId) this.imagekitService.bulkDelete([team.imageId]);
      return this.sendResponseBody({
        message: 'OK',
        code: 200,
      });
    } catch (err) {
      await transaction.rollback();
      throw err;
    }
  }

  @Patch(':teamId/:userId')
  @HttpCode(200)
  public async verifyNewMember(
    @Param('teamId', ParseUUIDPipe, TeamFindByIdLocked)
    team: TeamAttributes | null,
    @Param('userId', ParseUUIDPipe, UserFindByIdPipe)
    user: UserAttributes | null,
    @UserMe('id') userId: string,
  ) {
    if (!team) throw new NotFoundException('team not found');
    if (!user) throw new NotFoundException('user not found');

    if (team.owner !== userId) throw new ForbiddenException('forbidden');
    const member = await this.teamMemberService.findByTeamIdAndUserId(
      team.id,
      user.id,
    );
    if (!member) throw new NotFoundException('member not found');

    if (member.status) throw new ConflictException('member already verified');

    await this.teamMemberService.verifiedMember(member.userId);
    return this.sendResponseBody({
      message: 'OK',
      code: 200,
    });
  }
}
