import { Page, Locator } from '@playwright/test';

export class SearchResultsPage {
  readonly page: Page;
  readonly resultsHeading: Locator;

  constructor(page: Page) {
    this.page = page;
    this.resultsHeading = page.locator('main h1');
  }

  /** Product tiles use class "product-name" on the storefront's default theme. */
  productLink(productName: string): Locator {
    return this.page.locator('a.product-name', { hasText: productName }).first();
  }

  async openProduct(productName: string): Promise<void> {
    await this.productLink(productName).click();
  }
}
