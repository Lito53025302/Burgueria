import { z } from 'zod';

// Schema para validação do cliente
export const customerSchema = z.object({
    name: z.string().min(3, 'Nome deve ter pelo menos 3 caracteres'),
    phone: z.string().regex(/^\d{10,11}$/, 'Telefone inválido (use apenas números, com DDD)'),
    address: z.string().min(5, 'Endereço deve ser completo'),
});

// Schema para itens do pedido
export const orderItemSchema = z.object({
    id: z.string(),
    name: z.string(),
    price: z.number().positive(),
    quantity: z.number().int().positive(),
    notes: z.string().optional()
});

// Schema para o pedido completo
export const orderSchema = z.object({
    items: z.array(orderItemSchema).min(1, 'O carrinho não pode estar vazio'),
    total: z.number().positive('Total deve ser maior que zero'),
    paymentMethod: z.enum(['money', 'credit', 'debit', 'pix']),
    changeFor: z.string().optional(), // Troco para
    deliveryAddress: z.string().min(5, 'Endereço de entrega é obrigatório')
});

export type CustomerData = z.infer<typeof customerSchema>;
export type OrderData = z.infer<typeof orderSchema>;
