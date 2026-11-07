import type { Page } from '@playwright/test';
// A visible dialog may still be fading in. Audit its settled colors, not an
// arbitrary frame of composited opacity; keep animations enabled in the app.
export async function settleMotion(page: Page) {
  await page.evaluate(() =>
    Promise.all(
      document
        .getAnimations()
        .filter((animation) => animation.effect?.getTiming().iterations !== Infinity)
        .map((animation) => animation.finished.catch(() => {})),
    ),
  );
}
