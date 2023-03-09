const express = require("express");
const app = express();
const cors = require("cors");
const port = 3042;
const secp = require("ethereum-cryptography/secp256k1");
const { keccak256 } = require("ethereum-cryptography/keccak");
const { utf8ToBytes } = require("ethereum-cryptography/utils");
const { toHex } = require("ethereum-cryptography/utils");

app.use(cors());
app.use(express.json());

const balances = {
  "047287f1571c8996c3d13fe7c3efa75677dbab83bad5931eccf17f46abbd4e14b272de045d1c5b2fb2b190909f336182ed3f912941efd2bb3baa6a2cfc0ab0bf7b": 100,
  "04dec99e3278782171bef9bd3a6823ae378510afd4d9b6a0bc1ceec512e9c0630645041294fe6c173d190f42124b62c66877abc2f0a9e4ed6bc7f83765bf1bd99c": 50,
  "048d0d45f04eeff7a086571626e2e2b855ff7b41db8ca8404c52be18a8e3b89c575c9afea656bd0cada37dd3077eb3c7fefd260f5122da4667ac31a16ffc4fb466": 75,
};
const privateKeys = {
  "047287f1571c8996c3d13fe7c3efa75677dbab83bad5931eccf17f46abbd4e14b272de045d1c5b2fb2b190909f336182ed3f912941efd2bb3baa6a2cfc0ab0bf7b": "434b47c190700803b5c96f552e4e39331dffb1683b86e72c27b66f161d1e6c75",
  "04dec99e3278782171bef9bd3a6823ae378510afd4d9b6a0bc1ceec512e9c0630645041294fe6c173d190f42124b62c66877abc2f0a9e4ed6bc7f83765bf1bd99c": "83c667542b3e4d127c518cab436a22973712130a39c8d670f11689618d508b24",
  "048d0d45f04eeff7a086571626e2e2b855ff7b41db8ca8404c52be18a8e3b89c575c9afea656bd0cada37dd3077eb3c7fefd260f5122da4667ac31a16ffc4fb466": "09d970db5fa56e602cf339b444d56b0b3dad5bf736216ed1a460e5db45873b85",

}

app.get("/balance/:address", (req, res) => {
  const { address } = req.params;
  const balance = balances[address] || 0;
  res.send({ balance });
});

app.get("/privateKey/:address", (req, res) => {
  const {address}  = req.params;
  const privateKey = privateKeys[address] || 0;
  res.send({privateKey});
})

app.post("/send", async (req, res) => {
  const { message, signature, recoveryBit } = req.body;
  const {sender, recipient, amount} = message;

  const recoveredPublicKey = await recoverKey(message, new Uint8Array(signature), recoveryBit);
  console.log(req.body)
  setInitialBalance(sender);
  setInitialBalance(recipient);


  console.log(sender)
  console.log(toHex(recoveredPublicKey) )
  if (toHex(recoveredPublicKey) === sender){
    if (balances[sender] < amount) {
      res.status(400).send({ message: "Not enough funds!" });
    } else {
      console.log(amount);
      balances[sender] -= amount;
      balances[recipient] += amount;
      res.send({ balance: balances[sender] });
    }
  }
  else{
    res.status(400).send({message: "Signature isn't valid"});
  }
});

app.listen(port, () => {
  console.log(`Listening on port ${port}!`);
});

function setInitialBalance(address) {
  if (!balances[address]) {
    balances[address] = 0;
  }
}

async function recoverKey(message, signature, recoveryBit){
  return await secp.recoverPublicKey(
    keccak256(utf8ToBytes(JSON.stringify(message))),
    signature,
    recoveryBit
  )
}