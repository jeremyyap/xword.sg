# Lambda function to publish new crossword daily
data "archive_file" "lambda_zip" {
  type        = "zip"
  source_dir  = "${path.module}/../lambda"
  output_path = "${path.module}/lambda_function.zip"
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
  name               = "crossword_publisher"
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
  name   = "crossword-publisher-s3-bucket-access"
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
  name                = "every-10-am"
  description         = "Fires every day at 10 AM"
  schedule_expression = "cron(0 2 * * ? *)"
}

resource "aws_cloudwatch_event_target" "every_10AM" {
  rule = aws_cloudwatch_event_rule.every_10AM.name
  arn  = aws_lambda_function.publish_crossword.arn
}

resource "aws_lambda_permission" "allow_cloudwatch_to_publish" {
  statement_id  = "AllowExecutionFromCloudWatch"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.publish_crossword.function_name
  principal     = "events.amazonaws.com"
  source_arn    = aws_cloudwatch_event_rule.every_10AM.arn
}
