import { test, expect } from '@playwright/test';

test('should process an order from pending to ready', async ({ page }) => {
  // 1. Navegar para a página de pedidos
  await page.goto('/');

  // Aguardar os cards de pedido carregarem, esperando o primeiro aparecer
  await expect(page.locator('.bg-white.rounded-xl').first()).toBeVisible();

  // 2. Encontrar o primeiro pedido pendente
  const pendingOrder = page.locator('div').filter({ hasText: 'Pendente' }).first();
  const customerName = await pendingOrder.locator('h3').innerText();
  console.log(`Processando pedido para: ${customerName}`);

  // 3. Clicar para iniciar o preparo
  await pendingOrder.getByRole('button', { name: 'Iniciar Preparo' }).click();

  // 4. Verificar se o pedido foi para a coluna "Preparando"
  const preparingOrder = page.locator('div').filter({ hasText: customerName }).first();
  await expect(preparingOrder.locator('span', { hasText: 'Preparando' })).toBeVisible();
  console.log(`Pedido de ${customerName} movido para Preparando.`);

  // 5. Clicar para marcar como pronto
  await preparingOrder.getByRole('button', { name: 'Marcar como Pronto' }).click();

  // 6. Verificar se o pedido foi para a coluna "Pronto"
  const readyOrder = page.locator('div').filter({ hasText: customerName }).first();
  await expect(readyOrder.locator('span', { hasText: 'Pronto' })).toBeVisible();
  console.log(`Pedido de ${customerName} movido para Pronto. Teste concluído com sucesso!`);
});
