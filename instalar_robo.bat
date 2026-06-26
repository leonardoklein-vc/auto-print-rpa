@echo off
color 0B
title Instalador - Robo AGHUse v7

echo ===================================================
echo       PREPARANDO INSTALACAO DO ROBO AGHUSE
echo ===================================================
echo.

:: 1. Cria a pasta segura no C: e copia os arquivos
set "TARGET_DIR=C:\AGHUse_Robo"
if not exist "%TARGET_DIR%" mkdir "%TARGET_DIR%"
xcopy /Y /E "%~dp0\*" "%TARGET_DIR%\" >nul

:: Remove o proprio .bat da pasta de destino para ficar apenas os arquivos da extensao
del "%TARGET_DIR%\instalar_robo.bat" >nul 2>&1

echo [OK] Arquivos do robo salvos com sucesso em %TARGET_DIR%
echo.
echo ===================================================
echo                     ATENCAO!
echo ===================================================
echo Para finalizar, siga estes 3 passos simples:
echo.
echo 1. O Chrome vai abrir agora na tela de extensoes.
echo 2. Ligue a chave "Modo do desenvolvedor" (no canto superior direito).
echo 3. Arraste a pasta de arquivos que vai abrir para dentro do Chrome.
echo ===================================================
echo.
echo Pressione qualquer tecla para abrir as telas e finalizar...
pause >nul

:: 2. Abre a aba de extensoes no Chrome
start chrome "chrome://extensions/"

:: Aguarda 2 segundos para dar tempo do Chrome iniciar e processar
timeout /t 2 /nobreak >nul

:: 3. Abre a pasta no Windows Explorer por cima do Chrome
explorer "%TARGET_DIR%"

exit