import { Settings, X } from "lucide-react";
import "./index.scss";

const Header: React.FC = () => {
  return (
    <header className="header">
      <span className="settings-btn">
        <Settings size={25} strokeWidth={1.5} />
      </span>
      <span className="close-btn">
        <X size={25} strokeWidth={1.5} />
      </span>
    </header>
  );
}

export default Header;