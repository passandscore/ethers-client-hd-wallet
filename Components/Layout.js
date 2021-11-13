import "bootstrap/dist/css/bootstrap.css";
import "bootstrap-icons/font/bootstrap-icons.json";
import Navbar from "./Navbar";
import LockWallet from "./LockWallet";
import { useRecoilValue } from "recoil";
import { lockState } from "../recoil/atoms.js";

const Layout = ({ children }) => {
  const currentWalletLockState = useRecoilValue(lockState);

  return (
    <>
      <Navbar />
      {currentWalletLockState == "unlocked" && <LockWallet />}
      <div className="d-flex justify-content-center">{children}</div>
    </>
  );
};

export default Layout;
