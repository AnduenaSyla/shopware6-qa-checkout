import { Page, Locator } from '@playwright/test';

export class ProductPage {
  readonly page: Page;
  readonly title: Locator;
  readonly quantityInput: Locator;
  readonly addToCartButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.title = page.locator('main h1');
    // Scoped to the real buy-widget form (#productDetailPageBuyProductForm) so this
    // never accidentally matches an unrelated number/submit input elsewhere on the page.
    this.quantityInput = page.locator('#productDetailPageBuyProductForm input[type="number"]');
    this.addToCartButton = page.locator('#productDetailPageBuyProductForm button[type="submit"]');
  }

  async setQuantity(quantity: number): Promise<void> {
    await this.quantityInput.fill(String(quantity));
  }

  async addToCart(): Promise<void> {
    await this.addToCartButton.click();
    // Wait for the off-canvas cart flyout to open and reflect the add.
    await this.page.locator('.offcanvas.is-open, .offcanvas.show, .cart-offcanvas').first().waitFor({ state: 'visible', timeout: 5000 }).catch(() => {
      // Some themes/config close the flyout quickly or open it without the "show" class;
      // the assertions in the test itself (cart badge count) are the real source of truth.
    });
  }
}
