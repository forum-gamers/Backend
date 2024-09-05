export declare global {
  namespace NodeJS {
    interface ProcessEnv {
      CORS_LIST: string;
      PORT: string;
      SECRET: string;
      MAILER_EMAIL: string;
      MAILER_PASSWORD: string;
      IMAGEKIT_PRIVATE_KEY: string;
      IMAGEKIT_PUBLIC_KEY: string;
      IMAGEKIT_URL: string;
      CHAT_ENCRYPTION_KEY: string;
      PUBLIC_APP_URL: string;
      CHAT_HMAC_KEY: string;
      DATABASE_ENCRYPTION_KEY: string;
      DATABASE_URL: string;
      DATABASE_PASSWORD: string;
      DATABASE_USERNAME: string;
      DATABASE_PORT: string;
      DATABASE_HOST: string;
      BACKUP_EMAIL: string;
      FIRST_ADMIN_EMAIL: string;
      FIRST_ADMIN_PASSWORD: string;
      FIRST_ADMIN_NAME: string;
      ADMIN_SECRET: string;
      MIDTRANS_SERVER_KEY: string;
      MIDTRANS_CLIENT_KEY: string;
      GOOGLE_OAUTH_CLIENTID: string;
      GOOGLE_OAUTH_CLIENT_SECRET: string;
    }
  }
}
