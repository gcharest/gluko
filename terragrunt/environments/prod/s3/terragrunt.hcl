include {
  path = find_in_parent_folders("root.hcl")
}

locals {
  env_vars = read_terragrunt_config(find_in_parent_folders("region.hcl"))
}

inputs = {
  bucket_name = "${local.env_vars.locals.project_name}"
  domain_name = local.env_vars.locals.domain_name
  tags        = local.env_vars.locals.tags
}
