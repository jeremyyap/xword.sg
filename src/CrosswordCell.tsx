import { Ipuz } from "./Ipuz";

type Props = {
  row: number;
  col: number;
  answer: string;
  input: string;
  cellInfo: Ipuz['puzzle'][number][number];
  isActiveCell: boolean;
  isActiveClue: boolean;
  onClick: (activeCell: {row: number, col: number}) => void;
}

export default function CrosswordCell({row, col, cellInfo, isActiveCell, isActiveClue, onClick}: Props) {
  const clueNumber = getClueNumber(cellInfo);
  const isWall = cellInfo === '#';
  let fill = 'white';
  if (isWall) {
    fill = 'black';
  } else if (isActiveCell) {
    fill = 'yellow';
  } else if (isActiveClue) {
    fill = 'cyan';
  }
  
  const handleClick = () => onClick({row, col})

  return <g onClick={isWall ? undefined : handleClick}>
    <rect
      x={col}
      y={row}
      width={1}
      height={1}
      fill={fill}
      stroke="black"
      strokeWidth={.01}
    />
    {clueNumber && <text
      x={col + .05}
      y={row + .05}
      dominantBaseline="hanging"
      style={{ fontSize: '.3', fill: "black" }}
    >
      {clueNumber}
    </text>}
  </g>;
}

function getClueNumber(cellInfo: Ipuz['puzzle'][number][number]): number | null {
  if (cellInfo instanceof Object) {
    return cellInfo.cell === 0 ? null : cellInfo.cell;
  }

  if (typeof cellInfo === "string") {
    return null;
  }

  return cellInfo === 0 ? null : cellInfo;
}
