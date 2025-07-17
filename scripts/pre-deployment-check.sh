#!/bin/bash

# Pre-deployment check script for PDF Management Platform
# This script verifies that all required configurations are in place

echo "🔍 Starting pre-deployment checks..."

# Check if DATABASE_URL is set
if [ -z "$DATABASE_URL" ]; then
    echo "❌ ERROR: DATABASE_URL is not set. Please provision a database."
    exit 1
else
    echo "✅ DATABASE_URL is configured"
fi

# Check if theme.json exists
if [ ! -f "theme.json" ]; then
    echo "❌ ERROR: theme.json file is missing"
    exit 1
else
    echo "✅ theme.json file exists"
fi

# Verify theme.json structure
if ! jq -e '.name and .dark and .variant and .appearance' theme.json > /dev/null 2>&1; then
    echo "❌ ERROR: theme.json is missing required fields"
    exit 1
else
    echo "✅ theme.json has correct structure"
fi

# Check if package.json exists
if [ ! -f "package.json" ]; then
    echo "❌ ERROR: package.json file is missing"
    exit 1
else
    echo "✅ package.json exists"
fi

# Check if shared/schema.ts exists
if [ ! -f "shared/schema.ts" ]; then
    echo "❌ ERROR: Database schema file is missing"
    exit 1
else
    echo "✅ Database schema file exists"
fi

# Check if drizzle.config.ts exists
if [ ! -f "drizzle.config.ts" ]; then
    echo "❌ ERROR: Drizzle configuration file is missing"
    exit 1
else
    echo "✅ Drizzle configuration exists"
fi

# Test database connection
echo "🔍 Testing database connection..."
if timeout 10 node -e "
import('pg').then(({default: pg}) => {
  const client = new pg.Client({connectionString: process.env.DATABASE_URL});
  client.connect().then(() => {
    console.log('✅ Database connection successful');
    client.end();
  }).catch(err => {
    console.error('❌ Database connection failed:', err.message);
    process.exit(1);
  });
});
" 2>/dev/null; then
    echo "✅ Database connection verified"
else
    echo "❌ ERROR: Database connection failed"
    exit 1
fi

echo ""
echo "🎉 All pre-deployment checks passed!"
echo "✅ Ready for deployment"
echo ""
echo "📋 Deployment checklist:"
echo "   1. Run 'npm run db:push' to create database tables"
echo "   2. Start the application with 'npm run dev'"
echo "   3. Test all API endpoints"
echo "   4. Verify file upload functionality"