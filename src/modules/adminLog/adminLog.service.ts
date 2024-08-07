import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { AdminLog, type AdminLogAttributes } from 'src/models/adminlog';
import { CreateAdminLogDto } from './dto/create.dto';
import { type CreateOptions } from 'sequelize';

@Injectable()
export class AdminLogService {
  constructor(
    @InjectModel(AdminLog)
    private readonly adminLogModel: typeof AdminLog,
  ) {}

  public async create(
    payload: CreateAdminLogDto,
    opts?: CreateOptions<AdminLogAttributes>,
  ) {
    return await this.adminLogModel.create(payload, opts);
  }
}
