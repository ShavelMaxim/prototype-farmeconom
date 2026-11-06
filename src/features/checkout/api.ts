import { baseApi } from '@/shared/api/base-api';
import type { CheckoutRequest, CheckoutResponse } from './model';
import { demoCheckout } from './demo-checkout';
const checkoutApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    checkout: build.mutation<CheckoutResponse, CheckoutRequest>({
      async queryFn(body, api, extra, request) {
        if (process.env.NEXT_PUBLIC_API_URL) {
          const result = await request({ url: 'demo-checkout', method: 'POST', body });
          return result.error ? { error: result.error } : { data: result.data as CheckoutResponse };
        }
        await new Promise((resolve) => setTimeout(resolve, 350));
        const response = await demoCheckout(
          new Request('https://demo.local/checkout', {
            method: 'POST',
            body: JSON.stringify(body),
          }),
        );
        const data = await response.json();
        return response.ok
          ? { data: data as CheckoutResponse }
          : { error: { status: response.status, data } };
      },
    }),
  }),
});
export const { useCheckoutMutation } = checkoutApi;
