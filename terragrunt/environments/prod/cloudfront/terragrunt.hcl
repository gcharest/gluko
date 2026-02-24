include {
  path = find_in_parent_folders("root.hcl")
}

dependency "s3" {
  config_path = "../s3"

  mock_outputs = {
    bucket_id                      = "gluko-pwa"
    bucket_arn                     = "arn:aws:s3:::gluko-pwa"
    bucket_regional_domain_name    = "gluko-pwa.s3.us-east-1.amazonaws.com"
  }

  mock_outputs_allowed_terraform_commands = ["plan", "validate", "init"]
}

dependency "acm" {
  config_path = "../acm"

  mock_outputs = {
    certificate_arn = "arn:aws:acm:us-east-1:123456789012:certificate/12345678-1234-1234-1234-123456789012"
  }

  mock_outputs_allowed_terraform_commands = ["plan", "validate", "init"]
}

locals {
  env_vars = read_terragrunt_config(find_in_parent_folders("region.hcl"))
}

inputs = {
  distribution_name               = "${local.env_vars.locals.project_name}"
  s3_bucket_id                    = dependency.s3.outputs.bucket_id
  s3_bucket_arn                   = dependency.s3.outputs.bucket_arn
  s3_bucket_regional_domain_name  = dependency.s3.outputs.bucket_regional_domain_name
  acm_certificate_arn             = dependency.acm.outputs.certificate_arn
  domain_name                     = local.env_vars.locals.domain_name
  tags                            = local.env_vars.locals.tags
}
