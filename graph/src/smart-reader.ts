import {
  AnnotationAdded as AnnotationAddedEvent,
  ContractAdded as ContractAddedEvent,
} from '../generated/SmartReader/SmartReader';
import { Annotation, Contract, subContract } from '../generated/schema';
import { log, dataSource } from '@graphprotocol/graph-ts';

export function handleContractAdded(event: ContractAddedEvent): void {
  let contract = Contract.load(event.params.mainContract.toHexString());

  if (contract == null) {
    contract = new Contract(event.params.mainContract.toHexString());
    contract.network = dataSource.network();
    contract.smartReaderContract = event.address;
    contract.createdAt = event.block.timestamp;
    contract.blockNumber = event.block.number;
    contract.transactionHash = event.transaction.hash;
    contract.blockTimestamp = event.block.timestamp;
    contract.mainContractAddress = event.params.mainContract;
    contract.subContracts = [];
    contract.Annotations = [];
  }

  let subContractId =
    event.params.mainContract.toHexString() +
    '/' +
    event.params.subContractName;
  let subContractEntity = new subContract(subContractId);
  log.info('subContractId {}', [subContractId]);
  subContractEntity.smartReaderContract = event.address;
  subContractEntity.mainContract = event.params.mainContract;
  subContractEntity.subContractName = event.params.subContractName;
  subContractEntity.network = dataSource.network();
  subContractEntity.createdAt = event.block.timestamp;
  subContractEntity.blockNumber = event.block.number;
  subContractEntity.transactionHash = event.transaction.hash;
  subContractEntity.blockTimestamp = event.block.timestamp;
  subContractEntity.ipfsSchema = event.params.explanation;

  subContractEntity.save();

  let subContracts = contract.subContracts;
  subContracts.push(subContractEntity.id);
  contract.subContracts = subContracts;
  contract.save();
}

export function handleAnnotationAdded(event: AnnotationAddedEvent): void {
  let contract = Contract.load(event.params.mainContract.toHexString());
  log.info('handleAnnotationAdded {}', [
    event.params.mainContract.toHexString(),
  ]);
  if (contract != null) {
    let annotation = new Annotation(event.transaction.hash.toHexString());
    log.info('lizard {}', [event.transaction.hash.toHexString()]);
    annotation.mainContract = event.params.mainContract;
    annotation.blockNumber = event.block.number;
    annotation.blockTimestamp = event.block.timestamp;
    annotation.transactionHash = event.transaction.hash;
    annotation.subContractName = event.params.subContractName;
    annotation.annotation = event.params.annotation;
    log.info('funk {}', [event.params.annotation]);
    annotation.createdAt = event.block.timestamp;

    annotation.save();

    let annotations = contract.Annotations;
    annotations.push(annotation.id);
    contract.Annotations = annotations;
    contract.save();
  }
}
