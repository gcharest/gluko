# ACM certificates for CloudFront must be created in us-east-1
provider "aws" {
  alias  = "us_east_1"
  region = "us-east-1"
}

resource "aws_acm_certificate" "website" {
  provider                  = aws.us_east_1
  domain_name              = var.domain_name
  validation_method        = var.validation_method
  subject_alternative_names = var.subject_alternative_names

  tags = merge(
    var.tags,
    {
      Name = "${var.project_name}-certificate"
    }
  )

  lifecycle {
    create_before_destroy = true
  }
}

resource "aws_route53_record" "cert_validation" {
  for_each = var.create_route53_records ? {
    for dvo in aws_acm_certificate.website.domain_validation_options : dvo.domain_name => {
      name   = dvo.resource_record_name
      record = dvo.resource_record_value
      type   = dvo.resource_record_type
    }
  } : {}

  zone_id = var.route53_zone_id
  name    = each.value.name
  type    = each.value.type
  ttl     = 60
  records = [each.value.record]
}

resource "aws_acm_certificate_validation" "website" {
  count           = var.wait_for_validation ? 1 : 0
  certificate_arn = aws_acm_certificate.website.arn

  timeouts {
    create = "5m"
  }

  depends_on = [aws_route53_record.cert_validation]
}