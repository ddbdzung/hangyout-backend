import { readFileSync } from 'fs';

export default function loadEnvFile(path: string) {
  const envFile = readFileSync(path);
  const env = {};
  const envConfig = envFile.toString().split('\n');
  envConfig.forEach(line => {
    const [key, value] = line.split('=');
    if (key && value) {
      env[key] = value;
    }
  });
  return env;
}
