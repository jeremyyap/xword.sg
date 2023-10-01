export type CrosswordData = {
  dimensions: {
    width: number;
    height: number;
  };
  puzzle: Array<Array<CellData>>;
  solution: Array<Array<string>>;
  acrossClueNumbers: Array<Array<number | null>>;
  acrossClues: { [key: number]: string };
  downClueNumbers: Array<Array<number | null>>;
  downClues: { [key: number]: string };
};

export type CellData =
  | string
  | number
  | {
      cell: number;
      style: {
        shapebg: string;
      };
    };

export type CellSelection = {
  row: number;
  col: number;
  horizontal: boolean;
};
