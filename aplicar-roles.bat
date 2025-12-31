@echo off
echo ===================================================
echo   ATUALIZACAO DE SEGURANCA - BURGUERIA
echo ===================================================
echo.
echo Para finalizar a configuracao de seguranca, voce precisa
echo executar o script SQL no Painel do Supabase.
echo.
echo Siga os passos:
echo 1. Copie o conteudo do arquivo "add_role_column.sql"
echo 2. Acesse: https://supabase.com/dashboard/project/_/sql/new
echo 3. Cole o script e clique em RUN
echo.
echo IMPORTANTE:
echo No arquivo SQL, substitua 'seu@email.com' pelo seu
echo email de administrador verdadeiro antes de rodar!
echo.
echo Pressione qualquer tecla para abrir o arquivo SQL...
pause
notepad "add_role_column.sql"
