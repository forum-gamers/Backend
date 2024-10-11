import {
  BadRequestException,
  Body,
  ConflictException,
  Controller,
  HttpCode,
  NotFoundException,
  ParseIntPipe,
  Post,
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
import type { CreateTournamentBodyProps } from './tournament.interface';
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
    let moneyPool = 0;
    try {
      if (paymentType)
        switch (paymentType) {
          case 'wallet': {
            const wallet = await this.walletService.findByUserId(user.id);
            if (!wallet) throw new NotFoundException('wallet not found');

            if (wallet.balance < pricePool)
              throw new BadRequestException('balance not enough');

            await this.walletService.updateBalance(
              wallet.userId,
              +wallet.balance - pricePool,
              { transaction },
            );

            moneyPool = pricePool;
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

            transactionData = await this.transactionService.create(
              new CreateTransactionDto({
                type: TransactionType.PAYMENT,
                userId: user.id,
                signature: this.midtransService.generateSignature(
                  chargeData.order_id,
                  '200',
                  chargeData.gross_amount,
                ),
                amount: pricePool,
                fee: pricePool < MINIMUM_FREE_ADMIN ? 4500 : 0,
                tax: 0,
                discount: 0,
                description: 'Creating tournament with transfer',
                status: TransactionStatus.PENDING,
                detail:
                  pricePool < MINIMUM_FREE_ADMIN
                    ? '+ Midtrans Fee: 4500'
                    : null,
              }),
              { transaction },
            );
            break;
          }
          default:
            throw new BadRequestException('invalid payment type');
        }

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
          moneyPool,
        }),
        { transaction },
      );

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
}
