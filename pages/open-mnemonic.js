import Head from "next/head";
import Image from "next/image";
import { Button } from "react-bootstrap";
import styles from "../styles/CreateWallet.module.css";
import { useState } from "react";
import { ethers } from "ethers";
import "react-toastify/dist/ReactToastify.min.css";
import { useRecoilState } from "recoil";
import { walletState } from "../recoil/atoms";

export default function OpenMnemonic() {
  const [password, setPassword] = useState("");
  const [keystore, setKeystore] = useState(localStorage.getItem("keystore"));
  const [mnemonic, setMnemonic] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isGenerated, setIsGenerated] = useState(false);
  const [title, setTitle] = useState("Open From Mnemonic");
  const [updateWalletState, setUpdateWalletState] = useRecoilState(walletState);

  const openWalletFromMnemonic = async () => {
    const providedMnemonic = mnemonic;

    try {
      if (!ethers.utils.isValidMnemonic(mnemonic))
        throw new Error("Invalid Mnemonic");

      const wallet = ethers.Wallet.fromMnemonic(providedMnemonic);
      const providedPassword = password;
      const encryptedWallet = await wallet.encrypt(
        providedPassword,
        {},
        setIsLoading(true)
      );

      if (!encryptedWallet) throw new Error("Invalid Password");

      setKeystore(encryptedWallet);
      localStorage.setItem("keystore", encryptedWallet);
      setIsGenerated(true);
      setUpdateWalletState(true);

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

            {!isGenerated ? (
              <div className=" pb-4 fs-3" style={{ color: "#F7CD53" }}>
                {mnemonic}
              </div>
            ) : (
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
          </main>
        </div>
      )}
    </>
  );
}
