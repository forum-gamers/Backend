import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Admin, type AdminAttributes } from 'src/models/admin';
import { CreateAdminDto } from './dto/create.dto';
import { CreateOptions } from 'sequelize';

@Injectable()
export class AdminService {
  constructor(
    @InjectModel(Admin)
    private readonly adminModel: typeof Admin,
  ) {}

  public async findOneByEmail(email: string) {
    return this.adminModel.findOne({ where: { email } });
  }

  public async findOneById(id: string) {
    return this.adminModel.findByPk(id);
  }

  public async create(
    payload: CreateAdminDto,
    opts?: CreateOptions<AdminAttributes>,
  ) {
    return await this.adminModel.create(payload, opts);
  }
}
