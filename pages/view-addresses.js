import Head from "next/head";
import Image from "next/image";
import { Modal, Button } from "react-bootstrap";
import styles from "../styles/CreateWallet.module.css";
import { useEffect, useState } from "react";
import { ethers } from "ethers";
import copy from "copy-to-clipboard";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.min.css";
import { INFURA_PROJECT_ID } from "../config";

export default function ViewAddresses() {
  const [password, setPassword] = useState("");
  const [keystore, setKeystore] = useState(localStorage.getItem("keystore"));
  const [mnemonic, setMnemonic] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isGenerated, setIsGenerated] = useState(false);
  const [title, setTitle] = useState("Show Addresses and Balances");
  const [addresses, setAddresses] = useState(null);
  const network = "ropsten";

  const provider = new ethers.providers.JsonRpcProvider(
    `https://${network}.infura.io/v3/${INFURA_PROJECT_ID}`
  );

  const derivationPath = "m/44'/60'/0'/0/";

  const showAddressesAndBalances = async () => {
    let providedPassword = password;

    let wallet;
    try {
      wallet = await ethers.Wallet.fromEncryptedJson(
        keystore,
        providedPassword,
        setIsLoading(true)
      );

      if (wallet) {
        // generate the addresses
        let walletAddresses = await renderAddressAndBalances(wallet);
        if (walletAddresses) {
          setAddresses(walletAddresses);
          console.log(walletAddresses);
        } else {
          throw Error("No addresses found");
        }
        setIsGenerated(true);
      } else {
        throw Error("Wallet not found");
      }
    } catch (err) {
      setErrorMsg(err.message);

      return;
    } finally {
      setIsLoading(false);
    }
  };

  const renderAddressAndBalances = async (wallet) => {
    let addresses = [];
    // Create a HDNode
    const masterNode = ethers.utils.HDNode.fromMnemonic(wallet.mnemonic.phrase);

    const balancePromises = [];

    for (let index = 0; index < 5; index++) {
      // Derive from node and build a new wallet from the new private key
      const derivedPrivateKey = masterNode.derivePath(
        derivationPath + index
      ).privateKey;

      // Call the balances from each of the newly created wallets
      let wallet = new ethers.Wallet(derivedPrivateKey, provider);
      const promise = wallet.getBalance();
      balancePromises.push(promise);
    }

    let balances;

    try {
      balances = await Promise.all(balancePromises);
    } catch (err) {
      setErrorMsg(err.message);
      return;
    }

    let totalBalance = 0;
    for (let index = 0; index < 5; index++) {
      const derivedPrivateKey = masterNode.derivePath(
        derivationPath + index
      ).privateKey;
      let wallet = new ethers.Wallet(derivedPrivateKey, provider);

      //update the total balance
      totalBalance += Number(ethers.utils.formatEther(balances[index]));

      addresses.push({
        address: wallet.address,
        balance: ethers.utils.formatEther(balances[index]),
        link: `https://${network}.etherscan.io/address/${wallet.address}`,
      });
    }

    addresses.total = totalBalance;
    return addresses;
  };

  const addressCopiedHandler = (e) => {
    console.log(e);
    toast.success("Address Copied to Clipboard", { theme: "colored" });
    copy(e.target.id);
  };

  return (
    <>
      <Head>
        <title>Show Addresses</title>
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

            <h1
              className="title display-3 pb-4 text-center"
              style={{ color: "#72C1EA" }}
            >
              {title}
            </h1>

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
            {!isGenerated && !isLoading ? (
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
                    onClick={showAddressesAndBalances}
                  >
                    Submit
                  </Button>
                </div>
              </>
            ) : (
              isGenerated && (
                <>
                  <table
                    className="table table-hover table-warning "
                    style={{ borderRadius: "6px", overflow: "hidden" }}
                  >
                    <thead>
                      <tr>
                        <th scope="col">#</th>
                        <th scope="col">Address</th>
                        <th scope="col">Balance</th>
                        <th scope="col"></th>
                      </tr>
                    </thead>
                    <tbody>
                      {addresses &&
                        addresses.map(({ address, balance, link }, index) => (
                          <>
                            <tr className="table-light">
                              <th scope="row">{index + 1}</th>
                              <td>
                                <a href={link} target="_blank" rel="noreferrer">
                                  {address}
                                </a>
                              </td>
                              <td>{balance}</td>
                              <td>
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  width="16"
                                  height="16"
                                  fill="currentColor"
                                  className="bi bi-clipboard"
                                  viewBox="0 0 16 16"
                                  cursor="pointer"
                                  id={address}
                                  onClick={(e) => {
                                    addressCopiedHandler(e);
                                  }}
                                >
                                  <path d="M4 1.5H3a2 2 0 0 0-2 2V14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V3.5a2 2 0 0 0-2-2h-1v1h1a1 1 0 0 1 1 1V14a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V3.5a1 1 0 0 1 1-1h1v-1z" />
                                  <path d="M9.5 1a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5h-3a.5.5 0 0 1-.5-.5v-1a.5.5 0 0 1 .5-.5h3zm-3-1A1.5 1.5 0 0 0 5 1.5v1A1.5 1.5 0 0 0 6.5 4h3A1.5 1.5 0 0 0 11 2.5v-1A1.5 1.5 0 0 0 9.5 0h-3z" />
                                </svg>
                              </td>
                            </tr>
                          </>
                        ))}
                    </tbody>
                  </table>
                  <p className="display-4" style={{ color: "#F7CD53" }}>
                    {addresses.total} ETH
                  </p>
                </>
              )
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
