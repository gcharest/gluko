output "certificate_arn" {
  description = "ARN of the ACM certificate"
  value       = aws_acm_certificate.website.arn
}

output "certificate_domain" {
  description = "Domain name of the certificate"
  value       = aws_acm_certificate.website.domain_name
}

output "certificate_status" {
  description = "Status of the certificate (PENDING_VALIDATION, ISSUED, etc.)"
  value       = aws_acm_certificate.website.status
}

output "validation_options" {
  description = "Certificate validation options"
  value = [
    for option in aws_acm_certificate.website.domain_validation_options : {
      domain_name = option.domain_name
      record_name = option.resource_record_name
      record_type = option.resource_record_type
      record_value = option.resource_record_value
    }
  ]
}
