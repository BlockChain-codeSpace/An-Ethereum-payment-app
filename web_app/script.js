// =============================================================================
//                                  Config
// =============================================================================
const provider = new ethers.providers.JsonRpcProvider("http://127.0.0.1:8545/");
var defaultAccount;

// Constant we use later
var GENESIS = '0x0000000000000000000000000000000000000000000000000000000000000000';

// This is the ABI for your contract (get it from Remix, in the 'Compile' tab)
// ============================================================
var abi = [
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": false,
        "internalType": "int32",
        "name": "cycle_end",
        "type": "int32"
      }
    ],
    "name": "logCycleEnd",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": false,
        "internalType": "string",
        "name": "message",
        "type": "string"
      }
    ],
    "name": "logMessage",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": false,
        "internalType": "uint32",
        "name": "min",
        "type": "uint32"
      }
    ],
    "name": "logMin",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": false,
        "internalType": "address",
        "name": "_address",
        "type": "address"
      }
    ],
    "name": "visitedNode",
    "type": "event"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "creditor",
        "type": "address"
      },
      {
        "internalType": "uint32",
        "name": "amount",
        "type": "uint32"
      }
    ],
    "name": "add_IOU",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "allUsers",
    "outputs": [
      {
        "internalType": "address[]",
        "name": "",
        "type": "address[]"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "",
        "type": "address"
      },
      {
        "internalType": "address",
        "name": "",
        "type": "address"
      }
    ],
    "name": "balances",
    "outputs": [
      {
        "internalType": "uint32",
        "name": "",
        "type": "uint32"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "user",
        "type": "address"
      }
    ],
    "name": "getNeighbors",
    "outputs": [
      {
        "internalType": "address[10]",
        "name": "",
        "type": "address[10]"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "debtor",
        "type": "address"
      },
      {
        "internalType": "address",
        "name": "creditor",
        "type": "address"
      }
    ],
    "name": "lookup",
    "outputs": [
      {
        "internalType": "uint32",
        "name": "",
        "type": "uint32"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "name": "parents",
    "outputs": [
      {
        "internalType": "uint32",
        "name": "",
        "type": "uint32"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "",
        "type": "address"
      }
    ],
    "name": "unique_users",
    "outputs": [
      {
        "internalType": "uint32",
        "name": "",
        "type": "uint32"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "name": "users",
    "outputs": [
      {
        "internalType": "address",
        "name": "",
        "type": "address"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "name": "visited",
    "outputs": [
      {
        "internalType": "bool",
        "name": "",
        "type": "bool"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  }
] // FIXME: fill this in with your contract's ABI //Be sure to only have one array, not two
// ============================================================
abiDecoder.addABI(abi);
// call abiDecoder.decodeMethod to use this - see 'getAllFunctionCalls' for more

var contractAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3"; // FIXME: fill this in with your contract's address/hash

var BlockchainSplitwise = new ethers.Contract(contractAddress, abi, provider.getSigner());
async () => {
  if (await provider.getCode(contractAddress) === "0x") {
    console.log("Chua được deploy");
  } else {
    console.log("Deployed!!!!");
  }
}
// =============================================================================
//                            Functions To Implement
// =============================================================================

// TODO: Add any helper functions here!

// TODO: Get the balances between debtor, creditor
async function lookup(debtor, creditor) {
  var result = await BlockchainSplitwise.lookup(debtor, creditor)
  return result;
}

// TODO: Return a list of all users (creditors or debtors) in the system
// All users in the system are everyone who has ever sent or received an IOU
async function getUsers() {
  const users = await BlockchainSplitwise.allUsers()
  return users
}

// TODO: Get the total amount owed by the user specified by 'user'
async function getTotalOwed(user) {
  let total = 0;
  let active_users = await getUsers();
  for (var i = 0; i < active_users.length; i++) {
    if (user == active_users[i]) {
      continue;
    }
    var result = await lookup(user, active_users[i]);
    result = parseInt(result);
    if (result > 0) {
      total += result;
    }
  }
  return total
}

// TODO: Get the last time this user has sent or received an IOU, in seconds since Jan. 1, 1970
// Return null if you can't find any activity for the user.
// HINT: Try looking at the way 'getAllFunctionCalls' is written. You can modify it if you'd like.
async function getLastActive(user) {
  var results = await getAllFunctionCalls(contractAddress, "add_IOU");
  for (var i = 0; i < results.length; i++) {
    let result = results[i];
    if (result.from.toLowerCase() == user.toLowerCase()) {
      return result.t;
    }

    if (result.args[0].toLowerCase() == user.toLowerCase()) {
      return result.args[1];
    }
  }
  return null
}

// TODO: add an IOU ('I owe you') to the system
// The person you owe money is passed as 'creditor'
// The amount you owe them is passed as 'amount'
async function add_IOU(creditor, amount) {
  // BlockchainSplitwise = new ethers.Contract(contractAddress, abi, provider.getSigner(defaultAccount));
  await BlockchainSplitwise.connect(provider.getSigner(defaultAccount)).add_IOU(creditor, amount)
    .then(() => {
      console.log("Send IOU successfully")
    })
    .catch((err) => {
      console.error(err.error.message.split("reason string ")[1].replace(/'/g, ""));
    })
}

// =============================================================================
//                              Provided Functions
// =============================================================================
// Reading and understanding these should help you implement the above

// This searches the block history for all calls to 'function	Name' (string) on the 'addressOfContract' (string) contract
// It returns an array of objects, one for each call, containing the sender ('from'), arguments ('args'), and the timestamp ('t')
async function getAllFunctionCalls(addressOfContract, functionName) {
  var curBlock = await provider.getBlockNumber();
  var function_calls = [];

  while (curBlock !== GENESIS) {
    var b = await provider.getBlockWithTransactions(curBlock);
    var txns = b.transactions;
    for (var j = 0; j < txns.length; j++) {
      var txn = txns[j];

      // check that destination of txn is our contract
      if (txn.to == null) { continue; }
      if (txn.to.toLowerCase() === addressOfContract.toLowerCase()) {
        var func_call = abiDecoder.decodeMethod(txn.data);

        // check that the function getting called in this txn is 'functionName'
        if (func_call && func_call.name === functionName) {
          var timeBlock = await provider.getBlock(curBlock);
          var args = func_call.params.map(function (x) { return x.value });
          function_calls.push({
            from: txn.from.toLowerCase(),
            args: args,
            t: timeBlock.timestamp
          })
        }
      }
    }
    curBlock = b.parentHash;
  }
  return function_calls;
}

// We've provided a breadth-first search implementation for you, if that's useful
// It will find a path from start to end (or return null if none exists)
// You just need to pass in a function ('getNeighbors') that takes a node (string) and returns its neighbors (as an array)
async function doBFS(start, end, getNeighbors) {
  var queue = [[start]];
  while (queue.length > 0) {
    var cur = queue.shift();
    var lastNode = cur[cur.length - 1]
    if (lastNode.toLowerCase() === end.toString().toLowerCase()) {
      return cur;
    } else {
      var neighbors = await getNeighbors(lastNode);
      for (var i = 0; i < neighbors.length; i++) {
        queue.push(cur.concat([neighbors[i]]));
      }
    }
  }
  return null;
}

// =============================================================================
//                                      UI
// =============================================================================

// This sets the default account on load and displays the total owed to that
// account.
provider.listAccounts().then((response) => {
  defaultAccount = response[0];

  getTotalOwed(defaultAccount).then((response) => {
    $("#total_owed").html("$" + response);
  });

  getLastActive(defaultAccount).then((response) => {
    time = timeConverter(response)
    $("#last_active").html(time)
  });
});

// This code updates the 'My Account' UI with the results of your functions
$("#myaccount").change(function () {
  defaultAccount = $(this).val();

  getTotalOwed(defaultAccount).then((response) => {
    $("#total_owed").html("$" + response);
  })

  getLastActive(defaultAccount).then((response) => {
    time = timeConverter(response)
    $("#last_active").html(time)
  });
});

// Allows switching between accounts in 'My Account' and the 'fast-copy' in 'Address of person you owe
provider.listAccounts().then((response) => {
  var opts = response.map(function (a) {
    return '<option value="' +
      a.toLowerCase() + '">' + a.toLowerCase() + '</option>'
  });
  $(".account").html(opts);
  $(".wallet_addresses").html(response.map(function (a) { return '<li>' + a.toLowerCase() + '</li>' }));
});

// This code updates the 'Users' list in the UI with the results of your function
getUsers().then((response) => {
  $("#all_users").html(response.map(function (u, i) { return "<li>" + u + "</li>" }));
});

// This runs the 'add_IOU' function when you click the button
// It passes the values from the two inputs above
$("#addiou").click(function () {
  defaultAccount = $("#myaccount").val(); //sets the default account
  add_IOU($("#creditor").val(), $("#amount").val()).then(() => {
    window.location.reload(false); // refreshes the page after add_IOU returns and the promise is unwrapped
  })
});

// This is a log function, provided if you want to display things to the page instead of the JavaScript console
// Pass in a discription of what you're printing, and then the object to print
function log(description, obj) {
  $("#log").html($("#log").html() + description + ": " + JSON.stringify(obj, null, 2) + "\n\n");
}


// =============================================================================
//                                      TESTING
// =============================================================================

// This section contains a sanity check test that you can use to ensure your code
// works. We will be testing your code this way, so make sure you at least pass
// the given test. You are encouraged to write more tests!

// Remember: the tests will assume that each of the four client functions are
// async functions and thus will return a promise. Make sure you understand what this means.

function check(name, condition) {
  if (condition) {
    console.log(name + ": SUCCESS");
    return 3;
  } else {
    console.log(name + ": FAILED");
    return 0;
  }
}

async function sanityCheck() {
  console.log("\nTEST", "Simplest possible test: only runs one add_IOU; uses all client functions: lookup, getTotalOwed, getUsers, getLastActive");

  var score = 0;

  var accounts = await provider.listAccounts();
  defaultAccount = accounts[0];

  var users = await getUsers();
  score += check("getUsers() initially empty", users.length === 0);

  var owed = await getTotalOwed(accounts[1]);
  score += check("getTotalOwed(0) initially empty", owed === 0);

  var lookup_0_1 = await BlockchainSplitwise.lookup(accounts[0], accounts[1]);
  console.log("lookup(0, 1) current value" + lookup_0_1);
  score += check("lookup(0,1) initially 0", parseInt(lookup_0_1, 10) === 0);

  var response = await add_IOU(accounts[1], "10");

  users = await getUsers();
  score += check("getUsers() now length 2", users.length === 2);

  owed = await getTotalOwed(accounts[0]);
  score += check("getTotalOwed(0) now 10", owed === 10);

  lookup_0_1 = await BlockchainSplitwise.lookup(accounts[0], accounts[1]);
  score += check("lookup(0,1) now 10", parseInt(lookup_0_1, 10) === 10);

  var timeLastActive = await getLastActive(accounts[0]);
  var timeNow = Date.now() / 1000;
  var difference = timeNow - timeLastActive;
  score += check("getLastActive(0) works", difference <= 60 && difference >= -3); // -3 to 60 seconds

  console.log("Final Score: " + score + "/21");
}

// sanityCheck() //Uncomment this line to run the sanity check when you first open index.html
