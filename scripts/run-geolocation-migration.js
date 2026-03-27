import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { join } from 'path';

// Credenciais do Supabase
const supabaseUrl = 'https://yoprdgfhznxdrypinmkx.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlvcHJkZ2Zoem54ZHJ5cGlubWt4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjY1NDA4MzEsImV4cCI6MjA4MjExNjgzMX0.mxSYeSxIKiENi4pZjvDgwwF3HgtD51UgGv2I5M9h_vY';

const supabase = createClient(supabaseUrl, supabaseKey);

async function runMigration() {
    console.log('🚀 Executando migration: add_geolocation_to_tenants.sql\n');

    try {
        // Ler o arquivo SQL
        const sqlPath = join(process.cwd(), 'migrations', 'add_geolocation_to_tenants.sql');
        const sql = readFileSync(sqlPath, 'utf-8');

        console.log('📄 SQL a ser executado:');
        console.log(sql);
        console.log('\n⚠️  IMPORTANTE: Execute este SQL manualmente no Supabase SQL Editor');
        console.log('🔗 https://supabase.com/dashboard/project/yoprdgfhznxdrypinmkx/sql\n');

        console.log('📋 Passos:');
        console.log('1. Copie o SQL acima');
        console.log('2. Acesse o link do Supabase SQL Editor');
        console.log('3. Cole o SQL e execute');
        console.log('4. Depois execute: node scripts/setup-complete.js\n');

    } catch (error) {
        console.error('❌ Erro:', error);
    }
}

runMigration();
