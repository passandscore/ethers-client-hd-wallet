import Head from "next/head";
import Image from "next/image";
import styles from "../styles/Home.module.css";

export default function Home() {
  return (
    <>
      <div className={styles.container}>
        <Head>
          <title>My Ethers Wallet</title>
          <meta name="description" content="Generated by create next app" />
          <link rel="icon" href="/favicon.ico" />
        </Head>

        <main className={styles.main}>
          <div className="mb-5 pb-5">
            <h1 className={styles.title}>
              Simple HD Wallet using{" "}
              <a href="https://docs.ethers.io/v5/">Ethers.js!</a>
            </h1>

            <div className={styles.description}>
              <p>
                This is a{" "}
                <a href="https://en.bitcoin.it/wiki/Deterministic_wallet">
                  Hierarchical deterministic wallet
                </a>{" "}
                kept encrypted in Local Storage.
              </p>
              <p>It shows the first 5 derived addresses and their balances.</p>
            </div>
          </div>
        </main>
      </div>
    </>
  );
}
