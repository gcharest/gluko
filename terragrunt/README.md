# Terragrunt/Terraform Infrastructure for Gluko PWA

> **⚠️ Updated to v6.0**: This infrastructure now uses AWS Provider 6.x with S3 lockfile backend (no DynamoDB). See [SETUP_GUIDE.md](./SETUP_GUIDE.md) for migration details.

This directory contains Infrastructure as Code (IaC) for deploying Gluko to AWS using Terragrunt and Terraform.

## Quick Links

- **[Setup Guide](./SETUP_GUIDE.md)**: Detailed setup instructions for GitHub Actions deployment
- **[Architecture](#architecture-overview)**: System design and services
- **[Cost](#total-monthly-cost)**: Pricing breakdown (~$0.50/month)

## What's New in v6.0

- ✅ AWS Provider updated from `~> 5.0` to `~> 6.0`
- ✅ Backend changed from DynamoDB locks to S3 native lockfile
- ✅ Region standardized to `us-east-1` (required for CloudFront)
- ✅ CloudFront logging disabled (free tier optimization)
- ✅ Security response headers policy added
- ✅ GitHub Actions workflows for automated deployment

## Architecture Overview

```
Custom Domain (Gandi.net)
        ↓
   Route 53 DNS
        ↓
   CloudFront CDN (Free Tier $0/mo)
        ↓
   S3 Bucket (Static Files)
        ↓
   Built Assets (HTML, CSS, JS, JSON)
```

## Services Deployed

- **S3**: Static file hosting with versioning and encryption
- **CloudFront**: Global CDN with DDoS protection, HTTPS, intelligent caching
- **Route 53**: DNS management with alias records to CloudFront
- **ACM**: Free SSL/TLS certificate with auto-renewal

## Prerequisites

### Required Tools

```bash
# Homebrew (macOS)
brew install terraform terragrunt aws-cli

# Or download manually:
# - Terraform: https://www.terraform.io/downloads
# - Terragrunt: https://terragrunt.gruntwork.io/docs/getting-started/install/
# - AWS CLI: https://aws.amazon.com/cli/
```

### AWS Account Setup

1. Create AWS account: https://aws.amazon.com/
2. Receive $200 free credits
3. Configure AWS credentials:

```bash
# Option 1: Interactive
aws configure

# Option 2: Environment variables
export AWS_ACCESS_KEY_ID="your-access-key"
export AWS_SECRET_ACCESS_KEY="your-secret-key"
export AWS_REGION="us-east-1"

# Option 3: AWS credentials file (~/.aws/credentials)
[default]
aws_access_key_id = your-access-key
aws_secret_access_key = your-secret-key
```

### Domain Setup (Gandi.net)

1. You already own domain at Gandi.net
2. We'll create Route 53 hosted zone
3. You'll point nameservers at Gandi.net to Route 53 nameservers
4. ACM will auto-validate certificate via DNS

## Project Structure

```
terragrunt/
├── terragrunt.hcl                  # Root config (shared by all modules)
├── modules/                        # Reusable Terraform modules
│   ├── s3/                        # S3 bucket for static files
│   ├── cloudfront/                # CloudFront CDN
│   ├── route53/                   # Route 53 DNS
│   └── acm/                       # SSL/TLS certificate
└── environments/
    └── prod/
        ├── region.hcl             # Environment variables
        ├── s3/terragrunt.hcl      # S3 deployment config
        ├── cloudfront/terragrunt.hcl
        ├── route53/terragrunt.hcl
        └── acm/terragrunt.hcl
```

## Configuration

### 1. Update Domain Name

Edit `terragrunt/environments/prod/region.hcl`:

```hcl
locals {
  domain_name = "your-actual-domain.com"  # NOT gluko.example.com
  # ... rest of config
}
```

Replace `your-actual-domain.com` with your Gandi.net domain.

### 2. AWS Region

All infrastructure is in `us-east-1` (required for CloudFront + ACM certificates).

## Deployment Steps

### Step 1: Initialize Terragrunt

```bash
cd terragrunt/environments/prod

# Initialize - creates .terraform directory and downloads providers
terragrunt run-all init
```

### Step 2: Plan Infrastructure

```bash
# See what will be created (dry-run)
terragrunt run-all plan

# Or plan individual modules:
terragrunt plan -chdir s3/
terragrunt plan -chdir cloudfront/
terragrunt plan -chdir route53/
terragrunt plan -chdir acm/
```

### Step 3: Deploy Infrastructure

```bash
# Apply all changes
terrg run-all apply

# Or apply modules in order (with dependencies):
terragrunt apply -chdir acm/
terragrunt apply -chdir route53/  # Needs ACM zone ID
terragrunt apply -chdir s3/
terragrunt apply -chdir cloudfront/  # Needs S3 + ACM
```

When prompted, review the changes and type `yes` to confirm.

**Note**: First deployment typically takes 15-30 minutes (CloudFront distribution creation is slow).

### Step 4: Get Route 53 Nameservers

After Route 53 deploys successfully:

```bash
# Get the nameservers
terragrunt output -chdir route53/ nameservers

# Output will be like:
# ns-123.awsdns-45.com.
# ns-456.awsdns-78.net.
# ns-789.awsdns-01.com.
# ns-012.awsdns-34.org.
```

### Step 5: Update Gandi.net Nameservers

1. Login to Gandi.net
2. Go to Domain Settings → Name Servers
3. Select "Use external name servers"
4. Enter the 4 Route 53 nameservers from Step 4
5. Save (takes 5-24 hours to propagate)

### Step 6: Verify CloudFront & Certificate

After nameservers propagate:

```bash
# Get CloudFront distribution ID
terragrunt output -chdir cloudfront/ distribution_id

# Get domain name
terragrunt output -chdir cloudfront/ domain_name

# Check ACM certificate status
terragrunt output -chdir acm/ certificate_status
```

Visit `https://your-domain.com` - should show HTTPS ✅

## Uploading Build Files to S3

```bash
# Build your app locally
npm run build

# Get S3 bucket name
BUCKET=$(terragrunt output -chdir s3/ bucket_id 2>/dev/null | tr -d '"')

# Sync built files to S3
aws s3 sync dist/ s3://$BUCKET/ --delete --cache-control "public, max-age=31536000"

# Special handling for index.html and manifest.json (short TTL)
aws s3 cp dist/index.html s3://$BUCKET/ --cache-control "public, max-age=3600"
aws s3 cp dist/manifest.json s3://$BUCKET/ --cache-control "public, max-age=0"

# Invalidate CloudFront cache
DIST_ID=$(terragrunt output -chdir cloudfront/ distribution_id 2>/dev/null | tr -d '"')
aws cloudfront create-invalidation --distribution-id $DIST_ID --paths "/index.html" "/manifest.json"
```

**Tip**: Use the GitHub Actions workflow for automated deployments (see below).

## Useful Commands

```bash
# Show all outputs across all modules
terragrunt run-all output

# Show specific output
terragrunt output -chdir route53/ nameservers

# Destroy all infrastructure (use with caution!)
terragrunt run-all destroy

# Refresh state (sync local state with AWS)
terragrunt run-all refresh

# Format all Terraform files
terragrunt run-all fmt

# Validate all Terraform configurations
terragrunt run-all validate

# Show costs estimate (requires setup)
# terragrunt run-all plan -out=tfplan && terraform show -json tfplan | jq .resource_changes
```

## Terraform State Management

State files are stored in S3 with DynamoDB locking:

- **S3 Bucket**: `gluko-terraform-state-{ACCOUNT_ID}`
- **DynamoDB Table**: `terraform-locks`
- **Encryption**: Enabled by default
- **Versioning**: Enabled for recovery

**Never commit state files to Git!** (already in .gitignore)

## GitHub Actions Deployment (CI/CD)

See `.github/workflows/deploy-aws.yml` for automated deployments on git push.

Setup:

1. Create IAM role for GitHub with S3 + CloudFront permissions
2. Configure OIDC trust between GitHub and AWS
3. Add secrets to GitHub Actions
4. Push to `main` branch → automatic deployment

## Cost Estimation

| Service    | Free Tier     | Notes                      |
| ---------- | ------------- | -------------------------- |
| S3         | $0            | 5 GB storage included      |
| CloudFront | $0            | Free plan ($0/mo)          |
| Route 53   | ~$0.50/mo     | Hosted zone + DNS queries  |
| ACM        | $0            | Non-exportable cert (free) |
| **Total**  | **~$0.50/mo** | ✅ Essentially free         |

Your $200 AWS credit lasts ~400 months!

## Monitoring & Debugging

### Check Distribution Status

```bash
aws cloudfront get-distribution \
  --id $(terragrunt output -chdir cloudfront/ distribution_id | tr -d '"')
```

### View CloudFront Metrics

```
AWS Console → CloudFront → Distributions → Select gluko-pwa → Monitoring
```

### Test HTTPS Certificate

```bash
openssl s_client -connect your-domain.com:443 -servername your-domain.com
```

### Check DNS Resolution

```bash
# Should resolve to CloudFront distribution
dig your-domain.com

# View nameserver records
dig NS your-domain.com
```

### Monitor S3 Bucket

```bash
# List all objects in S3
aws s3 ls s3://gluko-pwa/ --recursive

# Check bucket size
aws s3 ls s3://gluko-pwa/ --recursive --summarize
```

## Troubleshooting

### "Certificate validation pending" (ACM)

Ensure Route 53 hosted zone is active and nameservers are updated at Gandi.net. Validation can take 5-60 minutes.

### CloudFront returns 403 (Forbidden)

- Check S3 bucket policy is correct (OAC configured)
- Verify CloudFront origin points to S3 bucket
- Check S3 bucket Block Public Access settings

### Changes not visible after deployment

CloudFront caches files:
- `index.html`: cached 1 hour (update within 60 minutes)
- `manifest.json`: not cached (update immediately)
- JS/CSS: cached 1 year (must change filename to update)

Manually invalidate cache:

```bash
aws cloudfront create-invalidation --distribution-id DIST_ID --paths "/index.html"
```

### Nameservers not updating at registrar

- **Gandi.net** propagation: 5 minutes - 24 hours (typically < 2 hours)
- Verify you're updating the right domain
- Check DNS with: `dig NS your-domain.com`

### Terraform lock timeout

If another deployment is running:

```bash
# View lock
aws dynamodb scan --table-name terraform-locks --region us-east-1

# Force unlock (use with caution!)
terragrunt force-unlock LOCK_ID
```

## Security Best Practices

✅ **Already Configured**:
- S3 encryption at rest (AES-256)
- HTTPS only (redirects HTTP → HTTPS)
- CloudFront DDoS protection (included in free tier)
- Origin Access Control (S3 not publicly accessible)
- Public access blocked on S3

⚠️ **Additional Recommendations**:
- Enable MFA on AWS account
- Use IAM roles (not root credentials)
- Add billing alerts: AWS Console → Billing → Budget
- Enable CloudTrail for audit logging
- Consider AWS WAF for additional protection (not in free tier)

## Next Steps

1. **Update domain name** in `region.hcl`
2. **Run `terragrunt run-all plan`** to review
3. **Deploy infrastructure** with `terragrunt run-all apply`
4. **Update Gandi.net nameservers** (get from Route 53 output)
5. **Wait 24h for propagation**
6. **Test HTTPS** at your domain
7. **Deploy app files** to S3
8. **Set up GitHub Actions** for CI/CD

## Resources

- **Terraform Docs**: https://registry.terraform.io/
- **Terragrunt Docs**: https://terragrunt.gruntwork.io/
- **AWS Docs**: https://docs.aws.amazon.com/
- **CloudFront Caching**: https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/caching-and-serving.html

## Support

For issues:

1. Check troubleshooting section
2. Review logs: `terragrunt run-all apply --terragrunt-log-level debug`
3. Check AWS Console for error messages
4. Review Terraform state: `terragrunt output -chdir <module>/`

## License

Same as Gluko project
