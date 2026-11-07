import { expect, type Page } from '@playwright/test';
// A visible dialog may still be fading in. Audit its settled colors, not an
// arbitrary frame of composited opacity; keep animations enabled in the app.
export async function settleMotion(page: Page) {
  // afterOpenChange is the component's readiness signal; visibility alone can
  // precede style registration and the first animation frame of a lazy dialog.
  for (const dialog of await page.getByRole('dialog').all()) {
    await expect(dialog.locator('[data-dialog-ready="true"]')).toBeAttached();
  }
  await page.evaluate(() =>
    Promise.all(
      document
        .getAnimations()
        .filter((animation) => animation.effect?.getTiming().iterations !== Infinity)
        .map((animation) => animation.finished.catch(() => {})),
    ),
  );
}
