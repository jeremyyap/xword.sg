import { Ipuz } from "./Ipuz";

type Props = {
    data: Ipuz;
}

export default function CrosswordGrid(props: Props) {
    return <div>{JSON.stringify(props)}</div>
}
