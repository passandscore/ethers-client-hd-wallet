import "bootstrap/dist/css/bootstrap.css";
import "bootstrap-icons/font/bootstrap-icons.json";
import Navbar from "./Navbar";
import Image from "next/image";

const Layout = ({ children }) => {
  return (
    <>
      <Navbar />
      <div className="d-flex justify-content-center">{children}</div>
    </>
  );
};

export default Layout;
