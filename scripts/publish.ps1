# =====================================================================
# My Finance - One-Click Publisher Script
# =====================================================================
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8

$projectDir = Split-Path -Parent $PSScriptRoot
Set-Location $projectDir

# 1. Ensure PATH contains Node.js and Git
$extraPaths = @(
    "C:\Users\User\AppData\Local\nodejs\node-v20.18.0-win-x64",
    "C:\Users\User\AppData\Local\GitHubDesktop\app-3.6.5\resources\app\git\cmd"
)
foreach ($p in $extraPaths) {
    if ((Test-Path $p) -and ($env:PATH -notlike "*$p*")) {
        $env:PATH = "$p;$env:PATH"
    }
}
$userPath = [Environment]::GetEnvironmentVariable("Path", "User")
if ($userPath) {
    $env:PATH = "$userPath;$env:PATH"
}

Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host "             🚀 MY FINANCE - ONE-CLICK PUBLISHER          " -ForegroundColor Yellow
Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host ""

# 2. Check Git Installation
Write-Host "[1/7] Git টুল চেক করা হচ্ছে..." -ForegroundColor White
$gitVersion = & git --version 2>$null
if (-not $gitVersion) {
    Write-Host "❌ ত্রুটি: Git পাওয়া যায়নি! দয়া করে নিশ্চিত করুন Git ইনস্টল আছে।" -ForegroundColor Red
    exit 1
}
Write-Host "   ✓ $gitVersion" -ForegroundColor Green

# 3. Check Node & npm
Write-Host "[2/7] Node.js ও npm চেক করা হচ্ছে..." -ForegroundColor White
$nodeVersion = & node -v 2>$null
$npmVersion = & npm -v 2>$null
if (-not $nodeVersion -or -not $npmVersion) {
    Write-Host "❌ ত্রুটি: Node.js বা npm পাওয়া যায়নি!" -ForegroundColor Red
    exit 1
}
Write-Host "   ✓ Node $nodeVersion | npm $npmVersion" -ForegroundColor Green

# 4. Check Repository & Remote Configuration
Write-Host "[3/7] Git রিপোজিটরি ও রিমোট লিংক যাচাই করা হচ্ছে..." -ForegroundColor White
$isRepo = & git rev-parse --is-inside-work-tree 2>$null
if ($isRepo -ne "true") {
    Write-Host "❌ ত্রুটি: বর্তমান ফোল্ডারটি একটি Git রিপোজিটরি নয়!" -ForegroundColor Red
    exit 1
}

$currentBranch = (& git branch --show-current).Trim()
$remoteUrl = (& git remote get-url origin 2>$null)
if (-not $remoteUrl) {
    Write-Host "❌ ত্রুটি: Git রিমোট 'origin' কনফিগার করা নেই!" -ForegroundColor Red
    exit 1
}

# Determine Live URL & Actions URL from real remote
$publicUrl = ""
$actionsUrl = ""
if ($remoteUrl -match "github\.com[:/](.+?)/(.+?)(\.git)?$") {
    $owner = $matches[1]
    $repo = $matches[2] -replace "\.git$", ""
    $publicUrl = "https://$owner.github.io/$repo/"
    $actionsUrl = "https://github.com/$owner/$repo/actions"
}

Write-Host "   ✓ ব্রাঞ্চ: $currentBranch" -ForegroundColor Green
Write-Host "   ✓ রিমোট:  $remoteUrl" -ForegroundColor Green
if ($publicUrl) {
    Write-Host "   ✓ টার্গেট লাইভ সাইট: $publicUrl" -ForegroundColor Gray
}

# 5. Check for Changes
Write-Host "[4/7] প্রোজেক্ট ফাইলের পরিবর্তন সনাক্ত করা হচ্ছে..." -ForegroundColor White
$status = & git status --porcelain
if (-not $status) {
    Write-Host ""
    Write-Host "ℹ️ কোনো নতুন পরিবর্তন পাওয়া যায়নি! রিপোজিটরি ইতিমধ্যে আপ-টু-ডেট আছে।" -ForegroundColor Yellow
    if ($publicUrl) {
        Write-Host ""
        Write-Host "🌐 লাইভ অ্যাপ্লিকেশন লিংক:" -ForegroundColor Cyan
        Write-Host "   $publicUrl" -ForegroundColor White
        Write-Host "⚙️ ডিপ্লয়মেন্ট হিস্ট্রি:" -ForegroundColor Cyan
        Write-Host "   $actionsUrl" -ForegroundColor White
    }
    exit 0
}
Write-Host "   ✓ পরিবর্তনসমূহ পাওয়া গেছে।" -ForegroundColor Green

