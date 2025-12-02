@echo off
echo 🚀 Opening Supabase Database Editor...
echo.
echo 📋 Follow these steps:
echo 1. The browser will open to your Supabase SQL Editor
echo 2. Click "New Query" button
echo 3. Copy ALL content from migrate.sql file
echo 4. Paste it in the SQL editor and click RUN
echo 5. Run: node check-db.js to verify tables
echo.

start "Supabase SQL Editor" "https://supabase.com/dashboard/project/aujiwuvqtzjzpbzfciez/editor"

echo ✅ Browser opened! Complete the database setup there.
pause