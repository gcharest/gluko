include {
  path = find_in_parent_folders()
}

dependency "cloudfront" {
  config_path = "../cloudfront"

  mock_outputs = {
    domain_name       = "d123abc.cloudfront.net"
    distribution_id   = "E123ABC"
  }

  mock_outputs_allowed_terraform_commands = ["plan", "validate", "init"]
}

locals {
  env_vars = read_terragrunt_config(find_in_parent_folders("region.hcl"))
}

inputs = {
  domain_name             = local.env_vars.locals.domain_name
  cloudfront_domain_name  = dependency.cloudfront.outputs.domain_name
  cloudfront_zone_id      = "Z2FDTNDATAQYW2"  # CloudFront zone ID for us-east-1
  create_www_subdomain    = true
  tags                    = local.env_vars.locals.tags
}
