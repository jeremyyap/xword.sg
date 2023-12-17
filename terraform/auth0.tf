provider "auth0" {}

resource "auth0_client" "xword_sg" {
  name                                = "xword.sg"
  app_type                            = "spa"
  custom_login_page_on                = true
  callbacks                           = ["http://localhost:5173", "https://www.xword.sg"]
  allowed_origins                     = ["http://localhost:5173", "https://www.xword.sg"]
  allowed_logout_urls                 = ["http://localhost:5173", "https://www.xword.sg"]
  web_origins                         = ["http://localhost:5173", "https://www.xword.sg"]
}

resource "auth0_resource_server" "api_xword_sg" {
  name        = "api.xword.sg"
  identifier  = "https://api.xword.sg"
}