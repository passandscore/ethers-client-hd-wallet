import Head from "next/head";
import Image from "next/image";
import styles from "../styles/CreateWallet.module.css";
import { useEffect, useState } from "react";
import copy from "copy-to-clipboard";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.min.css";
import { useRecoilValue, useRecoilState } from "recoil";
import { allWallets, storedWallet, storedAccounts } from "../Recoil/atoms";
import { NETWORK } from "../config";
import updateAddressBalances from "../utils/updateAddressBalances";
import { ethers } from "ethers";
import jwt from "jsonwebtoken";

export default function ViewAddresses() {
  const [errorMsg, setErrorMsg] = useState("");
  const [walletIsLoaded, setWalletIsLoaded] = useState(false);
  const [title, setTitle] = useState("Updating Wallet Balances...");
  const { addresses } = useRecoilValue(allWallets);

  const provider = new ethers.providers.JsonRpcProvider(
    `https://${NETWORK}.infura.io/v3/${process.env.NEXT_PUBLIC_INFURA_PROJECT_ID}`
  );

  const [updateStoredAccounts, setUpdateStoredAccounts] =
    useRecoilState(storedAccounts);
  const [updateAllWallets, setUpdateAllWallets] = useRecoilState(allWallets);
  const [updateStoredWallet, setUpdateStoredWallet] =
    useRecoilState(storedWallet);

  useEffect(() => {
    jwt.verify(
      localStorage.getItem("wallet-pw"),
      "jwtSecret",
      function (err, decoded) {
        if (err) {
          setErrorMsg(err.message);
        } else {
          refreshAccounts(decoded.password);
        }
      }
    );
  }, []);

  const refreshAccounts = async (decodedPassword) => {
    try {
      let wallet;
      wallet = await ethers.Wallet.fromEncryptedJson(
        localStorage.getItem("keystore"),
        decodedPassword
      );

      if (wallet) {
        const user = await updateAddressBalances(provider, wallet, NETWORK);

        setUpdateStoredWallet(wallet);
        setWalletIsLoaded(true);
        setUpdateAllWallets(user);
        setUpdateStoredAccounts(user.addresses);
        setTitle(`Addresses / Balances`);
      }
    } catch (err) {
      setErrorMsg(err.message);
      console.log(err);
    }
  };

  const addressCopiedHandler = (e) => {
    toast.success("Address Copied to Clipboard", {
      theme: "colored",
      position: toast.POSITION.BOTTOM_CENTER,
    });
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
          <main className={styles.main} style={{ marginTop: "100px" }}>
            <h1
              className="title display-3 pb-4 text-center"
              style={{
                color: "#72C1EA",
                paddingLeft: "80px",
                paddingRight: "80px",
              }}
            >
              {title}
            </h1>

            {walletIsLoaded ? (
              <>
                <div
                  className=" pb-4 text-center display-5"
                  style={{ color: "#F7CD53" }}
                >
                  {addresses.total} ETH
                </div>

                {addresses.length != 0 &&
                  addresses.map(({ address, balance, link }, index) => (
                    <div className="w-75 h-100" key={index}>
                      <div className=" d-flex justify-content-between  bg-white rounded my-2 ">
                        <div className="card-body d-flex justify-content-between align-items-center">
                          <div>
                            <h5 className="card-title">{balance} ETH</h5>
                            <p className="card-text">{address}</p>
                          </div>
                          <div>
                            <div>
                              <a
                                href={link}
                                className="btn btn-primary btn-sm w-100"
                                target="_blank"
                                rel="noreferrer"
                              >
                                History
                              </a>
                              <div className="my-1"></div>
                              <a
                                className="btn btn-primary btn-sm w-100"
                                id={address}
                                onClick={(e) => {
                                  addressCopiedHandler(e);
                                }}
                              >
                                Copy
                              </a>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
              </>
            ) : (
              <div className="flex justify-center mt-20">
                <Image
                  src={"/loading-spinner.gif"}
                  alt="Loader"
                  width="200"
                  height="200"
                />
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
