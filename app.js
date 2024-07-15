let web3;
let contract;
const contractAddress = "0xe275eD36af4bea727224a545591c483ea1128FF9"; // Dağıtılmış sözleşmenizin adresi
const contractABI = [
    {
        "inputs": [],
        "stateMutability": "payable",
        "type": "constructor"
    },
    {
        "inputs": [],
        "name": "getBalance",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "setSecretNumber",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "uint8",
                "name": "_number",
                "type": "uint8"
            }
        ],
        "name": "guess",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "owner",
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
        "inputs": [],
        "name": "fundContract",
        "outputs": [],
        "stateMutability": "payable",
        "type": "function"
    },
    {
        "anonymous": false,
        "inputs": [
            {
                "indexed": true,
                "internalType": "address",
                "name": "player",
                "type": "address"
            },
            {
                "indexed": false,
                "internalType": "bool",
                "name": "success",
                "type": "bool"
            }
        ],
        "name": "GuessMade",
        "type": "event"
    }
];

async function connectWallet() {
    if (window.ethereum) {
        web3 = new Web3(window.ethereum);
        try {
            await window.ethereum.request({ method: 'eth_requestAccounts' });
            document.getElementById('connectButton').style.display = 'none';
            document.getElementById('disconnectButton').style.display = 'block';
            document.getElementById('walletInfo').style.display = 'block';
            const accounts = await web3.eth.getAccounts();
            document.getElementById('account').textContent = accounts[0];
            contract = new web3.eth.Contract(contractABI, contractAddress);
            updateBalance();
        } catch (error) {
            console.error("User denied account access", error);
        }
    } else {
        console.error("Non-Ethereum browser detected. Consider trying MetaMask!");
    }
}

async function disconnectWallet() {
    web3 = null;
    contract = null;
    document.getElementById('connectButton').style.display = 'block';
    document.getElementById('disconnectButton').style.display = 'none';
    document.getElementById('walletInfo').style.display = 'none';
    document.getElementById('account').textContent = '';
    document.getElementById('balance').textContent = '';
}

async function updateBalance() {
    try {
        const balance = await contract.methods.getBalance().call();
        document.getElementById('balance').textContent = web3.utils.fromWei(balance, 'ether');
    } catch (error) {
        console.error("Error updating balance:", error);
    }
}

document.getElementById('connectButton').addEventListener('click', connectWallet);
document.getElementById('disconnectButton').addEventListener('click', disconnectWallet);

document.getElementById('guessButton').addEventListener('click', async () => {
    const guess = document.getElementById('guessInput').value;
    const accounts = await web3.eth.getAccounts();
    try {
        console.log(`Submitting guess: ${guess}, Account: ${accounts[0]}`);
        const receipt = await contract.methods.guess(guess).send({ from: accounts[0] });
        document.getElementById('message').textContent = "Guess submitted!";
        // Check guess result
        const event = receipt.events.GuessMade;
        if (event.returnValues.success) {
            document.getElementById('message').textContent = "Congratulations! You guessed correctly!";
        } else {
            document.getElementById('message').textContent = "Sorry, wrong guess. Try again!";
        }
        updateBalance();
    } catch (error) {
        document.getElementById('message').textContent = "Error submitting guess.";
        console.error("Error submitting guess:", error);
    }
});

// Matrix Animation
const canvas = document.getElementById('matrixCanvas');
const ctx = canvas.getContext('2d');

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const letters = Array(256).join(1).split('');
const draw = () => {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#0F0';
    letters.map((y_pos, index) => {
        const text = String.fromCharCode(1e2 + Math.random() * 33);
        const x_pos = index * 10;
        ctx.fillText(text, x_pos, y_pos);
        letters[index] = y_pos > 758 + Math.random() * 1e4 ? 0 : y_pos + 10;
    });
};
setInterval(draw, 33);

window.addEventListener('resize', () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
});
