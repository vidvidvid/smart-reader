const { expect } = require('chai');
const { ethers } = require('hardhat');

describe('SmartReader', function () {
  let smartReader;
  let owner;
  const explanation = 'This is a new contract';

  beforeEach(async function () {
    [owner] = await ethers.getSigners();
    const SmartReader = await ethers.getContractFactory('SmartReader');
    smartReader = await SmartReader.deploy();
    await smartReader.deployed();
  });

  describe('Contract Storage Interactions', function () {
    it('should add a new contract with an explanation', async function () {
      const newContract = '0x1234567890123456789012345678901234567890';
      await smartReader.addContract(newContract, explanation);
      const result = await smartReader.contractStorage(newContract);
      expect(result).to.equal(explanation);
    });

    it('should emit a ContractAdded event', async function () {
      const newContract = '0x1234567890123456789012345678901234567890';

      const tx = await smartReader.addContract(newContract, explanation);
      const receipt = await tx.wait();
      const event = receipt.events.find((e) => e.event === 'ContractAdded');
      expect(event.args.parentContract).to.equal(newContract);
      expect(event.args.explanation).to.equal(explanation);
    });

    it('should revert if the contract already exists', async function () {
      const newContract = '0x1234567890123456789012345678901234567890';
      await smartReader.addContract(newContract, explanation);
      await expect(
        smartReader.addContract(newContract, explanation)
      ).to.be.revertedWith('Contract already exists');
    });
    it('should emit an AnnotationAdded event', async function () {
      const parentContract = '0x1234567890123456789012345678901234567890';
      const annotation = 'ipfsHash. changed to multihash later on';
      const functionId = 42;
      await smartReader.addContract(parentContract, explanation);
      const tx = await smartReader.addAnnotation(
        parentContract,
        functionId,
        annotation
      );
      const receipt = await tx.wait();
      const event = receipt.events.find((e) => e.event === 'AnnotationAdded');
      expect(event.args.parentContract).to.equal(parentContract);
      expect(event.args.functionId).to.equal(functionId);
    });
    it('should revert if the parent contract does not exist', async function () {
      const nonExistentContract = '0x0000000000000000000000000000000000000000';
      const functionId = 42;
      const annotation = 'ipfsHash of annotation';

      await expect(
        smartReader.addAnnotation(nonExistentContract, functionId, annotation)
      ).to.be.revertedWith('Contract does not exist');
    });
  });
});
