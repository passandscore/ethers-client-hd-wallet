import "bootstrap/dist/css/bootstrap.css";
import "bootstrap-icons/font/bootstrap-icons.json";
import Navbar from "./Navbar";
import Image from "next/image";

const Layout = ({ children }) => {
  return (
    <div className="main-container .bgImage">
      <Navbar />
      {children}
    </div>
  );
};

export default Layout;
