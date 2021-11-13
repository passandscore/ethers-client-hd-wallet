import Head from "next/head";
import Image from "next/image";
import { useRouter } from "next/router";

import { Button } from "react-bootstrap";
import styles from "../styles/CreateWallet.module.css";
import { useEffect, useState } from "react";
import { ethers } from "ethers";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.min.css";
import { NETWORK, INFURA_PROJECT_ID } from "../config";
import { useRecoilValue } from "recoil";
import { storedWallet } from "../recoil/atoms";
export default function SendTransactions() {
  // const [password, setPassword] = useState("");
  const [keystore, setKeystore] = useState(null);
  const [errorMsg, setErrorMsg] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [title, setTitle] = useState("Send Transaction");
  const [addresses, setAddresses] = useState([]);
  const [sender, setSender] = useState("");
  const [recipient, setRecipient] = useState("");
  const [amount, setAmount] = useState("");
  const [wallets, setWallets] = useState({});
  const [hash, setHash] = useState("");
  const [etherscanURL, setEtherscanURL] = useState("");
  const primaryWallet = useRecoilValue(storedWallet);

  const provider = new ethers.providers.JsonRpcProvider(
    `https://${NETWORK}.infura.io/v3/${INFURA_PROJECT_ID}`
  );

  const router = useRouter();

  const derivationPath = "m/44'/60'/0'/0/";

  useEffect(() => {
    setKeystore(localStorage.getItem("keystore"));
    renderAddresses(primaryWallet);
  }, []);

  const renderAddresses = async (wallet) => {
    const derivedAddresses = [];

    let masterNode = ethers.utils.HDNode.fromMnemonic(wallet.mnemonic.phrase);

    for (let index = 0; index < 5; index++) {
      let wallet = new ethers.Wallet(
        masterNode.derivePath(derivationPath + index).privateKey,
        provider
      );
      derivedAddresses.push(wallet.address);
      wallets[wallet.address] = wallet;
    }
    console.log(wallets);
    setAddresses(derivedAddresses);
    setTitle("Send Transaction");
    console.log(derivedAddresses);
  };

  const sendTransaction = async () => {
    let wallet = wallets[sender];

    // Validations
    if (sender === "Choose an address") {
      setErrorMsg("Invalid sender address!");
      return;
    }

    if (!recipient) {
      setErrorMsg("Invalid recipient address!");
      return;
    }

    if (!amount || amount <= 0) {
      setErrorMsg("Invalid transfer value!");
      return;
    }

    setIsLoading(true);

    console.log(
      `Attempting to send ${amount} ETH transaction from ${sender} to ${recipient}`
    );

    // Create Tx Object
    const tx = {
      to: recipient,
      value: ethers.utils.parseEther(amount.toString()),
    };

    try {
      setTitle("Processing Transaction...");
      console.log(wallet);
      const createReceipt = await wallet.sendTransaction(tx);
      toast.success("Transaction successfully signed", {
        theme: "colored",
        position: toast.POSITION.BOTTOM_RIGHT,
      });

      setTimeout(() => {
        toast.info("Waiting for current block to be mined.", {
          theme: "colored",
          position: toast.POSITION.BOTTOM_RIGHT,
        });
      }, 3000);

      await createReceipt.wait();
      setTitle("Transaction Successful!");
      toast.success("Transaction successful", {
        theme: "colored",
        position: toast.POSITION.BOTTOM_RIGHT,
      });

      setIsLoading(false);
      const hash = createReceipt.hash;

      console.log(`Transaction successful with hash ${hash}`);
      setTitle("Transaction successful with hash");
      setHash(hash);
      setEtherscanURL(`https://ropsten.etherscan.io/tx/${hash}`);
    } catch (err) {
      console.log("error");
      console.log(err);
      err.message.includes("insufficient funds")
        ? setErrorMsg("Insufficient Funds")
        : setErrorMsg(err.message);
    }
  };

  return (
    <>
      <Head>
        <title>Send Transaction</title>
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
            <div className=" pb-4 fs-3" style={{ color: "#F7CD53" }}>
              {hash}
            </div>

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
            {/* {!unlockedWallet && !isLoading && (
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
                    onClick={unlockWalletAndDeriveAddresses}
                  >
                    Submit
                  </Button>
                </div>
              </>
            )} */}

            {!isLoading && !hash && (
              <>
                <div className="input-group my-2">
                  <label className="input-group-text" htmlFor="sender">
                    Sender
                  </label>
                  <select
                    className="form-select"
                    id="sender"
                    value={sender}
                    onChange={(e) => {
                      setSender(e.target.value);
                    }}
                  >
                    <option selected>Choose an address</option>
                    {addresses.length > 0 &&
                      addresses.map((address, index) => (
                        <option key={index} value={address}>
                          {address}
                        </option>
                      ))}
                  </select>
                </div>

                <div className="input-group my-2">
                  <span className="input-group-text">Recipient</span>
                  <input
                    type="text"
                    className="form-control"
                    value={recipient}
                    onChange={(e) => setRecipient(e.target.value)}
                  />
                </div>

                <div className="input-group my-2">
                  <span className="input-group-text">Amount</span>
                  <input
                    type="text"
                    className="form-control"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                  />
                </div>

                <div className="d-grid gap-2">
                  <Button
                    variant="primary"
                    className="mt-3"
                    size="lg"
                    onClick={sendTransaction}
                  >
                    Sign &amp; Send Transaction
                  </Button>
                </div>
              </>
            )}

            {hash && (
              <div className="d-grid gap-2">
                <a
                  className="btn btn-primary mt-3 fs-5 p-2"
                  size="lg"
                  href={etherscanURL}
                  role="button"
                  target="_blank"
                  rel="noreferrer"
                >
                  View On Etherscan
                </a>
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
            <Button
              variant="primary"
              className="mt-3"
              size="lg"
              onClick={() => {
                setTitle("Send Transaction");
                setErrorMsg(null);
                setIsLoading(false);
              }}
            >
              Try Agian
            </Button>
          </main>
        </div>
      )}
    </>
  );
}
