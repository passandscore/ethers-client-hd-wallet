import Head from "next/head";
import Image from "next/image";
import { Modal, Button } from "react-bootstrap";
import styles from "../styles/CreateWallet.module.css";
import { useEffect, useState } from "react";
import { ethers } from "ethers";
import copy from "copy-to-clipboard";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.min.css";

export default function ShowMnemonic() {
  const [password, setPassword] = useState("");
  const [keystore, setKeystore] = useState(null);
  const [mnemonic, setMnemonic] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isGenerated, setIsGenerated] = useState(false);
  const [title, setTitle] = useState("Show Mnemonic Phrase");

  useEffect(() => {
    setKeystore(localStorage.getItem("keystore"));
  }, []);

  const showMnemonic = async () => {
    if (!password) {
      toast.error("Password Required", { theme: "colored" });
      return;
    }

    const providedPassword = password;

    let wallet;

    try {
      wallet = await ethers.Wallet.fromEncryptedJson(
        keystore,
        providedPassword,
        () => {
          setIsLoading(true);
          setTitle("Decrypting Wallet...");
        }
      );

      if (wallet) {
        setIsGenerated(true);
        setMnemonic(wallet.mnemonic.phrase);
        setTitle("Your mnemonic:");
      }
    } catch (err) {
      console.log(err.message);
      setErrorMsg(err.message);

      return;
    } finally {
      setIsLoading(false);
    }
  };

  const mnemonicCopiedHandler = () => {
    toast.success("Mnemonic Copied to Clipboard", { theme: "colored" });
    copy(mnemonic);
  };

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

  return (
    <>
      <Head>
        <title>Show Mnemonic</title>
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
            <div
              className=" pb-4 fs-3 text-center"
              style={{ color: "#F7CD53" }}
            >
              {mnemonic}
            </div>
            {mnemonic && (
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
              <>
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
                    onClick={showMnemonic}
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
          </main>
        </div>
      )}
    </>
  );
}
