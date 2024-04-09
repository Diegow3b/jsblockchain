const assert = require("assert");
const blockchain = require("../model/blockchain");

describe("Blockchain", function () {
  beforeEach(function () {
    // Reinitialize the blockchain before each test
    blockchain.init();
  });

  it("should initialize with a genesis block", function () {
    const chain = blockchain.getChain();
    assert.strictEqual(chain.length, 1); // Only the genesis block should exist
    const genesisBlock = chain[0];
    assert.strictEqual(genesisBlock.index, 1); // Genesis block should have index 1
    assert.strictEqual(genesisBlock.previousHash, "0"); // Genesis block's previous hash should be '0'
  });

  it("should create a new block", function () {
    blockchain.newTransaction("sender1", "receiver1", 10);
    blockchain.mine("miner1");

    const chain = blockchain.getChain();
    assert.strictEqual(chain.length, 2); // Genesis block + newly mined block
    const newBlock = chain[1];
    assert.strictEqual(newBlock.index, 2); // Index should be 2 for the new block
  });

  it("should validate the chain", function () {
    // Add transactions and mine blocks
    blockchain.newTransaction("sender1", "receiver1", 10);
    blockchain.mine("miner1");

    blockchain.newTransaction("sender2", "receiver2", 20);
    blockchain.mine("miner2");

    // Validate the chain
    blockchain.checkChain();
    assert.strictEqual(blockchain.chain.length, 3); // Genesis block + 2 mined blocks
  });

  it("should invalidate chain with incorrect proof of work", function () {
    // Add transactions and mine a block
    blockchain.newTransaction("sender1", "receiver1", 10);
    blockchain.mine("miner1");

    // Manipulate proof of work
    blockchain.chain[1].proof = 12345;

    // Validate the chain
    const chain = blockchain.checkChain();
    assert.strictEqual(chain.length, 0); // Chain should be invalidated
  });

  it("should invalidate chain with incorrect previous hash", function () {
    // Add transactions and mine blocks
    blockchain.newTransaction("sender1", "receiver1", 10);
    blockchain.mine("miner1");

    blockchain.newTransaction("sender2", "receiver2", 20);
    blockchain.mine("miner2");

    // Manipulate previous hash
    blockchain.chain[1].previousHash = "invalidhash";

    // Validate the chain
    const validatedChain = blockchain.checkChain();
    assert.strictEqual(validatedChain.length, 0); // Chain should be invalidated
  });
});
