# 📖 Como Usar as Melhorias Implementadas

Este guia mostra como usar as novas funcionalidades implementadas no sistema.

---

## 🔄 1. Realtime do Supabase

### No App do Cliente

```typescript
import { useOrdersRealtime } from '@/hooks/useOrdersRealtime';

function MyComponent() {
  const customerId = 'user-id-here';
  const { orders, loading, refetch } = useOrdersRealtime(customerId);

  // orders atualiza automaticamente quando o status muda!
  
  return (
    <div>
      {orders.map(order => (
        <div key={order.id}>
          Status: {order.status}
        </div>
      ))}
    </div>
  );
}
```

### No Painel Admin

```typescript
import { useOrders } from '@/hooks/useOrders';

function OrdersPage() {
  const tenantId = 'tenant-id-here';
  const { orders, loading, error, updateOrderStatus } = useOrders(tenantId);

  const handleStatusChange = async (orderId: string) => {
    await updateOrderStatus(orderId, 'preparing');
    // Não precisa recarregar! Atualiza automaticamente
  };

  return (
    <div>
      {orders.map(order => (
        <OrderCard 
          key={order.id} 
          order={order}
          onStatusChange={handleStatusChange}
        />
      ))}
    </div>
  );
}
```

### No App do Entregador

O realtime já estava implementado e foi otimizado. Funciona automaticamente!

---

## 🔒 2. Verificação de Admin

### Proteger Rotas no Frontend

```typescript
import { checkAdminAuth } from '@/middleware/adminAuth';

async function MyAdminComponent() {
  const { isAdmin, userId, tenantId, error } = await checkAdminAuth();

  if (!isAdmin) {
    return <div>Acesso negado: {error}</div>;
  }

  // Usuário é admin, pode continuar
  return <AdminPanel />;
}
```

### Proteger Operações Sensíveis

```typescript
import { requireAdmin } from '@/middleware/adminAuth';

async function createDeliverer(data: DelivererData) {
  try {
    // Lança erro se não for admin
    const { userId, tenantId } = await requireAdmin();

    // Continuar com a operação
    const result = await supabase
      .from('profiles')
      .insert({ ...data, tenant_id: tenantId });

    return result;
  } catch (error) {
    console.error('Acesso negado:', error);
    throw error;
  }
}
```

### Na API (Node.js)

A verificação já está implementada no middleware `verifyAdminAuth` em `create-entregador.cjs`.

Para adicionar em outras rotas:

```javascript
app.post('/minha-rota-protegida',
  verifyAdminAuth,  // Middleware que verifica admin
  async (req, res) => {
    // req.user contém os dados do usuário autenticado
    // Só chega aqui se for admin
  }
);
```

---

## ✅ 3. Validação com Zod

### Validar Dados de Formulário

```typescript
import { validateData, menuItemSchema } from '@/lib/validations';

function CreateMenuItem() {
  const handleSubmit = (formData: any) => {
    // Validar dados
    const result = validateData(menuItemSchema, formData);

    if (!result.success) {
      // Mostrar erros ao usuário
      Object.entries(result.errors || {}).forEach(([field, message]) => {
        console.error(`${field}: ${message}`);
        // Ou mostrar em um toast/alert
      });
      return;
    }

    // Dados validados e tipados!
    const validItem = result.data;
    
    // Salvar no banco
    await supabase.from('menu_items').insert(validItem);
  };

  return <form onSubmit={handleSubmit}>...</form>;
}
```

### Validar Pedido Completo

```typescript
import { validateData, orderSchema } from '@/lib/validations';

function Checkout() {
  const handleCheckout = async () => {
    const orderData = {
      customer_name: 'João Silva',
      customer_phone: '(11) 98765-4321',
      customer_address: 'Rua Exemplo, 123',
      items: cartItems,
      total: calculateTotal(),
      payment_method: 'pix'
    };

    // Validar pedido
    const result = validateData(orderSchema, orderData);

    if (!result.success) {
      alert('Dados inválidos: ' + JSON.stringify(result.errors));
      return;
    }

    // Salvar pedido validado
    await supabase.from('orders').insert(result.data);
  };
}
```

### Validar Configurações da Loja

