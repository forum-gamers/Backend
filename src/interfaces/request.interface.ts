import type { NumberSchema, StringSchema } from 'yup';

export interface BaseQuery {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortDirection?: 'ASC' | 'DESC';
}

export interface ICustomValidateFiles {
  fieldname: StringSchema;
  originalname: StringSchema;
  encoding: StringSchema;
  mimetype: StringSchema;
  size: NumberSchema;
  filename: StringSchema;
  buffer: any;
}
