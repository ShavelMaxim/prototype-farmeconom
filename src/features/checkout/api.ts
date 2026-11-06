import { baseApi } from '@/shared/api/base-api';
import type { CheckoutRequest, CheckoutResponse } from './model';
import { demoCheckout } from './demo-checkout';
import { checkoutRequestSchema, checkoutResponseSchema } from './model';
import { delay } from '@/shared/api/delay';
export const checkoutApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    checkout: build.mutation<CheckoutResponse, CheckoutRequest>({
      async queryFn(body, api, extra, request) {
        const input = checkoutRequestSchema.safeParse(body);
        if (!input.success) return { error: { status: 400, data: {} } };
        let data: unknown;
        if (process.env.NEXT_PUBLIC_API_URL) {
          const result = await request({ url: 'demo-checkout', method: 'POST', body: input.data });
          if (result.error) return { error: result.error };
          data = result.data;
        } else {
          await delay(350, api.signal);
          if (api.signal.aborted) return { error: { status: 'CUSTOM_ERROR', error: 'Отменено' } };
          const response = await demoCheckout(
            new Request('https://demo.local/checkout', {
              method: 'POST',
              body: JSON.stringify(body),
            }),
          );
          data = await response.json();
          if (!response.ok) return { error: { status: response.status, data } };
        }
        const parsed = checkoutResponseSchema.safeParse(data);
        return parsed.success
          ? { data: parsed.data }
          : { error: { status: 'CUSTOM_ERROR', error: 'VALIDATION_ERROR' } };
      },
    }),
  }),
});
export const { useCheckoutMutation } = checkoutApi;
