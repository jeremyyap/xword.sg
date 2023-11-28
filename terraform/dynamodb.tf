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