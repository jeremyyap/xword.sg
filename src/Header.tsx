import {
  IconCalendarEvent,
  IconInfoSquare,
  IconMenu2,
  IconSquare,
  IconSquareCheckFilled,
} from "@tabler/icons-react";
import { useState } from "react";
import Sidebar from "./Sidebar";

type Props = {
  isAutoCheckEnabled: boolean;
  openDatepicker: () => void;
  openInfo: () => void;
  toggleAutoCheck: () => void;
};

export default function Header({
  isAutoCheckEnabled,
  openDatepicker,
  openInfo,
  toggleAutoCheck,
}: Props) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const toggleIsSidebarOpen = () =>
    setIsSidebarOpen((isSidebarOpen) => !isSidebarOpen);
  const CheckIcon = isAutoCheckEnabled ? IconSquareCheckFilled : IconSquare;

  return (
    <>
      <div className="header">
        <IconMenu2
          size={40}
          className="button"
          onClick={toggleIsSidebarOpen}
          visibility={isSidebarOpen ? "hidden" : "visible"}
        />
        <div className="button" onClick={toggleAutoCheck}>
          <CheckIcon size={32} />
          <span>Auto-check</span>
        </div>
        <IconCalendarEvent size={32} onClick={openDatepicker} />
        <IconInfoSquare size={32} onClick={openInfo} />
      </div>
      <Sidebar
        isSidebarOpen={isSidebarOpen}
        handleClose={toggleIsSidebarOpen}
      />
    </>
  );
}
