import React from "react";
import Header from "../Header/Header";
import Footer from "../Footer/Footer";
import Main from "../Main/Main";
import Sidebar from "../Sidebar/Sidebar";
import { useSidebarContext } from "../../contexts/SidebarContext";

function Layout() {
  const { isLargeOpen, isSmallOpen, close } = useSidebarContext();

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <div className="flex flex-1">
        <Sidebar
          className={`${isLargeOpen ? "lg:flex" : "lg:hidden"} ${
            isSmallOpen ? "flex" : "hidden"
          } z-50`}
        />
        {isSmallOpen && (
          <div
            onClick={close}
            className="lg:hidden fixed inset-0 bg-gray-900 opacity-50 z-40"
          />
        )}
        <Main />
      </div>
      <Footer />
    </div>
  );
}

export default Layout;

/*
<Main>
     <Outlet /> 
 </Main>
*/
