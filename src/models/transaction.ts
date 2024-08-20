import { DataTypes } from 'sequelize';
import { Column, Model, Table } from 'sequelize-typescript';
import type {
  Supported_Currency,
  Transaction_Status,
} from 'src/interfaces/model.interface';
import type { TransactionType } from 'src/interfaces/transaction.interface';

export interface TransactionAttributes {
  id: string;
  userId: string;
  amount: number;
  type: TransactionType;
  currency: Supported_Currency;
  status: Transaction_Status;
  description?: string;
  detail?: string;
  signature: string;
  discount: number;
  fee: number;
  tax: number;
  createdAt: Date;
  updatedAt: Date;
}

@Table<Model<TransactionAttributes, TransactionAttributes>>({
  tableName: 'Transactions',
  modelName: 'Transactions',
})
export class Transaction
  extends Model<TransactionAttributes, TransactionAttributes>
  implements TransactionAttributes
{
  @Column({
    primaryKey: true,
    allowNull: false,
    type: DataTypes.UUID,
  })
  public id: string;

  @Column({
    allowNull: false,
    type: DataTypes.UUID,
    references: {
      model: {
        tableName: 'Users',
      },
      key: 'id',
    },
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  })
  public userId: string;

  @Column({
    allowNull: false,
    type: DataTypes.FLOAT,
    validate: {
      notEmpty: {
        msg: 'amount is required',
      },
      notNull: {
        msg: 'amount is required',
      },
    },
  })
  public amount: number;

  @Column({
    allowNull: false,
    type: DataTypes.STRING,
    validate: {
      notEmpty: {
        msg: 'type is required',
      },
      notNull: {
        msg: 'type is required',
      },
    },
  })
  public type: TransactionType;

  @Column({
    type: DataTypes.ENUM,
    values: ['USD', 'IDR'],
    defaultValue: 'IDR',
  })
  public currency: Supported_Currency;

  @Column({
    type: DataTypes.ENUM,
    values: [
      'pending',
      'completed',
      'failed',
      'cancel',
      'refund',
      'settlement',
      'deny',
      'expire',
    ],
    defaultValue: 'pending',
  })
  public status: Transaction_Status;

  @Column({
    allowNull: true,
    type: DataTypes.TEXT,
  })
  public description?: string;

  @Column({
    allowNull: true,
    type: DataTypes.TEXT,
  })
  public detail?: string;

  @Column({
    allowNull: false,
    validate: {
      notEmpty: {
        msg: 'signature is required',
      },
      notNull: {
        msg: 'signature is required',
      },
    },
    type: DataTypes.STRING,
  })
  public signature: string;

  @Column({
    allowNull: false,
    type: DataTypes.FLOAT,
    defaultValue: 0,
  })
  public discount: number;

  @Column({
    allowNull: false,
    type: DataTypes.FLOAT,
    validate: {
      notEmpty: {
        msg: 'fee is required',
      },
      notNull: {
        msg: 'fee is required',
      },
    },
  })
  public fee: number;

  @Column({
    type: DataTypes.FLOAT,
    defaultValue: 0,
  })
  public tax: number;

  @Column({
    allowNull: false,
    type: DataTypes.DATE,
  })
  public createdAt: Date;

  @Column({
    allowNull: false,
    type: DataTypes.DATE,
  })
  public updatedAt: Date;
}
