import { z } from 'zod';

// Validação de item do menu
export const menuItemSchema = z.object({
  name: z.string()
    .min(3, 'Nome deve ter no mínimo 3 caracteres')
    .max(100, 'Nome muito longo'),
  description: z.string()
    .min(10, 'Descrição deve ter no mínimo 10 caracteres')
    .max(500, 'Descrição muito longa'),
  price: z.number()
    .min(0.01, 'Preço deve ser maior que zero')
    .max(9999.99, 'Preço muito alto'),
  category: z.string()
    .min(1, 'Categoria é obrigatória'),
  image: z.string()
    .url('URL da imagem inválida')
    .optional(),
  available: z.boolean().default(true),
  spice_level: z.number()
    .min(0)
    .max(3)
    .optional(),
  tempo_preparo: z.number()
    .min(1, 'Tempo de preparo deve ser no mínimo 1 minuto')
    .max(180, 'Tempo de preparo muito longo')
    .optional()
});

// Validação de customização
export const customizationSchema = z.object({
  name: z.string()
    .min(2, 'Nome deve ter no mínimo 2 caracteres')
    .max(50, 'Nome muito longo'),
  price: z.number()
    .min(0, 'Preço não pode ser negativo')
    .max(999.99, 'Preço muito alto'),
  available: z.boolean().default(true)
});

// Validação de configurações da loja
export const storeSettingsSchema = z.object({
  name: z.string()
    .min(3, 'Nome da loja deve ter no mínimo 3 caracteres')
    .max(100, 'Nome muito longo')
    .optional(),
  phone: z.string()
    .regex(/^\(\d{2}\)\s?\d{4,5}-?\d{4}$/, 'Telefone inválido')
    .optional(),
  address: z.string()
    .min(10, 'Endereço deve ter no mínimo 10 caracteres')
    .optional(),
  tempo_maximo_preparo: z.number()
    .min(5, 'Tempo mínimo é 5 minutos')
    .max(120, 'Tempo máximo é 120 minutos')
    .optional(),
  is_open: z.boolean().optional(),
  primary_color: z.string()
    .regex(/^#[0-9A-F]{6}$/i, 'Cor inválida. Use formato hexadecimal (#RRGGBB)')
    .optional(),
  secondary_color: z.string()
    .regex(/^#[0-9A-F]{6}$/i, 'Cor inválida. Use formato hexadecimal (#RRGGBB)')
    .optional(),
  logo_url: z.string()
    .url('URL do logo inválida')
    .optional(),
  banner_url: z.string()
    .url('URL do banner inválida')
    .optional()
});

// Validação de entregador
export const delivererSchema = z.object({
  name: z.string()
    .min(3, 'Nome deve ter no mínimo 3 caracteres')
    .max(100, 'Nome muito longo'),
  email: z.string()
    .email('Email inválido'),
  password: z.string()
    .min(6, 'Senha deve ter no mínimo 6 caracteres')
    .max(50, 'Senha muito longa'),
  phone: z.string()
    .regex(/^\(\d{2}\)\s?\d{4,5}-?\d{4}$/, 'Telefone inválido')
    .optional()
});

// Helper para validar dados
export function validateData<T>(schema: z.ZodSchema<T>, data: unknown): { 
  success: boolean; 
  data?: T; 
  errors?: Record<string, string> 
} {
  try {
    const validData = schema.parse(data);
    return { success: true, data: validData };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errors: Record<string, string> = {};
      error.errors.forEach(err => {
        const path = err.path.join('.');
        errors[path] = err.message;
      });
      return { success: false, errors };
    }
    return { success: false, errors: { _general: 'Erro de validação' } };
  }
}
