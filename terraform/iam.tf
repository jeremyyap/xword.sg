resource "aws_iam_role" "apigw" {
  name               = "xword_sg_dynamodb"
  assume_role_policy = <<-EOF
  {
    "Version": "2012-10-17",
    "Statement": [
      {
        "Action": "sts:AssumeRole",
        "Principal": {
          "Service":  "apigateway.amazonaws.com"
        },
        "Effect": "Allow",
        "Sid": "iamroletrustpolicy"
      }
    ]
  }
  EOF
}

resource "aws_iam_role_policy_attachment" "allow_apigw_to_cloudwatch" {
  role       = aws_iam_role.apigw.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AmazonAPIGatewayPushToCloudWatchLogs"
}