import Link from "next/link";

const Navbar = () => {
  return (
    <>
      <nav className="navbar navbar-light bg-light position-absolute vw-100  ">
        <div className="container-fluid d-flex justify-content-center ">
          <Link href="/">
            <a className="nav-link active fs-5">Home</a>
          </Link>

          <Link href="/create-wallet">
            <a className="nav-link active fs-5">Create Wallet</a>
          </Link>

          <Link href="/open-wallet">
            <a className="nav-link fs-5">Open Wallet</a>
          </Link>
          <Link href="/open-mnemonic">
            <a className="nav-link fs-5">Open From Mnemonic</a>
          </Link>
          <Link href="/open-keystore">
            <a className="nav-link fs-5">Open From Keystore</a>
          </Link>
          <Link href="/show-mnemonic">
            <a className="nav-link fs-5">Show Mnemonic</a>
          </Link>
          <Link href="/view-addresses">
            <a className="nav-link fs-5">View Addresses</a>
          </Link>
          <Link href="/send-transactions">
            <a className="nav-link fs-5">Send Transactions</a>
          </Link>
          <Link href="/export-wallet">
            <a className="nav-link fs-5">Export Wallet</a>
          </Link>
          <Link href="/contract">
            <a className="nav-link fs-5">Contract</a>
          </Link>
        </div>
      </nav>
    </>
  );
};

export default Navbar;
