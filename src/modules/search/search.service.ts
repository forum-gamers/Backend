import { Injectable } from '@nestjs/common';
import { Sequelize } from 'sequelize-typescript';

@Injectable()
export class SearchService {
  constructor(private readonly sequelize: Sequelize) {}
}
