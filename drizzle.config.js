import 'dotenv/config';

export default {
  schema: './src/models/*.js',
  out: './drizzle',
  dialect: 'postgresql',
  dbCredentials: { url: process.env.NODE_ENV.DATABASE_URL },
};
