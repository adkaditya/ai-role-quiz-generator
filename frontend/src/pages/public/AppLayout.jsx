import React from "react";
import MyNavbar from "../../components/shared/MyNavbar";
import Footer from "../../components/shared/Footer";
import { Outlet } from "react-router";
import { Toaster } from "react-hot-toast";

function AppLayout() {
  return (
    <div className="min-h-screen flex flex-col justify-between">
      <MyNavbar />
      <div className="flex-1">
        <Outlet />
      </div>
      <Footer />
      {/* <Toaster position="top-center" reverseOrder={false} /> */}
    </div>
  );
}

export default AppLayout;