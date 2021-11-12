import Head from "next/head";
import styles from "../styles/CreateWallet.module.css";
import { useEffect, useState } from "react";
import copy from "copy-to-clipboard";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.min.css";
import { useRecoilValue } from "recoil";
import { allWallets, storedAccounts } from "../Recoil/atoms";

export default function ViewAddresses() {
  const [errorMsg, setErrorMsg] = useState("");
  const [keystore, setKeystore] = useState(null);
  const { addresses } = useRecoilValue(allWallets);
  const [allAddresses, setAllAddresses] = useState([]);

  useEffect(() => {
    setKeystore(localStorage.getItem("keystore"));
    // setAllAddresses(Object.entries(addresses));
    console.log(addresses);
  }, []);

  const addressCopiedHandler = (e) => {
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
          <main className={styles.main} style={{ marginTop: "100px" }}>
            {errorMsg && (
              <div>
                <p style={{ color: "#EC6956" }}>{errorMsg}</p>
              </div>
            )}

            <h1
              className="title display-3 pb-4 text-center"
              style={{
                color: "#72C1EA",
                paddingLeft: "80px",
                paddingRight: "80px",
              }}
            >
              Addresses &amp; Balances
            </h1>

            <div
              className=" pb-4 text-center display-5"
              style={{ color: "#F7CD53" }}
            >
              {addresses.total} ETH
            </div>

            {addresses.length != 0 &&
              addresses.map(({ address, balance, link }, index) => (
                <div className="w-75 h-100" key={index}>
                  <div className=" d-flex justify-content-between  bg-white rounded my-2">
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
