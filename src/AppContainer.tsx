import { useEffect, useState } from "react";
import { IpuzData } from "./useCrosswordData";
import App from "./App";

export default function AppContainer() {
  const [ipuzData, setIpuzData] = useState<IpuzData | null>(null);
  useEffect(() => {
    fetch("/crosswords/latest.json", {
      method: "GET",
      mode: "no-cors",
    })
      .then((response) => response.json())
      .then((response) => setIpuzData(response));
  });

  if (ipuzData != null) {
    return <App ipuzData={ipuzData} />;
  }
  return <div />;
}
