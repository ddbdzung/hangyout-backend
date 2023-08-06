import * as dotenv from 'dotenv';
import * as path from 'path';

const ENV = process.env.NODE_ENV;
const envFilePath = !ENV ? '.env' : `.${ENV}.env`;
dotenv.config({
  path: path.join(__dirname, '..', envFilePath),
});
