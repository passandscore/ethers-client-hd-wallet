# Ethereum (Ropsten) Client-side Ethers HD Wallet
<!-- [View Website Here](https://king-wiki.herokuapp.com/) -->


<!-- <p align=”center”>
<img src="images/readme-cover.png" alt="Logo" width="800" height="600">
</p> -->

<!-- ABOUT THE PROJECT -->



This is a Hierarchical Deterministic Wallet that represents a large tree of private keys, which can be reproduced from an initial seed. Each node in the tree is represented by an HDNode which can be branched.

This is an implementation of a hierarchical wallet (HD wallet) for Ethereum in JavaScript using the [Ethers.js](https://github.com/ethers-io/ethers.js) library. The wallet will hold a BIP39 mnemonic phrase and will allow deriving private keys and addresses from it. The concept of hierarchical wallets (HD Wallets) is based on BIP39 and BIP44 specs. The HDNode class in the Ethers.js library holds a seed key + the ability to derive private keys by a certain derivation path.

### Languages

- [JavaScript](https://www.javascript.com/)

### Built With

- [Ethers.js](https://docs.ethers.io/v5/)
- [Next.js](https://nextjs.org/)
- [Bootstrap](https://getbootstrap.com/)

### Recommended Dependanices

- [React Toastify](https://github.com/fkhadra/react-toastify#readme)

<!-- GETTING STARTED -->


---

## Local Installation

- Requires a config.js file to be created on the root. Provide the follow information

```bash
export const INFURA_PROJECT_ID = "<PROJECT ID HERE>";
export const NETWORK = "ropsten";
export const DERIVATION_PATH = "m/44'/60'/0'/0/";
```

- Load all dependencies

```bash
yarn install
```

---

## BIP39 and BIP44 Online

Play a bit with the BIP39 online implementation here: [iancoleman](https://iancoleman.io/bip39). Generate/load mnemonics, derive Ethereum and Bitcoin keys and addresses.

---

## Features

## a) Open from Mnemonic

1. Restores an HD node by given existing mnemonic words:

```
upset fuel enhance depart portion hope core animal innocent will athlete snack <EXAMPLE>
```

2. When an ethers.Wallet instance is created from a mnemonic, it actually uses `HDNode.fromMnemonic`, derives once, and from the new HD node, it takes the private key to build the wallet.

## b) Create Random Wallet

1. Generates a new random HD node (generate random mnemonics). To create a random HD node, you can either do `ethers.Wallet.createRandom` and build the HD node from the mnemonic, or you can build the mnemonic from 16 bytes of entropy using `ethers.utils.HDNode.entropyToMnemonic`.

2. Create a random HD wallet using `ethers.Wallet.createRandom`.

## c) Export Keystore

Encrypt and save given HD node to a JSON document by password. To save the HD Wallet in an encrypted JSON format, you need the Wallet to include the mnemonic phrase. The mnemonic is encrypted in the `x-ethers` part of the json.

## d) Open From Keystore

Decrypts and loads an HD node from a JSON document using a password. Uses `ethers.Wallet.fromEncryptedJson(json, password)`.

## e) View Accounts

Derives keys (and their associated addresses) from HD Wallet by given derivation path. Derivation path is `m/44'/60'/0'/0`.

## f) Send Transaction

1. Sign Transaction - Take an address from the derived wallets and signs a transaction with a given recipient address and ether value.

2. Send Transaction - Take an address from the derived wallets and sends a transaction with a given recipient address and ether value.

---

## Created By

- [Jason Schwarz | LinkedIn](https://www.linkedin.com/in/jason-schwarz-75b91482/)
