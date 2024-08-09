import { Controller, Get, HttpCode, Query } from '@nestjs/common';
import { BaseController } from 'src/base/controller.base';
import { SearchService } from './search.service';
import { HistoryService } from '../history/history.service';
import { SearchValidation } from './search.validation';
import { CreateHistoryDto } from '../history/dto/create.dto';
import { UserMe } from '../user/decorators/me.decorator';

@Controller('search')
export class SearchController extends BaseController {
  constructor(
    private readonly searchService: SearchService,
    private readonly historyService: HistoryService,
    private readonly searchValidation: SearchValidation,
  ) {
    super();
  }

  @Get()
  @HttpCode(200)
  public async searchAnything(
    @Query() query: any,
    @UserMe('id') userId: string,
  ) {
    const { q, record } =
      await this.searchValidation.validateSearchQuery(query);
    try {
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
    } finally {
      if (record)
        this.historyService.create(
          new CreateHistoryDto({ searchedText: q, userId }),
        );
    }
  }
}
