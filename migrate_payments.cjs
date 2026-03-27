const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

const SUPABASE_URL = 'https://yoprdgfhznxdrypinmkx.supabase.co';
const SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlvcHJkZ2Zoem54ZHJ5cGlubWt4Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NjU0MDgzMSwiZXhwIjoyMDgyMTE2ODMxfQ.0L-BEQG0FjwvbEBSBANOvcBvDfZGalSGAMoLKmm1kWM';

const supabase = createClient(SUPABASE_URL, SERVICE_KEY);

async function runMigration() {
    console.log('🚀 Executando migração de Pagamentos e Notas Fiscais...');

    const migrationPath = path.join(__dirname, 'migrations', '011_payments_and_invoices.sql');
    const sql = fs.readFileSync(migrationPath, 'utf8');

    try {
        const { error } = await supabase.rpc('exec_sql', { sql_query: sql });
        if (error) {
            console.error('❌ Erro ao executar migração:', error.message);
        } else {
            console.log('✅ Migração de Pagamentos e Notas Fiscais concluída com sucesso!');
        }
    } catch (err) {
        console.error('💥 Erro fatal:', err);
    }
}

runMigration();
