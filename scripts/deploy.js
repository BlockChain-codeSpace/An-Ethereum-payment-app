// imports 
const { ethers, network } = require("hardhat")

// async main
async function main() {
    const BlockchainSplitwiseFactory = await ethers.getContractFactory("BlockchainSplitwise")
    console.log("Deploying contract...")
    const BlockchainSplitwise = await BlockchainSplitwiseFactory.deploy()
    await BlockchainSplitwise.deployed()
    console.log(`Deployed contract to: ${BlockchainSplitwise.address}`)
    // console.log(await ethers.getSigners());
    // what happens when we deploy to our hardhat network?
    if (network.config.chainId === 11155111 && process.env.ETHERSCAN_API_KEY) {
        console.log("Waiting for block confirmations...")
        await BlockchainSplitwise.deployTransaction.wait(6)
        await verify(BlockchainSplitwise.address, [])
    }
}

// args for contructor
async function verify(contractAddress, args) {
    console.log("Verifying contract...");
    try {
        run("verify:verify", {
            address: contractAddress,
            constructorArguments: args,
        })
    } catch (err) {
        if (err.message.toLowerCase().includes("already verified")) {
            console.log("Already Verified");
        } else {
            console.log(err);
        }
    }
}

// main
main()
    .then(() => process.exit(0))
    .catch((err) => {
        console.error(err);
        process.exit(1);
    });