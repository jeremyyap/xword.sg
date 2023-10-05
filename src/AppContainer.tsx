import { useEffect, useState } from "react";
import { IpuzData } from "./useCrosswordData";
import App from "./App";
import { format } from "date-fns";

export default function AppContainer() {
  const [puzzleDate, setPuzzleDate] = useState<Date>(new Date());
  const [ipuzData, setIpuzData] = useState<IpuzData | null>(null);

  const today = new Date();
  console.log(puzzleDate);
  const puzzlePath =
    today.toDateString() === puzzleDate.toDateString()
      ? "/crosswords/latest.json"
      : `/crosswords/${format(puzzleDate, "yyyy-MM-dd")}.json`;

  useEffect(() => {
    fetch(puzzlePath, {
      method: "GET",
      mode: "no-cors",
    })
      .then((response) => response.json())
      .then((response) => setIpuzData(response));
  }, [puzzlePath]);

  if (ipuzData != null) {
    return (
      <App
        puzzleDate={puzzleDate}
        setPuzzleDate={setPuzzleDate}
        ipuzData={ipuzData}
      />
    );
  }
  return <div />;
}
