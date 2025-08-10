import { useCallback, useEffect, useMemo, useState } from "react";
import { IpuzData } from "./useCrosswordData";
import App from "./App";
import { format } from "date-fns";

export default function AppContainer() {
  const urlParams = new URLSearchParams(window.location.search);
  const titleParam = urlParams.get('t') ?? 'latest';

  const [ipuzData, setIpuzData] = useState<IpuzData | null>(null);
  const [puzzleTitle, setPuzzleTitle] = useState<string>(titleParam);

  const puzzleDate = useMemo(() => {
    const date = new Date(titleParam);
    return isNaN(date.getTime()) ? new Date() : date; 
  }, [titleParam]);

  const setPuzzleDate = useCallback((newDate: Date) => {
    const dateString = format(newDate, "yyyy-MM-dd");
    setPuzzleTitle(dateString);

    const newUrl = new URL(window.location.href)
    newUrl.searchParams.set('t', dateString);
    window.history.replaceState({}, '', newUrl);
  }, []);

  useEffect(() => {
    fetch(`/crosswords/${puzzleTitle}.json`, {
      method: "GET",
      mode: "no-cors",
    })
      .then((response) => response.json())
      .then((response) => setIpuzData(response))
      .catch(() => setPuzzleTitle('latest'));
  }, [puzzleTitle]);

  if (ipuzData != null) {
    return (
      <App
        key={ipuzData.title}
        puzzleDate={puzzleDate}
        setPuzzleDate={setPuzzleDate}
        ipuzData={ipuzData}
      />
    );
  }
  return <div />;
}
