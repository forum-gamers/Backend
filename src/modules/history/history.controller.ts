import { Body, Controller, HttpCode, Post } from '@nestjs/common';
import { BaseController } from 'src/base/controller.base';
import { HistoryService } from './history.service';
import { HistoryValidation } from './history.validation';
import { UserMe } from '../user/decorators/me.decorator';
import { CreateHistoryDto } from './dto/create.dto';

@Controller('history')
export class HistoryController extends BaseController {
  constructor(
    private readonly historyService: HistoryService,
    private readonly historyValidation: HistoryValidation,
  ) {
    super();
  }

  @Post()
  @HttpCode(201)
  public async create(@Body() payload: any, @UserMe('id') userId: string) {
    const { searchedText } =
      await this.historyValidation.validateCreateHistory(payload);

    return this.sendResponseBody({
      message: 'OK',
      code: 201,
      data: await this.historyService.create(
        new CreateHistoryDto({ searchedText, userId }),
      ),
    });
  }
}
