import React from "react";
import ReactDOM from "react-dom/client";
import { Auth0Provider } from "@auth0/auth0-react";
import AppContainer from "./AppContainer";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <Auth0Provider
      domain="dev-wzadxrbi8nvn8iuk.us.auth0.com"
      clientId="Dk9lHROKspMALCwC2yQuXq6ghQLoJxyQ"
      authorizationParams={{
        audience: "https://api.xword.sg",
        redirect_uri: window.location.origin,
      }}
    >
      <AppContainer />
    </Auth0Provider>
  </React.StrictMode>,
);
