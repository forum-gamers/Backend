import { SearchResultDto } from './dto/searchResult.dto';

export interface SearchAnythingResult {
  datas: SearchResultDto[];
  totalData: number;
}
