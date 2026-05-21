export default () => ({
  runSeed: process.env.RUN_SEED === "true",
  nodeEnv: process.env.NODE_ENV as string || "production",
  port: parseInt(process.env.PORT as string, 10) || 3000,
  jwtSecret: process.env.JWT_SECRET as string,
  database: {
    type: process.env.DATABASE_TYPE,
    url: process.env.POSTGRES_URL as string,
    host: process.env.POSTGRES_HOST as string,
    port: parseInt(process.env.POSTGRES_PORT as string, 10) || 5432,
    username: process.env.POSTGRES_USER as string,
    password: process.env.POSTGRES_PASSWORD as string,
    database: process.env.POSTGRES_DB as string,
  },
  cloudinaryUrl: process.env.CLOUDINARY_URL as string,
  rootAdminEmail: process.env.ROOT_ADMIN_EMAIL as string,
  rootAdminPassword: process.env.ROOT_ADMIN_PASSWORD as string,
  rootAdminFirstName: process.env.ROOT_ADMIN_FIRST_NAME as string,
  rootAdminLastName: process.env.ROOT_ADMIN_LAST_NAME as string
});