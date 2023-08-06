import { Request } from 'express';

export const getUserIp = (request: Request): string => {
  const ipAddress =
    request.headers['x-forwarded-for'] || request.connection.remoteAddress;

  if (Array.isArray(ipAddress)) {
    // Extract the first IP address from the array
    return ipAddress[0];
  }

  return ipAddress;
};
