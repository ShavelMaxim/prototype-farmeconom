import { baseApi } from '@/shared/api/base-api';
import type { CatalogQuery, CatalogResponse } from '@/entities/product/model';
import { catalogQuerySchema } from './model';
import { getCatalog } from './repository';
export const catalogApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getCatalog: build.query<CatalogResponse, CatalogQuery & { demo?: string }>({
      async queryFn(params, api, extra, request) {
        if (process.env.NEXT_PUBLIC_API_URL) {
          const result = await request({ url: 'products', params });
          return result.error ? { error: result.error } : { data: result.data as CatalogResponse };
        }
        await new Promise((resolve) => setTimeout(resolve, params.demo === 'slow' ? 1500 : 250));
        if (api.signal.aborted) return { error: { status: 'CUSTOM_ERROR', error: 'Отменено' } };
        if (params.demo === 'error')
          return { error: { status: 503, data: { message: 'Демонстрационная ошибка' } } };
        const parsed = catalogQuerySchema.safeParse(params);
        if (!parsed.success)
          return { error: { status: 400, data: { message: 'Проверьте параметры поиска' } } };
        return { data: getCatalog(parsed.data) };
      },
    }),
  }),
});
export const { useGetCatalogQuery } = catalogApi;
