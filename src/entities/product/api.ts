import { baseApi } from '@/shared/api/base-api';
import { delay } from '@/shared/api/delay';
import { catalogQuerySchema, type CatalogQuery, type CatalogResponse, type Product } from './model';
import { filterCatalog } from './filter-catalog';

export const inventoryApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getInventory: build.query<CatalogResponse, void>({
      async queryFn(_arg, _api, _extra, request) {
        let body: unknown;
        if (process.env.NEXT_PUBLIC_API_URL) {
          const response = await request({ url: 'products', params: catalogQuerySchema.parse({}) });
          if (response.error) return { error: response.error };
          body = response.data;
        } else {
          const { defaultCatalog } = await import('./repository');
          body = defaultCatalog;
        }
        const { catalogResponseSchema } = await import('./contracts');
        const parsed = catalogResponseSchema.safeParse(body);
        return parsed.success
          ? { data: parsed.data }
          : {
              error: {
                status: 'CUSTOM_ERROR',
                error: 'VALIDATION_ERROR',
                data: { status: 'VALIDATION_ERROR' },
              },
            };
      },
    }),
  }),
});
export const { useGetInventoryQuery } = inventoryApi;
export function useInventory(initial: Product[]) {
  const query = useGetInventoryQuery(undefined, { refetchOnMountOrArgChange: 30 });
  const products = query.data?.items ?? (process.env.NEXT_PUBLIC_API_URL ? [] : initial);
  return {
    ...query,
    products,
    ready:
      !process.env.NEXT_PUBLIC_API_URL ||
      (!query.isFetching && !query.isError && Boolean(query.data)),
  };
}
export const catalogApi = inventoryApi.injectEndpoints({
  endpoints: (build) => ({
    getCatalog: build.query<CatalogResponse, CatalogQuery & { demo?: string }>({
      async queryFn(params, api) {
        await delay(params.demo === 'slow' ? 1500 : 250, api.signal);
        if (api.signal.aborted) return { error: { status: 'CUSTOM_ERROR', error: 'Отменено' } };
        if (params.demo === 'error') return { error: { status: 503, data: {} } };
        const parsed = catalogQuerySchema.safeParse(params);
        if (!parsed.success) return { error: { status: 400, data: {} } };
        const inventory = await api.dispatch(
          inventoryApi.endpoints.getInventory.initiate(undefined, {
            subscribe: false,
            forceRefetch: Boolean(process.env.NEXT_PUBLIC_API_URL),
          }),
        );
        if (inventory.error)
          return {
            error:
              'status' in inventory.error
                ? inventory.error
                : { status: 'CUSTOM_ERROR', error: 'Не удалось получить каталог' },
          };
        if (!inventory.data) return { error: { status: 'CUSTOM_ERROR', error: 'Нет данных' } };
        return { data: filterCatalog(parsed.data, inventory.data.items) };
      },
    }),
  }),
});
export const { useGetCatalogQuery } = catalogApi;
