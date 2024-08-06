import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Admin } from 'src/models/admin';

@Injectable()
export class AdminService {
  constructor(
    @InjectModel(Admin)
    private readonly adminModel: typeof Admin,
  ) {}

  public async findOneByEmail(email: string) {
    return this.adminModel.findOne({ where: { email } });
  }
}
