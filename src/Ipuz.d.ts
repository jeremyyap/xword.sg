export type Ipuz = {
  origin: string;
  version: string;
  kind: Array<string>;
  copyright: string;
  author: string;
  publisher: string;
  title: string;
  intro: string;
  difficulty: string;
  empty: string;
  dimensions: {
    width: number;
    height: number;
  };
  puzzle: Array<
    Array<
      | string
      | number
      | {
          cell: number;
          style: {
            shapebg: string;
          };
        }
    >
  >;
  clues: {
    Across: Array<Array<string | number>>;
    Down: Array<Array<string | number>>;
  };
  solution: Array<Array<string>>;
};
