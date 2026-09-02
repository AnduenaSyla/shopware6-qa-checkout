import { Page, Locator } from '@playwright/test';

/**
 * Storefront homepage: entry point of the guest journey.
 * Also owns the cookie-consent banner, since it is the first thing
 * every fresh session encounters regardless of which page object is "active".
 */
export class HomePage {
  readonly page: Page;
  readonly searchInput: Locator;
  readonly cartBadge: Locator;
  readonly acceptNecessaryCookiesButton: Locator;

  constructor(page: Page) {
    this.page = page;
    // Stable: real #id from the storefront header, not a fragile CSS chain.
    this.searchInput = page.locator('#header-main-search-input');
    this.cartBadge = page.locator('.header-cart-badge');
    // Accessible role + visible label ("Only technically necessary") — no data-test-id
    // exists on this theme, so the accessible name is the most stable anchor available.
    this.acceptNecessaryCookiesButton = page.getByRole('button', { name: 'Nur technisch notwendige' });
  }

  async goto(): Promise<void> {
    await this.page.goto('/');
    await this.dismissCookieBannerIfPresent();
  }

  /** The cookie banner only appears on a session's first page load. */
  async dismissCookieBannerIfPresent(): Promise<void> {
    const isVisible = await this.acceptNecessaryCookiesButton.isVisible().catch(() => false);
    if (isVisible) {
      await this.acceptNecessaryCookiesButton.click();
    }
  }

  async searchFor(term: string): Promise<void> {
    await this.searchInput.click();
    await this.searchInput.fill(term);
    await this.searchInput.press('Enter');
  }

  async getCartItemCount(): Promise<string> {
    return (await this.cartBadge.textContent())?.trim() ?? '';
  }
}
