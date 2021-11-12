import { ethers } from "ethers";
import { DERIVATION_PATH } from "../config";

// eslint-disable-next-line import/no-anonymous-default-export
export default async function (provider, wallet, network) {
  let addresses = [];
  // Create a HDNode
  const masterNode = ethers.utils.HDNode.fromMnemonic(wallet.mnemonic.phrase);

  const balancePromises = [];
  const derivedWallets = {};

  for (let index = 0; index < 5; index++) {
    // Derive from node and build a new wallet from the new private key
    const derivedPrivateKey = masterNode.derivePath(
      DERIVATION_PATH + index
    ).privateKey;

    // Call the balances from each of the newly created wallets
    let wallet = new ethers.Wallet(derivedPrivateKey, provider);
    derivedWallets[wallet.address] = wallet;
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
      DERIVATION_PATH + index
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
  const user = { addresses, derivedWallets };
  console.log(user);
  return user;
}
