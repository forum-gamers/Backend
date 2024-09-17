import { DataTypes } from 'sequelize';
import { BelongsTo, Column, Model, Table } from 'sequelize-typescript';
import { User } from './user';

export interface DiscordProfileAttributes {
  id: string;
  imageUrl?: string;
  backgroundUrl?: string;
  userId: string;
  accessToken: string;
  refreshToken: string;
  tokenExpires: bigint;
}

@Table<Model<DiscordProfileAttributes, DiscordProfileAttributes>>({
  tableName: 'DiscordProfiles',
  modelName: 'DiscordProfiles',
})
export class DiscordProfile
  extends Model<DiscordProfileAttributes, DiscordProfileAttributes>
  implements DiscordProfileAttributes
{
  @Column({
    primaryKey: true,
    allowNull: false,
    type: DataTypes.STRING,
  })
  public id: string;

  @Column({
    allowNull: true,
    type: DataTypes.STRING,
  })
  public imageUrl?: string;

  @Column({
    allowNull: true,
    type: DataTypes.STRING,
  })
  public backgroundUrl?: string;

  @Column({
    allowNull: false,
    type: DataTypes.STRING,
    validate: {
      notEmpty: {
        msg: 'accessToken is required',
      },
      notNull: {
        msg: 'accessToken is required',
      },
    },
  })
  public accessToken: string;

  @Column({
    allowNull: false,
    type: DataTypes.STRING,
    validate: {
      notEmpty: {
        msg: 'refreshToken is required',
      },
      notNull: {
        msg: 'refreshToken is required',
      },
    },
  })
  public refreshToken: string;

  @Column({
    allowNull: false,
    type: DataTypes.BIGINT,
    validate: {
      notEmpty: {
        msg: 'tokenExpires is required',
      },
      notNull: {
        msg: 'tokenExpires is required',
      },
    },
  })
  public tokenExpires: bigint;

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
    type: DataTypes.DATE,
  })
  public createdAt: Date;

  @Column({
    allowNull: false,
    type: DataTypes.DATE,
  })
  public updatedAt: Date;

  @BelongsTo(() => User, 'userId')
  public user: User;
}
