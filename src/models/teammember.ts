import { DataTypes } from 'sequelize';
import { Column, Model, Table } from 'sequelize-typescript';
import type { TeamRole } from 'src/interfaces/model.interface';

export interface TeamMemberAttributes {
  id: number;
  teamId: string;
  status: boolean;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
  role: TeamRole;
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
    defaultValue: false,
    type: DataTypes.BOOLEAN,
  })
  public status: boolean;

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

  @Column({
    allowNull: false,
    type: DataTypes.ENUM,
    values: ['owner', 'member', 'coach', 'inspector', 'manager', 'admin'],
    defaultValue: 'member',
  })
  public role: TeamRole;
}
