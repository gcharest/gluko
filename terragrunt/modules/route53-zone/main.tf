resource "aws_route53_zone" "main" {
  name    = var.domain_name
  comment = "Hosted zone for ${var.domain_name}"

  tags = merge(
    var.tags,
    {
      Name = var.domain_name
    }
  )
}