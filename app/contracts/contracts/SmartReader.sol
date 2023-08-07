// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

contract SmartReader {
    address public owner;

    event ContractAdded(
        address mainContract,
        string subContractName,
        string explanation
    );
    event AnnotationAdded(
        address mainContract,
        string subContractName,
        string annotation
    );

    mapping(address => mapping(string => string)) public contractStorage;

    constructor() {
        owner = msg.sender;
    }

    function addContract(
        address mainContract,
        string memory subContractName,
        string memory explanation
    ) public {
        require(
            bytes(contractStorage[mainContract][subContractName]).length == 0,
            'Explanation already exists'
        );
        contractStorage[mainContract][subContractName] = explanation;
        emit ContractAdded(mainContract, subContractName, explanation);
    }

    function addAnnotation(
        address mainContract,
        string memory subContractName,
        string memory annotation
    ) public {
        require(
            bytes(contractStorage[mainContract][subContractName]).length != 0,
            'annotation already exists'
        );

        emit AnnotationAdded(mainContract, subContractName, annotation);
    }
}
