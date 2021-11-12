import Head from "next/head";
import styles from "../styles/CreateWallet.module.css";
import { useEffect, useState } from "react";
import copy from "copy-to-clipboard";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.min.css";
import { useRecoilValue } from "recoil";
import { storedAccounts } from "../Recoil/atoms";

export default function ViewAddresses() {
  const [errorMsg, setErrorMsg] = useState("");
  const [keystore, setKeystore] = useState(null);
  const currentAddresses = useRecoilValue(storedAccounts);

  useEffect(() => {
    setKeystore(localStorage.getItem("keystore"));
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
          <main className={styles.main}>
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
            <>
              <table
                className="table table-hover table-secondary "
                style={{ borderRadius: "6px", overflow: "hidden" }}
              >
                <thead>
                  <tr className="px-1">
                    <th scope="col" className="fs-5">
                      #
                    </th>
                    <th scope="col" className="fs-5">
                      Address
                    </th>
                    <th scope="col" className="fs-5">
                      Balance
                    </th>
                    <th scope="col"></th>
                  </tr>
                </thead>
                <tbody>
                  {currentAddresses &&
                    currentAddresses.map(
                      ({ address, balance, link }, index) => (
                        <>
                          <tr
                            className="table-light"
                            style={{ paddingTop: "10px" }}
                          >
                            <th scope="row" className="fs-5">
                              {index + 1}
                            </th>
                            <td className="fs-5">
                              <a href={link} target="_blank" rel="noreferrer">
                                {address}
                              </a>
                            </td>
                            <td className="fs-5">{balance}</td>
                            <td>
                              <div
                                data-bs-toggle="tooltip"
                                data-bs-placement="right"
                                title="Copy Address"
                              >
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
                              </div>
                            </td>
                          </tr>
                        </>
                      )
                    )}
                </tbody>
              </table>
              <p className="display-4" style={{ color: "#F7CD53" }}>
                {currentAddresses.total} ETH
              </p>
            </>
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
