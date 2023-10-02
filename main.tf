terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.19.0"
    }
  }

  required_version = ">= 0.14.9"
}

provider "aws" {
  region = "ap-southeast-1"
}

provider "aws" {
  alias = "us-east-1"
  region = "us-east-1"
}

locals {
  mime_types = {
    "html" = "text/html"
    "css" = "text/css"
    "js" = "text/javascript"
  }
}

resource "aws_route53_zone" "main" {
  name = "xword.sg"
}

resource "aws_acm_certificate" "cert" {
  domain_name       = "xword.sg"
  subject_alternative_names = ["*.xword.sg"]
  validation_method = "DNS"
  provider = aws.us-east-1

  lifecycle {
    create_before_destroy = true
  }
}

resource "aws_route53_record" "cert_dns" {
  allow_overwrite = true
  name =  tolist(aws_acm_certificate.cert.domain_validation_options)[0].resource_record_name
  records = [tolist(aws_acm_certificate.cert.domain_validation_options)[0].resource_record_value]
  type = tolist(aws_acm_certificate.cert.domain_validation_options)[0].resource_record_type
  zone_id = aws_route53_zone.main.zone_id
  ttl = 60
}

resource "aws_s3_bucket" "xword_sg" {
  bucket = "xword.sg"
}

resource "aws_s3_bucket" "queue_xword_sg" {
  bucket = "queue.xword.sg"
}

resource "aws_s3_bucket" "www_xword_sg" {
  bucket = "www.xword.sg"
}

resource "aws_s3_bucket_public_access_block" "www_xword_sg" {
  bucket = aws_s3_bucket.www_xword_sg.id
}

resource "aws_s3_bucket_website_configuration" "xword_sg" {
  bucket = aws_s3_bucket.xword_sg.id
  
  redirect_all_requests_to {
    host_name = "www.xword.sg"
  }
}

resource "aws_s3_bucket_website_configuration" "www_xword_sg" {
  bucket = aws_s3_bucket.www_xword_sg.id
  
  index_document {
    suffix = "index.html"
  }
}

resource "aws_s3_object" "dist" {
  for_each = toset([
    for file in fileset("dist/", "**") : file if !startswith(file, "crosswords")
  ])
  key    = each.value 
  bucket = aws_s3_bucket.www_xword_sg.id
  source = "dist/${each.value}"
  etag = filemd5("dist/${each.value}")
  content_type = lookup(local.mime_types, split(".", each.value)[1])
}

resource "aws_cloudfront_distribution" "www_xword_sg" {
  origin {
    domain_name = aws_s3_bucket.www_xword_sg.website_endpoint
    origin_id   = "www.xword.sg"

    custom_origin_config {
      http_port              = "80"
      https_port             = "443"
      origin_protocol_policy = "http-only"
      origin_ssl_protocols   = ["TLSv1", "TLSv1.1", "TLSv1.2"]
    }
  }

  enabled             = true
  is_ipv6_enabled     = true
  default_root_object = "index.html"

  aliases = ["www.xword.sg"]

  default_cache_behavior {
    cache_policy_id  = "658327ea-f89d-4fab-a63d-7e88639e58f6"
    cached_methods   = ["GET", "HEAD"]
    allowed_methods  = ["GET", "HEAD", "OPTIONS"]
    viewer_protocol_policy = "redirect-to-https"
    target_origin_id = "www.xword.sg"
  }

  viewer_certificate {
    acm_certificate_arn = aws_acm_certificate.cert.arn
    minimum_protocol_version = "TLSv1.2_2021"
    ssl_support_method = "sni-only"
  }

  restrictions {
    geo_restriction {
      locations = []
      restriction_type = "none"
    }
  }
}

resource "aws_cloudfront_distribution" "xword_sg" {
  origin {
    domain_name = aws_s3_bucket.xword_sg.website_endpoint
    origin_id   = "xword.sg"

    custom_origin_config {
      http_port              = "80"
      https_port             = "443"
      origin_protocol_policy = "http-only"
      origin_ssl_protocols   = ["TLSv1", "TLSv1.1", "TLSv1.2"]
    }
  }

  enabled             = true
  is_ipv6_enabled     = true
  default_root_object = "index.html"

  aliases = ["xword.sg"]

  default_cache_behavior {
    cache_policy_id  = "658327ea-f89d-4fab-a63d-7e88639e58f6"
    cached_methods   = ["GET", "HEAD"]
    allowed_methods  = ["GET", "HEAD", "OPTIONS"]
    viewer_protocol_policy = "redirect-to-https"
    target_origin_id = "xword.sg"
  }

  viewer_certificate {
    acm_certificate_arn = aws_acm_certificate.cert.arn
    minimum_protocol_version = "TLSv1.2_2021"
    ssl_support_method = "sni-only"
  }

  restrictions {
    geo_restriction {
      locations = []
      restriction_type = "none"
    }
  }
}

