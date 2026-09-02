import { Page, Locator } from '@playwright/test';

export class CartPage {
  readonly page: Page;
  readonly lineItems: Locator;
  readonly proceedToCheckoutButton: Locator;
  readonly emptyCartMessage: Locator;

  constructor(page: Page) {
    this.page = page;
    this.lineItems = page.locator('.cart-item, .line-item');
    // "begin-checkout-btn" is the real, stable class Shopware renders on this control.
    this.proceedToCheckoutButton = page.locator('a.begin-checkout-btn');
    this.emptyCartMessage = page.getByText('Ihr Warenkorb ist leer');
  }

  async goto(): Promise<void> {
    await this.page.goto('/checkout/cart');
  }

  async proceedToCheckout(): Promise<void> {
    await this.proceedToCheckoutButton.click();
  }
}
