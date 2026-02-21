variable "domain_name" {
  description = "Primary domain name for Route 53 hosted zone"
  type        = string
  validation {
    condition     = can(regex("^[a-z0-9][a-z0-9-]*[a-z0-9]+\\.[a-z]{2,}$", var.domain_name))
    error_message = "Domain name must be a valid domain."
  }
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
