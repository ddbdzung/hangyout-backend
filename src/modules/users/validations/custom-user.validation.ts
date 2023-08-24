import { allTimeZone } from '@/common/libs/all-time-zone.common';

export const objectId = (value, helpers) => {
  if (!value.match(/^[0-9a-fA-F]{24}$/)) {
    return helpers.message('"{{#label}}" must be a valid mongo id');
  }
  return value;
};

export const validPhoneNumber = (value: string, helpers) => {
  const mobileCodes = allTimeZone.map(tz => tz.mobileCode);
  if (!mobileCodes.some(code => value.startsWith(code))) {
    return helpers.error('Invalid phone number');
  }

  return value;
};
