import { NextResponse } from 'next/server';
import { checkoutRequestSchema } from '@/features/checkout/model';
import { getCartSummary } from '@/features/cart/summary';
import { products } from '@/entities/product/repository';
export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ message: 'Некорректный запрос.' }, { status: 400 });
  }
  const result = checkoutRequestSchema.safeParse(body);
  if (!result.success)
    return NextResponse.json({ message: 'Проверьте данные оформления.' }, { status: 400 });
  const summary = getCartSummary(result.data.items, products, result.data.pharmacy);
  if (!summary.valid)
    return NextResponse.json(
      { message: 'Количество или наличие изменилось. Проверьте корзину.' },
      { status: 409 },
    );
  return NextResponse.json(
    {
      reference: `DEMO-${crypto.randomUUID().slice(0, 8).toUpperCase()}`,
      total: summary.total,
      count: summary.count,
      message: 'Сценарий пройден. Настоящий заказ не создан.',
    },
    { headers: { 'Cache-Control': 'no-store' } },
  );
}
