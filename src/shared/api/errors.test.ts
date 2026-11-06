import { describe, expect, it } from 'vitest';
import { apiErrorMessage } from './errors';
describe('сообщения API', () => {
  it('различает отсутствие сети, таймаут, ошибку данных и конфликт наличия', () => {
    expect(apiErrorMessage({ status: 'FETCH_ERROR' })).toContain('интернету');
    expect(apiErrorMessage({ status: 'TIMEOUT_ERROR' })).toContain('вовремя');
    expect(apiErrorMessage({ status: 'CUSTOM_ERROR', error: 'VALIDATION_ERROR' })).toContain(
      'некорректные',
    );
    expect(apiErrorMessage({ status: 409 })).toContain('наличие');
    expect(apiErrorMessage({ status: 503 })).toContain('временно');
  });
});
