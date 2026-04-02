import React, { useState } from "react";
import { styles } from "../assets/dummyStyles.js";
import Navbar from "./Navbar";
import { Sidebar } from "lucide-react";

const Layout = ({ onLogout, user }) => {
  const [SidebarCollapsed, setSidebarCollapsed] = useState(false);
  return (
    <div className={styles.layout.root}>
      <Navbar user={user} onLogout={onLogout} />
      <Sidebar
        user={user}
        isCollapsed={setSidebarCollapsed}
        setSidebarCollapsed={setSidebarCollapsed}
      />
    </div>
  );
};

export default Layout;
