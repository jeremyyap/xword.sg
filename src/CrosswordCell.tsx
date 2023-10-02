import { CellData } from "./CrosswordData";

type Props = {
  row: number;
  col: number;
  answer: string;
  input: string;
  cellInfo: CellData;
  isActiveCell: boolean;
  isActiveClue: boolean;
  onClick: (activeCell: { row: number; col: number }) => void;
};

export default function CrosswordCell({
  row,
  col,
  cellInfo,
  isActiveCell,
  isActiveClue,
  input,
  onClick,
}: Props) {
  const clueNumber = getClueNumber(cellInfo);
  const isWall = cellInfo === "#";
  let fill = "white";

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
