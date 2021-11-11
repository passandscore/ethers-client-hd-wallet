import Head from "next/head";
import Image from "next/image";
import { ProgressBar, Button } from "react-bootstrap";
import styles from "../styles/CreateWallet.module.css";
import { useState } from "react";
import { ethers } from "ethers";
import copy from "copy-to-clipboard";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.min.css";
import { useRecoilState } from "recoil";
import { walletState } from "../recoil/atoms";

export default function CreateWallet() {
  const [password, setPassword] = useState("");
  const [keystore, setKeystore] = useState("");
  const [msg, setMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isGenerated, setIsGenerated] = useState(false);
  const [title, setTitle] = useState("Create a New Wallet");
  const [updateWalletState, setUpdateWalletState] = useRecoilState(walletState);

  const saveKeystore = () => {
    let textToSaveAsBlob = new Blob([keystore], { type: "text/plain" });
    let textToSaveAsURL = window.URL.createObjectURL(textToSaveAsBlob);
    let fileNameToSaveAs = "exportedJsonKeystore.json";

    let downloadLink = document.createElement("a");
    downloadLink.download = fileNameToSaveAs;
    downloadLink.innerHTML = "Download File";
    downloadLink.href = textToSaveAsURL;
    downloadLink.onclick = destroyClickedElement;
    downloadLink.style.display = "none";
    document.body.appendChild(downloadLink);

    downloadLink.click();
  };

  function destroyClickedElement(event) {
    document.body.removeChild(event.target);
  }

  const mnemonicCopiedHandler = () => {
    toast.success("Mnemonic Copied to Clipboard", { theme: "colored" });
    copy(msg);
  };

  const walletGenerationProcess = () => {
    setIsLoading(true);
    setTitle("Generating Wallet...");
  };

  const handleClick = async () => {
    if (isGenerated) {
      saveKeystore();
      return;
    }

    const randomNumber = Math.random();
    const wallet = ethers.Wallet.createRandom([password, randomNumber]);

    try {
      let encryptedWallet = await wallet.encrypt(
        password,
        {},
        walletGenerationProcess()
      );

      if (encryptedWallet) {
        setKeystore(encryptedWallet);
        setIsGenerated(true);
        setTitle("Wallet Successfully Created");
        setUpdateWalletState("Created");
        setMsg(wallet.mnemonic.phrase);
        localStorage.setItem("JSON", encryptedWallet);
      }
    } catch (err) {
      setErrorMsg(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Head>
        <title>Open Wallet</title>
      </Head>

      {!errorMsg ? (
        <div className={styles.container}>
          <ToastContainer position="top-center" pauseOnFocusLoss={false} />
          <main className={styles.main}>
            {errorMsg && (
              <div>
                <p style={{ color: "#EC6956" }}>{errorMsg}</p>
              </div>
            )}

            <h1 className="title display-3 pb-4" style={{ color: "#72C1EA" }}>
              {title}
            </h1>
            {msg && (
              <>
                <div className="d-flex justified-content-center">
                  <button
                    className=" btn btn-light btn-lg p-3 m-3"
                    style={{ width: "250px" }}
                    onClick={mnemonicCopiedHandler}
                  >
                    Copy Mnemonic
                  </button>
                  <button
                    className=" btn btn-light btn-lg p-3 m-3"
                    style={{ width: "250px" }}
                    onClick={saveKeystore}
                  >
                    Download Keystore
                  </button>
                </div>
                <ul>
                  <li className=" py-2" style={{ color: "#F7CD53" }}>
                    Save your mnemonic phrase and keystore in a safe place.
                  </li>

                  <li style={{ color: "#F7CD53" }}>
                    You will need these to restore your wallet.
                  </li>
                </ul>
              </>
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
              <div className="input-group my-4">
                <span className="input-group-text">Password</span>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Provide a secure password."
                />
              </div>
            )}

            {!isLoading && !isGenerated && (
              <div className="d-grid gap-2">
                <Button
                  variant="primary"
                  className="mt-3"
                  size="lg"
                  onClick={handleClick}
                  onChange={(e) => setPassword(e.target.value)}
                >
                  Generate Wallet
                </Button>
              </div>
            )}
          </main>
        </div>
      ) : (
        <div className={styles.container}>
          <main className={styles.main}>
            <h1 className="title display-3 mb-3" style={{ color: "#72C1EA" }}>
              Unexpected Error
            </h1>
            <p style={{ color: "#EC6956" }}>{errorMsg}</p>
          </main>
        </div>
      )}
    </>
  );
}
