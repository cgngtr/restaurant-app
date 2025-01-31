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
    "builds": [
        {
            "src": "bubble-exports/customer/**",
            "use": "@vercel/static"
        }
    ],
    "routes": [
        {
            "src": "/(.*)",
            "dest": "/bubble-exports/customer/$1"
        }
    ],
    "env": {
        "SUPABASE_URL": "@supabase_url",
        "SUPABASE_ANON_KEY": "@supabase_anon_key"
    }
}
```

### Admin Portal (AWS Amplify)
```yaml
version: 1
frontend:
  phases:
    build:
      commands:
        - echo "No build required for Bubble.io export"
  artifacts:
    baseDirectory: bubble-exports/admin
    files:
      - '**/*'
  cache:
    paths: []
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
    - endpoint: "/*"
      rate: 100
      per: 60
    - endpoint: "/api/*"
      rate: 50
      per: 60
```

## Monitoring & Logging

### Application Monitoring
```yaml
monitoring:
  services:
    - name: customer_portal
      endpoints:
        - https://customer.qrorderapp.com/health
      interval: 60
      timeout: 5
    - name: admin_portal
      endpoints:
        - https://admin.qrorderapp.com/health
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

## Scaling Configuration

### Vercel (Customer Portal)
```json
{
    "functions": {
        "maxDuration": 10,
        "memory": 1024
    },
    "regions": ["iad1", "sfo1", "hnd1"]
}
```

### AWS Amplify (Admin Portal)
```yaml
scaling:
  auto_scaling:
    min_capacity: 1
    max_capacity: 10
    target_utilization: 70
```

## Backup & Recovery

### Database Backups
```yaml
backup_strategy:
  full_backup:
    frequency: daily
    time: "00:00"
    retention: 30d
  point_in_time:
    enabled: true
    retention: 7d
```

### Disaster Recovery
```yaml
disaster_recovery:
  rpo: 24h  # Recovery Point Objective
  rto: 4h   # Recovery Time Objective
  regions:
    primary: us-east-1
    secondary: us-west-2
```

## CI/CD Pipeline

### GitHub Actions
```yaml
name: Deploy
on:
  push:
    branches: [main]
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Deploy Customer Portal
        uses: vercel/actions/cli@v2
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.ORG_ID}}
          vercel-project-id: ${{ secrets.PROJECT_ID }}
      - name: Deploy Admin Portal
        uses: aws-actions/configure-aws-credentials@v1
        with:
          aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
          aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
          aws-region: us-east-1
```

## Environment Variables

### Production
```env
NODE_ENV=production
SUPABASE_URL=https://[project_ref].supabase.co
SUPABASE_ANON_KEY=[anon_key]
AWS_REGION=us-east-1
CLOUDFLARE_TOKEN=[cf_token]
```

### Staging
```env
NODE_ENV=staging
SUPABASE_URL=https://[staging_ref].supabase.co
SUPABASE_ANON_KEY=[staging_anon_key]
AWS_REGION=us-east-1
CLOUDFLARE_TOKEN=[cf_staging_token]
``` 