import {
  IconX,
  IconBrandGit,
  IconMail,
  IconLogin,
  IconLogout,
} from "@tabler/icons-react";
import { useAuth0 } from "@auth0/auth0-react";
import classnames from "classnames";

type Props = {
  isSidebarOpen: boolean;
  handleClose: () => void;
};

export default function Sidebar({ isSidebarOpen, handleClose }: Props) {
  const { user, isAuthenticated, isLoading, loginWithRedirect, logout } =
    useAuth0();

  return (
    <div className={classnames({ sidebar: true, open: isSidebarOpen })}>
      <IconX
        size={40}
        className="button"
        onClick={handleClose}
        style={{ position: "absolute", top: 8, right: 8 }}
      />
      <h2>xword.sg (Beta)</h2>
      {!isLoading && isAuthenticated && user != null && (
        <div className="sidebar-profile">
          <img src={user.picture} alt={user.name} width={48} height={48} />
          <h3>Logged in as {user.name}</h3>
        </div>
      )}
      {!isAuthenticated && !isLoading && (
        <div className="sidebar-item" onClick={() => loginWithRedirect()}>
          <IconLogin size={32} />
          Login
        </div>
      )}
      {isAuthenticated && !isLoading && (
        <div
          className="sidebar-item"
          onClick={() =>
            logout({ logoutParams: { returnTo: window.location.origin } })
          }
        >
          <IconLogout size={32} />
          Logout
        </div>
      )}
      <a href="https://www.github.com/jeremyyap/xword.sg">
        <div className="sidebar-item">
          <IconBrandGit size={32} />
          Source code
        </div>
      </a>
      <a href="mailto:jeremy.yapjl@gmail.com">
        <div className="sidebar-item">
          <IconMail size={32} />
          Contact
        </div>
      </a>
    </div>
  );
}
