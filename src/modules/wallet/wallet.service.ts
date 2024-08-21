import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Wallet, type WalletAttributes } from '../../models/wallet';
import { CreateWallet } from './dto/createWallet.dto';
import type { CreateOptions, FindOptions, UpdateOptions } from 'sequelize';
import { v4 } from 'uuid';

@Injectable()
export class WalletService {
  constructor(
    @InjectModel(Wallet)
    private readonly walletModel: typeof Wallet,
  ) {}

  public async createWallet(
    payload: CreateWallet,
    opts?: CreateOptions<WalletAttributes>,
  ) {
    return await this.walletModel.create({ ...payload, id: v4() }, opts);
  }

  public async updateBalance(
    userId: string,
    balance: number,
    opts?: Omit<UpdateOptions<WalletAttributes>, 'where'>,
  ) {
    return await this.walletModel.update(
      { balance },
      { ...opts, where: { userId } },
    );
  }

  public async findByUserId(
    userId: string,
    opts?: Omit<FindOptions<WalletAttributes>, 'where'>,
  ) {
    return await this.walletModel.findOne({ ...opts, where: { userId } });
  }
}
