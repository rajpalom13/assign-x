@echo off
REM AssignX Development Run Script (Windows)
REM Usage: .\scripts\run.bat

REM Load environment variables from .env file
if exist .env (
    for /f "usebackq tokens=1,2 delims==" %%a in (".env") do (
        if not "%%a"=="" if not "%%a:~0,1%"=="#" (
            set "%%a=%%b"
        )
    )
) else (
    echo ERROR: .env file not found
    echo Create a .env file from .env.example
    exit /b 1
)

REM Validate required environment variables
if "%SUPABASE_URL%"=="" (
    echo ERROR: SUPABASE_URL not set
    echo Create a .env file with SUPABASE_URL=https://your-project.supabase.co
    exit /b 1
)

if "%SUPABASE_ANON_KEY%"=="" (
    echo ERROR: SUPABASE_ANON_KEY not set
    echo Create a .env file with SUPABASE_ANON_KEY=your-anon-key
    exit /b 1
)

echo Running AssignX in debug mode...

REM Build dart-define arguments
set "DART_DEFINES=--dart-define=SUPABASE_URL=%SUPABASE_URL%"
set "DART_DEFINES=%DART_DEFINES% --dart-define=SUPABASE_ANON_KEY=%SUPABASE_ANON_KEY%"

REM Add Google Web Client ID if configured
if not "%GOOGLE_WEB_CLIENT_ID%"=="" (
    set "DART_DEFINES=%DART_DEFINES% --dart-define=GOOGLE_WEB_CLIENT_ID=%GOOGLE_WEB_CLIENT_ID%"
)

flutter run %DART_DEFINES%
