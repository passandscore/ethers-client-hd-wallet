import Head from "next/head";
import Image from "next/image";
import { Button } from "react-bootstrap";
import styles from "../styles/CreateWallet.module.css";
import { useState } from "react";
import { ethers } from "ethers";
import copy from "copy-to-clipboard";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.min.css";
import { useRecoilState } from "recoil";
import {
  lockState,
  storedAccounts,
  storedWallet,
  allWallets,
} from "../recoil/atoms";
import { NETWORK } from "../config";
import updateAddressBalances from "../utils/updateAddressBalances";
import generateToken from "../utils/generateToken";

export default function CreateWallet() {
  const [password, setPassword] = useState("");
  const [keystore, setKeystore] = useState("");
  const [mnemonic, setMnemonic] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isGenerated, setIsGenerated] = useState(false);
  const [title, setTitle] = useState("Create a New Wallet");
  const [updateWalletLockState, setUpdateWalletLockState] =
    useRecoilState(lockState);
  const [updateStoredWallet, setUpdateStoredWallet] =
    useRecoilState(storedWallet);
  const [updateStoredAccounts, setUpdateStoredAccounts] =
    useRecoilState(storedAccounts);
  const [updateAllWallets, setUpdateAllWallets] = useRecoilState(allWallets);
  console.log(process.env.NEXT_PUBLIC_INFURA_PROJECT_ID);
  const provider = new ethers.providers.JsonRpcProvider(
    `https://${NETWORK}.infura.io/v3/${process.env.NEXT_PUBLIC_INFURA_PROJECT_ID}`
  );

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
    toast.success("Mnemonic Copied to Clipboard", {
      theme: "colored",
      position: toast.POSITION.BOTTOM_CENTER,
    });
    copy(mnemonic);
  };

  const walletGenerationProcess = () => {
    setIsLoading(true);
    setTitle("Generating Wallet...");
  };

  const handleClick = async () => {
    if (!password) {
      toast.error("Password Required", {
        theme: "colored",
        position: toast.POSITION.BOTTOM_CENTER,
      });
      return;
    }

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
        const user = await updateAddressBalances(provider, wallet, NETWORK);

        if (user.addresses.length > 0) {
          toast.success("5 Accounts Successfully Loaded", {
            theme: "colored",
            position: toast.POSITION.BOTTOM_CENTER,
          });

          setKeystore(encryptedWallet);
          setMnemonic(wallet.mnemonic.phrase);
          setIsGenerated(true);
          setUpdateAllWallets(user);
          setUpdateStoredAccounts(user.addresses);
          setUpdateStoredWallet(wallet);
          setUpdateWalletLockState("unlocked");

          setTitle("Wallet successfully loaded!");

          // Encrypt the password
          const encryptedPassword = generateToken(password);
          localStorage.setItem("wallet-pw", encryptedPassword);

          localStorage.setItem("keystore", encryptedWallet);
          console.log(allWallets);
        }
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
        <title>Create Wallet</title>
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
            {mnemonic && (
              <>
                <div>
                  <div className="d-flex justified-content-between">
                    <Button
                      variant="primary"
                      className="mt-3 mx-2"
                      size="lg"
                      onClick={mnemonicCopiedHandler}
                    >
                      Copy Mnemonic
                    </Button>
                    <Button
                      variant="primary"
                      className="mt-3 mx-3"
                      size="lg"
                      onClick={saveKeystore}
                    >
                      Download Keystore
                    </Button>
                  </div>
                  <ul>
                    <li className=" py-2" style={{ color: "#F7CD53" }}>
                      Save your mnemonic phrase and keystore in a safe place.
                    </li>

                    <li style={{ color: "#F7CD53" }}>
                      You will need these to restore your wallet.
                    </li>
                  </ul>
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
              <div className="input-group my-4">
                <span className="input-group-text">Password</span>
                <input
                  type="password"
                  className="form-control"
                  placeholder="Provide a secure password."
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            )}

            {!isLoading && !isGenerated && (
              <div className="d-grid gap-2">
                <Button
                  variant="primary"
                  className="mt-3"
                  size="lg"
                  value={password}
                  onClick={handleClick}
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
            <p className="display-6" style={{ color: "#EC6956" }}>
              {errorMsg}
            </p>
          </main>
        </div>
      )}
    </>
  );
}
