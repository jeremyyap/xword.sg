export type CrosswordData = {
  title: string;
  dimensions: {
    width: number;
    height: number;
  };
  puzzle: Array<Array<CellData>>;
  solution: Array<Array<string>>;
  acrossClueNumbers: Array<number>;
  acrossClues: { [key: number]: string };
  downClueNumbers: Array<number>;
  downClues: { [key: number]: string };
  mappedAcrossClues: Array<Array<number | null>>;
  mappedDownClues: Array<Array<number | null>>;
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
