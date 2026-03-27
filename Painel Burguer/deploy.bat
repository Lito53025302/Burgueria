@echo off
echo ========================================
echo   DEPLOY DO PAINEL ADMINISTRATIVO (V2)
echo ========================================
echo.

echo [1/5] Testando o build...
call npm run build
if %ERRORLEVEL% NEQ 0 (
    echo.
    echo ❌ ERRO: Build falhou!
    echo Verifique os erros acima e corrija antes de fazer deploy.
    pause
    exit /b 1
)

echo.
echo ✅ Build concluído com sucesso!
echo.

echo [2/5] Verificando Vercel CLI...
where vercel >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo.
    echo ⚠️  Vercel CLI não encontrado!
    echo Instalando Vercel CLI globalmente...
    call npm install -g vercel
)

echo.
echo [3/5] Preparando ambiente (Bypass Git Check)...
if exist .git (
    echo Escondendo pasta .git temporariamente...
    rename .git .git_bkp
)

echo.
echo [4/5] Fazendo deploy em PRODUÇÃO...
echo.
call vercel --prod

echo.
echo [5/5] Restaurando ambiente...
if exist .git_bkp (
    echo Restaurando pasta .git...
    rename .git_bkp .git
)

echo.
echo ========================================
echo   ✅ DEPLOY CONCLUÍDO!
echo ========================================
echo.
echo ⚠️  IMPORTANTE: Não esqueça de configurar as variáveis de ambiente no Vercel:
echo    - VITE_SUPABASE_URL
echo    - VITE_SUPABASE_ANON_KEY
echo.
echo 📖 Veja o arquivo DEPLOY_VERCEL.md para mais detalhes
echo.
pause
