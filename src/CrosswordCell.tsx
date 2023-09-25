import { Ipuz } from "./Ipuz";

type Props = {
  row: number;
  col: number;
  answer: string;
  input: string;
  cellInfo: Ipuz['puzzle'][number][number]
}

export default function CrosswordCell({row, col, cellInfo}: Props) {
  const fill = cellInfo === '#' ? 'black' : 'white';

  return <g>
    <rect
      x={row}
      y={col}
      width={1}
      height={1}
      fill={fill}
      stroke="black"
      strokeWidth={.01}
    />
  </g>;
}
