import CrosswordGrid from "./CrosswordGrid";
import { useState, useCallback, useEffect } from "react";
import { CellSelection } from "./CrosswordData";
import {
  getInitialActiveState,
  checkGrid,
  getNextCell,
  getPreviousCell,
} from "./gridUtils";
import useCrosswordData, { IpuzData } from "./useCrosswordData";
import useKeydownListener from "./useKeydownListener";
import Keyboard from "react-simple-keyboard";
import "react-simple-keyboard/build/css/index.css";
import useIsMobileBrowser from "./useIsMobileBrowser";
import Modal from "./Modal";
import Header from "./Header";
import DatePicker from "react-datepicker";

import "react-datepicker/dist/react-datepicker.css";
import { useAuth0 } from "@auth0/auth0-react";
import { useDebounce } from "./utils";

type Props = {
  ipuzData: IpuzData;
  puzzleDate: Date;
  setPuzzleDate: (date: Date) => void;
};

const MIN_DATE = new Date(2025, 6, 7);
const MAX_DATE = new Date();

export default function App({ ipuzData, puzzleDate, setPuzzleDate }: Props) {
  const crosswordData = useCrosswordData(ipuzData);
  const {
    title,
    dimensions: { height, width },
    puzzle: puzzleGrid,
    solution: solutionGrid,
  } = crosswordData;

  const getInitialState = (height: number, width: number) =>
    Array.from(
      {
        length: height,
      },
      () => new Array(width).fill(""),
    );

  const [inputGrid, setInputGrid] = useState(getInitialState(height, width));
  const [completed, setCompleted] = useState(false);
  const [selection, setSelection] = useState(getInitialActiveState(puzzleGrid));
  const [isCompleteModalOpen, setIsCompleteModalOpen] = useState(false);
  const [isAutoCheckEnabled, setIsAutoCheckEnabled] = useState(false);
  const [isDatepickerOpen, setIsDatepickerOpen] = useState(false);
  const [isInfoOpen, setIsInfoOpen] = useState(false);
  const [isSyncing, setIsSyncing] = useState(true);
  const [isDirty, setIsDirty] = useState(false);

  const { getAccessTokenSilently, isAuthenticated, isLoading } = useAuth0();

  useEffect(() => {
    if (isLoading) {
      return;
    }

    if (!isAuthenticated) {
      setIsSyncing(false);
      return;
    }

    getAccessTokenSilently()
      .then((accessToken) =>
        fetch(`https://api.xword.sg/saves/${title}`, {
          method: "GET",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
        }),
      )
      .then((response) => response.json())
      .then((response) => {
        const result = response.Items[0];
        if (result != null) {
          const state = JSON.parse(result.state.S);
          setInputGrid(state.inputGrid);
        }
        setIsSyncing(false);
      });
  }, [title, isAuthenticated, isLoading, getAccessTokenSilently]);

  const debouncedInputGrid = useDebounce(inputGrid, 2000);
  const debouncedIsDirty = useDebounce(isDirty, 2000);
  useEffect(() => {
    if (!debouncedIsDirty || !isAuthenticated) {
      return;
    }

    setIsSyncing(true);
    getAccessTokenSilently()
      .then((accessToken) =>
        fetch(`https://api.xword.sg/saves/${title}`, {
          method: "POST",
          body: JSON.stringify({
            state: JSON.stringify({ inputGrid: debouncedInputGrid }),
          }),
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
        }),
      )
      .then(() => {
        setIsSyncing(false);
        setIsDirty(false);
      });
  }, [
    title,
    isAuthenticated,
    debouncedIsDirty,
    debouncedInputGrid,
    getAccessTokenSilently,
  ]);

  const handleInput = useCallback(
    (input: string, cell: CellSelection) => {
      if (completed) {
        return;
      }

      setInputGrid((inputGrid) => {
        const { row, col } = cell;
        const newInputGrid = [...inputGrid];
        newInputGrid[row][col] = input;
        return newInputGrid;
      });
      setIsDirty(true);
    },
    [completed],
  );

  const handleKeyboardPress = useCallback(
    (button: string) => {
      if (button === "{bksp}") {
        setSelection((selection) => {
          const newSelection = getPreviousCell(puzzleGrid, selection);
          handleInput("", newSelection);
          return newSelection;
        });
      } else {
        handleInput(button, selection);
        setSelection((selection) => getNextCell(puzzleGrid, selection));
      }
    },
    [handleInput, selection, puzzleGrid],
  );

  useKeydownListener(handleInput, puzzleGrid, selection, setSelection);

  useEffect(() => {
    if (checkGrid(inputGrid, solutionGrid)) {
      if (!completed && isDirty) {
        setIsCompleteModalOpen(true);
      }
      setCompleted(true);
    }
  }, [completed, isDirty, inputGrid, solutionGrid]);

  const toggleAutoCheck = useCallback(
    () => setIsAutoCheckEnabled((enabled) => !enabled),
    [],
  );

  return (
    <>
      <Header
        isAutoCheckEnabled={isAutoCheckEnabled}
        openDatepicker={() => setIsDatepickerOpen(true)}
        openInfo={() => setIsInfoOpen(true)}
        toggleAutoCheck={toggleAutoCheck}
      />
      <CrosswordGrid
        data={crosswordData}
        inputGrid={inputGrid}
        selection={selection}
        setSelection={setSelection}
        isAutoCheckEnabled={isAutoCheckEnabled}
      />
      {isSyncing && "Syncing..."}
      {useIsMobileBrowser() && (
        <Keyboard
          layout={{
            default: [
              "Q W E R T Y U I O P",
              "A S D F G H J K L",
              "Z X C V B N M {bksp}",
            ],
          }}
          onKeyPress={handleKeyboardPress}
        />
      )}
      {isCompleteModalOpen && (
        <Modal
          content="Congratulations! A new puzzle will be published at 10AM every day (hopefully)"
          onHide={() => setIsCompleteModalOpen(false)}
        />
      )}
      {isDatepickerOpen && (
        <Modal
          content={
            <>
              <h3>Archives</h3>
              <DatePicker
                selected={puzzleDate}
                onChange={setPuzzleDate}
                inline
                minDate={MIN_DATE}
                maxDate={MAX_DATE}
              />
              <div onClick={() => setPuzzleDate(new Date())}>
                Back to latest
              </div>
            </>
          }
          onHide={() => setIsDatepickerOpen(false)}
        />
      )}
      {isInfoOpen && (
        <Modal
          content={
            <>
              <h3>{ipuzData.title}</h3>
              <p>By {ipuzData.author}</p>
            </>
          }
          onHide={() => setIsInfoOpen(false)}
        />
      )}
    </>
  );
}
