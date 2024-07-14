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
    }
  }
}
