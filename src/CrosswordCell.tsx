import { useEffect, useState } from "react";
import { CellData } from "./CrosswordData";

type Props = {
  row: number;
  col: number;
  answer: string;
  input: string;
  cellInfo: CellData;
  isActiveCell: boolean;
  isActiveClue: boolean;
  isAutoCheckEnabled: boolean;
  onClick: (activeCell: { row: number; col: number }) => void;
};

export default function CrosswordCell({
  row,
  col,
  answer,
  cellInfo,
  isActiveCell,
  isActiveClue,
  input,
  isAutoCheckEnabled,
  onClick,
}: Props) {
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const clueNumber = getClueNumber(cellInfo);
  const isWall = cellInfo === "#";
  let fill = "white";

  useEffect(() => {
    if (isAutoCheckEnabled) {
      if (input === "") {
        setIsCorrect(null);
      } else {
        setIsCorrect(input === answer);
      }
    } else {
      setIsCorrect(null);
    }
  }, [input, answer, isAutoCheckEnabled]);

  const isDarkMode =
    window.matchMedia &&
    window.matchMedia("(prefers-color-scheme: dark)").matches;
  if (isDarkMode) {
    fill = "#555";

    if (isWall) {
      fill = "black";
    } else if (isActiveCell) {
      fill = "#6495ED";
    } else if (isActiveClue) {
      fill = "#0F52BA";
    }
  } else {
    if (isWall) {
      fill = "black";
    } else if (isActiveCell) {
      fill = "yellow";
    } else if (isActiveClue) {
      fill = "cyan";
    }
  }

  const handleClick = () => onClick({ row, col });

  const cross = (
    <g>
      <line
        x1={col}
        y1={row + 1}
        x2={col + 1}
        y2={row}
        vectorEffect="non-scaling-stroke"
        stroke="red"
        strokeWidth={2}
      />
    </g>
  );

  return (
    <g onClick={isWall ? undefined : handleClick}>
      <rect
        x={col}
        y={row}
        width={1}
        height={1}
        fill={fill}
        stroke="black"
        strokeWidth={0.01}
      />
      {clueNumber && (
        <text
          x={col + 0.05}
          y={row + 0.05}
          dominantBaseline="hanging"
          style={{ fontSize: ".25px", fill: isDarkMode ? "white" : "black" }}
        >
          {clueNumber}
        </text>
      )}
      <text
        x={col + 0.5}
        y={row + 0.55}
        textAnchor="middle"
        dominantBaseline="middle"
        style={{ fontSize: ".5px", fill: isDarkMode ? "white" : "black" }}
      >
        {input}
      </text>
      {isCorrect === false && cross}
      {getCellDecoration(cellInfo, row, col)}
    </g>
  );
}

function getClueNumber(cellInfo: CellData): number | null {
  if (cellInfo instanceof Object) {
    return cellInfo.cell === 0 ? null : cellInfo.cell;
  }

  if (typeof cellInfo === "string") {
    return null;
  }

  return cellInfo === 0 ? null : cellInfo;
}

function getCellDecoration(cellInfo: CellData, row: number, col: number): JSX.Element | null {
  if (cellInfo instanceof Object) {
    if (cellInfo.style.shapebg === 'circle') {
      return <circle cx={col + 0.5} cy={row + 0.5} r={0.5} fill="none" stroke="black" stroke-width={0.01} />
    }
  }
  return null;
}
