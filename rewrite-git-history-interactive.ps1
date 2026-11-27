# Git History Rewrite Script - Interactive
# Rewrites all commits to use the specified author/committer info
# Run from the repo root: C:\Users\armaa\kids-island

Write-Host "=== Git History Rewrite Script ===" -ForegroundColor Cyan
Write-Host "This will rewrite ALL commits in the repository to use the kidsislandschool GitHub account." -ForegroundColor Yellow
Write-Host ""

# Get target info
$authorName = Read-Host "Author Name (e.g., Kids Island School)"
if (-not $authorName) { $authorName = "Kids Island School" }

$authorEmail = Read-Host "Author Email (e.g., kidsislandschool@gmail.com)"
if (-not $authorEmail) { $authorEmail = "kidsislandschool@gmail.com" }

$committerName = Read-Host "Committer Name (usually same as author)"
if (-not $committerName) { $committerName = $authorName }

$committerEmail = Read-Host "Committer Email (usually same as author)"
if (-not $committerEmail) { $committerEmail = $authorEmail }

Write-Host ""
Write-Host "=== Configuration ===" -ForegroundColor Cyan
Write-Host "Author:  $authorName <$authorEmail>" -ForegroundColor Green
Write-Host "Committer: $committerName <$committerEmail>" -ForegroundColor Green
Write-Host ""

$confirm = Read-Host "This will rewrite ALL git history. Continue? (yes/no)"
if ($confirm.ToLower() -ne 'yes') {
    Write-Host "Aborted." -ForegroundColor Red
    exit 1
}

# Create backup branch
$backupBranch = "backup-before-rewrite-$(Get-Date -Format 'yyyyMMdd-HHmmss')"
git branch $backupBranch
Write-Host "Created backup branch: $backupBranch" -ForegroundColor Cyan

# Set env vars for filter-branch
$env:GIT_AUTHOR_NAME = $authorName
$env:GIT_AUTHOR_EMAIL = $authorEmail
$env:GIT_COMMITTER_NAME = $authorName
$env:GIT_COMMITTER_EMAIL = $committerEmail

Write-Host "Rewriting git history..." -ForegroundColor Cyan

git filter-branch --env-filter '
    export GIT_AUTHOR_NAME="$env:GIT_AUTHOR_NAME"
    export GIT_AUTHOR_EMAIL="$env:GIT_AUTHOR_EMAIL"
    export GIT_COMMITTER_NAME="$env:GIT_COMMITTER_NAME"
    export GIT_COMMITTER_EMAIL="$env:GIT_COMMITTER_EMAIL"
' --tag-name-filter cat -- --branches --tags

if ($LASTEXITCODE -ne 0) {
    Write-Host "Filter-branch failed!" -ForegroundColor Red
    exit 1
}

# Clean up refs
git for-each-ref --format="delete %(refname)" refs/original | git update-ref --stdin
git reflog expire --expire=now --all
git gc --prune=now --aggressive

Write-Host "History rewritten successfully!" -ForegroundColor Green
Write-Host ""
Write-Host "Now you need to force push:" -ForegroundColor Yellow
Write-Host "  git push origin master --force" -ForegroundColor Cyan
Write-Host "  git push origin --tags --force" -ForegroundColor Cyan
Write-Host ""
Write-Host "WARNING: This rewrites history. Coordinate with team before pushing!" -ForegroundColor Red