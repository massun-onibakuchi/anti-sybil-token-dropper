# anti-sybil-token-drop
This repo uses 🏗 scaffold-eth - 🔏 sign in with web3 example

## Concept
Airdrops of tokens and nft are common. However, these airdrops are often conducted by individuals with multiple addresses, and are often bought up or minted by a small number of participants. As a countermeasure, there is a launch pad that distributes tokens according to the amount of tokens locked in advance, but this also favors a small number of whales. The method I propose here is to use Proofof humanity so that only accounts registered as individuals can be minted or claimed only once. We also transfer tokens from the backend for participants with small amounts who are hesitant to pay for gas.

## How it works
> Ask users to sign a message with their web3 wallet and recover it in a backend service

> If the user has not claimed yet, we will send the token to them.

## Setup
---

```bash
git clone https://github.com/austintgriffith/scaffold-eth.git anti-sybil-token-drop

cd anti-sybil-token-drop

git checkout anti-sybil-token-drop
```

```bash

yarn install

```

```bash
yarn chain
```

```bash
yarn deploy
```

```bash

yarn start

```

> start the backend service that listens for and verifies signatures:
get a private key which is provided `yarn chain` and set `PK`
```bash

PK=<Private Key> yarn backend 

```

📝 Edit your frontend `App.jsx` in `packages/react-app/src`

📱 Open http://localhost:3000 to see the app


---

> Connect a web3 wallet:

![image](https://user-images.githubusercontent.com/2653167/116907182-794c0480-abfe-11eb-9b63-935d8848b613.png)

---

> Sign a message to prove you own the address:

![image](https://user-images.githubusercontent.com/2653167/116907431-c6c87180-abfe-11eb-9382-e885a39c0579.png)

![image](https://user-images.githubusercontent.com/2653167/116907476-dc3d9b80-abfe-11eb-9fb6-f0c2af0f40a1.png)

---

> A backend server verifies sigatures:

![image](https://user-images.githubusercontent.com/2653167/116907561-fb3c2d80-abfe-11eb-9b09-f1c81265040b.png)

---

> The frontend can then react to the correct signature:

![image](https://user-images.githubusercontent.com/2653167/116907586-02633b80-abff-11eb-9ab4-3c5a9a16d64d.png)

---

## 💬 Support Chat

Join the telegram [support chat 💬](https://t.me/joinchat/KByvmRe5wkR-8F_zz6AjpA)  to ask questions and find others building with 🏗 scaffold-eth!

---

===================================================== [⏫ back to the top ⏫](https://github.com/austintgriffith/scaffold-eth#-scaffold-eth)

---
