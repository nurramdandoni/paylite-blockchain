const SHA256 = require('crypto-js/sha256');
const elliptic = require('elliptic');
const ec = new elliptic.ec('secp256k1'); // Kurva eliptis Bitcoin

const PayliteAddress = '04ef1c5f1fdd3382da501b8d29aaf734371d5ca06e3002b5cbf8921b3db7f9d5be148473190a1e6b6fa419a43bd087c2e3f804ca414d13933765e005841dcf0ffc';
const PaylitePrivate = 'da1b01fc5300efa4d8adc9686465313150097bac64e966b22bac144122b70e98';

class Transaction {
  constructor(sender, recipient, amount, message = '') {
    this.sender = sender;
    this.recipient = recipient;
    this.amount = amount;
    this.timestamp = Date.now();
    this.signature = '';
    this.message = message;
  }

  calculateHash() {
    return SHA256(
      this.sender + this.recipient + this.amount + this.timestamp + this.message
    ).toString();
  }

  signTransaction(privateKey) {
    const dataToSign = this.calculateHash();
    const signature = ec.sign(dataToSign, privateKey, 'hex');
    this.signature = signature.toDER('hex');
  }

  isValid() {
    if (!this.signature || this.signature === '') {
      return false;
    }
    const dataToVerify = this.calculateHash();
    return ec.verify(dataToVerify, this.signature, this.sender, 'hex');
  }
}

class Block {
  constructor(timestamp, transactions, previousHash = '') {
    this.timestamp = timestamp;
    this.transactions = transactions;
    this.previousHash = previousHash;
    this.nonce = 0;
    this.hash = this.calculateHash();
  }

  calculateHash() {
    return SHA256(
      this.timestamp +
      JSON.stringify(this.transactions) +
      this.previousHash +
      this.nonce
    ).toString();
  }

  mineBlock(difficulty) {
    while (
      this.hash.substring(0, difficulty) !== Array(difficulty + 1).join('0')
    ) {
      this.nonce++;
      this.hash = this.calculateHash();
    //   console.log("calculate nounce : "+ this.nounce + " hash : "+ this.hash);
    }
    console.log('Block mined: ' + this.hash);
  }
}

class Blockchain {
  constructor() {
    this.chain = [this.createGenesisBlock()];
    this.difficulty = 3;
    this.pendingTransactions = [];
    this.miningReward = 1;
  }

  createGenesisBlock() {
    return new Block(Date.now(), "Blok Pertama Paylite Blockchain", '0');
  }

  getLatestBlock() {
    return this.chain[this.chain.length - 1];
  }

  minePendingTransactions(miningRewardAddress) {
    const rewardTransaction = new Transaction(
      null,
      miningRewardAddress,
      this.miningReward
    );
    this.pendingTransactions.push(rewardTransaction);

    const block = new Block(
      Date.now(),
      this.pendingTransactions,
      this.getLatestBlock().hash
    );

    block.mineBlock(this.difficulty);

    this.chain.push(block);
    this.pendingTransactions = [];
  }

  createTransaction(transaction) {
    // pengecekan dinonaktifkan karena blockchain dijadikan sebagai ledger bukan sebagai wallet

    // const senderBalance = this.getBalanceOfAddress(transaction.sender);
    // if (senderBalance >= transaction.amount) {
      transaction.signTransaction(transaction.senderPrivateKey);
      this.pendingTransactions.push(transaction);
    // } else {
    //   console.log('Saldo pengirim tidak mencukupi. Transaksi dibatalkan.');
    // }
  }

  getBalanceOfAddress(address) {
    let balance = 0;
    for (const block of this.chain) {
      for (const transaction of block.transactions) {
        if (transaction.sender === address) {
          balance -= transaction.amount;
        }
        if (transaction.recipient === address) {
          balance += transaction.amount;
        }
      }
    }
    return balance;
  }

  isChainValid() {
    for (let i = 1; i < this.chain.length; i++) {
      const currentBlock = this.chain[i];
      const previousBlock = this.chain[i - 1];

      if (currentBlock.hash !== currentBlock.calculateHash()) {
        return false;
      }

      if (currentBlock.previousHash !== previousBlock.hash) {
        return false;
      }
    }

    return true;
  }
}

// Buat pasangan kunci (keypair) untuk pengguna
const user1KeyPair = ec.genKeyPair();
const user1Address = user1KeyPair.getPublic('hex');
const user1Private = user1KeyPair.getPrivate('hex');
console.log(` 
user1 key : ${user1KeyPair} 
user1 Adress : ${user1Address}
user1 Private : ${user1Private}
`);

const user2KeyPair = ec.genKeyPair();
const user2Address = user2KeyPair.getPublic('hex');
const user2Private = user2KeyPair.getPrivate('hex');
console.log(` 
user2 key : ${user2KeyPair} 
user2 Adress : ${user2Address}
user2 Private : ${user2Private}
`);

const myBlockchain = new Blockchain();

// Transaksi: User1 deposit ke paylite paylite mengisi saldo user 1
const transactionDeposit = new Transaction(PayliteAddress, user1Address, 500);
transactionDeposit.senderPrivateKey = PaylitePrivate; // Set kunci pribadi pengirim

// Menambahkan transaksi ke dalam rantai
myBlockchain.createTransaction(transactionDeposit);

// Menambang blok untuk memasukkan transaksi ke dalam blockchain
myBlockchain.minePendingTransactions('my-Minner');

// Transaksi: User1 mengirim 50 unit kepada User2
const transaction = new Transaction(user1Address, user2Address, 50);
transaction.senderPrivateKey = user1KeyPair.getPrivate('hex'); // Set kunci pribadi pengirim

// Menambahkan transaksi ke dalam rantai
myBlockchain.createTransaction(transaction);

// Menambang blok untuk memasukkan transaksi ke dalam blockchain
myBlockchain.minePendingTransactions('my-minner');

console.log('Is blockchain valid?', myBlockchain.isChainValid());
console.log('Balance of user1:', myBlockchain.getBalanceOfAddress(user1Address));
console.log('Balance of user2:', myBlockchain.getBalanceOfAddress(user2Address));
console.log('Balance of my-minner:', myBlockchain.getBalanceOfAddress('my-minner'));
