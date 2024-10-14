import {
  BadGatewayException,
  BadRequestException,
  Body,
  ConflictException,
  Controller,
  HttpCode,
  NotFoundException,
  Post,
  UseGuards,
} from '@nestjs/common';
import { BaseController } from 'src/base/controller.base';
import { TransactionService } from './transaction.service';
import { MidtransService } from 'src/third-party/midtrans/midtrans.service';
import { UserMe } from '../user/decorators/me.decorator';
import { TransactionValidation } from './transaction.validation';
import { RateLimitGuard } from 'src/middlewares/global/rateLimit.middleware';
import {
  TransactionStatus,
  TransactionType,
} from 'src/constants/transaction.constant';
import { type UserAttributes } from 'src/models/user';
import type { ChargeResp } from 'midtrans-client';
import {
  type CreateTournamentTransactionContext,
  CreateTransactionDto,
  type ParticipateTournamentTransactionContext,
} from './dto/create.dto';
import { TransactionFindBySignaturePipe } from './pipes/findBySignature.locked.pipe';
import { type TransactionAttributes } from 'src/models/transaction';
import { WalletService } from '../wallet/wallet.service';
import { Transaction } from 'sequelize';
import { Sequelize } from 'sequelize-typescript';
import {
  MINIMUM_FREE_ADMIN,
  ORDER_ID_START_WITH,
  ORDER_TYPES,
} from 'src/third-party/midtrans/midtrans.constant';
import { OrderType } from 'src/third-party/midtrans/midtrans.interface';
import { TransactionHelper } from './transaction.helper';
import {
  CREATE_TOURNAMENT_TRANSACTION,
  PARTICIPATE_TOURNAMENT,
} from './transaction.constant';
import { TournamentService } from '../tournament/tournament.service';
import { TeamService } from '../team/team.service';
import { TournamentParticipantService } from '../tournamentParticipant/tournamentParticipant.service';

@Controller('transaction')
export class TransactionController extends BaseController {
  constructor(
    private readonly tournamentParticipantService: TournamentParticipantService,
    private readonly transactionValidation: TransactionValidation,
    private readonly transactionService: TransactionService,
    private readonly transactionHelper: TransactionHelper,
    private readonly tournamentService: TournamentService,
    private readonly midtransService: MidtransService,
    private readonly walletService: WalletService,
    private readonly sequelize: Sequelize,
  ) {
    super();
  }

  @Post('top-up')
  @HttpCode(201)
  @UseGuards(
    new RateLimitGuard({
      windowMs: 1 * 60 * 1000,
      max: 10,
      message: 'Too many requests from this IP, please try again in 1 minute.',
    }),
  )
  public async topUp(@UserMe() user: UserAttributes, @Body() payload: any) {
    const { paymentType, amount } =
      await this.transactionValidation.validateTopup(payload);

    if (
      (
        await this.transactionService.findActiveUserTransactionByType(
          user.id,
          TransactionType.TOPUP,
        )
      )?.length
    )
      throw new ConflictException('You have an active top up transaction');

    const charge = await this.midtransService.chargeTopup(paymentType, {
      username: user.username,
      email: user.email,
      amount,
    });

    if (
      !charge ||
      isNaN(Number(charge.status_code)) ||
      Number(charge.status_code) >= 400
    )
      throw new BadGatewayException('failed to charge topup');

    const transaction = await this.transactionService.create(
      new CreateTransactionDto({
        type: TransactionType.TOPUP,
        userId: user.id,
        signature: this.midtransService.generateSignature(
          charge.order_id,
          '200',
          charge.gross_amount,
        ),
        amount,
        fee: amount < MINIMUM_FREE_ADMIN ? 4500 : 0,
        tax: 0,
        discount: 0,
        description: 'Topup wallet via ' + paymentType,
        detail: amount < MINIMUM_FREE_ADMIN ? '+ Midtrans Fee: 4500' : null,
        context: {
          vaNumber: charge?.va_numbers ?? [],
          actions: charge?.actions ?? [],
        },
      }),
    );

    return this.sendResponseBody({
      message: 'Topup transaction created',
      data: this.transactionHelper.generateTransactionResponse(
        transaction.dataValues.id,
        charge,
      ),
      code: 201,
    });
  }

  @Post('notification')
  @HttpCode(200)
  public async notification(
    @Body() payload: ChargeResp,
    @Body('signature_key', TransactionFindBySignaturePipe)
    transactionData: TransactionAttributes | null,
  ) {
    if (!transactionData) throw new NotFoundException('transaction not found');

    if (!payload.order_id)
      throw new BadRequestException('order id must supplied');

    if (!payload.order_id.startsWith(ORDER_ID_START_WITH))
      throw new BadRequestException('invalid order id');

    const transaction = await this.sequelize.transaction();
    try {
      const splitted = payload.order_id.split('-');
      const orderType = splitted[splitted.length - 1] as OrderType;
      if (!ORDER_TYPES.includes(orderType))
        throw new BadRequestException('invalid order id');

      if (orderType === 'tp') {
        const wallet = await this.walletService.findByUserId(
          transactionData.userId,
          { lock: Transaction.LOCK.UPDATE, transaction },
        );
        if (!wallet) throw new NotFoundException('wallet not found');

        if (payload.transaction_status === 'settlement')
          await this.walletService.updateBalance(
            transactionData.userId,
            +wallet.balance + +transactionData.amount,
            { transaction },
          );
      }

      if (orderType === 'py')
        if (
          payload.transaction_status === 'settlement' &&
          transactionData?.context
        )
          switch (transactionData.context.type) {
            case CREATE_TOURNAMENT_TRANSACTION:
              {
                const { tournamentId = null } =
                  transactionData.context as CreateTournamentTransactionContext;
                if (!tournamentId)
                  throw new BadGatewayException(
                    'unexpectedly missing tournamentId',
                  );

                const tournament = await this.tournamentService.findById(
                  tournamentId,
                  { transaction, lock: Transaction.LOCK.UPDATE },
                );
                if (!tournament)
                  throw new NotFoundException('tournament not found');

                await this.tournamentService.updateMoneyPool(
                  tournament.id,
                  +tournament.moneyPool + +transactionData.amount,
                  { transaction },
                );
              }
              break;
            case PARTICIPATE_TOURNAMENT:
              {
                const { tournamentId = null, teamId = null } =
                  transactionData.context as ParticipateTournamentTransactionContext;
                if (!tournamentId)
                  throw new BadGatewayException(
                    'unexpectedly missing tournamentId',
                  );

                if (!teamId)
                  throw new BadGatewayException('unexpectedly missing teamId');

                const participant =
                  await this.tournamentParticipantService.findByTournamentIdAndTeamId(
                    tournamentId,
                    teamId,
                    { transaction, lock: Transaction.LOCK.UPDATE },
                  );
                if (!participant)
                  throw new NotFoundException('participant not found');

                if (participant.status)
                  throw new ConflictException(
                    'participant already participated to the tournament',
                  );

                await this.tournamentParticipantService.updateStatus(
                  participant.tournamentId,
                  participant.teamId,
                  true,
                  { transaction },
                );
              }
              break;
            default:
              throw new BadRequestException('invalid transaction context');
          }

      await this.transactionService.updateStatus(
        transactionData.id,
        TransactionStatus[payload.transaction_status] ??
          TransactionStatus.FAILED,
        { transaction },
      );

      await transaction.commit();
      return this.sendResponseBody({
        message: 'success',
        code: 200,
      });
    } catch (err) {
      await transaction.rollback();
      throw err;
    }
  }
}
