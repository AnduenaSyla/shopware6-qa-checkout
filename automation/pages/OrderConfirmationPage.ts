import { Page, Locator } from '@playwright/test';

export class OrderConfirmationPage {
  readonly page: Page;
  readonly heading: Locator;
  readonly mainContent: Locator;

  constructor(page: Page) {
    this.page = page;
    this.heading = page.getByRole('heading', { name: /Vielen Dank für Ihre Bestellung/i });
    this.mainContent = page.locator('main');
  }

  /** Extracts the numeric order number from "Ihre Bestellnummer:12345". */
  async getOrderNumber(): Promise<string | null> {
    const text = await this.mainContent.innerText();
    const match = text.match(/Bestellnummer:\s*(\d+)/i);
    return match ? match[1] : null;
  }

  async getPaymentMethodText(): Promise<string> {
    const text = await this.mainContent.innerText();
    const match = text.match(/Zahlungsart:\s*([^\n]+)/i);
    return match ? match[1].trim() : '';
  }
}
