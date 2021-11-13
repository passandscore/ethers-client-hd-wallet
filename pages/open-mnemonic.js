import Head from "next/head";
import Image from "next/image";
import { useRouter } from "next/router";
import { Button } from "react-bootstrap";
import styles from "../styles/CreateWallet.module.css";
import { useState } from "react";
import { ethers } from "ethers";
import "react-toastify/dist/ReactToastify.min.css";
import { useRecoilState } from "recoil";
import {
  lockState,
  storedWallet,
  storedAccounts,
  allWallets,
} from "../recoil/atoms.js";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.min.css";
import updateAddressBalances from "../utils/updateAddressBalances";
import { NETWORK } from "../config";
import generateToken from "../utils/generateToken";

export default function OpenMnemonic() {
  const [password, setPassword] = useState("");
  const [keystore, setKeystore] = useState(null);
  const [mnemonic, setMnemonic] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isGenerated, setIsGenerated] = useState(false);
  const [title, setTitle] = useState("Open From Mnemonic");
  const [updateWalletLockState, setUpdateWalletLockState] =
    useRecoilState(lockState);
  const [updateStoredWallet, setUpdateStoredWallet] =
    useRecoilState(storedWallet);
  const [updateStoredAccounts, setUpdateStoredAccounts] =
    useRecoilState(storedAccounts);
  const [updateAllWallets, setUpdateAllWallets] = useRecoilState(allWallets);

  const provider = new ethers.providers.JsonRpcProvider(
    `https://${NETWORK}.infura.io/v3/${process.env.NEXT_PUBLIC_INFURA_PROJECT_ID}`
  );

  const router = useRouter();

  const openWalletFromMnemonic = async () => {
    if (!password) {
      toast.error("Password Required", {
        theme: "colored",
        position: toast.POSITION.BOTTOM_CENTER,
      });
      return;
    }
    const providedMnemonic = mnemonic;

    try {
      if (!ethers.utils.isValidMnemonic(mnemonic))
        throw new Error("Invalid Mnemonic");

      setTitle("Generating wallet...");
      setIsLoading(true);

      // Generate wallet from mnemonic
      const wallet = ethers.Wallet.fromMnemonic(providedMnemonic);
      setUpdateStoredWallet(wallet);

      // Encrypt wallet
      const providedPassword = password;
      const encryptedWallet = await wallet.encrypt(providedPassword, {}, () => {
        setTitle("Restoring wallet...");
      });

      if (!encryptedWallet) throw new Error("Invalid Password");

      // Encrypt the password
      const encryptedPassword = generateToken(password);
      localStorage.setItem("wallet-pw", encryptedPassword);

      setKeystore(encryptedWallet);
      localStorage.setItem("keystore", encryptedWallet);

      // update the wallet balance

      const user = await updateAddressBalances(provider, wallet, NETWORK);
      toast.success("5 Accounts Successfully Loaded", {
        theme: "colored",
        position: toast.POSITION.BOTTOM_CENTER,
      });
      setIsGenerated(true);
      setUpdateAllWallets(user);
      setUpdateStoredAccounts(user.addresses);
      setUpdateStoredWallet(wallet);
      setUpdateWalletLockState("unlocked");

      setTitle("Wallet successfully loaded!");
    } catch (err) {
      setErrorMsg(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Head>
        <title>Open Mnemonic</title>
      </Head>

      <ToastContainer position="top-center" pauseOnFocusLoss={false} />

      {!errorMsg ? (
        <div className={styles.container}>
          <main className={styles.main} style={{ marginTop: "50px" }}>
            {errorMsg && (
              <div>
                <p style={{ color: "#EC6956" }}>{errorMsg}</p>
              </div>
            )}

            <h1 className="title display-3 " style={{ color: "#72C1EA" }}>
              {title}
            </h1>

            {!isGenerated && !isLoading && (
              <div
                className=" pb-4 fs-3 text-center"
                style={{ color: "#F7CD53" }}
              >
                {mnemonic}
              </div>
            )}

            {isGenerated && (
              <div className="flex justify-center pt-4">
                <Image
                  src={"/wallet.png"}
                  alt="wallet"
                  width="300"
                  height="300"
                />
              </div>
            )}

            {isLoading && (
              <div className="flex justify-center mt-20">
                <Image
                  src={"/loading-spinner.gif"}
                  alt="Loader"
                  width="200"
                  height="200"
                />
              </div>
            )}
            {!isGenerated && !isLoading && (
              <>
                <div className="input-group my-4">
                  <span className="input-group-text">Mnemonic</span>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Provide your mnemonic phrase."
                    value={mnemonic}
                    onChange={(e) => setMnemonic(e.target.value)}
                  />
                </div>

                <div className="input-group my-4">
                  <span className="input-group-text">Password</span>
                  <input
                    type="password"
                    className="form-control"
                    placeholder="Provide a secure password for the keystore file."
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>

                <div className="d-grid gap-2">
                  <Button
                    variant="primary"
                    className="mt-3"
                    size="lg"
                    onClick={openWalletFromMnemonic}
                  >
                    Submit
                  </Button>
                </div>
              </>
            )}
          </main>
        </div>
      ) : (
        <div className={styles.container}>
          <main className={styles.main}>
            <h1 className="title display-3 mb-3" style={{ color: "#72C1EA" }}>
              Unexpected Error
            </h1>
            <p className="display-6" style={{ color: "#EC6956" }}>
              {errorMsg}
            </p>
            <Button
              variant="primary"
              className="mt-3"
              size="lg"
              onClick={() => router.reload(window.location.pathname)}
            >
              Try Agian
            </Button>
          </main>
        </div>
      )}
    </>
  );
}
