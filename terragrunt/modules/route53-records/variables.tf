variable "domain_name" {
  description = "Primary domain name for DNS records"
  type        = string
}

variable "route53_zone_id" {
  description = "Route 53 hosted zone ID where records will be created"
  type        = string
}

variable "cloudfront_domain_name" {
  description = "CloudFront distribution domain name"
  type        = string
}

variable "cloudfront_zone_id" {
  description = "CloudFront distribution zone ID (for alias records)"
  type        = string
  default     = "Z2FDTNDATAQYW2"
}

variable "create_www_subdomain" {
  description = "Whether to create www subdomain record"
  type        = bool
  default     = true
}

variable "tags" {
  description = "Common tags for all resources"
  type        = map(string)
  default     = {}
}

variable "aws_region" {
  description = "AWS region for resources"
  type        = string
}

variable "environment" {
  description = "Environment name"
  type        = string
}
