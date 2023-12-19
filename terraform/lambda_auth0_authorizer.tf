# Lambda function to authorize with auth0
data "archive_file" "lambda_auth0_authorizer" {
  type        = "zip"
  source_dir  = "${path.module}/../lambda_auth0_authorizer"
  output_path = "${path.module}/lambda_auth0_authorizer.zip"
}

resource "aws_lambda_function" "auth0_authorizer" {
  filename      = data.archive_file.lambda_auth0_authorizer.output_path
  function_name = "auth0_authorizer"
  role          = aws_iam_role.auth0_authorizer.arn
  handler       = "index.handler"
  timeout       = 10

  source_code_hash = data.archive_file.lambda_auth0_authorizer.output_base64sha256

  runtime = "nodejs16.x"

  environment {
    variables = {
      AUDIENCE = auth0_resource_server.api_xword_sg.identifier
      AWS_RESOURCE_ARN = "${aws_api_gateway_rest_api.xword_saves_api.execution_arn}/*/*/*"
      JWKS_URI = "https://dev-wzadxrbi8nvn8iuk.us.auth0.com/.well-known/jwks.json"
      TOKEN_ISSUER = "https://dev-wzadxrbi8nvn8iuk.us.auth0.com/"
    }
  }
}

resource "aws_iam_role" "auth0_authorizer" {
  name               = "auth0_authorizer"
  assume_role_policy = <<-EOF
  {
    "Version": "2012-10-17",
    "Statement": [
      {
        "Action": "sts:AssumeRole",
        "Principal": {
          "Service": "lambda.amazonaws.com"
        },
        "Effect": "Allow",
        "Sid": "iamroletrustpolicy"
      }
    ]
  }
  EOF
}

resource "aws_api_gateway_authorizer" "auth0_authorizer" {
  name                   = "auth0_authorizer"
  rest_api_id            = aws_api_gateway_rest_api.xword_saves_api.id
  authorizer_uri         = aws_lambda_function.auth0_authorizer.invoke_arn
  identity_validation_expression = "^Bearer [-0-9a-zA-z.]*$"
}

resource "aws_lambda_permission" "allow_apigateway_to_invoke" {
  statement_id  = "AllowExecutionFromApigateway"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.auth0_authorizer.function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${aws_api_gateway_rest_api.xword_saves_api.execution_arn}/authorizers/${aws_api_gateway_authorizer.auth0_authorizer.id}"
}