```typescript
import { validateData, storeSettingsSchema } from '@/lib/validations';

function StoreSettings() {
  const handleSave = async (settings: any) => {
    const result = validateData(storeSettingsSchema, settings);

    if (!result.success) {
      // Mostrar erros específicos
      if (result.errors?.phone) {
        alert('Telefone inválido: ' + result.errors.phone);
      }
      if (result.errors?.primary_color) {
        alert('Cor inválida: ' + result.errors.primary_color);
      }
      return;
    }

    // Salvar configurações validadas
    await supabase.from('loja_info').update(result.data);
  };
}
```

### Criar Validações Customizadas

```typescript
import { z } from 'zod';

// Validação customizada de CPF
const cpfSchema = z.string()
  .regex(/^\d{3}\.\d{3}\.\d{3}-\d{2}$/, 'CPF inválido')
  .refine((cpf) => {
    // Lógica de validação de CPF
    return validarCPF(cpf);
  }, 'CPF inválido');

// Validação de horário
const horarioSchema = z.string()
  .regex(/^([01]\d|2[0-3]):([0-5]\d)$/, 'Horário inválido (use HH:MM)');

// Validação de preço com desconto
const precoComDescontoSchema = z.object({
  preco_original: z.number().min(0),
  desconto: z.number().min(0).max(100)
}).refine((data) => {
  const precoFinal = data.preco_original * (1 - data.desconto / 100);
  return precoFinal >= 0;
}, 'Desconto não pode ser maior que o preço');
```

---

## 📝 4. Sistema de Logger

### Logs Básicos

```typescript
import { logger } from '@/utils/logger';

// Log de informação (apenas em dev)
logger.info('Pedido criado com sucesso', { 
  orderId: '123',
  total: 45.90 
});

// Log de aviso (apenas em dev)
logger.warn('GPS desabilitado', { 
  userId: 'user-123' 
});

// Log de erro (sempre exibido)
logger.error('Erro ao salvar pedido', error, { 
  context: 'checkout',
  orderId: '123' 
});

// Log de debug (apenas em dev)
logger.debug('Estado do carrinho', { 
  items: cartItems,
  total: total 
});
```

### Medir Performance

```typescript
import { logger } from '@/utils/logger';

function buscarPedidos() {
  // Iniciar medição
  logger.time('Buscar pedidos');

  const pedidos = await supabase
    .from('orders')
    .select('*');

  // Finalizar medição (mostra tempo decorrido)
  logger.timeEnd('Buscar pedidos');

  return pedidos;
}
```

### Agrupar Logs Relacionados

```typescript
import { logger } from '@/utils/logger';

async function processarPedido(orderId: string) {
  logger.group('Processar Pedido ' + orderId);
  
  logger.info('Validando pedido');
  const isValid = await validarPedido(orderId);
  
  logger.info('Calculando total');
  const total = await calcularTotal(orderId);
  
  logger.info('Salvando no banco');
  await salvarPedido(orderId, total);
  
  logger.groupEnd();
}
```

### Exibir Dados em Tabela

```typescript
import { logger } from '@/utils/logger';

const pedidos = [
  { id: '1', cliente: 'João', total: 45.90 },
  { id: '2', cliente: 'Maria', total: 32.50 },
  { id: '3', cliente: 'Pedro', total: 78.00 }
];

// Exibe em formato de tabela (apenas em dev)
logger.table(pedidos);
```

### Integração com Sentry (Futuro)

```typescript
import { logger } from '@/utils/logger';
import * as Sentry from '@sentry/react';

// No arquivo logger.ts, adicionar:
class Logger {
  error(message: string, error?: unknown, data?: LogData): void {
    const formattedMessage = this.formatMessage('error', message);
    const parsedError = error instanceof Error ? error : undefined;

    console.error(formattedMessage, {
      error: parsedError?.message || error,
      stack: parsedError?.stack,
      ...data
    });

    // Enviar para Sentry em produção
    if (!this.isDevelopment && parsedError) {
      Sentry.captureException(parsedError, {
        extra: { message, ...data }
      });
    }
  }
}
```

---

## 🎯 Exemplos Práticos Completos

### Exemplo 1: Criar Item do Menu com Validação

