resource "aws_dynamodb_table" "xword_sg_data" {
  name           = "xword_sg_data"
  billing_mode   = "PROVISIONED"
  read_capacity  = "1"
  write_capacity = "1"
  hash_key       = "userId"
  range_key      = "date"

  attribute {
    name = "userId"
    type = "S"
  }

  attribute {
    name = "date"
    type = "S"
  }
}

data "aws_iam_policy_document" "xword_sg_dynamodb" {
  depends_on = [aws_dynamodb_table.xword_sg_data]
  statement {
    sid = "dynamodbtablepolicy"

    actions = [
      "dynamodb:Query",
      "dynamodb:PutItem"
    ]

    resources = [
      aws_dynamodb_table.xword_sg_data.arn,
    ]
  }
}

resource "aws_iam_role_policy" "xword_sg_dynamodb" {
  name = "xword_sg_dynamodb"
  role = aws_iam_role.apigw.id
  policy = data.aws_iam_policy_document.xword_sg_dynamodb.json
}