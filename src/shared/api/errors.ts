export function apiErrorMessage(error: unknown): string {
  const status = error && typeof error === 'object' && 'status' in error ? error.status : undefined;
  if (error && typeof error === 'object' && 'error' in error && error.error === 'VALIDATION_ERROR')
    return 'Сервис вернул некорректные данные. Попробуйте обновить их позже.';
  if (status === 'TIMEOUT_ERROR') return 'Сервис не ответил вовремя. Повторите попытку.';
  if (status === 'FETCH_ERROR')
    return 'Не удалось связаться с сервисом. Проверьте подключение к интернету.';
  if (status === 409) return 'Цена или наличие изменились. Вернитесь в корзину и проверьте товары.';
  if (typeof status === 'number' && status >= 500)
    return 'Сервис временно недоступен. Попробуйте ещё раз.';
  return 'Не удалось обновить данные. Повторите попытку; товары в корзине сохранены.';
}