```typescript
import { useState } from 'react';
import { validateData, menuItemSchema } from '@/lib/validations';
import { logger } from '@/utils/logger';
import { supabase } from '@/lib/supabase';

function CreateMenuItem() {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: 0,
    category: '',
    image: ''
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validar dados
    const result = validateData(menuItemSchema, formData);

    if (!result.success) {
      setErrors(result.errors || {});
      logger.warn('Validação falhou', result.errors);
      return;
    }

    try {
      logger.time('Criar item do menu');

      const { data, error } = await supabase
        .from('menu_items')
        .insert(result.data)
        .select()
        .single();

      if (error) throw error;

      logger.info('Item criado com sucesso', { itemId: data.id });
      logger.timeEnd('Criar item do menu');

      // Limpar formulário
      setFormData({ name: '', description: '', price: 0, category: '', image: '' });
      setErrors({});

      alert('Item criado com sucesso!');
    } catch (error) {
      logger.error('Erro ao criar item', error);
      alert('Erro ao criar item');
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        value={formData.name}
        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
      />
      {errors.name && <span className="error">{errors.name}</span>}
      
      {/* Outros campos... */}
      
      <button type="submit">Criar Item</button>
    </form>
  );
}
```

### Exemplo 2: Pedido com Realtime e Validação

```typescript
import { useOrdersRealtime } from '@/hooks/useOrdersRealtime';
import { validateData, orderSchema } from '@/lib/validations';
import { logger } from '@/utils/logger';

function CustomerOrders() {
  const { user } = useCustomerAuth();
  const { orders, loading } = useOrdersRealtime(user?.id);

  const createOrder = async (orderData: any) => {
    // Validar pedido
    const result = validateData(orderSchema, orderData);

    if (!result.success) {
      logger.warn('Pedido inválido', result.errors);
      alert('Dados do pedido inválidos');
      return;
    }

    try {
      logger.group('Criar Pedido');
      logger.info('Salvando pedido', { items: result.data.items.length });

      const { data, error } = await supabase
        .from('orders')
        .insert(result.data)
        .select()
        .single();

      if (error) throw error;

      logger.info('Pedido criado', { orderId: data.id });
      logger.groupEnd();

      // Pedido aparecerá automaticamente na lista (realtime!)
      alert('Pedido realizado com sucesso!');
    } catch (error) {
      logger.error('Erro ao criar pedido', error);
      alert('Erro ao criar pedido');
    }
  };

  return (
    <div>
      <h2>Meus Pedidos</h2>
      {loading ? (
        <p>Carregando...</p>
      ) : (
        orders.map(order => (
          <div key={order.id}>
            <p>Status: {order.status}</p>
            {/* Status atualiza automaticamente! */}
          </div>
        ))
      )}
    </div>
  );
}
```

---

## 🚀 Dicas e Boas Práticas

### 1. Sempre Validar Dados do Usuário
```typescript
// ❌ NÃO FAÇA ISSO
await supabase.from('orders').insert(formData);

// ✅ FAÇA ISSO
const result = validateData(orderSchema, formData);
if (result.success) {
  await supabase.from('orders').insert(result.data);
}
```

### 2. Use Logger ao Invés de Console
```typescript
// ❌ NÃO FAÇA ISSO
console.log('Pedido criado:', order);

// ✅ FAÇA ISSO
logger.info('Pedido criado', { orderId: order.id });
```

### 3. Aproveite o Realtime
```typescript
// ❌ NÃO FAÇA ISSO
const fetchOrders = async () => {
  const { data } = await supabase.from('orders').select('*');
  setOrders(data);
};
setInterval(fetchOrders, 5000); // Polling manual

// ✅ FAÇA ISSO
const { orders } = useOrders(tenantId); // Atualiza automaticamente!
```

### 4. Proteja Rotas Administrativas
```typescript
// ❌ NÃO FAÇA ISSO
async function deleteUser(userId: string) {
  await supabase.from('profiles').delete().eq('id', userId);
}

// ✅ FAÇA ISSO
async function deleteUser(userId: string) {
  const { isAdmin } = await checkAdminAuth();
  if (!isAdmin) throw new Error('Acesso negado');
  
  await supabase.from('profiles').delete().eq('id', userId);
}
```

---

## 📚 Recursos Adicionais

- [Documentação do Zod](https://zod.dev/)
- [Supabase Realtime](https://supabase.com/docs/guides/realtime)
- [TypeScript Best Practices](https://www.typescriptlang.org/docs/handbook/declaration-files/do-s-and-don-ts.html)

---

**Dúvidas?** Consulte o arquivo `MELHORIAS_IMPLEMENTADAS.md` para mais detalhes técnicos!
