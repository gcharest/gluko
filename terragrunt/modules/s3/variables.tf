variable "bucket_name" {
  description = "S3 bucket name for hosting static website files"
  type        = string
  validation {
    condition     = can(regex("^[a-z0-9-]{3,63}$", var.bucket_name))
    error_message = "Bucket name must be 3-63 lowercase alphanumeric characters or hyphens."
  }
}

variable "domain_name" {
  description = "Primary domain name for CORS configuration"
  type        = string
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
