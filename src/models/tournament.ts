import { DataTypes } from 'sequelize';
import { Column, Model, Table } from 'sequelize-typescript';

export interface TournamentAttributes {
  id: number;
  name: string;
  gameId: number;
  pricePool: number;
  slot: number;
  startDate: Date;
  registrationFee: number;
  description?: string;
  imageUrl: string;
  imageId: string;
  createdAt: Date;
  updatedAt: Date;
  userId?: string | null;
  communityId?: number | null;
  location: string;
  tags: string[];
  status: string;
}

@Table<Model<TournamentAttributes, TournamentAttributes>>({
  tableName: 'Tournaments',
  modelName: 'Tournaments',
})
export class Tournament
  extends Model<TournamentAttributes, TournamentAttributes>
  implements TournamentAttributes
{
  @Column({
    allowNull: false,
    autoIncrement: true,
    primaryKey: true,
    type: DataTypes.INTEGER,
  })
  public id: number;

  @Column({
    allowNull: false,
    validate: {
      notEmpty: {
        msg: 'name is required',
      },
      notNull: {
        msg: 'name is required',
      },
    },
    type: DataTypes.STRING,
  })
  public name: string;

  @Column({
    allowNull: false,
    references: {
      model: {
        tableName: 'Games',
      },
      key: 'id',
    },
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
    validate: {
      notEmpty: {
        msg: 'gameId is required',
      },
      notNull: {
        msg: 'gameId is required',
      },
    },
    type: DataTypes.INTEGER,
  })
  public gameId: number;

  @Column({
    allowNull: false,
    validate: {
      notEmpty: {
        msg: 'pricePool is required',
      },
      notNull: {
        msg: 'pricePool is required',
      },
      min: {
        args: [0],
        msg: 'pricePool must be greater than 0',
      },
    },
    type: DataTypes.DECIMAL(15, 2),
  })
  public pricePool: number;

  @Column({
    allowNull: false,
    validate: {
      notEmpty: {
        msg: 'slot is required',
      },
      notNull: {
        msg: 'slot is required',
      },
      min: {
        args: [0],
        msg: 'slot must be greater than 0',
      },
    },
    type: DataTypes.INTEGER,
  })
  public slot: number;

  @Column({
    allowNull: false,
    validate: {
      notEmpty: {
        msg: 'startDate is required',
      },
      notNull: {
        msg: 'startDate is required',
      },
    },
    type: DataTypes.DATE,
  })
  public startDate: Date;

  @Column({
    allowNull: false,
    validate: {
      notEmpty: {
        msg: 'registrationFee is required',
      },
      notNull: {
        msg: 'registrationFee is required',
      },
      min: {
        args: [0],
        msg: 'registrationFee must be greater than 0',
      },
    },
    type: DataTypes.DECIMAL(15, 2),
  })
  public registrationFee: number;

  @Column({
    allowNull: true,
    defaultValue: null,
    type: DataTypes.TEXT,
  })
  public description?: string;

  @Column({
    type: DataTypes.ENUM,
    values: ['preparation', 'started', 'finished'],
    defaultValue: 'preparation',
  })
  public status: string;

  @Column({
    allowNull: false,
    validate: {
      notEmpty: {
        msg: 'imageUrl is required',
      },
      notNull: {
        msg: 'imageUrl is required',
      },
    },
    type: DataTypes.STRING,
  })
  public imageUrl: string;

  @Column({
    allowNull: false,
    validate: {
      notEmpty: {
        msg: 'imageId is required',
      },
      notNull: {
        msg: 'imageId is required',
      },
    },
    type: DataTypes.STRING,
  })
  public imageId: string;

  @Column({
    allowNull: false,
    validate: {
      notEmpty: {
        msg: 'location is required',
      },
      notNull: {
        msg: 'location is required',
      },
    },
    type: DataTypes.STRING,
  })
  public location: string;

  @Column({
    allowNull: false,
    type: DataTypes.ARRAY(DataTypes.STRING),
  })
  public tags: string[];

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

  @Column({
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: {
        tableName: 'Users',
      },
      key: 'id',
    },
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
    defaultValue: null,
  })
  public userId?: string;

  @Column({
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: {
        tableName: 'Communities',
      },
      key: 'id',
    },
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
    defaultValue: null,
  })
  public communityId?: number;
}
