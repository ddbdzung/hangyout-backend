import { plus, getSecondFromJwtExpiresIn } from './time';
import { UNITS } from '../constants/enums/Time';

describe('utils.time (unit)', () => {
  describe('plus', () => {
    it('should return a date in the future', () => {
      const time = 1;
      const unit = UNITS.SECOND;

      const result = plus(time, unit);

      expect(result).toBeInstanceOf(Date);
      expect(result.getTime()).toBeGreaterThan(Date.now());
    });

    it('should return exact date in the future', () => {
      const time = 1;
      const unit = UNITS.SECOND;

      const result = plus(time, unit);

      expect(result).toBeInstanceOf(Date);
      expect(result.getTime()).toBeCloseTo(Date.now() + time * 1000, -2);
    });
  });

  describe('getSecondFromJwtExpiresIn', () => {
    it('should return 0 if input is empty', () => {
      const result = getSecondFromJwtExpiresIn('');

      expect(result).toBe(0);
    });

    it('should return exact number of seconds', () => {
      const result = getSecondFromJwtExpiresIn('15m');

      expect(result).toBe(15 * 60);
    });
  });
});
