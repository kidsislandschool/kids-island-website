# Git History Rewrite Script
# Rewrites all commits to use the specified author/committer info
# Run from the repo root: C:\Users\armaa\kids-island

param(
    [Parameter(Mandatory=$true)]
    [string]$AuthorName,
    
    [Parameter(Mandatory=$true)]
    [string]$AuthorEmail,
    
    [Parameter(Mandatory=$true)]
    [string]$CommitterName,
    
    [Parameter(Mandatory=$true)]
    [string]$CommitterEmail
)

Write-Host "=== Git History Rewrite Script ===" -ForegroundColor Cyan
Write-Host "This will rewrite ALL commits in the repository." -ForegroundColor Yellow
Write-Host "Target: $AuthorName <$AuthorEmail>" -ForegroundColor Green
Write-Host "Committer: $CommitterName <$CommitterEmail>" -ForegroundColor Green
Write-Host ""

# Confirm
$confirm = Read-Host "This will rewrite ALL git history. Are you sure? (yes/no)"
if ($confirm.ToLower() -ne 'yes') {
    Write-Host "Aborted." -ForegroundColor Red
    exit 1
}

# Backup current HEAD
$backupBranch = "backup-before-rewrite-$(Get-Date -Format 'yyyyMMdd-HHmmss')"
git branch $backupBranch
Write-Host "Created backup branch: $backupBranch" -ForegroundColor Cyan

# Rewrite history
Write-Host "Rewriting git history..." -ForegroundColor Cyan

$env:GIT_AUTHOR_NAME = $AuthorName
$env:GIT_AUTHOR_EMAIL = $AuthorEmail
$env:GIT_COMMITTER_NAME = $CommitterName
$env:GIT_COMMITTER_EMAIL = $CommitterEmail

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