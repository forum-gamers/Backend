import 'dotenv/config';
import { Injectable } from '@nestjs/common';
import { CoreApi } from 'midtrans-client';

@Injectable()
export class MidtransService {
  private readonly coreApi: CoreApi = new CoreApi({
    isProduction: process.env.NODE_ENV === 'production',
    serverKey: process.env.MIDTRANS_SERVER_KEY,
    clientKey: process.env.MIDTRANS_CLIENT_KEY,
  });
}
