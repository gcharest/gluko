output "hosted_zone_id" {
  description = "Route 53 Hosted Zone ID"
  value       = aws_route53_zone.main.zone_id
}

output "hosted_zone_name" {
  description = "Route 53 Hosted Zone name"
  value       = aws_route53_zone.main.name
}

output "nameservers" {
  description = "Route 53 nameservers (use these at your registrar)"
  value       = aws_route53_zone.main.name_servers
}

output "nameservers_string" {
  description = "Route 53 nameservers as a formatted string for copy-paste"
  value       = join("\n", aws_route53_zone.main.name_servers)
}

output "primary_nameserver" {
  description = "Primary Route 53 nameserver"
  value       = aws_route53_zone.main.name_servers[0]
}
