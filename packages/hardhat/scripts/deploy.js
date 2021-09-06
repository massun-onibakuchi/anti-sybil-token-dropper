/* eslint no-use-before-define: "warn" */
const fs = require("fs");
const chalk = require("chalk");
const { config, ethers, tenderly, run } = require("hardhat");
const { utils } = require("ethers");
const R = require("ramda");

const main = async () => {
    console.log("\n\n 📡 Deploying...\n");
    const [owner] = await ethers.getSigners();

    // const yourContract = await ethers.getContractAt('YourContract', "0xaAC799eC2d00C013f1F11c37E654e59B0429DF6A") //<-- if you want to instantiate a version of a contract at a specific address!
    // const secondContract = await deploy("SecondContract")
    const yourContract = await deploy("YourContract"); // <-- add in constructor args like line 19 vvvv
    const tokenMock = await deploy("ERC20Mock");
    const proofOfHumanity = await deploy("ProofOfHumanityMock");
    const collectibe = await deploy("Collectible", [proofOfHumanity.address]);
    const distributor = await deploy("Distributor", [proofOfHumanity.address]);

    await tokenMock.setDecimals(18);
    await tokenMock.mint(owner.address, utils.parseEther("100"));
    await tokenMock.connect(owner).approve(distributor.address, utils.parseEther("100"));

    await distributor
        .connect(owner)
        .setDrop(
            tokenMock.address,
            utils.parseEther("10"),
            Math.floor(Date.now() / 1000 + 30),
            Math.floor(Date.now() / 1000 + 3600),
            utils.parseEther("1"),
        );

    await collectibe.connect(owner).mint(0, "");
    await collectibe.connect(owner).mint(1, "");
    await collectibe.connect(owner).setStartTime(Math.floor(Date.now() / 1000 + 30));

    await owner.sendTransaction({ to: "0x94eE9662A3573Bb52716a9e695A7f7f33Caa8B3F", value: utils.parseEther("1") });

    // If you want to verify your contract on etherscan
    /*
        console.log(chalk.blue('verifying on etherscan'))
        await run("verify:verify", {
            address: yourContract.address,
            // constructorArguments: args // If your contract has constructor arguments, you can pass them as an array
        })
    */

    console.log(
        " 💾  Artifacts (address, abi, and args) saved to: ",
        chalk.blue("packages/hardhat/artifacts/"),
        "\n\n",
    );
};

const deploy = async (contractName, _args = [], overrides = {}, libraries = {}) => {
    console.log(` 🛰  Deploying: ${contractName}`);

    const contractArgs = _args || [];
    const contractArtifacts = await ethers.getContractFactory(contractName, { libraries });
    const deployed = await contractArtifacts.deploy(...contractArgs, overrides);
    const encoded = abiEncodeArgs(deployed, contractArgs);
    fs.writeFileSync(`artifacts/${contractName}.address`, deployed.address);

    let extraGasInfo = "";
    if (deployed && deployed.deployTransaction) {
        const gasUsed = deployed.deployTransaction.gasLimit.mul(deployed.deployTransaction.gasPrice);
        extraGasInfo = `${utils.formatEther(gasUsed)} ETH, tx hash ${deployed.deployTransaction.hash}`;
    }

    console.log(" 📄", chalk.cyan(contractName), "deployed to:", chalk.magenta(deployed.address));
    console.log(" ⛽", chalk.grey(extraGasInfo));

    await tenderly.persistArtifacts({
        name: contractName,
        address: deployed.address,
    });

    if (!encoded || encoded.length <= 2) return deployed;
    fs.writeFileSync(`artifacts/${contractName}.args`, encoded.slice(2));

    return deployed;
};

// ------ utils -------

// abi encodes contract arguments
// useful when you want to manually verify the contracts
// for example, on Etherscan
const abiEncodeArgs = (deployed, contractArgs) => {
    // not writing abi encoded args if this does not pass
    if (!contractArgs || !deployed || !R.hasPath(["interface", "deploy"], deployed)) {
        return "";
    }
    const encoded = utils.defaultAbiCoder.encode(deployed.interface.deploy.inputs, contractArgs);
    return encoded;
};

// checks if it is a Solidity file
const isSolidity = fileName =>
    fileName.indexOf(".sol") >= 0 && fileName.indexOf(".swp") < 0 && fileName.indexOf(".swap") < 0;

const readArgsFile = contractName => {
    let args = [];
    try {
        const argsFile = `./contracts/${contractName}.args`;
        if (!fs.existsSync(argsFile)) return args;
        args = JSON.parse(fs.readFileSync(argsFile));
    } catch (e) {
        console.log(e);
    }
    return args;
};

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// If you want to verify on https://tenderly.co/
const tenderlyVerify = async ({ contractName, contractAddress }) => {
    const tenderlyNetworks = ["kovan", "goerli", "mainnet", "rinkeby", "ropsten", "matic", "mumbai", "xDai", "POA"];
    const targetNetwork = process.env.HARDHAT_NETWORK || config.defaultNetwork;

    if (tenderlyNetworks.includes(targetNetwork)) {
        console.log(chalk.blue(` 📁 Attempting tenderly verification of ${contractName} on ${targetNetwork}`));

        await tenderly.persistArtifacts({
            name: contractName,
            address: contractAddress,
        });

        const verification = await tenderly.verify({
            name: contractName,
            address: contractAddress,
            network: targetNetwork,
        });

        return verification;
    }
    console.log(chalk.grey(` 🧐 Contract verification not supported on ${targetNetwork}`));
};

main()
    .then(() => process.exit(0))
    .catch(error => {
        console.error(error);
        process.exit(1);
    });
