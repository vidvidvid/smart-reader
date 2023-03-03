import {
  AnnotationAdded as AnnotationAddedEvent,
  ContractAdded as ContractAddedEvent
} from "../generated/SmartReader/SmartReader"
import { Annotation, Contract} from "../generated/schema"
import { log, dataSource, Address } from '@graphprotocol/graph-ts';


export function handleContractAdded(event: ContractAddedEvent): void {
  let contract = new Contract(
    event.address.toHexString()
  )
  log.info('handleContractAdded {}', [event.params.parentContract.toHexString()]);
  contract.network = dataSource.network()
  contract.createdAt = event.block.timestamp
  contract.blockNumber = event.block.number
  contract.transactionHash = event.transaction.hash
  contract.blockTimestamp = event.block.timestamp
  contract.address = event.params.parentContract
  contract.ipfsSchema = event.params.explanation
  contract.blockNumber = event.block.number
  contract.blockTimestamp = event.block.timestamp
  contract.transactionHash = event.transaction.hash
  contract.Annotations = []

  contract.save()
}


export function handleAnnotationAdded(event: AnnotationAddedEvent): void {
  let contract = Contract.load(event.params.parentContract.toHexString())
  log.info('handleAnnotationAdded {}', [event.params.parentContract.toHexString()]);
  let annotation = new Annotation(
    event.transaction.hash.toHexString()
  )
  annotation.parentContract = event.params.parentContract
  annotation.blockNumber = event.block.number
  annotation.blockTimestamp = event.block.timestamp
  annotation.transactionHash = event.transaction.hash
  annotation.functionId = event.params.functionId
  annotation.annotation = event.params.annotation
  annotation.createdAt = event.block.timestamp


  annotation.save()
  if (contract !== null) {
  contract.Annotations.push(annotation.id)
  contract.save()
  }
}


