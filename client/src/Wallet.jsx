import server from "./server";

function Wallet({ address, setAddress, balance, setBalance, privateKey, setPrivateKey, /*signature, setSignature, recovery, setRecovery */}) {
  async function onChange(evt) {
    const address = evt.target.value;
    setAddress(address);
    if (address) {
      const {
        data: { balance },
      } = await server.get(`balance/${address}`);
      setBalance(balance);
      const{
        data: {privateKey}
      } = await server.get(`privateKey/${address}`);
      setPrivateKey(privateKey);
    } else {
      setBalance(0);
    }
  }

  return (
    <div className="container wallet">
      <h1>Your Wallet</h1>

      <label>
        Wallet Address
        <input placeholder="Type an address, for example: 0x1" value={address} onChange={onChange}></input>
      </label>
      <div className="balance">Balance: {balance}</div>
      <div className = "privateKey">Private Key: {privateKey}</div>
    </div>
  );
}

export default Wallet;
