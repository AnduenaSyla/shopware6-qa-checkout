import { Page, Locator } from '@playwright/test';

export interface GuestDetails {
  firstName: string;
  lastName: string;
  email: string;
  street: string;
  zipcode: string;
  city: string;
}

/**
 * The "Versandinformationen" (shipping information) step, where a guest enters
 * personal + billing details. Reached automatically from the cart when no one
 * is logged in; the "Create customer account" checkbox is left unchecked so the
 * order proceeds as an actual guest checkout.
 */
export class GuestCheckoutPage {
  readonly page: Page;
  readonly salutationSelect: Locator;
  readonly firstNameInput: Locator;
  readonly lastNameInput: Locator;
  readonly createAccountCheckbox: Locator;
  readonly emailInput: Locator;
  readonly streetInput: Locator;
  readonly zipcodeInput: Locator;
  readonly cityInput: Locator;
  readonly countrySelect: Locator;
  readonly continueButton: Locator;

  constructor(page: Page) {
    this.page = page;
    // Real #ids from the Shopware storefront register form — stable across releases
    // of this theme, unlike positional CSS selectors.
    this.salutationSelect = page.locator('#personalSalutation');
    this.firstNameInput = page.locator('#billingAddress-personalFirstName');
    this.lastNameInput = page.locator('#billingAddress-personalLastName');
    this.createAccountCheckbox = page.locator('#personalGuest');
    this.emailInput = page.locator('#personalMail');
    this.streetInput = page.locator('#billingAddress-AddressStreet');
    this.zipcodeInput = page.locator('#billingAddressAddressZipcode');
    this.cityInput = page.locator('#billingAddressAddressCity');
    this.countrySelect = page.locator('#billingAddressAddressCountry');
    this.continueButton = page.getByRole('button', { name: 'Weiter' });
  }

  async fillGuestDetails(details: GuestDetails): Promise<void> {
    // Pick the first real salutation option ("Mrs."/"Mr.") rather than "Not specified".
    const firstOptionValue = await this.salutationSelect.locator('option[value]:not([value=""])').first().getAttribute('value');
    if (firstOptionValue) {
      await this.salutationSelect.selectOption(firstOptionValue);
    }

    await this.firstNameInput.fill(details.firstName);
    await this.lastNameInput.fill(details.lastName);

    // Explicitly ensure the guest stays a guest — do not create a customer account.
    if (await this.createAccountCheckbox.isChecked()) {
      await this.createAccountCheckbox.uncheck();
    }

    await this.emailInput.fill(details.email);
    await this.streetInput.fill(details.street);
    await this.zipcodeInput.fill(details.zipcode);
    await this.cityInput.fill(details.city);
    // Country defaults to Germany on this demo shop; left as-is intentionally.
  }

  async continueToPayment(): Promise<void> {
    await this.continueButton.click();
  }
}
