import { DataTypes } from 'sequelize';
import { Column, Model, Table } from 'sequelize-typescript';

export interface TeamMemberAttributes {
  id: number;
  teamId: string;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
}

@Table<Model<TeamMemberAttributes, TeamMemberAttributes>>({
  tableName: 'TeamMembers',
  modelName: 'TeamMembers',
})
export class TeamMember
  extends Model<TeamMemberAttributes, TeamMemberAttributes>
  implements TeamMemberAttributes
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
    type: DataTypes.UUID,
    references: {
      model: {
        tableName: 'Teams',
      },
      key: 'id',
    },
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  })
  public teamId: string;

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
}
