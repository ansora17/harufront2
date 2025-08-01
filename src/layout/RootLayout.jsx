import React from "react";
import { Outlet } from "react-router-dom";
import Menu from "./Menu";
import Header from "./Header";
import Footer from "./Footer";

function RootLayout() {
  return (
    <>
      <div className="min-h-screen">
        <Header />
        <Menu />
        <div className="">
          <Outlet />
        </div>
      </div>
      <Footer />
    </>
  );
}

export default RootLayout;
