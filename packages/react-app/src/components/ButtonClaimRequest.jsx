import React, { useState } from "react";
import { Button, message } from "antd";

const axios = require("axios");

const ButtonClaimRequest = ({ address, disabled, metadata, distributorAddress, tx, userProvider, serverUrl }) => {
  const [loading, setLoading] = useState(true);
  const [isError, setIsError] = useState(false);
  const [result, setResult] = useState();

  const requestClaim = async () => {
    setLoading(true);
    setIsError(false);
    try {
      const msgToSign = await axios.get(serverUrl);
      console.log("msgToSign", msgToSign);
      if (msgToSign.data && msgToSign.data.length > 32) {
        let currentLoader = setTimeout(() => {
          setLoading(false);
        }, 4000);
        const raw = msgToSign.data;
        const msg = raw.replace("**ADDRESS**", address).replace("**DISTRIBUTOR**", distributorAddress);
        const sig = await userProvider.send("personal_sign", [msg, address]);
        clearTimeout(currentLoader);
        currentLoader = setTimeout(() => {
          setLoading(false);
        }, 4000);
        const res = await axios.post(serverUrl, {
          address,
          distributorAddress,
          message: msg,
          signature: sig,
        });
        clearTimeout(currentLoader);
        setLoading(false);
        console.log("RESULT:", res);
        if (res.data) {
          setResult(res.data);
          message.success(res.data);
        }
      } else {
        setLoading(false);
      }
    } catch (e) {
      setIsError(true);
      message.error(" Sorry, the server is overloaded. 🧯🚒🔥");
      console.log("FAILED TO GET...", e);
    }
  };

  return (
    <Button onClick={() => requestClaim()} disabled={disabled}>
      Claim {metadata.tokenName} token
    </Button>
  );
};

export default ButtonClaimRequest;
