import 'dotenv/config';
import { BadRequestException, Injectable } from '@nestjs/common';
import { type ChargeParameter, CoreApi, ItemDetail } from 'midtrans-client';
import {
  ChargeTopupViaBankProps,
  ChargeTopupViaEWalletProps,
} from './midtrans.interface';
import {
  BANK_PROVIDERS,
  EWALLET_PROVIDERS,
  ITEM_ID,
} from 'src/constants/transaction.constant';
import { MidtransHelper } from './midtrans.helper';
import { sha512 } from 'js-sha512';

@Injectable()
export class MidtransService extends MidtransHelper {
  private readonly coreApi: CoreApi = new CoreApi({
    isProduction: process.env.NODE_ENV === 'production',
    serverKey: process.env.MIDTRANS_SERVER_KEY,
    clientKey: process.env.MIDTRANS_CLIENT_KEY,
  });

  public async chargeTopupViaBank({
    username,
    email,
    amount,
    bank,
  }: ChargeTopupViaBankProps) {
    if (!BANK_PROVIDERS.includes(bank))
      throw new BadRequestException('unsupported bank');

    const item_details: ItemDetail[] = [
      {
        id: ITEM_ID.TOPUP_ITEM_ID,
        price: amount,
        quantity: 1,
        name: 'Topup',
      },
    ];

    if (amount < 100_000)
      item_details.push({
        id: ITEM_ID.TRANSACTION_MIDTRANS_FEE,
        price: 4500,
        quantity: 1,
        name: 'Transaction Midtrans Fee',
      });

    const payload: ChargeParameter = {
      payment_type: 'bank_transfer',
      transaction_details: {
        gross_amount: item_details
          .map(({ price }) => price)
          .reduce((a, b) => a + b),
        order_id: this.generateTransactionId('topup'),
      },
      customer_details: {
        first_name: username,
        email,
      },
      item_details,
      bank_transfer: {
        bank,
      },
    };

    return await this.coreApi.charge(payload);
  }

  public async chargeTopupViaEwallet({
    username,
    email,
    amount,
    provider,
  }: ChargeTopupViaEWalletProps) {
    if (!EWALLET_PROVIDERS.includes(provider))
      throw new BadRequestException('unsupported ewallet');

    const item_details: ItemDetail[] = [
      {
        id: ITEM_ID.TOPUP_ITEM_ID,
        price: amount,
        quantity: 1,
        name: 'Topup',
      },
    ];

    if (amount < 100_000)
      item_details.push({
        id: ITEM_ID.TRANSACTION_MIDTRANS_FEE,
        price: 4500,
        quantity: 1,
        name: 'Transaction Midtrans Fee',
      });

    const payload: ChargeParameter = {
      payment_type: provider,
      transaction_details: {
        gross_amount: item_details
          .map(({ price }) => price)
          .reduce((a, b) => a + b),
        order_id: this.generateTransactionId('topup'),
      },
      customer_details: {
        first_name: username,
        email,
      },
      item_details,
    };

    return await this.coreApi.charge(payload);
  }

  public generateSignature(
    orderId: string,
    statusCode: string,
    grossAmount: string,
  ) {
    return sha512(
      orderId + statusCode + grossAmount + process.env.MIDTRANS_SERVER_KEY,
    );
  }
}
