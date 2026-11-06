import { NextRequest, NextResponse } from 'next/server';
import { catalogQuerySchema } from '@/entities/product/model';
import { getCatalog } from '@/entities/product/repository';
export async function GET(request: NextRequest) {
  const parsed = catalogQuerySchema.safeParse(Object.fromEntries(request.nextUrl.searchParams));
  if (!parsed.success)
    return NextResponse.json({ message: 'Проверьте параметры поиска.' }, { status: 400 });
  const demo = request.nextUrl.searchParams.get('demo');
  if (demo === 'slow') await new Promise((resolve) => setTimeout(resolve, 1500));
  if (demo === 'error')
    return NextResponse.json(
      { message: 'Демонстрационная ошибка. Отключите её в панели проверки.' },
      { status: 503 },
    );
  return NextResponse.json(getCatalog(parsed.data), { headers: { 'Cache-Control': 'no-store' } });
}
