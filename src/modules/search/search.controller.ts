import {
  BadRequestException,
  Controller,
  Get,
  HttpCode,
  Query,
} from '@nestjs/common';
import { BaseController } from 'src/base/controller.base';
import { SearchService } from './search.service';

@Controller('search')
export class SearchController extends BaseController {
  constructor(private readonly searchService: SearchService) {
    super();
  }

  @Get()
  @HttpCode(200)
  public async searchAnything(@Query('q') q: string) {
    if (!q) throw new BadRequestException('q is required');

    const { datas, totalData } = await this.searchService.searchAnything(q);
    return this.sendResponseBody(
      {
        message: 'OK',
        code: 200,
        data: datas,
      },
      {
        totalData,
        totalPage: Math.ceil(totalData / 15),
        page: 1,
        limit: 15,
      },
    );
  }
}
