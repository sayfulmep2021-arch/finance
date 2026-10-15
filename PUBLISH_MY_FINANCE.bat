@echo off
title My Finance Publisher
chcp 65001 >nul
cd /d "%~dp0"

echo ==========================================================
echo               MY FINANCE - ONE-CLICK PUBLISHER
echo ==========================================================
echo.
echo প্রসেস শুরু হচ্ছে, অনুগ্রহ করে অপেক্ষা করুন...
echo.

powershell.exe -NoProfile -ExecutionPolicy Bypass -File "%~dp0scripts\publish.ps1"

echo.
echo ==========================================================
echo উইন্ডোটি বন্ধ করতে যেকোনো কি (Key) চাপুন...
pause >nul
