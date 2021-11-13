import Head from "next/head";
import Image from "next/image";
import { Button } from "react-bootstrap";
import styles from "../styles/CreateWallet.module.css";
import { useEffect, useState } from "react";
import { ethers } from "ethers";
import copy from "copy-to-clipboard";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.min.css";
import jwt from "jsonwebtoken";

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
    setPassword(localStorage.getItem("wallet-pw"));

    jwt.verify(
      localStorage.getItem("wallet-pw"),
      "jwtSecret",
      function (err, decoded) {
        if (err) {
          setErrorMsg(err.message);
        } else {
          setPassword(decoded.password);
        }
      }
    );
  }, []);

  const showMnemonic = async () => {
    let wallet;

    try {
      wallet = await ethers.Wallet.fromEncryptedJson(keystore, password, () => {
        setIsLoading(true);
        setTitle("Decrypting Wallet...");
      });

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
    toast.success("Mnemonic Copied to Clipboard", {
      theme: "colored",
      position: toast.POSITION.BOTTOM_CENTER,
    });
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
              <Button
                variant="primary"
                className="mt-3"
                size="lg"
                onClick={mnemonicCopiedHandler}
              >
                Copy Mnemonic
              </Button>
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
                <div className="d-grid gap-2">
                  <Button
                    variant="primary"
                    className="mt-3"
                    size="lg"
                    onClick={showMnemonic}
                  >
                    Reveal Menemonic
                  </Button>
                  <ul>
                    <li className=" pt-2" style={{ color: "#F7CD53" }}>
                      Save your mnemonic phrase in a safe place.
                    </li>
                    <li className=" py-2" style={{ color: "#F7CD53" }}>
                      Never share your mnemonic phrase with anyone.
                    </li>

                    <li style={{ color: "#F7CD53" }}>
                      Required to restore your wallet.
                    </li>
                  </ul>
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
