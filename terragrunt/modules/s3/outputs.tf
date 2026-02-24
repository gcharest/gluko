output "bucket_id" {
  description = "S3 bucket ID"
  value       = aws_s3_bucket.website.id
}

output "bucket_name" {
  description = "The name of the bucket"
  value       = aws_s3_bucket.website.bucket
}

output "bucket_arn" {
  description = "S3 bucket ARN"
  value       = aws_s3_bucket.website.arn
}

output "bucket_regional_domain_name" {
  description = "S3 bucket regional domain name"
  value       = aws_s3_bucket.website.bucket_regional_domain_name
}

output "bucket_region" {
  description = "S3 bucket region"
  value       = aws_s3_bucket.website.region
}
