// Import necessary modules
var validator = require("../utils/validator");

// Define blockchain constructor function
var blockchain = function blockchain() {
  var self = this;

  // Define public functions
  this.init = init;
  this.newBlock = newBlock;
  this.newTransaction = newTransaction;
  this.getChain = getChain;
  this.checkChain = checkChain;
  this.mine = mine;

  // Define blockchain properties
  this.chain;
  this.currentTransactions;

  // Initialize blockchain
  function init() {
    self.chain = [];
    self.currentTransactions = [];
    _buildGenesisBlock();
  }

  // Check if the chain is empty
  function _isChainEmpty() {
    return self.chain.length === 0;
  }

  // Check if the genesis block is invalid
  function _isGenesisBlockInvalid() {
    const genesisBlock = self.chain[0];
    return genesisBlock.index !== 1 || genesisBlock.previousHash !== "0";
  }

  // Check if the previous hash between blocks is invalid
  function _isHashesBetweenBlocksInvalid(currentBlock, previousBlock) {
    return (
      currentBlock.previousHash !==
      validator.calculateHash(previousBlock.transaction[0])
    );
  }

  // Check if the proof of work is invalid
  function _isProofOfWorkInvalid(currentBlock, previousBlock) {
    return !_validateProofOfWork(
      previousBlock.transaction[0],
      currentBlock.proof
    );
  }

  function _validateProofOfWork(transaction, proof) {
    console.log(
      "validator.generateProof(transaction)",
      validator.generateProof(transaction)
    );
    const calculatedProof = validator.generateProof(transaction);
    const isValidProofMatch = proof === calculatedProof;

    return isValidProofMatch;
  }

  function _generateGenesisTransaction() {
    return newTransaction(0, "192.168.1.1:9999", 0);
  }

  // Build the genesis block
  function _buildGenesisBlock() {
    const transaction = _generateGenesisTransaction();
    var proof = validator.generateProof(transaction);
    var previousHash = "0";
    self.newBlock(proof, previousHash);
  }

  // Get the chain
  function getChain() {
    return self.chain;
  }

  // Mine a new block
  function mine(miner) {
    var lastBlock = self.chain[self.chain.length - 1];
    var transaction = newTransaction(0, miner, miner.amount);
    var proof = validator.generateProof(transaction);
    var previousHash = validator.calculateHash(lastBlock.transaction[0]);
    return newBlock(proof, previousHash);
  }

  // Create a new block
  function newBlock(proof, previousHash) {
    var lastBlock = self.chain[self.chain.length - 1];
    var block = {
      index: self.chain.length + 1,
      timestamp: new Date().getTime(),
      transaction: self.currentTransactions,
      proof: proof,
      hash: validator.calculateHash(self.currentTransactions[0]),
      previousHash: lastBlock ? previousHash : "0",
    };
    self.currentTransactions = [];
    self.chain.push(block);
    return block;
  }

  // Create a new transaction
  function newTransaction(sender, receiver, amount) {
    var transaction = {
      sender: sender,
      receiver: receiver,
      amount: amount,
    };
    self.currentTransactions.push(transaction);
    return transaction;
  }

  // Check the integrity of the blockchain
  function checkChain() {
    if (_isChainEmpty()) {
      console.log("The chain is empty.");
      return [];
    }

    if (_isGenesisBlockInvalid()) {
      console.log("Invalid genesis block.");
      return [];
    }

    for (let i = 1; i < self.chain.length; i++) {
      const currentBlock = self.chain[i];
      const previousBlock = self.chain[i - 1];

      if (_isHashesBetweenBlocksInvalid(currentBlock, previousBlock)) {
        console.log(`Block ${currentBlock.index} has an invalid previousHash.`);
        return [];
      }

      if (_isProofOfWorkInvalid(currentBlock, previousBlock)) {
        console.log(
          `Proof of work for block ${currentBlock.index} is invalid.`
        );
        return [];
      }
    }

    console.log("The chain is valid.");
    return self.chain;
  }

  // Ensure singleton pattern
  if (blockchain.caller != blockchain.getInstance) {
    throw new Error("This object cannot be instantiated");
  }
};

// Implement the singleton pattern
blockchain.instance = null;
blockchain.getInstance = function () {
  if (this.instance === null) {
    this.instance = new blockchain();
  }
  return this.instance;
};

// Export the singleton instance
module.exports = blockchain.getInstance();
