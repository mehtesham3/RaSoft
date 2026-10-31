import { createHash, randomBytes } from 'crypto';

export class apikeyUtils {
    
  static generate(): { plainKey: string; keyHsh: string; keyPrefix: unknown } {
    const random = randomBytes(27).toString('hex');

    const plainKey = `${process.env.DEFAULT_KEY_PREFIX}${random}`;
    const keyHsh = createHash('sha256').update(plainKey).digest('hex');

    const keyPrefix = plainKey.substring(0,15);

    return { plainKey, keyHsh, keyPrefix };
  }

  static hash(key: string): string {
    return createHash('sha256').update(key).digest('hex');
  }
}

export enum keyPrfix{
  LIVE='rag_live_',
  PRODUCTION='rag_produc_',
  TEST='rag_test_'
}