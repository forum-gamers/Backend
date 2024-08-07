export class CreateAdminLogDto {
  public readonly adminId: string;
  public readonly path: string;
  public readonly statusCode: number;
  public readonly method: string;

  constructor({ adminId, path, statusCode, method }: CreateAdminLogDtoProps) {
    this.adminId = adminId;
    this.path = path;
    this.statusCode = statusCode;
    this.method = method;
  }
}

export interface CreateAdminLogDtoProps {
  adminId: string;
  path: string;
  statusCode: number;
  method: string;
}
