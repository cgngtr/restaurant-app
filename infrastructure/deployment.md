# Deployment Configuration

## Domain Setup

### DNS Configuration (Cloudflare)
```yaml
# Primary domain
qrorderapp.com:
  - Type: A
    Name: @
    Content: [Vercel IP]
    Proxy: true

# Customer subdomain
customer.qrorderapp.com:
  - Type: CNAME
    Name: customer
    Content: cname.vercel-dns.com
    Proxy: true

# Admin subdomain
admin.qrorderapp.com:
  - Type: CNAME
    Name: admin
    Content: [AWS Amplify Domain]
    Proxy: true
```

## Hosting Configuration

### Customer Portal (Vercel)
```json
{
    "version": 2,
    "framework": "nextjs",
    "buildCommand": "npm run build",
    "outputDirectory": ".next",
    "env": {
        "NEXT_PUBLIC_SUPABASE_URL": "@supabase_url",
        "NEXT_PUBLIC_SUPABASE_ANON_KEY": "@supabase_anon_key"
    }
}
```

### Admin Portal (AWS Amplify)
```yaml
version: 1
frontend:
  phases:
    preBuild:
      commands:
        - npm ci
    build:
      commands:
        - npm run build
  artifacts:
    baseDirectory: .next
    files:
      - '**/*'
  cache:
    paths:
      - node_modules/**/*
      - .next/cache/**/*
```

## Database Configuration (Supabase)

### Connection Settings
```yaml
database_url: postgresql://postgres:[DB_PASSWORD]@db.[project_ref].supabase.co:5432/postgres
pool_settings:
  max_connections: 100
  idle_timeout: 300
```

### Backup Configuration
```yaml
backup:
  schedule: "0 0 * * *"  # Daily backup at midnight
  retention_period: 30    # Keep backups for 30 days
  storage:
    provider: aws
    bucket: qrorderapp-backups
```

## Security Configuration

### SSL/TLS
```yaml
ssl_config:
  minimum_version: TLSv1.2
  preferred_ciphers:
    - ECDHE-ECDSA-AES128-GCM-SHA256
    - ECDHE-RSA-AES128-GCM-SHA256
```

### Rate Limiting
```yaml
rate_limiting:
  rules:
    - endpoint: "/api/*"
      rate: 100
      per: 60
```

## Monitoring & Logging

### Application Monitoring
```yaml
monitoring:
  services:
    - name: customer_portal
      endpoints:
        - https://customer.qrorderapp.com/api/health
      interval: 60
      timeout: 5
    - name: admin_portal
      endpoints:
        - https://admin.qrorderapp.com/api/health
      interval: 60
      timeout: 5
```

### Log Management
```yaml
logging:
  retention: 30d
  destinations:
    - type: cloudwatch
      log_group: /qrorderapp/production
    - type: supabase
      table: system_logs
```

## CI/CD Pipeline

### GitHub Actions
```yaml
name: Deploy
on:
  push:
    branches: [main]
jobs:
  deploy-customer:
    runs-on: ubuntu-latest
    defaults:
      run:
        working-directory: ./customer-portal
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - name: Install dependencies
        run: npm ci
      - name: Run tests
        run: npm test
      - name: Deploy to Vercel
        uses: vercel/actions/cli@v2
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.ORG_ID}}
          vercel-project-id: ${{ secrets.PROJECT_ID }}
          working-directory: ./customer-portal

  deploy-admin:
    runs-on: ubuntu-latest
    defaults:
      run:
        working-directory: ./admin-portal
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - name: Install dependencies
        run: npm ci
      - name: Run tests
        run: npm test
      - name: Deploy to AWS Amplify
        uses: aws-actions/configure-aws-credentials@v1
        with:
          aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
          aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
          aws-region: us-east-1
```

## Environment Variables

### Production
```env
# Next.js
NODE_ENV=production
NEXT_PUBLIC_SUPABASE_URL=https://[project_ref].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=[anon_key]
NEXT_PUBLIC_API_URL=https://api.qrorderapp.com

# AWS
AWS_REGION=us-east-1
CLOUDFLARE_TOKEN=[cf_token]
```

### Staging
```env
# Next.js
NODE_ENV=staging
NEXT_PUBLIC_SUPABASE_URL=https://[staging_ref].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=[staging_anon_key]
NEXT_PUBLIC_API_URL=https://api.staging.qrorderapp.com

# AWS
AWS_REGION=us-east-1
CLOUDFLARE_TOKEN=[cf_staging_token]
``` 