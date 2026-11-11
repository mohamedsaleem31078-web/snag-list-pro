@echo off
chcp 65001 > nul
title المتحف المصري الكبير - برنامج إدارة الملاحظات
cls
echo ====================================================================
echo    نظام إدارة ملاحظات ومخططات المتحف المصري الكبير GEM
echo ====================================================================
echo  جاري تشغيل البرنامج في نافذة سطح مكتب مستقلة (Desktop Standalone)...
echo ====================================================================

set "APP_FILE=%~dp0dist\index.html"

:: 1. Try launching in Microsoft Edge App Mode (Standalone native desktop window without browser URL bar)
start "" msedge.exe --app="file:///%APP_FILE:\=/%" --window-size=1450,920
if %ERRORLEVEL% EQU 0 goto :LAUNCHED

:: 2. Try launching in Google Chrome App Mode
start "" chrome.exe --app="file:///%APP_FILE:\=/%" --window-size=1450,920
if %ERRORLEVEL% EQU 0 goto :LAUNCHED

:: 3. Fallback to default browser
start "" "%APP_FILE%"

:LAUNCHED
echo [✓] تم تشغيل البرنامج بنجاح.
timeout /t 2 > nul
exit
