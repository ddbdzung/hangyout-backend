import { Inject, Injectable } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';

@Injectable()
export class RedisService {
  constructor(@Inject(CACHE_MANAGER) private readonly cacheManager: Cache) {}
  private _toMsFromSeconds(seconds: number): number {
    return seconds * 1000;
  }
  /**
   * @param {number} ttl In seconds
   */
  async set(key: string, value: any, ttl?: number): Promise<void> {
    return await this.cacheManager.set(key, value, this._toMsFromSeconds(ttl));
  }
  async get(key: string): Promise<string> {
    return await this.cacheManager.get(key);
  }

  async del(key: string): Promise<void> {
    return await this.cacheManager.del(key);
  }
}
