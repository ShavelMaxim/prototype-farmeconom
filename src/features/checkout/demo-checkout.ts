import { checkoutRequestSchema } from '@/features/checkout/model';
import { getCartSummary } from '@/features/cart/summary';
import { products } from '@/entities/product/repository';
export async function demoCheckout(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ message: 'Некорректный запрос.' }, { status: 400 });
  }
  const result = checkoutRequestSchema.safeParse(body);
  if (!result.success)
    return Response.json({ message: 'Проверьте данные оформления.' }, { status: 400 });
  const summary = getCartSummary(result.data.items, products, result.data.pharmacy);
  if (!summary.valid)
    return Response.json(
      { message: 'Количество или наличие изменилось. Проверьте корзину.' },
      { status: 409 },
    );
  return Response.json(
    {
      reference: `DEMO-${crypto.randomUUID().slice(0, 8).toUpperCase()}`,
      total: summary.total,
      count: summary.count,
      message: 'Сценарий пройден. Настоящий заказ не создан.',
    },
    { headers: { 'Cache-Control': 'no-store' } },
  );
}
