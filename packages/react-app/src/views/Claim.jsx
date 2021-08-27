/* eslint-disable jsx-a11y/accessible-emoji */

import React, { useState, useEffect } from "react";
import { Button, List, Divider } from "antd";
import { formatEther, formatUnits } from "@ethersproject/units";
import { Address, ButtonClaimSelf, ButtonClaimRequest } from "../components";
import { useContractReader } from "../hooks";

export default function Claim({
  address,
  mainnetProvider,
  userProvider,
  localProvider,
  userEthBalance,
  contractName,
  userTokenBalance,
  claimEvents,
  tx,
  readContracts,
  writeContracts,
  serverUrl,
}) {
  const isClaimed = useContractReader(readContracts, "Distributor", "userClaimed", [address], 15 * 1000);
  const param = useContractReader(readContracts, "Distributor", "dropParam", [], 3600000);
  const [owner, setOwner] = useState("");
  const [disabled, setDisable] = useState(false);
  const [metadata, setDroppedTokenMetadata] = useState({ tokenName: "", decimals: 18, totalSupply: 0 });

  let startDateText = ``;
  let endDateText = ``;
  if (param) {
    const startDate = new Date(param.startTimestamp.toNumber() * 1000);
    const endDate = new Date(param.endTimestamp.toNumber() * 1000);
    startDateText = `${startDate.toLocaleDateString()} ${startDate.toLocaleTimeString()}`;
    endDateText = `${endDate.toLocaleDateString()} ${endDate.toLocaleTimeString()}`;
  }

  useEffect(() => {
    const updateMetadata = async () => {
      let _owner;
      const _metadata = { tokenName: "", decimals: 0, totalSupply: 0 };
      try {
        _owner = await readContracts.Distributor.owner();
        _metadata.tokenName = await readContracts[contractName].name();
        _metadata.totalSupply = await readContracts[contractName].totalSupply();
        _metadata.decimals = await readContracts[contractName].decimals();
      } catch (e) {
        console.log(e);
      }
      setOwner(_owner);
      setDroppedTokenMetadata(_metadata);
    };
    updateMetadata();
  }, [readContracts, contractName]);

  useEffect(() => {
    setDisable(
      () =>
        !param ||
        isClaimed ||
        param.startTimestamp.toNumber() > Date.now() / 1000 ||
        param.endTimestamp.toNumber() < Date.now() / 1000,
    );
  }, [param, isClaimed]);

  return (
    <div>
      <div style={{ border: "1px solid #cccccc", padding: 16, width: 400, margin: "auto", marginTop: 64 }}>
        <h2>Claim</h2>
        <Divider />
        Your Address:
        <Address address={address} ensProvider={mainnetProvider} fontSize={14} />
        <div>Your ETH Balance: {userEthBalance ? formatEther(userEthBalance) : "..."}</div>
        <Divider />
        <h2>Token Info</h2>
        <div>Name:{metadata.tokenName}</div>
        <div>
          Address:
          <Address
            address={readContracts ? readContracts[contractName].address : readContracts}
            ensProvider={mainnetProvider}
            fontSize={16}
          />
        </div>
        <div>Your token Balance: {formatUnits(userTokenBalance || 0, metadata.decimals.toString())}</div>
        <Divider />
        <h2>Distributor Contract</h2>
        Address:
        <Address
          address={readContracts ? readContracts.Distributor.address : readContracts}
          ensProvider={mainnetProvider}
          fontSize={14}
        />
        <div>
          Owner:
          <Address address={owner} ensProvider={mainnetProvider} fontSize={14} />
        </div>
        <div>Start Time: {startDateText}</div>
        <div>Ent Time:{endDateText}</div>
        <div>Your claimable amount: {param ? formatUnits(param.dropAmountPerUser) : 0}</div>
        <Divider />
        <div style={{ margin: 8 }}>
          <ButtonClaimRequest
            address={address}
            distributorAddress={readContracts.Distributor.address}
            disabled={disabled}
            metadata={metadata}
            userProvider={userProvider}
            serverUrl={serverUrl}
          />
          {isClaimed && <div style={{ margin: 6 }}>You can not claim twice</div>}
        </div>
      </div>

      <div style={{ width: 600, margin: "auto", marginTop: 32, paddingBottom: 32 }}>
        <h2>Events:</h2>
        <List
          bordered
          dataSource={claimEvents}
          renderItem={item => {
            return (
              <List.Item
                key={item.blockNumber + "_" + item.user + "_" + formatUnits(item.amount, metadata.decimals.toString())}
              >
                <Address address={item[0]} ensProvider={mainnetProvider} fontSize={16} />:
                {formatUnits(item[1], metadata.decimals.toString())}
              </List.Item>
            );
          }}
        />
      </div>
    </div>
  );
}
