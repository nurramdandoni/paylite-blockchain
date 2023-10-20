// 
const SHA256 = require('crypto-js/sha256');

class Transaction{
    constructor(fromAddress,toAddress, amount, message = ''){
        this.fromAddress = fromAddress;
        this.toAddress = toAddress;
        this.amount = amount;
        this.message = message;
    }

}
class Block{
    constructor(timestamp, transactions, preveousHash = ''){
        this.timestamp = timestamp;
        this.transactions = transactions;
        this.preveousHash = preveousHash;
        this.hash = this.calculateHash();
        this.nounce = 0;
    }

    calculateHash(){
        return SHA256(this.index + this.preveousHash + this.timestamp + JSON.stringify(this.transactions) + this.nounce).toString();
    }

    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    async mineBlock(dificulty){
        while(this.hash.substring(0, dificulty) !== Array(dificulty + 1).join("0")){
            this.nounce++;
            this.hash = this.calculateHash();
            console.log("calculate nounce : "+ this.nounce + " hash : "+ this.hash);
            await this.sleep(100);
        }
        console.log("Block Mined: "+ this.hash);
    }
}

class Blockchain{
    constructor(){
        this.chain = [this.createGenesisBlock()];
        this.dificulty = 2;
        this.pendingTransactions = [];
        this.minningReward = 5;
    }

    createGenesisBlock(){
        return new Block("20/10/2023", "Blok Pertama Paylite", "0");
    }

    getLatestBlock(){
        return this.chain[this.chain.length - 1];
    }

    minePendingTransactions(minningRewardAdress){
        let block = new Block(Date.now(), this.pendingTransactions, this.getLatestBlock().hash);
        block.mineBlock(this.dificulty);

        console.log("Block Successfully Mined!");
        this.chain.push(block);

        this.pendingTransactions = [
            new Transaction(null, minningRewardAdress, this.minningReward)
        ];
    }

    createTransaction(transaction){
        this.pendingTransactions.push(transaction);
    }

    getBalanceOfAddress(address){
        let balance = 0;
        for(const block of this.chain){
            for(const trans of block.transactions){
                if(trans.fromAddress === address){
                    balance -= trans.amount;
                }

                if(trans.toAddress === address){
                    balance += trans.amount;
                }
            }
        }

        return balance;
    }

    isChainValid(){
        for(let i = 1; i < this.chain.length; i++){
            const currentBlock = this.chain[i];
            const preveousBlock = this.chain[i - 1];

            if(currentBlock.hash !== currentBlock.calculateHash()){
                return false;
            }

            if(currentBlock.preveousHash !== preveousBlock.hash){
                return false;
            }
        }
        return true;
    }

    
}
// Contoh penggunaan blockchain
const myCoin = new Blockchain();

myCoin.createTransaction(new Transaction('address1', 'address2', 100));
myCoin.createTransaction(new Transaction('address2', 'address1', 50));

console.log('Memulai proses penambangan...');
myCoin.minePendingTransactions('my-reward-address');

console.log('\nSaldo alamat address1: ' + myCoin.getBalanceOfAddress('address1'));
console.log('Saldo alamat address2: ' + myCoin.getBalanceOfAddress('address2'));
console.log('Saldo alamat my-reward-address: ' + myCoin.getBalanceOfAddress('my-reward-address'));

console.log('\nMemulai proses penambangan lagi...');
myCoin.minePendingTransactions('my-reward-address');

console.log('\nSaldo alamat my-reward-address setelah penambangan kedua: ' + myCoin.getBalanceOfAddress('my-reward-address'));

console.log('\nIs blockchain valid? ' + myCoin.isChainValid());