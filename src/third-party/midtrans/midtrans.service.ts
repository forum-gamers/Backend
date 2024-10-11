import 'dotenv/config';
import { BadRequestException, Injectable } from '@nestjs/common';
import {
  type ChargeParameter,
  CoreApi,
  EnablePayment,
  ItemDetail,
} from 'midtrans-client';
import {
  ChargeTopupProps,
  ChargeTopupViaBankProps,
  ChargeTopupViaEWalletProps,
} from './midtrans.interface';
import {
  BANK_PROVIDERS,
  EWALLET_PROVIDERS,
  ITEM_ID,
} from 'src/constants/transaction.constant';
import { MidtransHelper } from './midtrans.helper';
import type {
  BankProvider,
  PaymentProvider,
} from 'src/interfaces/transaction.interface';

@Injectable()
export class MidtransService extends MidtransHelper {
  private readonly coreApi: CoreApi = new CoreApi({
    isProduction: process.env.NODE_ENV === 'production',
    serverKey: process.env.MIDTRANS_SERVER_KEY,
    clientKey: process.env.MIDTRANS_CLIENT_KEY,
  });

  private async chargeTopupViaBank({
    username,
    email,
    amount,
    bank,
  }: ChargeTopupViaBankProps) {
    if (!BANK_PROVIDERS.includes(bank))
      throw new BadRequestException('unsupported bank');

    const item_details: ItemDetail[] = this.generateItemDetails({
      id: ITEM_ID.TOPUP_ITEM_ID,
      price: amount,
      quantity: 1,
      name: 'Topup',
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

  private async chargeTopupViaEwallet({
    username,
    email,
    amount,
    provider,
  }: ChargeTopupViaEWalletProps) {
    if (!EWALLET_PROVIDERS.includes(provider))
      throw new BadRequestException('unsupported ewallet');

    const item_details: ItemDetail[] = this.generateItemDetails({
      id: ITEM_ID.TOPUP_ITEM_ID,
      price: amount,
      quantity: 1,
      name: 'Topup',
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

  public async chargeTopup(
    type: PaymentProvider,
    { username, email, amount }: ChargeTopupProps,
  ) {
    switch (true) {
      case BANK_PROVIDERS.includes(type as BankProvider):
        return await this.chargeTopupViaBank({
          username,
          email,
          amount,
          bank: type as BankProvider,
        });
      case EWALLET_PROVIDERS.includes(type as EnablePayment):
        return await this.chargeTopupViaEwallet({
          username,
          email,
          amount,
          provider: type as EnablePayment,
        });
      default:
        throw new BadRequestException('unsupported payment provider');
    }
  }

  private async chargePaymentViaEwallet({
    username,
    email,
    amount,
    provider,
    transactionName,
  }: ChargeTopupViaEWalletProps & { transactionName: string }) {
    if (!EWALLET_PROVIDERS.includes(provider))
      throw new BadRequestException('unsupported ewallet');

    const item_details: ItemDetail[] = this.generateItemDetails({
      id: ITEM_ID.PAYMENT_ITEM_ID,
      price: amount,
      quantity: 1,
      name: transactionName,
    });

    const payload: ChargeParameter = {
      payment_type: provider,
      transaction_details: {
        gross_amount: item_details
          .map(({ price }) => price)
          .reduce((a, b) => a + b),
        order_id: this.generateTransactionId('payment'),
      },
      customer_details: {
        first_name: username,
        email,
      },
      item_details,
    };

    return await this.coreApi.charge(payload);
  }

  private async chargePaymentViaBank({
    username,
    email,
    amount,
    bank,
    transactionName,
  }: ChargeTopupViaBankProps & { transactionName: string }) {
    if (!BANK_PROVIDERS.includes(bank))
      throw new BadRequestException('unsupported bank');

    const item_details: ItemDetail[] = this.generateItemDetails({
      id: ITEM_ID.PAYMENT_ITEM_ID,
      price: amount,
      quantity: 1,
      name: transactionName,
    });

    const payload: ChargeParameter = {
      payment_type: 'bank_transfer',
      transaction_details: {
        gross_amount: item_details
          .map(({ price }) => price)
          .reduce((a, b) => a + b),
        order_id: this.generateTransactionId('payment'),
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

  public async chargePayment(
    type: PaymentProvider,
    {
      username,
      email,
      amount,
      transactionName,
    }: ChargeTopupProps & { transactionName: string },
  ) {
    switch (true) {
      case BANK_PROVIDERS.includes(type as BankProvider):
        return await this.chargePaymentViaBank({
          username,
          email,
          amount,
          bank: type as BankProvider,
          transactionName,
        });
      case EWALLET_PROVIDERS.includes(type as EnablePayment):
        return await this.chargePaymentViaEwallet({
          username,
          email,
          amount,
          provider: type as EnablePayment,
          transactionName,
        });
      default:
        throw new BadRequestException('unsupported payment provider');
    }
  }
}
