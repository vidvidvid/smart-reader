const { expect } = require('chai');
const { ethers } = require('hardhat');

describe('SmartReader', function () {
  let smartReader;
  let owner;

  beforeEach(async function () {
    [owner] = await ethers.getSigners();
    const SmartReader = await ethers.getContractFactory('SmartReader');
    smartReader = await SmartReader.deploy();
    await smartReader.deployed();
  });

  describe('Contract Storage Interactions', function () {
    it('should add a new contract with an explanation', async function () {
      const newContract = '0x1234567890123456789012345678901234567890';
      const subContractName = 'subContract1';
      const explanation = 'This is a new contract';
      await smartReader.addContract(newContract, subContractName, explanation);
      const result = await smartReader.contractStorage(
        newContract,
        subContractName
      );
      expect(result).to.equal(explanation);
    });

    it('should emit a ContractAdded event', async function () {
      const newContract = '0x1234567890123456789012345678901234567890';
      const subContractName = 'subContract1';
      const explanation = 'This is a new contract';

      const tx = await smartReader.addContract(
        newContract,
        subContractName,
        explanation
      );
      const receipt = await tx.wait();
      const event = receipt.events.find((e) => e.event === 'ContractAdded');
      expect(event.args.mainContract).to.equal(newContract);
      expect(event.args.subContractName).to.equal(subContractName);
      expect(event.args.explanation).to.equal(explanation);
    });

    it('should revert if the contract explanation already exists', async function () {
      const newContract = '0x1234567890123456789012345678901234567890';
      const subContractName = 'subContract1';
      const explanation = 'This is a new contract';
      await smartReader.addContract(newContract, subContractName, explanation);
      await expect(
        smartReader.addContract(newContract, subContractName, explanation)
      ).to.be.revertedWith('Explanation already exists');
    });

    it('should emit an AnnotationAdded event', async function () {
      const parentContract = '0x1234567890123456789012345678901234567890';
      const subContractName = 'subContract1';
      const annotation = 'This is an annotation';
      await smartReader.addContract(
        parentContract,
        subContractName,
        'Parent contract'
      );
      const tx = await smartReader.addAnnotation(
        parentContract,
        subContractName,
        annotation
      );
      const receipt = await tx.wait();
      const event = receipt.events.find((e) => e.event === 'AnnotationAdded');
      expect(event.args.parentContract).to.equal(parentContract);
      expect(event.args.functionId).to.equal(subContractName);
      expect(event.args.annotation).to.equal(annotation);
    });

    it('should revert if the parent contract does not exist', async function () {
      const nonExistentContract = '0x0000000000000000000000000000000000000000';
      const subContractName = 'subContract1';
      const annotation = 'This is an annotation';

      await expect(
        smartReader.addAnnotation(
          nonExistentContract,
          subContractName,
          annotation
        )
      ).to.be.revertedWith('Contract does not exist');
    });
    it('should revert if the sub-contract name does not exist', async function () {
      const parentContract = '0x1234567890123456789012345678901234567890';
      const nonExistentSubContractName = 'nonexistent';

      await expect(
        smartReader.addAnnotation(
          parentContract,
          nonExistentSubContractName,
          'Some annotation'
        )
      ).to.be.revertedWith('Contract does not exist');
    });
  });
});
