import { Page, Locator } from '@playwright/test';

/**
 * The final "Bestellung abschließen" (place order) step: payment method,
 * shipping method, Terms & Conditions, and the place-order action.
 *
 * Note on selectors: Shopware generates a fresh UUID for each payment method's
 * radio `id` per shop instance, so hard-coding that id would be fragile across
 * environments/data resets. The accessible role + visible label ("Cash on
 * delivery") is what stays stable, so that is what this page object anchors on.
 */
export class CheckoutConfirmPage {
  readonly page: Page;
  readonly heading: Locator;
  readonly cashOnDeliveryRadio: Locator;
  readonly termsCheckbox: Locator;
  readonly placeOrderButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.heading = page.getByRole('heading', { name: 'Bestellung abschließen' });
    this.cashOnDeliveryRadio = page.getByRole('radio', { name: 'Cash on delivery' });
    // Real, stable #id on this theme.
    this.termsCheckbox = page.locator('#tos');
    this.placeOrderButton = page.locator('#confirmFormSubmit');
  }

  async selectCashOnDelivery(): Promise<void> {
    await this.cashOnDeliveryRadio.check();
  }

  async acceptTermsAndConditions(): Promise<void> {
    await this.termsCheckbox.check();
  }

  async placeOrder(): Promise<void> {
    await this.placeOrderButton.click();
  }
}
