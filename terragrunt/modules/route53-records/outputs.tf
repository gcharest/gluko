output "apex_record_name" {
  description = "The apex domain record name"
  value       = aws_route53_record.cloudfront.name
}

output "www_record_name" {
  description = "The www subdomain record name"
  value       = var.create_www_subdomain ? aws_route53_record.www[0].name : null
}
