import React from "react";
import { PageHeader } from "antd";

// displays a page header

export default function Header() {
  return (
    <a href="/">
      <PageHeader
        title="🔏 Anti Sybil Token Drop"
        subTitle="Sign a message with your wallet to log in..."
        style={{ cursor: "pointer" }}
      />
    </a>
  );
}
