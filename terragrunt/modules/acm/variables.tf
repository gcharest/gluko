variable "domain_name" {
  description = "Primary domain name for the certificate"
  type        = string
}

variable "subject_alternative_names" {
  description = "Alternative domain names for the certificate"
  type        = list(string)
  default     = []
}

variable "validation_method" {
  description = "Certificate validation method (DNS or EMAIL)"
  type        = string
  default     = "DNS"
  validation {
    condition     = contains(["DNS", "EMAIL"], var.validation_method)
    error_message = "Validation method must be DNS or EMAIL."
  }
}

variable "route53_zone_id" {
  description = "Route 53 Hosted Zone ID for DNS validation"
  type        = string
  default     = ""
}

variable "create_route53_records" {
  description = "Whether to create Route 53 records for DNS validation"
  type        = bool
  default     = true
}

variable "wait_for_validation" {
  description = "Whether to wait for certificate validation before returning"
  type        = bool
  default     = true
}

variable "tags" {
  description = "Common tags for all resources"
  type        = map(string)
  default     = {}
}

variable "project_name" {
  description = "Project name for resource naming"
  type        = string
  default     = "gcharest"
}