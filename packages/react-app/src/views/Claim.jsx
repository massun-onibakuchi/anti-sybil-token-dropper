/* eslint-disable jsx-a11y/accessible-emoji */

import React, { useState } from "react";
import { Button, List, Divider, Input, Card, DatePicker, Slider, Switch, Progress, Spin } from "antd";
import { SyncOutlined } from "@ant-design/icons";
import { Address, Balance } from "../components";
import { parseEther, formatEther, formatUnits } from "@ethersproject/units";
import { useContractReader } from "../hooks";

export default function Claim({
  claimEvents,
  tokenName,
  contractName,
  address,
  mainnetProvider,
  userProvider,
  localProvider,
  userEthBalance,
  userTokenBalance,
  tx,
  readContracts,
  writeContracts,
}) {
  const isEligible = useContractReader(readContracts, "Distributor", "userClaimed", [address]);
  const param = useContractReader(readContracts, "Distributor", "dropParam", [], 3600000);
  const totalSupply = useContractReader(readContracts, ContractName, "totalSupply", [], 3600000);
  const decimals = useContractReader(readContracts, ContractName, "decimals", [], 3600000);
  console.log("decimals :>> ", decimals);

  const [owner, setOwner] = useState();
  const [metadata, setDroppedTokenMetadata] = useState({ tokenName, decimals, totalSupply });

  useEffect(() => {
    const updateMetadata = async () => {
      let _owner;
      const metadata = { tokenName: "", decimals: 0, totalSupply: 0 };
      try {
        _owner = await readContracts.Distributor.owner();
        metadata._totalSupply = await readContracts[ContractName].totalSupply();
        metadata._name = await readContracts[ContractName].name();
        metadata._decimals = await readContracts[ContractName].decimals();
      } catch (e) {
        console.log(e);
      }
      setOwner(_owner);
      setDroppedTokenMetadata(metadata);
    };
    updateMetadata();
  }, []);

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
        <div>Start Time: {param ? new Date(param.startTimestamp.toNumber() * 1000).toLocaleTimeString() : 0} </div>
        <div>Ent Time:{param ? new Date(param.endTimestamp.toNumber() * 1000).toLocaleTimeString() : 0} </div>
        <div>Your claimable amount: {param ? formatUnits(param.dropAmountPerUser) : 0}</div>
        <Divider />
        <div style={{ margin: 8 }}>
          <Button
            onClick={() => {
              tx(writeContracts.Distributor.claim(address));
            }}
            disabled={
              (!param && !isEligible) ||
              (param.startTimestamp.toNumber() > Date.now() && param.endTimestamp.toNumber() < Date.now())
            }
          >
            Claim {metadata.tokenName} token
          </Button>
        </div>
      </div>

      <div style={{ width: 600, margin: "auto", marginTop: 32, paddingBottom: 32 }}>
        <h2>Events:</h2>
        <List
          bordered
          dataSource={claimEvents}
          renderItem={item => {
            return (
              <List.Item key={item.blockNumber + "_" + item.user + "_" + item.amount}>
                <Address address={item[0]} ensProvider={mainnetProvider} fontSize={16} /> =>
                {item[1]}
              </List.Item>
            );
          }}
        />
      </div>
    </div>
  );
}
