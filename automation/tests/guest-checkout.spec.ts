import { test, expect } from '@playwright/test';
import { HomePage } from '../pages/HomePage';
import { SearchResultsPage } from '../pages/SearchResultsPage';
import { ProductPage } from '../pages/ProductPage';
import { CartPage } from '../pages/CartPage';
import { GuestCheckoutPage, GuestDetails } from '../pages/GuestCheckoutPage';
import { CheckoutConfirmPage } from '../pages/CheckoutConfirmPage';
import { OrderConfirmationPage } from '../pages/OrderConfirmationPage';

const PRODUCT_NAME = 'Demo Produkt';

/** A fresh, unique guest per run so repeat executions never collide on email. */
function buildGuestDetails(): GuestDetails {
  const stamp = Date.now();
  return {
    firstName: 'Ana',
    lastName: 'Testuese',
    email: `qa.automation.${stamp}@example.com`,
    street: 'Rruga Test 12',
    zipcode: '10000',
    city: 'Prishtina',
  };
}

/**
 * TC-01 from the manual test plan (QA_Test_Plan_Solution25.docx):
 * "Guest completes checkout with Cash on Delivery (happy path)".
 *
 * Full journey: open storefront -> search & open a product -> add to cart ->
 * proceed to checkout as a guest -> fill address -> choose Cash on Delivery ->
 * accept T&Cs -> place the order -> assert the confirmation page.
 */
test.describe('Guest checkout — Cash on Delivery', () => {
  test('TC-01: guest can find a product, add it to cart, and complete checkout with Cash on Delivery', async ({ page }) => {
    const guest = buildGuestDetails();

    await test.step('Open the storefront homepage', async () => {
      const home = new HomePage(page);
      await home.goto();
      await expect(page).toHaveURL(/shopware6-demo\.development-s25\.com/);
    });

    await test.step('Search for the product', async () => {
      const home = new HomePage(page);
      await home.searchFor(PRODUCT_NAME);

      const results = new SearchResultsPage(page);
      await expect(results.resultsHeading).toContainText(PRODUCT_NAME.split(' ')[0]);
      await expect(results.productLink(PRODUCT_NAME)).toBeVisible();
    });

    await test.step('Open the product and add it to the cart', async () => {
      const results = new SearchResultsPage(page);
      await results.openProduct(PRODUCT_NAME);

      const product = new ProductPage(page);
      await expect(product.title).toHaveText(PRODUCT_NAME);

      await product.addToCart();

      const home = new HomePage(page);
      await expect(home.cartBadge).toHaveText('1');
    });

    await test.step('Open the cart and proceed to checkout', async () => {
      const cart = new CartPage(page);
      await cart.goto();
      await expect(page.getByText(PRODUCT_NAME)).toBeVisible();
      await expect(cart.emptyCartMessage).toHaveCount(0);

      await cart.proceedToCheckout();
      // A guest with no active session lands on the shipping-information
      // ("Versandinformationen") step before reaching payment.
      await expect(page).toHaveURL(/\/checkout\/(confirm|register)/);
    });

    await test.step('Fill in guest personal & billing details', async () => {
      const guestForm = new GuestCheckoutPage(page);
      // Confirms we are genuinely on the guest-registration step, not already
      // logged in as a returning customer from a previous run.
      await expect(guestForm.firstNameInput).toBeVisible();

      await guestForm.fillGuestDetails(guest);
      await expect(guestForm.createAccountCheckbox).not.toBeChecked();

      await guestForm.continueToPayment();
    });

    await test.step('Select Cash on Delivery and accept the Terms & Conditions', async () => {
      const confirmStep = new CheckoutConfirmPage(page);
      await expect(confirmStep.heading).toBeVisible();

      await confirmStep.selectCashOnDelivery();
      await expect(confirmStep.cashOnDeliveryRadio).toBeChecked();

      await confirmStep.acceptTermsAndConditions();
      await expect(confirmStep.termsCheckbox).toBeChecked();
    });

    await test.step('Place the order and verify the confirmation page', async () => {
      const confirmStep = new CheckoutConfirmPage(page);
      await confirmStep.placeOrder();

      const confirmation = new OrderConfirmationPage(page);
      await expect(confirmation.heading).toBeVisible();
      await expect(page).toHaveURL(/checkout\/finish/);

      const orderNumber = await confirmation.getOrderNumber();
      expect(orderNumber, 'order confirmation should include a numeric order number').toMatch(/^\d+$/);

      const paymentMethod = await confirmation.getPaymentMethodText();
      expect(paymentMethod).toContain('Cash on delivery');

      await expect(page.getByText(PRODUCT_NAME)).toBeVisible();
    });
  });
});
