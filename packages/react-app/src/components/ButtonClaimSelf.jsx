/* eslint-disable jsx-a11y/accessible-emoji */
import React from "react";
import { Button } from "antd";

const ButtonClaimSelf = (address, disabled, metadata, writeContracts, tx) => {
  console.log("disable :>> ", disabled);
  console.log("metadata :>> ", metadata);

  return (
    <Button
      onClick={() => {
        tx(writeContracts.Distributor.claim(address));
      }}
      disabled={disabled}
    >
      Claim {metadata} token
    </Button>
  );
};

export default ButtonClaimSelf;
