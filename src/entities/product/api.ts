import { baseApi } from '@/shared/api/base-api';
import type { CatalogQuery, CatalogResponse } from '@/entities/product/model';
export const catalogApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getCatalog: build.query<CatalogResponse, CatalogQuery & { demo?: string }>({
      query: (params) => ({ url: 'products', params }),
    }),
  }),
});
export const { useGetCatalogQuery } = catalogApi;
