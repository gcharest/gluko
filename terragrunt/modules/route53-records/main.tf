locals {
  dmarc_tags = compact([
    "v=DMARC1",
    "p=${var.dmarc_policy}",
    "pct=${var.dmarc_pct}",
    var.dmarc_subdomain_policy == null ? null : "sp=${var.dmarc_subdomain_policy}",
    var.dmarc_aggregate_report_uri == null ? null : "rua=mailto:${var.dmarc_aggregate_report_uri}",
    var.dmarc_forensic_report_uri == null ? null : "ruf=mailto:${var.dmarc_forensic_report_uri}",
    var.dmarc_alignment_dkim == null ? null : "adkim=${var.dmarc_alignment_dkim}",
    var.dmarc_alignment_spf == null ? null : "aspf=${var.dmarc_alignment_spf}",
  ])
  dmarc_record = join("; ", local.dmarc_tags)
}

resource "aws_route53_record" "cloudfront" {
  zone_id = var.route53_zone_id
  name    = var.domain_name
  type    = "A"

  alias {
    name                   = var.cloudfront_domain_name
    zone_id                = var.cloudfront_zone_id
    evaluate_target_health = false
  }
}

resource "aws_route53_record" "cloudfront_ipv6" {
  zone_id = var.route53_zone_id
  name    = var.domain_name
  type    = "AAAA"

  alias {
    name                   = var.cloudfront_domain_name
    zone_id                = var.cloudfront_zone_id
    evaluate_target_health = false
  }
}

resource "aws_route53_record" "www" {
  count   = var.create_www_subdomain ? 1 : 0
  zone_id = var.route53_zone_id
  name    = "www.${var.domain_name}"
  type    = "A"

  alias {
    name                   = var.cloudfront_domain_name
    zone_id                = var.cloudfront_zone_id
    evaluate_target_health = false
  }
}

resource "aws_route53_record" "spf" {
  count   = var.enable_spf_record ? 1 : 0
  zone_id = var.route53_zone_id
  name    = var.domain_name
  type    = "TXT"
  ttl     = var.txt_ttl

  records = [var.spf_record_value]
}

resource "aws_route53_record" "null_mx" {
  count   = var.enable_null_mx_record ? 1 : 0
  zone_id = var.route53_zone_id
  name    = var.domain_name
  type    = "MX"
  ttl     = var.txt_ttl

  records = [var.null_mx_record_value]
}

resource "aws_route53_record" "dmarc" {
  count   = var.enable_dmarc_record ? 1 : 0
  zone_id = var.route53_zone_id
  name    = "_dmarc.${var.domain_name}"
  type    = "TXT"
  ttl     = var.txt_ttl

  records = [local.dmarc_record]
}