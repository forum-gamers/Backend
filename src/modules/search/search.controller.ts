import { Controller } from '@nestjs/common';
import { BaseController } from 'src/base/controller.base';
import { SearchService } from './search.service';

@Controller('search')
export class SearchController extends BaseController {
  constructor(private readonly searchService: SearchService) {
    super();
  }
}
