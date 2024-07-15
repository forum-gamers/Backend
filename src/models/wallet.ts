import { DataTypes } from 'sequelize';
import { Column, Table, Model } from 'sequelize-typescript';

export interface WalletAttributes {
  id: string;
  userId: string;
  balance: number;
  coin: number;
  createdAt: Date;
  updatedAt: Date;
}

@Table<Model<WalletAttributes, WalletAttributes>>({
  tableName: 'Wallets',
  modelName: 'Wallets',
})
export class Wallet
  extends Model<WalletAttributes, WalletAttributes>
  implements WalletAttributes
{
  @Column({ type: DataTypes.UUID, primaryKey: true, allowNull: false })
  public id: string;

  @Column({
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: {
        tableName: 'Users',
      },
      key: 'id',
    },
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
    unique: true,
  })
  public userId: string;

  @Column({
    type: DataTypes.DECIMAL(15, 2),
    defaultValue: 0,
  })
  public balance: number;

  @Column({
    type: DataTypes.DECIMAL(15, 2),
    defaultValue: 0,
  })
  public coin: number;

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