# 6. Run Automated Unit Tests
Write-Host "[5/7] স্বয়ংক্রিয় টেস্ট (Unit Tests) চালানো হচ্ছে..." -ForegroundColor White
& npm test
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ টেস্ট ব্যর্থ হয়েছে! কোনো ত্রুটিপূর্ণ কোড পুশ করা যাবে না।" -ForegroundColor Red
    exit 1
}
Write-Host "   ✓ সকল টেস্ট সফলভাবে সম্পন্ন হয়েছে!" -ForegroundColor Green

# 7. Run Production Build
Write-Host "[6/7] প্রোডাকশন বিল্ড ও PWA কম্পাইলেশন যাচাই করা হচ্ছে..." -ForegroundColor White
& npm run build
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ প্রোডাকশন বিল্ড ব্যর্থ হয়েছে! দয়া করে কোডের ত্রুটি ঠিক করুন।" -ForegroundColor Red
    exit 1
}
Write-Host "   ✓ প্রোডাকশন বিল্ড সফল হয়েছে!" -ForegroundColor Green

# 8. Git Add, Commit & Push
Write-Host "[7/7] GitHub-এ পরিবর্তন পুশ করা হচ্ছে..." -ForegroundColor White
& git add .

$timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
$commitMsg = "Update My Finance: $timestamp"

& git commit -m "$commitMsg"
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Commit সম্পন্ন করা যায়নি!" -ForegroundColor Red
    exit 1
}

& git push origin $currentBranch
if ($LASTEXITCODE -ne 0) {
    Write-Host ""
    Write-Host "❌ GitHub-এ Push ব্যর্থ হয়েছে!" -ForegroundColor Red
    Write-Host "   সম্ভাব্য কারণ:" -ForegroundColor Yellow
    Write-Host "   ১. ইন্টারনেট সংযোগ বন্ধ থাকতে পারে।" -ForegroundColor Yellow
    Write-Host "   ২. GitHub একাউন্টের অনুমতি বা লগইন রিনিউ প্রয়োজন হতে পারে।" -ForegroundColor Yellow
    exit 1
}

Write-Host ""
Write-Host "==========================================================" -ForegroundColor Green
Write-Host "        🎉 My Finance সফলভাবে GitHub-এ প্রকাশিত হয়েছে!       " -ForegroundColor Yellow
Write-Host "==========================================================" -ForegroundColor Green
Write-Host ""
Write-Host "✓ কোড পুশ সম্পন্ন হয়েছে: $commitMsg" -ForegroundColor Green
Write-Host "✓ GitHub Actions স্বয়ংক্রিয়ভাবে ক্লাউডে বিল্ড ও ডেপ্লয় শুরু করেছে।" -ForegroundColor Green
Write-Host ""
if ($publicUrl) {
    Write-Host "🌐 আপনার My Finance লাইভ লিংক:" -ForegroundColor Cyan
    Write-Host "   $publicUrl" -ForegroundColor White -NoNewline
    Write-Host " (মোবাইল বা পিসিতে এই লিংকে যান)" -ForegroundColor Gray
    Write-Host ""
    Write-Host "⚙️ ডেপ্লয়মেন্টের লাইভ অগ্রগতি দেখতে পারেন:" -ForegroundColor Cyan
    Write-Host "   $actionsUrl" -ForegroundColor Gray
}
Write-Host ""
Write-Host "📱 পরামর্শ: ১-২ মিনিট পর মোবাইলে অ্যাপটি ওপেন করে Refresh দিলেই নতুন আপডেট চলে আসবে!" -ForegroundColor Yellow
Write-Host ""
