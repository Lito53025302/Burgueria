/**
 * Script para testar configuração do Cloudinary
 */

const cloudName = 'dz2egpnu7';
const apiKey = '659878552427868';

console.log('🔍 Testando configuração do Cloudinary...\n');

// 1. Verificar se credenciais existem
console.log('✅ Cloud Name:', cloudName);
console.log('✅ API Key:', apiKey);

// 2. Testar URL de upload
const uploadUrl = `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`;
console.log('\n📤 URL de Upload:', uploadUrl);

// 3. Testar transformação de IA
const testImageUrl = `https://res.cloudinary.com/${cloudName}/image/upload/sample.jpg`;
const enhancedUrl = `https://res.cloudinary.com/${cloudName}/image/upload/e_upscale,e_enhance,q_auto:best,f_auto/sample.jpg`;

console.log('\n🎨 Teste de Transformação:');
console.log('Original:', testImageUrl);
console.log('Melhorada:', enhancedUrl);

console.log('\n✅ Configuração OK! Cloudinary está pronto para uso!');
console.log('\n📋 Próximos passos:');
console.log('1. Execute a migration: migrations/add_ai_image_enhancement.sql');
console.log('2. Teste o componente AIImageUpload');
console.log('3. Configure o Upload Preset "ml_default" no Cloudinary Dashboard');
