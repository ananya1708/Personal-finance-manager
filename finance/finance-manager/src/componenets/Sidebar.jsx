import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { 
  Home, Receipt, Wallet, Settings, LogOut, Menu
} from "lucide-react"; 
import "../styles/Sidebar.css"; 

const Sidebar = () => {
  const [isOpen, setIsOpen] = useState(true);
  const location = useLocation();

  return (
    <div className={`sidebar ${isOpen ? "open" : "collapsed"}`}>
      <div className="toggle-btn" onClick={() => setIsOpen(!isOpen)}>
        <Menu className="icon menu-icon" />
      </div>
      <ul className="menu-list">
        <li className={location.pathname === "/dashboard" ? "active" : ""}>
          <Link to="/dashboard">
            <Home className="icon" /> <span className="text">{isOpen && "Dashboard"}</span>
          </Link>
        </li>
        <li className={location.pathname === "/transactions" ? "active" : ""}>
          <Link to="/transactions">
            <Receipt className="icon" /> <span className="text">{isOpen && "Transactions"}</span>
          </Link>
        </li>
        <li className={location.pathname === "/budget" ? "active" : ""}>
          <Link to="/budget">
            <Wallet className="icon" /> <span className="text">{isOpen && "Budgets"}</span>
          </Link>
        </li>
        <li className={location.pathname === "/settings" ? "active" : ""}>
          <Link to="/settings">
            <Settings className="icon" /> <span className="text">{isOpen && "Settings"}</span>
          </Link>
        </li>
        <li className="logout">
          <Link to="/logout">
            <LogOut className="icon" /> <span className="text">{isOpen && "Logout"}</span>
          </Link>
        </li>
      </ul>
    </div>
  );
};

export default Sidebar;
