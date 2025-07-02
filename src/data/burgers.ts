import { BurgerItem } from '../types';

export const burgerData: BurgerItem[] = [
  {
    id: '1',
    name: 'O Supremo',
    description: 'Carne angus, maionese trufada, cebola caramelizada, rúcula, cheddar envelhecido',
    price: 48.99,
    image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=800&q=80',
    category: 'signature',
    ingredients: ['Carne Angus', 'Maionese Trufada', 'Cebola Caramelizada', 'Rúcula', 'Cheddar Envelhecido', 'Pão Brioche'],
    calories: 680,
    spiceLevel: 'mild'
  },
  {
    id: '2',
    name: 'Fogo & Fumaça',
    description: 'Pulled pork com BBQ, jalapeños, queijo gouda defumado, maionese chipotle, cebola crispy',
    price: 46.99,
    image: 'https://images.unsplash.com/photo-1586190848861-99aa4a171e90?w=800&q=80',
    category: 'signature',
    ingredients: ['Pulled Pork BBQ', 'Jalapeños', 'Gouda Defumado', 'Maionese Chipotle', 'Cebola Crispy', 'Pão com Gergelim'],
    calories: 720,
    spiceLevel: 'hot'
  },
  {
    id: '3',
    name: 'Clássico Real',
    description: 'Blend bovino premium, alface, tomate, picles, molho especial, queijo cheddar',
    price: 42.99,
    image: 'https://images.unsplash.com/photo-1550547660-d9450f859349?w=800&q=80',
    category: 'classic',
    ingredients: ['Blend Premium', 'Alface', 'Tomate', 'Picles', 'Molho Especial', 'Queijo Cheddar', 'Pão com Gergelim'],
    calories: 580,
    spiceLevel: 'mild'
  },
  {
    id: '4',
    name: 'Jardim',
    description: 'Hambúrguer vegetariano, abacate, brotos, pepino, maionese de ervas',
    price: 44.99,
    image: 'https://images.unsplash.com/photo-1525059696034-4967a729002e?w=800&q=80',
    category: 'veggie',
    ingredients: ['Hambúrguer Vegano', 'Abacate', 'Brotos', 'Pepino', 'Maionese de Ervas', 'Pão Integral'],
    calories: 520,
    spiceLevel: 'mild'
  },
  {
    id: '5',
    name: 'Batatas Trufadas',
    description: 'Batatas rústicas com azeite trufado, parmesão e ervas',
    price: 29.99,
    image: 'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=800&q=80',
    category: 'sides',
    ingredients: ['Batatas Rústicas', 'Azeite Trufado', 'Parmesão', 'Ervas Frescas'],
    calories: 380
  },
  {
    id: '6',
    name: 'Refrigerante Artesanal',
    description: 'Cola artesanal com baunilha e especiarias',
    price: 12.99,
    image: 'https://images.unsplash.com/photo-1544145945-f90425340c7e?w=800&q=80',
    category: 'drinks',
    ingredients: ['Água com Gás', 'Baunilha Natural', 'Blend de Especiarias', 'Açúcar de Cana'],
    calories: 150
  }
];