data "aws_region" "current" {}

resource "aws_api_gateway_rest_api" "xword_saves_api" {
  name        = "xword_saves_api"
  description = "xword.sg Saves API"
}

resource "aws_api_gateway_resource" "saves" {
  rest_api_id = aws_api_gateway_rest_api.xword_saves_api.id
  parent_id   = aws_api_gateway_rest_api.xword_saves_api.root_resource_id
  path_part   = "saves"
}

resource "aws_api_gateway_resource" "save" {
  rest_api_id = aws_api_gateway_rest_api.xword_saves_api.id
  parent_id   = aws_api_gateway_resource.saves.id
  path_part   = "{date}"
}

# GET /saves/{date}
resource "aws_api_gateway_method" "get_save" {
  rest_api_id   = aws_api_gateway_rest_api.xword_saves_api.id
  resource_id   = aws_api_gateway_resource.save.id
  http_method   = "GET"
  authorization = "NONE"
}

resource "aws_api_gateway_integration" "get_save_integration" {
  rest_api_id             = aws_api_gateway_rest_api.xword_saves_api.id
  resource_id             = aws_api_gateway_resource.save.id
  http_method             = aws_api_gateway_method.get_save.http_method
  type                    = "AWS"
  integration_http_method = "POST"
  uri                     = "arn:aws:apigateway:${data.aws_region.current.name}:dynamodb:action/Query"
  credentials             = aws_iam_role.xword_sg_dynamodb.arn
  
  request_templates = {
    "application/json" = <<EOF
      {
        "TableName": "${aws_dynamodb_table.xword_sg_data.name}",
        "KeyConditionExpression": "userId = :userId AND #date = :date",
        "ExpressionAttributeNames": { "#date": "date" },
        "ExpressionAttributeValues": {
          ":date": {
              "S": "$input.params('date')"
          },
          ":userId": {
              "S": "test@example.com"
          }
        }
      }
    EOF
  }
}

resource "aws_api_gateway_method_response" "get_save_response_200" {
  rest_api_id = aws_api_gateway_rest_api.xword_saves_api.id
  resource_id = aws_api_gateway_resource.save.id
  http_method = aws_api_gateway_method.get_save.http_method
  status_code = "200"
  response_parameters = {
    "method.response.header.Access-Control-Allow-Origin" = true
  }
}

resource "aws_api_gateway_integration_response" "get_save_response" {
  depends_on = [aws_api_gateway_integration.get_save_integration]
  rest_api_id = aws_api_gateway_rest_api.xword_saves_api.id
  resource_id = aws_api_gateway_resource.save.id
  http_method = aws_api_gateway_method_response.get_save_response_200.http_method
  status_code = aws_api_gateway_method_response.get_save_response_200.status_code
  response_parameters = {
    "method.response.header.Access-Control-Allow-Origin" = "'*'"
  }

  response_templates = {
    "application/json" = <<EOF
      $input.json('$')
    EOF
  }
}

# POST/saves/{date}
resource "aws_api_gateway_method" "post_save" {
  rest_api_id   = aws_api_gateway_rest_api.xword_saves_api.id
  resource_id   = aws_api_gateway_resource.save.id
  http_method   = "POST"
  authorization = "NONE"
}

resource "aws_api_gateway_integration" "post_save_integration" {
  rest_api_id             = aws_api_gateway_rest_api.xword_saves_api.id
  resource_id             = aws_api_gateway_resource.save.id
  http_method             = aws_api_gateway_method.post_save.http_method
  type                    = "AWS"
  integration_http_method = "POST"
  uri                     = "arn:aws:apigateway:${data.aws_region.current.name}:dynamodb:action/PutItem"
  credentials             = aws_iam_role.xword_sg_dynamodb.arn
  
  request_templates = {
    "application/json" = <<EOF
      {
        "TableName": "${aws_dynamodb_table.xword_sg_data.name}",
        "Item": {
          "userId": {
            "S": "test@example.com"
          },
          "date": {
            "S": "$input.params('date')"
          },
          "state": {
            "S": "$input.path('$.state')"
          }
        }
      }
    EOF
  }
}

resource "aws_api_gateway_method_response" "post_save_response_200" {
  rest_api_id = aws_api_gateway_rest_api.xword_saves_api.id
  resource_id = aws_api_gateway_resource.save.id
  http_method = aws_api_gateway_method.post_save.http_method
  status_code = "200"
  response_parameters = {
    "method.response.header.Access-Control-Allow-Origin" = true
  }
}

resource "aws_api_gateway_integration_response" "post_save_response" {
  depends_on = [aws_api_gateway_integration.post_save_integration]
  rest_api_id = aws_api_gateway_rest_api.xword_saves_api.id
  resource_id = aws_api_gateway_resource.save.id
  http_method = aws_api_gateway_method_response.post_save_response_200.http_method
  status_code = aws_api_gateway_method_response.post_save_response_200.status_code
  response_parameters = {
    "method.response.header.Access-Control-Allow-Origin" = "'*'"
  }

  response_templates = {
    "application/json" = <<EOF
      $input.json('$')
    EOF
  }
}