import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import {
  SearchHistory,
  type SearchHistoryAttributes,
} from 'src/models/searchHistory';
import { CreateHistoryDto } from './dto/create.dto';
import { type CreateOptions } from 'sequelize';

@Injectable()
export class HistoryService {
  constructor(
    @InjectModel(SearchHistory)
    private readonly searchHistoryModel: typeof SearchHistory,
  ) {}

  public async create(
    payload: CreateHistoryDto,
    opts?: CreateOptions<SearchHistoryAttributes>,
  ) {
    return await this.searchHistoryModel.create(payload, opts);
  }
}
