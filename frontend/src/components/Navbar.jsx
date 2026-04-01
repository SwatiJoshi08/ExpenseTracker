import React from "react";
import { navbarStyles } from "../assets/dummyStyles.js";
import img1 from "../assets/logo.png";
import { useNavigate } from "react-router-dom";
const Navbar = ({ user: propUser, onLogout }) => {
  const navigate = useNavigate();
  return (
    <header className={navbarStyles.header}>
      <div className={navbarStyles.container}>
        {/* logo */}
        <div
          onClick={() => navigate("/")} // navigate to "/" meaning home
          className={navbarStyles.logoContainer}
        >
          <div className={navbarStyles.logoImage}>
            <img src={img1} alt="logo" />
          </div>
          <span className={navbarStyles.logoText}>Expense Tracker</span>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
