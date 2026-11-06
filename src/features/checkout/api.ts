import { baseApi } from '@/shared/api/base-api';
import type { CheckoutRequest, CheckoutResponse } from './model';
const checkoutApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    checkout: build.mutation<CheckoutResponse, CheckoutRequest>({
      query: (body) => ({ url: 'demo-checkout', method: 'POST', body }),
    }),
  }),
});
export const { useCheckoutMutation } = checkoutApi;
