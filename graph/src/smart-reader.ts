import {
  AnnotationAdded as AnnotationAddedEvent,
  ContractAdded as ContractAddedEvent,
} from '../generated/SmartReader/SmartReader';
import { Annotation, Contract } from '../generated/schema';
import { log, dataSource, crypto, ByteArray } from '@graphprotocol/graph-ts';

export function handleContractAdded(event: ContractAddedEvent): void {
  let contract = new Contract(event.params.addedContract.toHexString());
  log.info('handleContractAdded {}', [
    event.params.addedContract.toHexString(),
  ]);

  contract.network = dataSource.network();
  contract.smartReaderContract = event.address;
  contract.createdAt = event.block.timestamp;
  contract.blockNumber = event.block.number;
  contract.transactionHash = event.transaction.hash;
  contract.blockTimestamp = event.block.timestamp;
  contract.address = event.params.addedContract;
  contract.ipfsSchema = event.params.explanation;
  contract.blockNumber = event.block.number;
  contract.blockTimestamp = event.block.timestamp;
  contract.transactionHash = event.transaction.hash;
  contract.Annotations = [];

  contract.save();
}

export function handleAnnotationAdded(event: AnnotationAddedEvent): void {
  let contract = Contract.load(event.params.parentContract.toHexString());
  log.info('handleAnnotationAdded {}', [
    event.params.parentContract.toHexString(),
  ]);
  if (contract != null) {
    let annotation = new Annotation(event.transaction.hash.toHexString());
    log.info('lizard {}', [event.transaction.hash.toHexString()]);
    annotation.parentContract = event.params.parentContract;
    annotation.blockNumber = event.block.number;
    annotation.blockTimestamp = event.block.timestamp;
    annotation.transactionHash = event.transaction.hash;
    annotation.functionId = event.params.functionId;
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
