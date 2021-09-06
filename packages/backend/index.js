const ethers = require("ethers");
const express = require("express");
const fs = require("fs");
const https = require("https");
const DISTRIBUTOR_ADDRESS = require("./contracts/Distributor.address.js");
const DISTRIBUTOR_ABI = require("./contracts/Distributor.abi.js");
const cors = require("cors");
const bodyParser = require("body-parser");
const app = express();
let cache = {};
let currentMessage = "I am **ADDRESS** and I would like to claim to **DISTRIBUTOR** on behalfof me, plz!";

const localhost = {
    name: "localhost",
    color: "#666666",
    chainId: 31337,
    blockExplorer: "",
    rpcUrl: "http://localhost:8545",
};

const localProvider = new ethers.providers.StaticJsonRpcProvider(localhost.rpcUrl);

if (!process.env.PK) throw Error("process.env.PK " + process.env.PK);
const wallet = new ethers.Wallet(process.env.PK, localProvider);
console.log(wallet.address);
const checkWalletBalance = async () => {
    console.log("BALANCE:", ethers.utils.formatEther(await wallet.provider.getBalance(wallet.address)));
};
checkWalletBalance();

app.use(cors());

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.get("/", function (req, res) {
    console.log("/");
    res.status(200).send(currentMessage);
});

app.post("/", async function (request, response) {
    const ip = request.headers["x-forwarded-for"] || request.connection.remoteAddress;
    console.log("POST from ip address:", ip, request.body.message);
    try {
        // isAddress
        if (!ethers.utils.isAddress(request.body.address)) {
            response.send("invalid address 😅");
        }
        // is correct distributor address
        if (DISTRIBUTOR_ADDRESS !== request.body.distributorAddress) {
            response.send(" Distributor contract address mismatch!? 😅");
        }
        // is signature valid
        if (
            request.body.message !=
            currentMessage
                .replace("**ADDRESS**", request.body.address)
                .replace("**DISTRIBUTOR**", request.body.distributorAddress)
        ) {
            response.send(" ⚠️ Secret message mismatch!?! Please reload and try again. Sorry! 😅");
        }
        const distributor = new ethers.Contract(DISTRIBUTOR_ADDRESS, DISTRIBUTOR_ABI, localProvider);
        const isClaimable = await distributor.isClaimable(request.body.address);
        const recovered = ethers.utils.verifyMessage(request.body.message, request.body.signature);
        if (!isClaimable) {
            response.send("You are not claimable");
        }
        if (recovered == request.body.address) {
            distributor
                .connect(wallet)
                .claim(request.body.address)
                .then(result => {
                    response.send(" 👍 successfully request claim " + request.body.address + "!");
                })
                .catch(err => {
                    console.log("err :>> ", err);
                    response.send("transaction fail");
                });
        }
    } catch (err) {
        console.log("err :>> ", err);
        response.send("Some error has occurred😅");
    }
});

if (fs.existsSync("server.key") && fs.existsSync("server.cert")) {
    https
        .createServer(
            {
                key: fs.readFileSync("server.key"),
                cert: fs.readFileSync("server.cert"),
            },
            app,
        )
        .listen(49832, () => {
            console.log("HTTPS Listening: 49832");
        });
} else {
    var server = app.listen(49832, function () {
        console.log("HTTP Listening on port:", server.address().port);
    });
}
