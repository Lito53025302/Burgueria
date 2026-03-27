import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuração do Supabase
const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://your-project.supabase.co';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'your-service-role-key';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function runMigration() {
    try {
        console.log('🚀 Iniciando migration de assinaturas...\n');

        // Ler o arquivo SQL
        const migrationPath = path.join(__dirname, '..', 'migrations', 'add_subscription_system.sql');
        const sqlContent = fs.readFileSync(migrationPath, 'utf8');

        console.log('📄 Arquivo SQL carregado com sucesso!');
        console.log('📊 Executando migration...\n');

        // Executar o SQL
        const { data, error } = await supabase.rpc('exec_sql', {
            sql_query: sqlContent
        });

        if (error) {
            console.error('❌ Erro ao executar migration:', error);
            process.exit(1);
        }

        console.log('✅ Migration executada com sucesso!\n');
        console.log('📋 Tabelas criadas:');
        console.log('   • subscription_plans');
        console.log('   • commission_transactions');
        console.log('   • monthly_invoices');
        console.log('\n📦 Planos criados:');
        console.log('   • FREE (R$ 0/mês, 5% comissão)');
        console.log('   • BÁSICO (R$ 49,90/mês, 3% comissão)');
        console.log('   • PRO (R$ 99,90/mês, 2% comissão)');
        console.log('\n🎉 Sistema de assinaturas pronto para uso!');

    } catch (err) {
        console.error('❌ Erro inesperado:', err);
        process.exit(1);
    }
}

runMigration();
