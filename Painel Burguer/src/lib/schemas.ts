import { z } from 'zod';

// Schema para Itens do Menu
export const menuItemSchema = z.object({
    name: z.string().min(3, 'Nome deve ter pelo menos 3 caracteres'),
    description: z.string().min(10, 'Descrição deve ter pelo menos 10 caracteres'),
    price: z.number().positive('Preço deve ser maior que zero'),
    category: z.string().min(3, 'Categoria é obrigatória'),
    image: z.string().url('URL da imagem inválida').optional().or(z.literal('')),
    available: z.boolean().default(true)
});

// Schema para Entregadores
export const entregadorSchema = z.object({
    name: z.string().min(3, 'Nome deve ter pelo menos 3 caracteres'),
    email: z.string().email('Email inválido'),
    phone: z.string().min(10, 'Telefone inválido'),
    cpf: z.string().regex(/^\d{11}$/, 'CPF deve ter 11 dígitos'),
    password: z.string().min(6, 'Senha deve ter pelo menos 6 caracteres')
});

export type MenuItemData = z.infer<typeof menuItemSchema>;
export type EntregadorData = z.infer<typeof entregadorSchema>;
