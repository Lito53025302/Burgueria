@echo off
echo ========================================
echo  TESTE RAPIDO - PROJETO BURGUERIA
echo ========================================
echo.

echo [1/3] Verificando versoes do Supabase...
echo.

cd "C:\Users\paulo\Desktop\Burgueria"
echo App Principal:
call npm list @supabase/supabase-js 2>nul | findstr "supabase-js"
echo.

cd "C:\Users\paulo\Desktop\Burgueria\Painel Burguer"
echo Painel Admin:
call npm list @supabase/supabase-js 2>nul | findstr "supabase-js"
echo.

cd "C:\Users\paulo\Desktop\Burgueria\Entregador"
echo App Entregador:
call npm list @supabase/supabase-js 2>nul | findstr "supabase-js"
echo.

echo ========================================
echo [2/3] Verificando arquivos do logger...
echo ========================================
echo.

if exist "C:\Users\paulo\Desktop\Burgueria\src\utils\logger.ts" (
    echo [OK] App Principal - logger.ts encontrado
) else (
    echo [ERRO] App Principal - logger.ts NAO encontrado
)

if exist "C:\Users\paulo\Desktop\Burgueria\Painel Burguer\src\utils\logger.ts" (
    echo [OK] Painel Admin - logger.ts encontrado
) else (
    echo [ERRO] Painel Admin - logger.ts NAO encontrado
)

if exist "C:\Users\paulo\Desktop\Burgueria\Entregador\src\utils\logger.ts" (
    echo [OK] App Entregador - logger.ts encontrado
) else (
    echo [ERRO] App Entregador - logger.ts NAO encontrado
)

echo.
echo ========================================
echo [3/3] Resumo das Mudancas
echo ========================================
echo.
echo Arquivos modificados:
echo - 2 package.json atualizados
echo - 3 logger.ts criados
echo - 5 arquivos com console.log substituidos
echo.
echo Total de mudancas: 10 arquivos
echo.
echo ========================================
echo  TESTE CONCLUIDO!
echo ========================================
echo.
echo Proximos passos:
echo 1. Rodar: npm run dev (em cada app)
echo 2. Verificar console do navegador
echo 3. Testar funcionalidades basicas
echo.

pause
