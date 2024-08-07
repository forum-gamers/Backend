import { SearchResultDto } from './dto/searchResult.dto';

export interface SearchAnythingResult {
  datas: SearchResultDto[];
  totalData: number;
}

export interface SearchQueryProps {
  q: string;
  record: boolean;
}
