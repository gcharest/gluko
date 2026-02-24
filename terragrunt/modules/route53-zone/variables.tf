variable "domain_name" {
  description = "Primary domain name for Route 53 hosted zone"
  type        = string
  validation {
    condition     = can(regex("^[a-z0-9][a-z0-9-]*[a-z0-9]+\\.[a-z]{2,}$", var.domain_name))
    error_message = "Domain name must be a valid domain."
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
