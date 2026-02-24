include {
  path = find_in_parent_folders("root.hcl")
}

dependency "route53_zone" {
  config_path = "../route53-zone"

  mock_outputs = {
    hosted_zone_id = "Z1234567890ABC"
  }

  mock_outputs_allowed_terraform_commands = ["plan", "validate", "init"]
}

locals {
  env_vars = read_terragrunt_config(find_in_parent_folders("region.hcl"))
}

inputs = {
  project_name             = local.env_vars.locals.project_name
  domain_name              = local.env_vars.locals.domain_name
  subject_alternative_names = [
    "www.${local.env_vars.locals.domain_name}",
  ]
  validation_method    = "DNS"
  route53_zone_id      = dependency.route53_zone.outputs.hosted_zone_id
  create_route53_records = true
  wait_for_validation  = true
  tags                 = local.env_vars.locals.tags
}
