const express = require('express');
const app = express();
const port = 3000; // Ganti dengan port yang Anda inginkan

// Import Blockchain class and Transaction class
const { Blockchain, Transaction } = require('./blockchain-mining-example'); // Sesuaikan dengan lokasi berkas blockchain Anda

const myCoin = new Blockchain();

// Middleware untuk mengizinkan JSON dalam permintaan
app.use(express.json());

// Endpoint untuk mendapatkan saldo alamat
app.get('/balance/:address', (req, res) => {
  const address = req.params.address;
  const balance = myCoin.getBalanceOfAddress(address);
  res.json({ balance: balance });
});

// Endpoint untuk membuat transaksi baru
app.post('/transaction', (req, res) => {
  const fromAddress = req.body.fromAddress;
  const toAddress = req.body.toAddress;
  const amount = req.body.amount;
  const message = req.body.message;

  const transaction = new Transaction(fromAddress, toAddress, amount, message);
  myCoin.createTransaction(transaction);

  res.json({ message: 'Transaction added to pending transactions.' });
});

// Endpoint untuk menambang blok
app.get('/mine', (req, res) => {
  const miningRewardAddress = req.query.rewardAddress || 'my-reward-address';
  myCoin.minePendingTransactions(miningRewardAddress);
  res.json({ message: 'Mining completed.' });
});

// Endpoint untuk mendapatkan rantai blockchain
app.get('/blockchain', (req, res) => {
  res.json(myCoin);
});

// Endpoint untuk memeriksa kevalidan rantai blockchain
app.get('/validate', (req, res) => {
  const isValid = myCoin.isChainValid();
  res.json({ isValid });
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
