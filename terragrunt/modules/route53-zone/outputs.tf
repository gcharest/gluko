output "hosted_zone_id" {
  description = "The Route53 hosted zone ID"
  value       = aws_route53_zone.main.zone_id
}

output "name_servers" {
  description = "The name servers for the hosted zone"
  value       = aws_route53_zone.main.name_servers
}

output "zone_arn" {
  description = "The ARN of the hosted zone"
  value       = aws_route53_zone.main.arn
}
