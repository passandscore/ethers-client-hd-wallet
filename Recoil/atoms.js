import { atom } from "recoil";

export const lockState = atom({
  key: "lockState",
  default: "locked",
});

export const storedWallet = atom({
  key: "storedWallet",
  default: null,
});

export const storedAccounts = atom({
  key: "storedAccounts",
  default: null,
});
