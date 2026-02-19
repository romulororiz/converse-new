Param(
  [string]$OutputDir = "./migration-artifacts"
)

$ErrorActionPreference = "Stop"

if (-not $env:SUPABASE_DB_URL) {
  throw "SUPABASE_DB_URL is not set."
}

if (-not $env:NEON_DB_URL) {
  throw "NEON_DB_URL is not set."
}

if (-not (Get-Command pg_dump -ErrorAction SilentlyContinue)) {
  throw "pg_dump not found. Install PostgreSQL client tools and retry."
}

if (-not (Get-Command psql -ErrorAction SilentlyContinue)) {
  throw "psql not found. Install PostgreSQL client tools and retry."
}

New-Item -ItemType Directory -Force -Path $OutputDir | Out-Null

$schemaFile = Join-Path $OutputDir "supabase_schema.sql"
$dataFile = Join-Path $OutputDir "supabase_data.sql"

Write-Host "[1/5] Exporting Supabase schema..."
pg_dump $env:SUPABASE_DB_URL --schema=public --schema-only --no-owner --no-privileges --file $schemaFile

Write-Host "[2/5] Exporting Supabase data..."
pg_dump $env:SUPABASE_DB_URL --schema=public --data-only --no-owner --no-privileges --file $dataFile

Write-Host "[3/5] Restoring schema to Neon..."
psql $env:NEON_DB_URL -f $schemaFile

Write-Host "[4/5] Restoring data to Neon..."
psql $env:NEON_DB_URL -f $dataFile

Write-Host "[5/5] Running basic validation..."

psql $env:NEON_DB_URL -c "SELECT tablename FROM pg_tables WHERE schemaname='public' ORDER BY tablename;"
psql $env:NEON_DB_URL -c "SELECT schemaname, tablename, policyname, cmd FROM pg_policies WHERE schemaname='public' ORDER BY tablename, policyname;"

Write-Host "Migration completed. Artifacts stored in: $OutputDir"
