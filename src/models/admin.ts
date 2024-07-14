import { DataTypes } from 'sequelize';
import { Table, Model, Column } from 'sequelize-typescript';
import type { AdminDivision, AdminRole } from '../interfaces/model.interface';
import { ADMINDIVISION } from '../constants/admin.constant';

export interface AdminAttributes {
  id: string;
  fullname: string;
  email: string;
  password: string;
  division: AdminDivision;
  role: AdminRole;
  createdAt: Date;
  updatedAt: Date;
}

@Table<Model<AdminAttributes, AdminAttributes>>({
  tableName: 'Admins',
  modelName: 'Admins',
})
export class Admin
  extends Model<AdminAttributes, AdminAttributes>
  implements AdminAttributes
{
  @Column({ type: DataTypes.UUID, primaryKey: true, allowNull: false })
  public id: string;

  @Column({
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      notEmpty: {
        msg: 'fullname is required',
      },
      notNull: {
        msg: 'fullname is required',
      },
    },
  })
  public fullname: string;

  @Column({
    type: DataTypes.STRING,
    unique: true,
    allowNull: false,
    validate: {
      notEmpty: {
        msg: 'email is required',
      },
      notNull: {
        msg: 'email is required',
      },
      isEmail: {
        msg: 'invalid email format',
      },
    },
  })
  public email: string;

  @Column({
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      notNull: {
        msg: 'password is required',
      },
      notEmpty: {
        msg: 'password is required',
      },
    },
  })
  public password: string;

  @Column({
    type: DataTypes.ENUM,
    values: ADMINDIVISION,
    allowNull: false,
  })
  public division: AdminDivision;

  @Column({
    type: DataTypes.ENUM,
    values: ['Supervisor', 'Manager', 'Staff'],
    allowNull: false,
  })
  public role: AdminRole;

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
