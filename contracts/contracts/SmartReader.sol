// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

// import 'hardhat/console.sol';

contract SmartReader {
    address public owner;

    event ContractAdded(address addedContract, string explanation);
    event AnnotationAdded(
        address parentContract,
        uint256 functionId,
        string annotation
    );

    mapping(address => string) public contractStorage;

    constructor() {
        owner = msg.sender;
    }

    function addContract(
        address newContract,
        string memory explanation
    ) public {
        require(
            bytes(contractStorage[newContract]).length == 0,
            'Contract already exists'
        );
        contractStorage[newContract] = explanation;
        emit ContractAdded(newContract, explanation);
    }

    function addAnnotation(
        address parentContract,
        uint256 functionId,
        string memory annotation
    ) public {
        require(
            bytes(contractStorage[parentContract]).length != 0,
            'Contract does not exist'
        );

        emit AnnotationAdded(parentContract, functionId, annotation);
    }
}
