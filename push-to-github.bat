@echo off
echo ========================================
echo Pushing to GitHub Repository
echo ========================================
echo.
echo Repository: https://github.com/boristel/karuniadashboardadmin.git
echo Branch: main
echo.
echo You will be prompted for GitHub authentication.
echo Use your GitHub username and Personal Access Token (not password!)
echo.
echo Create token at: https://github.com/settings/tokens
echo.
pause
echo.
echo Starting push...
echo.

cd "D:\BEN\KMR\_New Source\WEBAPPS\frontend\dashboard"
"C:\Program Files\Git\bin\git.exe" push -u origin main

echo.
echo ========================================
if %ERRORLEVEL% EQU 0 (
    echo SUCCESS! Your code is now on GitHub!
    echo Visit: https://github.com/boristel/karuniadashboardadmin
) else (
    echo Push failed. Please check your credentials.
)
echo ========================================
echo.
pause
