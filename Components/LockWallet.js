import { useResetRecoilState } from "recoil";
import { lockState, storedAccounts, storedWallet } from "../recoil/atoms.js";

import { useRouter } from "next/router";

const LockWallet = () => {
  const resetLockState = useResetRecoilState(lockState);
  const resetStoredAccounts = useResetRecoilState(storedAccounts);
  const resetStoredWallet = useResetRecoilState(storedWallet);
  const router = useRouter();

  const reset = () => {
    localStorage.clear();
    resetLockState();
    resetStoredAccounts();
    resetStoredWallet();

    router.push("/");
  };

  return (
    <div className="d-flex justify-content-end">
      <div
        className="position-absolute"
        style={{ marginTop: "75px", marginRight: "10px" }}
      >
        <button
          type="button"
          className="btn btn-secondary btn-lg"
          onClick={reset}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            fill="currentColor"
            className="bi bi-lock-fill mb-1 "
            viewBox="0 0 16 16"
          >
            <path d="M8 1a2 2 0 0 1 2 2v4H6V3a2 2 0 0 1 2-2zm3 6V3a3 3 0 0 0-6 0v4a2 2 0 0 0-2 2v5a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2z" />
          </svg>{" "}
          Lock Wallet
        </button>
      </div>
    </div>
  );
};

export default LockWallet;
