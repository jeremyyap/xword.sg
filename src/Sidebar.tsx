import { IconX, IconBrandGit } from "@tabler/icons-react";
import classnames from "classnames";

type Props = {
  isSidebarOpen: boolean;
  handleClose: () => void;
};

export default function Sidebar({ isSidebarOpen, handleClose }: Props) {
  return (
    <div className={classnames({ sidebar: true, open: isSidebarOpen })}>
      <IconX
        size={40}
        className="button"
        onClick={handleClose}
        style={{ position: "absolute", top: 8, right: 8 }}
      />
      <h2>xword.sg</h2>
      <a href="https://www.github.com/jeremyyap/xword.sg">
        <div className="sidebar-item">
          <IconBrandGit size={32} />
          Source code
        </div>
      </a>
    </div>
  );
}
