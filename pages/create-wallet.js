import Head from "next/head";
import Image from "next/image";
import { ProgressBar, Button } from "react-bootstrap";
import styles from "../styles/OpenWallet.module.css";
import { useState } from "react";
import { ethers } from "ethers";
import copy from "copy-to-clipboard";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.min.css";

export default function CreateWallet() {
  const [password, setPassword] = useState("");
  const [keystore, setKeystore] = useState("");
  const [msg, setMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isGenerated, setIsGenerated] = useState(false);
  const [title, setTitle] = useState("Create a New Wallet");

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

            <h1 className="title display-3" style={{ color: "#72C1EA" }}>
              {title}
            </h1>
            {msg && (
              <div>
                <div className="input-group my-3" style={{ width: "725px" }}>
                  <span className="input-group-text">Mnemonic</span>
                  <input
                    type="text"
                    className="form-control"
                    aria-label="Amount (to the nearest dollar)"
                    value={msg}
                    disabled
                  />
                  <button
                    type="button"
                    className="btn btn-light"
                    data-toggle="tooltip"
                    data-placement="top"
                    title="Copy to clipboard"
                    onClick={mnemonicCopiedHandler}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="16"
                      height="16"
                      fill="currentColor"
                      className="bi bi-clipboard"
                      viewBox="0 0 16 16"
                    >
                      <path d="M4 1.5H3a2 2 0 0 0-2 2V14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V3.5a2 2 0 0 0-2-2h-1v1h1a1 1 0 0 1 1 1V14a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V3.5a1 1 0 0 1 1-1h1v-1z" />
                      <path d="M9.5 1a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5h-3a.5.5 0 0 1-.5-.5v-1a.5.5 0 0 1 .5-.5h3zm-3-1A1.5 1.5 0 0 0 5 1.5v1A1.5 1.5 0 0 0 6.5 4h3A1.5 1.5 0 0 0 11 2.5v-1A1.5 1.5 0 0 0 9.5 0h-3z" />
                    </svg>
                  </button>
                </div>
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
              <div className="input-group my-4">
                <span className="input-group-text">Password</span>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Provide a secure password."
                />
              </div>
            )}

            {isGenerated && (
              <div className="input-group">
                <span className="input-group-text">Keystore</span>
                <textarea
                  className="form-control"
                  aria-label="With textarea"
                  style={{ height: "300px", width: "600px" }}
                  defaultValue={keystore}
                  disabled
                ></textarea>
              </div>
            )}

            {!isLoading && (
              <div className="d-grid gap-2">
                <Button
                  variant="primary"
                  className="mt-3"
                  size="lg"
                  onClick={handleClick}
                  onChange={(e) => setPassword(e.target.value)}
                >
                  {!isGenerated ? "Generate Wallet" : "Save Keystore"}
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
