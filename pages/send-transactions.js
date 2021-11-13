import Head from "next/head";
import Image from "next/image";
import { useRouter } from "next/router";

import { Modal, Button } from "react-bootstrap";
import styles from "../styles/CreateWallet.module.css";
import { useEffect, useState } from "react";
import { ethers } from "ethers";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.min.css";
import { NETWORK } from "../config";
import { useRecoilValue } from "recoil";
import { storedWallet } from "../recoil/atoms";
export default function SendTransactions() {
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
  const [show, setShow] = useState(false);
  const [signed, setSigned] = useState(null);

  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);

  const provider = new ethers.providers.JsonRpcProvider(
    `https://${NETWORK}.infura.io/v3/${process.env.NEXT_PUBLIC_INFURA_PROJECT_ID}`
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
    setAddresses(derivedAddresses);
    setTitle("Send Transaction");
  };

  const signTransaction = async () => {
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

    // Create Tx Object
    const tx = {
      to: recipient,
      value: ethers.utils.parseEther(amount.toString()),
    };

    try {
      // setTitle("Signing Transaction...");
      const createReceipt = await wallet.signTransaction(tx);

      if (createReceipt) {
        setSigned(createReceipt);
        toast.success("Transaction successfully signed", {
          theme: "colored",
          position: toast.POSITION.BOTTOM_CENTER,
        });

        setIsLoading(false);

        setTitle("");
      }
    } catch (err) {
      console.log(err);
      setErrorMsg(err.message);
    }
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
    setSigned(null);

    // Create Tx Object
    const tx = {
      to: recipient,
      value: ethers.utils.parseEther(amount.toString()),
    };

    try {
      setTitle("Processing Transaction...");
      const createReceipt = await wallet.sendTransaction(tx);

      setTimeout(() => {
        toast.info("Waiting for current block to be mined.", {
          theme: "colored",
          position: toast.POSITION.BOTTOM_CENTER,
        });
      }, 3000);

      await createReceipt.wait();
      setTitle("Transaction Successful!");
      toast.success("Transaction successful", {
        theme: "colored",
        position: toast.POSITION.BOTTOM_CENTER,
      });

      setIsLoading(false);
      const hash = createReceipt.hash;

      setTitle("Transaction successful");
      setHash(hash);
      setEtherscanURL(`https://ropsten.etherscan.io/tx/${hash}`);
    } catch (err) {
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
            {/* <div className=" pb-4 fs-3 text-break" style={{ color: "#F7CD53" }}>
              {hash}
            </div> */}

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

            {!isLoading && !signed && !hash && (
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
                    <option defaultValue>Choose an address</option>
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
                    onClick={signTransaction}
                  >
                    Sign Transaction
                  </Button>
                </div>
              </>
            )}

            {signed && (
              <>
                <div className="card p-2">
                  <div className="card-header fs-3">Transaction Preview</div>
                  <ul className="list-group list-group-flush">
                    <li className="list-group-item">
                      <span className="fw-bold">Sender:</span> {sender}
                    </li>
                    <li className="list-group-item">
                      <span className="fw-bold">Recipient:</span> {recipient}
                    </li>
                    <li className="list-group-item">
                      <span className="fw-bold">Amount:</span> {amount}
                    </li>
                  </ul>
                  <div className="d-flex">
                    <Button
                      variant="primary"
                      className="mt-3 mx-1"
                      size="lg"
                      onClick={handleShow}
                    >
                      Review Signature
                    </Button>
                    <Button
                      variant="primary"
                      className="mt-3 "
                      size="lg"
                      onClick={sendTransaction}
                    >
                      Send Transaction
                    </Button>
                    <Button
                      variant="danger"
                      className="mt-3 mx-1"
                      size="lg"
                      onClick={() => {
                        setSigned(null);
                        setTitle("Send Transaction");
                      }}
                    >
                      Decline
                    </Button>
                  </div>
                </div>

                <Modal show={show} onHide={handleClose}>
                  <Modal.Header closeButton>
                    <Modal.Title>Transaction Signature</Modal.Title>
                  </Modal.Header>
                  <Modal.Body className="text-break">{signed}</Modal.Body>
                  <Modal.Footer>
                    <Button variant="secondary" onClick={handleClose}>
                      Close
                    </Button>
                  </Modal.Footer>
                </Modal>
              </>
            )}

            {hash && (
              <>
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