resource "aws_route53_record" "www_xword_sg" {
  alias {
    evaluate_target_health = false
    name                   = aws_cloudfront_distribution.www_xword_sg.domain_name
    zone_id                = aws_cloudfront_distribution.www_xword_sg.hosted_zone_id
  }

  name    = "www.xword.sg"
  type    = "A"
  zone_id = aws_route53_zone.main.id
}

resource "aws_route53_record" "xword_sg" {
  alias {
    evaluate_target_health = false
    name                   = aws_cloudfront_distribution.xword_sg.domain_name
    zone_id                = aws_cloudfront_distribution.xword_sg.hosted_zone_id
  }

  name    = "xword.sg"
  type    = "A"
  zone_id = aws_route53_zone.main.id
}

data "aws_iam_policy_document" "www_xword_sg" {
  statement {
    actions   = ["s3:GetObject"]
    resources = ["${aws_s3_bucket.www_xword_sg.arn}/*",]

    principals {
      type        = "AWS"
      identifiers = ["*"]
    }
  }
}

resource "aws_s3_bucket_policy" "www_xword_sg" {
  bucket = aws_s3_bucket.www_xword_sg.id
  policy = data.aws_iam_policy_document.www_xword_sg.json
}

# Lambda function to publish new crossword daily
data "archive_file" "lambda_zip" {
  type          = "zip" 
  source_dir    = "${path.module}/lambda"
  output_path   = "${path.module}/lambda_function.zip"
}

resource "aws_lambda_function" "publish_crossword" {
  filename      = data.archive_file.lambda_zip.output_path
  function_name = "publish_crossword"
  role          = aws_iam_role.publisher.arn
  handler       = "main.lambda_handler"
  timeout       = 10

  source_code_hash = data.archive_file.lambda_zip.output_base64sha256

  runtime = "python3.11"

  environment {
    variables = {
      CLOUDFRONT_DISTRIBUTION_ID = aws_cloudfront_distribution.www_xword_sg.id
    }
  }
}

resource "aws_iam_role" "publisher" {
  name = "crossword_publisher"
  assume_role_policy = <<EOF
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Action": "sts:AssumeRole",
      "Principal": {
        "Service": "lambda.amazonaws.com"
      },
      "Effect": "Allow",
      "Sid": ""
    }
  ]
}
EOF
}
resource "aws_iam_policy" "publisher_s3_bucket_access" {
  name="crossword-publisher-s3-bucket-access"
  policy = <<EOF
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "putObject",
      "Effect": "Allow",
      "Action": [
        "s3:PutObject"
      ],
      "Resource": [
        "arn:aws:s3:::www.xword.sg/*"
      ]
    },
    {
      "Sid": "getObject",
      "Effect": "Allow",
      "Action": [
        "s3:GetObject"
      ],
      "Resource": [
        "arn:aws:s3:::queue.xword.sg/*"
      ]
    },
    {
      "Sid": "createInvalidation",
      "Effect": "Allow",
      "Action": [
        "cloudfront:CreateInvalidation"
      ],
      "Resource": [
        "*"
      ]
    }
  ]
}
EOF
}

resource "aws_iam_role_policy_attachment" "publisher_s3_bucket_access" {
  role       = aws_iam_role.publisher.id
  policy_arn = aws_iam_policy.publisher_s3_bucket_access.arn
}

resource "aws_cloudwatch_event_rule" "every_10AM" {
  name = "every-10-am"
  description = "Fires every day at 10 AM"
  schedule_expression = "cron(0 2 * * ? *)"
}

resource "aws_cloudwatch_event_target" "every_10AM" {
  rule = "${aws_cloudwatch_event_rule.every_10AM.name}"
  arn = "${aws_lambda_function.publish_crossword.arn}"
}