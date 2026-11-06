@echo off
rem Launches the built Towelwise AI in a brand-new profile, so earlier sign-ins and installs never carry over.
rem Set TW_PROFILE to an existing profile folder to reopen it instead. TW_BUILDS overrides C:\towel-builds.
rem Every SET is quoted and nothing sits inside a parenthesized block, so paths with spaces, & or ( ) are safe.
setlocal
set "ELECTRON_RUN_AS_NODE="
for /f "delims==" %%v in ('set VSCODE_ 2^>nul') do set "%%v="
if not defined TW_BUILDS set "TW_BUILDS=C:\towel-builds"
if defined TW_PROFILE goto have_profile
for /f %%t in ('powershell -NoProfile -Command "Get-Date -Format yyyyMMdd-HHmmss"') do set "TW_PROFILE=%TW_BUILDS%\profiles\%%t"
:have_profile
if not exist "%TW_PROFILE%" mkdir "%TW_PROFILE%\claude" "%TW_PROFILE%\codex" "%TW_PROFILE%\user-data" "%TW_PROFILE%\extensions"
set "CLAUDE_CONFIG_DIR=%TW_PROFILE%\claude"
set "CODEX_HOME=%TW_PROFILE%\codex"
echo Profile: "%TW_PROFILE%"
start "" "%TW_BUILDS%\build\vscodium\VSCode-win32-x64\Towelwise AI.exe" --user-data-dir "%TW_PROFILE%\user-data" --extensions-dir "%TW_PROFILE%\extensions" %*
