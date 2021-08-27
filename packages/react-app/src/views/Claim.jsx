/* eslint-disable jsx-a11y/accessible-emoji */

import React, { useState, useEffect } from "react";
import { Button, List, Divider, Input, Card, DatePicker, Slider, Switch, Progress, Spin } from "antd";
import { SyncOutlined } from "@ant-design/icons";
import { formatEther, formatUnits } from "@ethersproject/units";
import { Address, Balance } from "../components";
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
}) {
  const isClaimed = useContractReader(readContracts, "Distributor", "userClaimed", [address]);
  const param = useContractReader(readContracts, "Distributor", "dropParam", [], 3600000);
  const [owner, setOwner] = useState();
  const [metadata, setDroppedTokenMetadata] = useState({ tokenName: "", decimals: 18, totalSupply: 0 });

  let startDateText = ``;
  let endDateText = ``;
  if (param) {
    const startDate = new Date(param.startTimestamp.toNumber() * 1000);
    const endDate = new Date(param.endTimestamp.toNumber() * 1000);
    startDateText = `${startDate.toLocaleDateString()} ${startDate.toLocaleTimeString()}`;
    endDateText = `${endDate.toLocaleDateString()} ${endDate.toLocaleTimeString()}`;
  }

  console.log("metadata :>> ", metadata);

  useEffect(() => {
    const updateMetadata = async () => {
      // let _data = [];
      let _owner;
      const metadata = { tokenName: "", decimals: 0, totalSupply: 0 };
      try {
        _owner = await readContracts.Distributor.owner();
        metadata.tokenName = await readContracts[contractName].name();
        metadata.totalSupply = await readContracts[contractName].totalSupply();
        metadata.decimals = await readContracts[contractName].decimals();
        // const data = await Promise.allSettled([
        //   await readContracts[contractName].name(),
        //   await readContracts[contractName].totalSupply(),
        //   await readContracts[contractName].decimals(),
        // ]);
      } catch (e) {
        console.log(e);
      }
      setOwner(_owner);
      setDroppedTokenMetadata(metadata);
      // setDroppedTokenMetadata({
      //   tokenName: _data[0],
      //   decimals: _data[1],
      //   totalSupply: _data[2],
      // });
    };
    updateMetadata().catch(() => updateMetadata()); // retry
  }, [readContracts, contractName]);

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
        <div>
          Total supply:{" "}
          {metadata.totalSupply && metadata.decimals
            ? formatUnits(metadata.totalSupply, metadata.decimals.toString())
            : "..."}
        </div>
        <div>
          Your token Balance:{" "}
          {userTokenBalance && metadata.decimals ? formatUnits(userTokenBalance, metadata.decimals.toString()) : "..."}
        </div>
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
          <Button
            onClick={() => {
              tx(writeContracts.Distributor.claim(address));
            }}
            disabled={
              (!param && !isClaimed) ||
              param.startTimestamp.toNumber() > Date.now() ||
              param.endTimestamp.toNumber() < Date.now()
            }
          >
            Claim {metadata.tokenName} token
          </Button>
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
