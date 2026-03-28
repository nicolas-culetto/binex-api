export default () => ({
  port: parseInt(process.env.PORT as string, 10) || 3000,
  database: {
    type: process.env.DATABASE_TYPE,
    url: process.env.DATABASE_URL as string,
    host: process.env.DATABASE_HOST as string,
    port: parseInt(process.env.DATABASE_PORT as string, 10) || 5432,
    username: process.env.DATABASE_USERNAME as string,
    password: process.env.DATABASE_PASSWORD as string,
    database: process.env.DATABASE as string,
  }
});