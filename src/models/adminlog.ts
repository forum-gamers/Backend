import { DataTypes } from 'sequelize';
import { Column, Model, Table } from 'sequelize-typescript';

export interface AdminLogAttributes {
  id: number;
  adminId: string;
  path: string;
  statusCode: number;
  method: string;
  createdAt: Date;
  updatedAt: Date;
}

@Table<Model<AdminLogAttributes, AdminLogAttributes>>({
  tableName: 'AdminLogs',
  modelName: 'AdminLogs',
})
export class AdminLog
  extends Model<AdminLogAttributes, AdminLogAttributes>
  implements AdminLogAttributes
{
  @Column({
    primaryKey: true,
    autoIncrement: true,
    allowNull: false,
    type: DataTypes.INTEGER,
  })
  id: number;

  @Column({
    allowNull: false,
    type: DataTypes.UUID,
    references: {
      model: {
        tableName: 'Admins',
      },
      key: 'id',
    },
  })
  adminId: string;

  @Column({
    allowNull: false,
    type: DataTypes.STRING,
    validate: {
      notEmpty: {
        msg: 'path is required',
      },
      notNull: {
        msg: 'path is required',
      },
    },
  })
  path: string;

  @Column({
    allowNull: false,
    type: DataTypes.INTEGER,
    validate: {
      notEmpty: {
        msg: 'statusCode is required',
      },
      notNull: {
        msg: 'statusCode is required',
      },
    },
  })
  statusCode: number;

  @Column({
    allowNull: false,
    type: DataTypes.ENUM,
    validate: {
      notEmpty: {
        msg: 'method is required',
      },
      notNull: {
        msg: 'method is required',
      },
    },
    values: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  })
  method: string;

  @Column({
    allowNull: false,
    type: DataTypes.DATE,
  })
  createdAt: Date;

  @Column({
    allowNull: false,
    type: DataTypes.DATE,
  })
  updatedAt: Date;
}
