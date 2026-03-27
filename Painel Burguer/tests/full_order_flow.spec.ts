import { test, expect } from '@playwright/test';

const CLIENT_URL = 'http://localhost:5173';
const PANEL_URL = 'http://localhost:5175';
const DELIVERY_URL = 'http://localhost:5174';

test.describe('Full Order Flow', () => {
  test('should create an order, process it, and deliver it', async ({ page }) => {
    // --- 1. Client App: Create an Order ---
    await page.goto(CLIENT_URL);

    // Espera o card de burger aparecer
    await page.locator('[class*=BurgerCard]').first().waitFor();
    // Clica no botão "Adicionar" dentro do primeiro card
    const firstBurgerCard = page.locator('[class*=BurgerCard]').first();
    await firstBurgerCard.locator('button:has-text("Adicionar")').click();
    // Se abrir um modal, clicar em "Adicionar R$"
    const modalAdicionar = page.locator('button:has-text("Adicionar R$")');
    if (await modalAdicionar.isVisible()) {
      await modalAdicionar.click();
    }

    // Go to cart and checkout
    await page.locator('button[aria-label="Carrinho"]').click();
    await page.locator('button:has-text("Finalizar Pedido")').click();

    // Fill checkout form
    await page.locator('input[name="name"]').fill('Test User');
    await page.locator('input[name="address"]').fill('123 Test Street');
    await page.locator('input[name="phone"]').fill('555-1234');
    await page.locator('button:has-text("Confirmar Pedido")').click();

    // Expect to see order progress
    await expect(page.locator('h2:has-text("Acompanhe seu Pedido")')).toBeVisible();
    const orderIdText = await page.locator('[data-testid="order-id"]').textContent();
    const orderId = orderIdText?.match(/#(\d+)/)?.[1];
    expect(orderId).toBeDefined();

    // --- 2. Panel App: Process the Order ---
    const panelPage = await page.context().newPage();
    await panelPage.goto(PANEL_URL);

    // Login
    await panelPage.locator('input[name="email"]').fill('admin@example.com');
    await panelPage.locator('input[name="password"]').fill('password123');
    await panelPage.locator('button:has-text("Login")').click();

    // Find the order and move it to "Ready"
    const orderRow = panelPage.locator(`tr:has-text("#${orderId}")`);
    await expect(orderRow).toBeVisible();
    await orderRow.locator('button:has-text("Preparar")').click();
    await expect(panelPage.locator('div[role="alert"]:has-text("Pedido movido para Em Preparo")')).toBeVisible();

    await orderRow.locator('button:has-text("Pronto")').click();
    await expect(panelPage.locator('div[role="alert"]:has-text("Pedido movido para Pronto")')).toBeVisible();


    // --- 3. Delivery App: Deliver the Order ---
    const deliveryPage = await page.context().newPage();
    await deliveryPage.goto(DELIVERY_URL);

    // Find the order and collect it
    const orderCard = deliveryPage.locator(`div:has-text("Pedido #${orderId}")`);
    await expect(orderCard).toBeVisible();
    await orderCard.locator('button:has-text("Coletar Pedido")').click();

    // Check if it's the current delivery
    await expect(deliveryPage.locator('h2:has-text("Minha Entrega Atual")')).toBeVisible();
    const currentDeliveryCard = deliveryPage.locator('div[data-testid="current-delivery"]');
    await expect(currentDeliveryCard).toContainText(`#${orderId}`);

    // Complete the delivery
    await currentDeliveryCard.locator('button:has-text("Finalizar Entrega")').click();

    // Expect the delivery to be gone from the list
    await expect(deliveryPage.locator('h2:has-text("Minha Entrega Atual")')).toBeVisible();
    await expect(deliveryPage.locator('p:has-text("Nenhuma entrega em andamento.")')).toBeVisible();

    // Verify in the panel that the order is marked as delivered
    await panelPage.reload();
    const deliveredOrderRow = panelPage.locator(`tr:has-text("#${orderId}")`);
    await expect(deliveredOrderRow).toContainText('Entregue');
  });
});
