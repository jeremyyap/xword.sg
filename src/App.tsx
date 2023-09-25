import "./App.css";
import ipuzData from "./sample";
import CrosswordGrid from "./CrosswordGrid";

export default function App() {
  return <CrosswordGrid data={ipuzData} />;
}
