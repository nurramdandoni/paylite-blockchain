const SHA256 = require('crypto-js/sha256');

class Block{
    constructor(index, timestamp, data, preveousHash = ''){
        this.index = index;
        this.timestamp = timestamp;
        this.data = data;
        this.preveousHash = preveousHash;
        this.hash = this.calculateHash();
    }

    calculateHash(){
        return SHA256(this.index + this.preveousHash + this.timestamp + JSON.stringify(this.data)).toString();
    }
}

class Blockchain{
    constructor(){
        this.chain = [this.createGenesisBlock()];
    }

    createGenesisBlock(){
        return new Block(0, "20/10/2023", "Blok Pertama Paylite");
    }

    getLatestBlock(){
        return this.chain[this.chain.length - 1];
    }

    addBlock(newBlock){
        newBlock.preveousHash = this.getLatestBlock().hash;
        newBlock.hash = newBlock.calculateHash();
        this.chain.push(newBlock);
    }

    chainValidate(){
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
let newTransactionTest = new Blockchain(); // membuat genesis block
newTransactionTest.addBlock(new Block(1,"20/10/2023",{amount:10000, from:"Paylite Counter",to:"Diana Sandia",message:"Witdrawal Account Wallet"}));
newTransactionTest.addBlock(new Block(2,"20/10/2023",{amount:20000, from:"David Beckam",to:"Paylite Counter",message:"Deposit Account Wallet"}));

console.log("Block Chain Status : " + newTransactionTest.chainValidate());

newTransactionTest.chain[1].data = {amount:100000, from:"Paylite Counter",to:"Diana Sandia",message:"Witdrawal Account Wallet"} // test tampering merubah transaksi
console.log("Block Chain Status : " + newTransactionTest.chainValidate());
// console.log(JSON.stringify(newTransactionTest));