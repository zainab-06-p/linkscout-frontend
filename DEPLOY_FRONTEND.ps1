# LinkScout Frontend - Quick Deploy to Vercel
# Run this script from PowerShell

Write-Host "🚀 LinkScout Frontend Deployment Script" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Check if we're in the right directory
$currentDir = Get-Location
if (-not (Test-Path "package.json")) {
    Write-Host "❌ Error: package.json not found!" -ForegroundColor Red
    Write-Host "Please run this script from: D:\LinkScout\web_interface\LinkScout" -ForegroundColor Yellow
    exit 1
}

Write-Host "✅ Found package.json" -ForegroundColor Green
Write-Host ""

# Check if git is initialized
if (-not (Test-Path ".git")) {
    Write-Host "📦 Initializing Git repository..." -ForegroundColor Yellow
    git init
    Write-Host "✅ Git initialized" -ForegroundColor Green
} else {
    Write-Host "✅ Git already initialized" -ForegroundColor Green
}
Write-Host ""

# Get GitHub username
Write-Host "📝 GitHub Setup" -ForegroundColor Cyan
Write-Host "----------------" -ForegroundColor Cyan
$githubUsername = Read-Host "Enter your GitHub username (e.g., zainab-06-p)"

if ([string]::IsNullOrWhiteSpace($githubUsername)) {
    Write-Host "❌ GitHub username is required!" -ForegroundColor Red
    exit 1
}

# Check if remote already exists
$remoteExists = git remote get-url origin 2>$null
if ($remoteExists) {
    Write-Host "⚠️  Git remote 'origin' already exists: $remoteExists" -ForegroundColor Yellow
    $overwrite = Read-Host "Do you want to update it? (y/n)"
    if ($overwrite -eq 'y') {
        git remote remove origin
        git remote add origin "https://github.com/$githubUsername/linkscout-frontend.git"
        Write-Host "✅ Remote updated" -ForegroundColor Green
    }
} else {
    git remote add origin "https://github.com/$githubUsername/linkscout-frontend.git"
    Write-Host "✅ Remote added: https://github.com/$githubUsername/linkscout-frontend" -ForegroundColor Green
}
Write-Host ""

# Add and commit files
Write-Host "📦 Preparing files for commit..." -ForegroundColor Yellow
git add .

$commitMessage = "Initial commit - LinkScout frontend ready for deployment"
git commit -m $commitMessage

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Files committed" -ForegroundColor Green
} else {
    Write-Host "⚠️  Nothing to commit (files may already be committed)" -ForegroundColor Yellow
}
Write-Host ""

# Push to GitHub
Write-Host "🚀 Pushing to GitHub..." -ForegroundColor Yellow
Write-Host "You may be prompted for GitHub credentials" -ForegroundColor Cyan
Write-Host ""

# Try to push
git branch -M main
git push -u origin main

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "✅ Successfully pushed to GitHub!" -ForegroundColor Green
    Write-Host ""
    Write-Host "========================================" -ForegroundColor Cyan
    Write-Host "🎉 GitHub Setup Complete!" -ForegroundColor Green
    Write-Host "========================================" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "📍 Your repository: https://github.com/$githubUsername/linkscout-frontend" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "🚀 NEXT STEPS:" -ForegroundColor Yellow
    Write-Host "1. Go to https://vercel.com" -ForegroundColor White
    Write-Host "2. Sign in with GitHub" -ForegroundColor White
    Write-Host "3. Click 'Add New...' → 'Project'" -ForegroundColor White
    Write-Host "4. Import 'linkscout-frontend'" -ForegroundColor White
    Write-Host "5. Add environment variable:" -ForegroundColor White
    Write-Host "   Name:  NEXT_PUBLIC_BACKEND_URL" -ForegroundColor Cyan
    Write-Host "   Value: https://zpsajst-linkscout-backend.hf.space" -ForegroundColor Cyan
    Write-Host "6. Click 'Deploy'" -ForegroundColor White
    Write-Host ""
    Write-Host "📖 Full guide: See DEPLOY_TO_VERCEL.md" -ForegroundColor Yellow
    Write-Host ""
} else {
    Write-Host ""
    Write-Host "❌ Push failed!" -ForegroundColor Red
    Write-Host ""
    Write-Host "📝 Make sure you've:" -ForegroundColor Yellow
    Write-Host "1. Created the repository on GitHub: https://github.com/new" -ForegroundColor White
    Write-Host "   Repository name: linkscout-frontend" -ForegroundColor Cyan
    Write-Host "2. Configured Git credentials" -ForegroundColor White
    Write-Host ""
    Write-Host "Then run this script again!" -ForegroundColor Yellow
    Write-Host ""
}
