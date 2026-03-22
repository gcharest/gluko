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

variable "txt_ttl" {
  description = "TTL in seconds for TXT records managed by this module"
  type        = number
  default     = 3600
}

variable "enable_spf_record" {
  description = "Whether to create an SPF TXT record at the apex domain"
  type        = bool
  default     = true
}

variable "spf_record_value" {
  description = "SPF TXT value to publish at apex (use v=spf1 -all for non-sending domains)"
  type        = string
  default     = "v=spf1 -all"
}

variable "enable_null_mx_record" {
  description = "Whether to publish a null MX record (RFC7505) indicating the domain does not accept email"
  type        = bool
  default     = true
}

variable "null_mx_record_value" {
  description = "MX record value for null MX (RFC7505); keep as '0 .' unless you need normal mail routing"
  type        = string
  default     = "0 ."
}

variable "enable_dmarc_record" {
  description = "Whether to create a DMARC TXT record"
  type        = bool
  default     = true
}

variable "dmarc_policy" {
  description = "DMARC policy for the organizational domain (none, quarantine, reject)"
  type        = string
  default     = "reject"

  validation {
    condition     = contains(["none", "quarantine", "reject"], var.dmarc_policy)
    error_message = "dmarc_policy must be one of: none, quarantine, reject."
  }
}

variable "dmarc_subdomain_policy" {
  description = "Optional DMARC subdomain policy (sp tag). Set null to omit"
  type        = string
  default     = null

  validation {
    condition     = var.dmarc_subdomain_policy == null || contains(["none", "quarantine", "reject"], var.dmarc_subdomain_policy)
    error_message = "dmarc_subdomain_policy must be null or one of: none, quarantine, reject."
  }
}

variable "dmarc_pct" {
  description = "DMARC pct tag value (0-100)"
  type        = number
  default     = 100

  validation {
    condition     = var.dmarc_pct >= 0 && var.dmarc_pct <= 100
    error_message = "dmarc_pct must be between 0 and 100."
  }
}

variable "dmarc_aggregate_report_uri" {
  description = "Optional DMARC aggregate report mailbox, without mailto: prefix"
  type        = string
  default     = null
}

variable "dmarc_forensic_report_uri" {
  description = "Optional DMARC forensic report mailbox, without mailto: prefix"
  type        = string
  default     = null
}

variable "dmarc_alignment_dkim" {
  description = "Optional DMARC DKIM alignment mode (r or s). Set null to omit"
  type        = string
  default     = null

  validation {
    condition     = var.dmarc_alignment_dkim == null || contains(["r", "s"], var.dmarc_alignment_dkim)
    error_message = "dmarc_alignment_dkim must be null, r, or s."
  }
}

variable "dmarc_alignment_spf" {
  description = "Optional DMARC SPF alignment mode (r or s). Set null to omit"
  type        = string
  default     = null

  validation {
    condition     = var.dmarc_alignment_spf == null || contains(["r", "s"], var.dmarc_alignment_spf)
    error_message = "dmarc_alignment_spf must be null, r, or s."
  }
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
