import {
  BelongsTo,
  Column,
  DataType,
  Model,
  Table,
} from 'sequelize-typescript';
import { COMMUNITY_EVENT_STATUS } from 'src/constants/event.constant';
import { User } from './user';

export type CommunityEventStatus =
  | 'scheduled'
  | 'ongoing'
  | 'completed'
  | 'cancelled';

export interface CommunityEventAttributes {
  id: number;
  communityId: number;
  title: string;
  description?: string;
  location: string;
  startTime: Date;
  endTime: Date | null;
  createdBy: string;
  isPublic: boolean;
  status: CommunityEventStatus;
  createdAt: Date;
  updatedAt: Date;
}

@Table<Model<CommunityEventAttributes, CommunityEventAttributes>>({
  tableName: 'CommunityEvents',
  modelName: 'CommunityEvents',
})
export class CommunityEvent
  extends Model<CommunityEventAttributes, CommunityEventAttributes>
  implements CommunityEventAttributes
{
  @Column({
    primaryKey: true,
    allowNull: false,
    autoIncrement: true,
    type: DataType.INTEGER,
  })
  public id: number;

  @Column({
    references: {
      model: {
        tableName: 'Communities',
      },
      key: 'id',
    },
    onDelete: 'SET NULL',
    onUpdate: 'SET NULL',
    allowNull: false,
    validate: {
      notNull: {
        msg: 'communityId is required',
      },
      notEmpty: {
        msg: 'communityId is required',
      },
    },
    type: DataType.INTEGER,
  })
  public communityId: number;

  @Column({
    allowNull: false,
    validate: {
      notNull: {
        msg: 'title is required',
      },
      notEmpty: {
        msg: 'title is required',
      },
    },
    type: DataType.STRING,
  })
  public title: string;

  @Column({
    allowNull: true,
    type: DataType.TEXT,
  })
  public description?: string;

  @Column({
    allowNull: false,
    validate: {
      notNull: {
        msg: 'location is required',
      },
      notEmpty: {
        msg: 'location is required',
      },
    },
    type: DataType.STRING,
  })
  public location: string;

  @Column({
    allowNull: false,
    validate: {
      notNull: {
        msg: 'startTime is required',
      },
      notEmpty: {
        msg: 'startTime is required',
      },
    },
    type: DataType.DATE,
  })
  public startTime: Date;

  @Column({
    allowNull: true,
    defaultValue: null,
    type: DataType.DATE,
  })
  public endTime: Date | null;

  @Column({
    allowNull: false,
    validate: {
      notNull: {
        msg: 'createdBy is required',
      },
      notEmpty: {
        msg: 'createdBy is required',
      },
    },
    type: DataType.STRING,
    references: {
      model: {
        tableName: 'Users',
      },
      key: 'id',
    },
    onDelete: 'SET NULL',
    onUpdate: 'SET NULL',
  })
  public createdBy: string;

  @Column({
    defaultValue: false,
    type: DataType.BOOLEAN,
  })
  public isPublic: boolean;

  @Column({
    type: DataType.ENUM,
    values: COMMUNITY_EVENT_STATUS,
    defaultValue: 'scheduled',
  })
  public status: CommunityEventStatus;

  @Column({
    allowNull: false,
    type: DataType.DATE,
  })
  public createdAt: Date;

  @Column({
    allowNull: false,
    type: DataType.DATE,
  })
  public updatedAt: Date;

  @BelongsTo(() => User, 'createdBy')
  public creator: User;
}
