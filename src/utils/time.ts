import { DateTime } from 'luxon';

import { UNITS } from '@/constants/enums/Time';

/**
 * @param {string} time In milliseconds
 * @param {number} unit UNITS
 */
export const plus = (time: number, unit: UNITS | string) =>
  DateTime.local()
    .plus({ [unit]: time })
    .toJSDate();

export const getSecondFromJwtExpiresIn = (val: string): number => {
  if (!val) return 0;
  if (/^[0-9]+$/.test(val)) return parseInt(val, 10);

  if (val.endsWith('ms')) {
    return parseInt(val.slice(0, -2), 10) / 1000;
  }

  if (val.endsWith('s')) {
    return parseInt(val.slice(0, -1), 10);
  }

  if (val.endsWith('m')) {
    return parseInt(val.slice(0, -1), 10) * 60;
  }

  if (val.endsWith('h')) {
    return parseInt(val.slice(0, -1), 10) * 60 * 60;
  }

  if (val.endsWith('d')) {
    return parseInt(val.slice(0, -1), 10) * 60 * 60 * 24;
  }

  if (val.endsWith('w')) {
    return parseInt(val.slice(0, -1), 10) * 60 * 60 * 24 * 7;
  }

  if (val.endsWith('y')) {
    return parseInt(val.slice(0, -1), 10) * 60 * 60 * 24 * 365;
  }
};
