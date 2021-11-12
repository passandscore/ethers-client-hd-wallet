import Head from "next/head";
import Image from "next/image";
import { useRouter } from "next/router";

import { Button } from "react-bootstrap";
import styles from "../styles/CreateWallet.module.css";
import { useState } from "react";
import { ethers } from "ethers";
import "react-toastify/dist/ReactToastify.min.css";
import { useRecoilState } from "recoil";
import { lockState, storedAccounts, storedWallet } from "../recoil/atoms";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.min.css";
import { NETWORK, INFURA_PROJECT_ID } from "../config";
import updateAddressBalances from "../utils/updateAddressBalances";

export default function OpenKeystore() {
  const [password, setPassword] = useState("");
  const [keystore, setKeystore] = useState(null);
  const [errorMsg, setErrorMsg] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isGenerated, setIsGenerated] = useState(false);
  const [title, setTitle] = useState("Open From Keystore File");
  const [updateWalletLockState, setUpdateWalletLockState] =
    useRecoilState(lockState);
  const [updateStoredWallet, setUpdateStoredWallet] =
    useRecoilState(storedWallet);
  const [updateStoredAccounts, setUpdateStoredAccounts] =
    useRecoilState(storedAccounts);

  const provider = new ethers.providers.JsonRpcProvider(
    `https://${NETWORK}.infura.io/v3/${INFURA_PROJECT_ID}`
  );

  const router = useRouter();

  const handleOnChange = (e) => {
    setKeystore(e.target.files[0]);
  };

  const openWalletFromFile = async () => {
    if (!password) {
      toast.error("Password Required", { theme: "colored" });
      return;
    }

    if (!keystore) {
      setErrorMsg("Please select a keystore file");
      return;
    }

    let fileReader = new FileReader();

    fileReader.onload = async function () {
      let wallet;
      let json = fileReader.result;
      try {
        wallet = await ethers.Wallet.fromEncryptedJson(json, password, () => {
          setIsLoading(true);
          setTitle("Restoring Wallet...");
        });

        if (!wallet.mnemonic.phrase)
          throw Error("Invalid Password or Keystore File");

        const addresses = await updateAddressBalances(
          provider,
          wallet,
          NETWORK
        );

        toast.success("5 Accounts Successfully Loaded", { theme: "colored" });
        setIsGenerated(true);
        setUpdateStoredAccounts(addresses);
        setUpdateStoredWallet(wallet);
        setUpdateWalletLockState("unlocked");

        setTitle("Wallet successfully loaded!");

        localStorage.setItem("keystore", json);
      } catch (err) {
        setErrorMsg(err.message);
      } finally {
        setIsLoading(false);
      }
    };
    fileReader.readAsText(keystore);
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

            <h1 className="title display-3" style={{ color: "#72C1EA" }}>
              {title}
            </h1>

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
                  <input
                    className="form-control"
                    type="file"
                    id="formFile"
                    onChange={(e) => {
                      handleOnChange(e);
                    }}
                  />
                </div>

                <div className="input-group my-4">
                  <span className="input-group-text">Password</span>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Provide your wallet password."
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>

                <div className="d-grid gap-2">
                  <Button
                    variant="primary"
                    className="mt-3"
                    size="lg"
                    onClick={openWalletFromFile}
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
