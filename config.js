const dotenv = require("dotenv");
const { z } = require("zod");

const result = dotenv.config();

const envVars = {
  ...result.parsed,
  ...process.env,
};

const envSchema = z.object({
  MONGO_URI: z.url(),
  PORT: z.string().default("3000"),
  SESSION_SECRET: z.string(),
  CLOUDINARY_NAME: z.string(),
  CLOUDINARY_API_KEY: z.string(),
  CLOUDINARY_API_SECRET: z.string(),
  RENDER_API_KEY:z.string(),
  ADMIN_EMAIL: z.string(),
});

const parsed = envSchema.safeParse(envVars);

if (!parsed.success) {
  console.error("Invalid environment variables:", z.flattenError(parsed.error));
  process.exit(1);
}

const config = {
  mongoURI: encodeURI(parsed.data.MONGO_URI),
  port: parsed.data.PORT,

  sessionSecret: parsed.data.SESSION_SECRET,
  adminEmail: parsed.data.ADMIN_EMAIL,

  cloudinary: {
    name: parsed.data.CLOUDINARY_NAME,
    apiKey: parsed.data.CLOUDINARY_API_KEY,
    apiSecret: parsed.data.CLOUDINARY_API_SECRET,
  },
  render: {
    apiKey: parsed.data.RENDER_API_KEY,
  },
};

module.exports = config;
