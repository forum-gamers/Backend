import {
  BadGatewayException,
  BadRequestException,
  Body,
  ConflictException,
  Controller,
  ForbiddenException,
  Get,
  HttpCode,
  NotFoundException,
  Param,
  ParseIntPipe,
  ParseUUIDPipe,
  Post,
  Query,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { BaseController } from 'src/base/controller.base';
import { TournamentService } from './tournament.service';
import { RateLimitGuard } from 'src/middlewares/global/rateLimit.middleware';
import { FileInterceptor } from '@nestjs/platform-express';
import { UserMe } from '../user/decorators/me.decorator';
import { type UserAttributes } from 'src/models/user';
import { FileValidationPipe } from 'src/utils/pipes/file.pipe';
import * as yup from 'yup';
import { SUPPORTED_IMAGE_TYPE } from 'src/constants/global.constant';
import { CreateTournamentPipe } from './pipes/create.pipe';
import type {
  CreateTournamentBodyProps,
  JointTournamentProps,
} from './tournament.interface';
import { RequiredField } from 'src/utils/pipes/requiredField.pipe';
import { GameFindById } from '../game/pipes/findById.pipe';
import { type GameAttributes } from 'src/models/game';
import { ImageKitService } from 'src/third-party/imagekit/imagekit.service';
import { TOURNAMENTS_IMAGE } from './tournament.constant';
import { CreateTournamentDto } from './dto/create.dto';
import { TournamentHelper } from './tournament.helper';
import { WalletService } from '../wallet/wallet.service';
import { Sequelize } from 'sequelize-typescript';
import { type TransactionAttributes } from 'src/models/transaction';
import { MidtransService } from 'src/third-party/midtrans/midtrans.service';
import { TransactionService } from '../transaction/transaction.service';
import { CreateTransactionDto } from '../transaction/dto/create.dto';
import {
  TransactionStatus,
  TransactionType,
} from 'src/constants/transaction.constant';
import { MINIMUM_FREE_ADMIN } from 'src/third-party/midtrans/midtrans.constant';
import { TransactionHelper } from '../transaction/transaction.helper';
import type { ChargeResp } from 'midtrans-client';
import { TournamentFindByIdLockedPipe } from './pipes/findById.locked.pipe';
import { type TournamentAttributes } from 'src/models/tournament';
import { JoinTournamentBodyPipe } from './pipes/joinTournament.pipe';
import { PaymentRequiredException } from 'src/utils/global/paymentRequired.error';
import { TournamentParticipantService } from '../tournamentParticipant/tournamentParticipant.service';
import { TeamAttributes } from 'src/models/team';
import { TeamFindById } from '../team/pipes/findById.pipe';
import { CreateTournamentParticipantDto } from '../tournamentParticipant/dto/create.dto';
import {
  CREATE_TOURNAMENT_TRANSACTION,
  PARTICIPATE_TOURNAMENT,
} from '../transaction/transaction.constant';
import { QueryPipe } from 'src/utils/pipes/query.pipe';
import type { BaseQuery } from 'src/interfaces/request.interface';

@Controller('tournament')
export class TournamentController extends BaseController {
  constructor(
    private readonly tournamentService: TournamentService,
    private readonly imagekitService: ImageKitService,
    private readonly tournamentHelper: TournamentHelper,
    private readonly walletService: WalletService,
    private readonly sequelize: Sequelize,
    private readonly midtransService: MidtransService,
    private readonly transactionService: TransactionService,
    private readonly transactionHelper: TransactionHelper,
    private readonly tournamentParticipantService: TournamentParticipantService,
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
  public async createTournament(
    @UserMe() user: UserAttributes,
    @Body(CreateTournamentPipe)
    {
      name,
      description,
      pricePool,
      slot,
      startDate,
      registrationFee,
      location,
      tags = [],
      communityId = null,
      isPublic = true,
      paymentType = null,
      paymentMethod = null,
    }: CreateTournamentBodyProps,
    @UploadedFile(
      new FileValidationPipe({
        required: { value: true, errorMessage: 'file is required' },
        mimetype: yup
          .string()
          .oneOf(SUPPORTED_IMAGE_TYPE, 'unsupported file')
          .required('mimetype is required'),
        size: yup
          .number()
          .max(2 * 1024 * 1024, 'max size 2mb')
          .required('size is required'),
      }),
    )
    { originalname, buffer }: Express.Multer.File,
    @Body('gameId', RequiredField, ParseIntPipe, GameFindById)
    game: GameAttributes | null,
  ) {
    if (!game) throw new NotFoundException('game not found');

    if (communityId)
      await this.tournamentHelper.canMakeCommunityTour(
        communityId,
        user.id,
        game.id,
      );
    else {
      if (
        (await this.tournamentService.findActiveTourByUserId(user.id, game.id))
          ?.length
      )
        throw new ConflictException('tournament already exist');
    }

    const transaction = await this.sequelize.transaction();
    let transactionData: TransactionAttributes | null = null;
    let chargeData: ChargeResp | null = null;
    let uploadedFileId: string | null = null;
    try {
      const { fileId, url } = await this.imagekitService.uploadFile({
        file: buffer,
        fileName: originalname,
        folder: TOURNAMENTS_IMAGE,
        useUniqueFileName: true,
      });
      uploadedFileId = fileId;

      const data = await this.tournamentService.create(
        new CreateTournamentDto({
          name,
          description,
          pricePool,
          slot,
          startDate,
          registrationFee,
          location,
          tags,
          communityId,
          gameId: game.id,
          imageUrl: url,
          imageId: fileId,
          isPublic: !!communityId ? isPublic : true,
          userId: user.id,
          moneyPool: 0,
        }),
        { transaction },
      );

      if (paymentType)
        switch (paymentType) {
          case 'wallet': {
            const wallet = await this.walletService.findByUserId(user.id, {
              lock: transaction.LOCK.UPDATE,
              transaction,
            });
            if (!wallet) throw new NotFoundException('wallet not found');

            if (wallet.balance < +pricePool)
              throw new BadRequestException('balance not enough');

            await this.walletService.updateBalance(
              wallet.userId,
              +wallet.balance - +pricePool,
              { transaction },
            );

            await this.tournamentService.updateMoneyPool(data.id, +pricePool, {
              transaction,
            });
            transactionData = await this.transactionService.create(
              new CreateTransactionDto({
                type: TransactionType.PAYMENT,
                userId: user.id,
                signature: this.midtransService.generateSignature(
                  this.midtransService.generateTransactionId('payment'),
                  '200',
                  pricePool.toString(),
                ),
                amount: pricePool,
                fee: 0,
                tax: 0,
                discount: 0,
                description: 'Deploying tournament with wallet',
                status: TransactionStatus.COMPLETE,
                context: {
                  type: CREATE_TOURNAMENT_TRANSACTION,
                  tournamentId: data.id,
                },
              }),
              { transaction },
            );

            break;
          }
          case 'transfer': {
            chargeData = await this.midtransService.chargePayment(
              paymentMethod,
              {
                username: user.username,
                email: user.email,
                amount: pricePool,
                transactionName: 'Creating Tournament',
              },
            );
            if (
              !chargeData ||
              isNaN(Number(chargeData.status_code)) ||
              Number(chargeData.status_code) >= 400
            )
              throw new BadGatewayException('charge payment failed');

            transactionData = await this.transactionService.create(
              new CreateTransactionDto({
                type: TransactionType.PAYMENT,
                userId: user.id,
                signature: this.midtransService.generateSignature(
                  chargeData.order_id,
                  '200',
                  chargeData.gross_amount,
                ),
                amount: +pricePool,
                fee: +pricePool < MINIMUM_FREE_ADMIN ? 4500 : 0,
                tax: 0,
                discount: 0,
                description: 'Creating tournament with transfer',
                status: TransactionStatus.PENDING,
                detail:
                  pricePool < MINIMUM_FREE_ADMIN
                    ? '+ Midtrans Fee: 4500'
                    : null,
                context: {
                  type: CREATE_TOURNAMENT_TRANSACTION,
                  tournamentId: data.id,
                  actions: chargeData?.actions ?? [],
                  vaNumber: chargeData?.va_numbers ?? [],
                },
              }),
              { transaction },
            );
            break;
          }
          default:
            throw new BadRequestException('invalid payment type');
        }

      await transaction.commit();
      return this.sendResponseBody({
        message: 'OK',
        code: 201,
        data: {
          transaction:
            transactionData && chargeData
              ? this.transactionHelper.generateTransactionResponse(
                  transactionData.id,
                  chargeData,
                )
              : null,
          tournament: data,
        },
      });
    } catch (err) {
      await transaction.rollback();
      if (uploadedFileId) this.imagekitService.bulkDelete([uploadedFileId]);
      throw err;
    }
  }

  @Post(':id')
  @HttpCode(201)
  @UseGuards(
    new RateLimitGuard({
      windowMs: 1 * 60 * 1000,
      max: 5,
      message: 'Too many requests from this IP, please try again in 1 minute.',
    }),
  )
  public async joinTournament(
    @Param('id', ParseIntPipe, TournamentFindByIdLockedPipe)
    tournament: TournamentAttributes | null,
    @Body('teamId', RequiredField, ParseUUIDPipe, TeamFindById)
    team: TeamAttributes | null,
    @Body(JoinTournamentBodyPipe)
    { paymentMethod = null, paymentType = null }: JointTournamentProps,
    @UserMe() user: UserAttributes,
  ) {
    if (!tournament) throw new NotFoundException('tournament not found');
    const NEED_PAYMENT = tournament.moneyPool < tournament.pricePool;
    if (NEED_PAYMENT && (!paymentType || !paymentMethod))
      throw new PaymentRequiredException();

    if (!team) throw new NotFoundException('team not found');
    if (team.owner !== user.id) throw new ForbiddenException('forbidden');
    if (team.gameId !== tournament.gameId)
      throw new BadRequestException('team and tournament game not match');

    const exists =
      await this.tournamentParticipantService.findByTournamentIdAndTeamId(
        tournament.id,
        team.id,
      );
    if (exists)
      throw new ConflictException(
        exists.status
          ? 'team already joined tournament'
          : 'team already joined tournament and need to pay the registration fee',
      );

    const transaction = await this.sequelize.transaction();
    try {
      if (
        tournament.slot <=
        (await this.tournamentParticipantService.countParticipant(
          tournament.id,
          true,
          { transaction },
        ))
      )
        throw new ConflictException('slot full');

      let transactionData: TransactionAttributes | null = null;
      let charge: ChargeResp | null = null;
      if (NEED_PAYMENT) {
        switch (paymentType) {
          case 'wallet':
            {
              const wallet = await this.walletService.findByUserId(team.owner, {
                lock: transaction.LOCK.UPDATE,
                transaction,
              });
              if (!wallet) throw new NotFoundException('wallet not found');

              if (+wallet.balance < +tournament.registrationFee)
                throw new BadRequestException('balance not enough');

              await this.walletService.updateBalance(
                wallet.userId,
                +wallet.balance - +tournament.registrationFee,
                { transaction },
              );

              await this.tournamentService.updateMoneyPool(
                +tournament.id,
                +tournament.moneyPool + +tournament.registrationFee,
                {
                  transaction,
                },
              );

              transactionData = await this.transactionService.create(
                new CreateTransactionDto({
                  type: TransactionType.PAYMENT,
                  userId: team.owner,
                  signature: this.midtransService.generateSignature(
                    this.midtransService.generateTransactionId('payment'),
                    '200',
                    tournament.registrationFee.toString(),
                  ),
                  amount: +tournament.registrationFee,
                  fee: 0,
                  tax: 0,
                  discount: 0,
                  description: 'joining tournament payment via wallet',
                  status: TransactionStatus.COMPLETE,
                  context: {
                    type: PARTICIPATE_TOURNAMENT,
                    teamId: team.id,
                    tournamentId: tournament.id,
                  },
                }),
                { transaction },
              );
            }
            break;
          case 'transfer':
            {
              charge = await this.midtransService.chargePayment(paymentMethod, {
                username: user.username,
                email: user.email,
                amount: tournament.pricePool,
                transactionName: 'Joining tournament',
              });
              if (
                !charge ||
                isNaN(Number(charge.status_code)) ||
                Number(charge?.status_code) >= 400
              )
                throw new BadGatewayException('charge payment failed');

              transactionData = await this.transactionService.create(
                new CreateTransactionDto({
                  type: TransactionType.PAYMENT,
                  userId: team.owner,
                  signature: this.midtransService.generateSignature(
                    charge.order_id,
                    '200',
                    charge.gross_amount,
                  ),
                  amount: +tournament.registrationFee,
                  fee:
                    +tournament.registrationFee < MINIMUM_FREE_ADMIN ? 4500 : 0,
                  tax: 0,
                  discount: 0,
                  description: 'joining tournament payment via ' + paymentType,
                  status: TransactionStatus.COMPLETE,
                  detail:
                    +tournament.registrationFee < MINIMUM_FREE_ADMIN
                      ? '+ Midtrans Fee: 4500'
                      : null,
                  context: {
                    type: PARTICIPATE_TOURNAMENT,
                    teamId: team.id,
                    tournamentId: tournament.id,
                    vaNumber: charge?.va_numbers ?? [],
                    actions: charge?.actions ?? [],
                  },
                }),
                { transaction },
              );
            }
            break;
          default:
            throw new BadRequestException('invalid payment type');
        }
      }
      const participant = await this.tournamentParticipantService.create(
        new CreateTournamentParticipantDto({
          tournamentId: tournament.id,
          teamId: team.id,
          status: !NEED_PAYMENT || (NEED_PAYMENT && paymentType === 'wallet'),
        }),
        { transaction },
      );

      await transaction.commit();
      return this.sendResponseBody({
        message: 'OK',
        code: 201,
        data: {
          participant,
          transaction:
            transactionData && charge
              ? this.transactionHelper.generateTransactionResponse(
                  transactionData.id,
                  charge,
                )
              : null,
        },
      });
    } catch (err) {
      await transaction.rollback();
      throw err;
    }
  }

  @Get()
  @HttpCode(200)
  public async findAll(
    @Query(
      new QueryPipe(1, 10, {
        q: yup.string().optional(),
      }),
    )
    { page, limit, q = null }: BaseQuery & { q?: string },
    @UserMe('id') userId: string,
  ) {
    const { datas, totalData } = await this.tournamentService.getTournament({
      page,
      limit,
      q,
      userId,
    });

    return this.sendResponseBody(
      {
        message: 'OK',
        code: 200,
        data: datas,
      },
      {
        totalData,
        totalPage: Math.ceil(totalData / limit),
        page,
        limit,
      },
    );
  }
}
