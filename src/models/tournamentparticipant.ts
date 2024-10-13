import { DataTypes } from 'sequelize';
import { Column, Model, Table } from 'sequelize-typescript';

export interface TournamentParticipantAttributes {
  id: number;
  tournamentId: number;
  teamId: string;
  createdAt: Date;
  updatedAt: Date;
  status: boolean;
}

@Table<Model<TournamentParticipantAttributes, TournamentParticipantAttributes>>(
  {
    tableName: 'TournamentParticipants',
    modelName: 'TournamentParticipants',
  },
)
export class TournamentParticipant
  extends Model<
    TournamentParticipantAttributes,
    TournamentParticipantAttributes
  >
  implements TournamentParticipantAttributes
{
  @Column({
    allowNull: false,
    autoIncrement: true,
    primaryKey: true,
    type: DataTypes.INTEGER,
  })
  public id: number;

  @Column({
    type: DataTypes.INTEGER,
    references: {
      model: {
        tableName: 'Tournaments',
      },
      key: 'id',
    },
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
    allowNull: false,
    validate: {
      notNull: {
        msg: 'Tournament Id is required',
      },
      notEmpty: {
        msg: 'Tournament Id is required',
      },
    },
  })
  public tournamentId: number;

  @Column({
    type: DataTypes.UUID,
    references: {
      model: {
        tableName: 'Teams',
      },
      key: 'id',
    },
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
    allowNull: false,
    validate: {
      notNull: {
        msg: 'Team Id is required',
      },
      notEmpty: {
        msg: 'Team Id is required',
      },
    },
  })
  public teamId: string;

  @Column({
    type: DataTypes.BOOLEAN,
    allowNull: false,
    validate: {
      notNull: {
        msg: 'Status is required',
      },
      notEmpty: {
        msg: 'Status is required',
      },
    },
  })
  public status: boolean;

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
