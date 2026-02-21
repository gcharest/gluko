locals {
  environment   = "prod"
  aws_region    = "us-east-1"  # Required for CloudFront + ACM
  project_name  = "gluko"
  domain_name   = "gluko.ca"

  tags = {
    Environment = "production"
    Terraform   = "true"
  }
}
