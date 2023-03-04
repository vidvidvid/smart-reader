import { newMockEvent } from 'matchstick-as';
import { ethereum, Address, BigInt } from '@graphprotocol/graph-ts';
import {
  AnnotationAdded,
  ContractAdded,
} from '../generated/SmartReader/SmartReader';

export function createAnnotationAddedEvent(
  parentContract: Address,
  functionId: BigInt,
  annotation: string
): AnnotationAdded {
  let annotationAddedEvent = changetype<AnnotationAdded>(newMockEvent());

  annotationAddedEvent.parameters = new Array();

  annotationAddedEvent.parameters.push(
    new ethereum.EventParam(
      'parentContract',
      ethereum.Value.fromAddress(parentContract)
    )
  );
  annotationAddedEvent.parameters.push(
    new ethereum.EventParam(
      'functionId',
      ethereum.Value.fromUnsignedBigInt(functionId)
    )
  );
  annotationAddedEvent.parameters.push(
    new ethereum.EventParam('annotation', ethereum.Value.fromString(annotation))
  );

  return annotationAddedEvent;
}

export function createContractAddedEvent(
  parentContract: Address,
  explanation: string
): ContractAdded {
  let contractAddedEvent = changetype<ContractAdded>(newMockEvent());

  contractAddedEvent.parameters = new Array();

  contractAddedEvent.parameters.push(
    new ethereum.EventParam(
      'parentContract',
      ethereum.Value.fromAddress(parentContract)
    )
  );
  contractAddedEvent.parameters.push(
    new ethereum.EventParam(
      'explanation',
      ethereum.Value.fromString(explanation)
    )
  );

  return contractAddedEvent;
}
