import {
  assert,
  describe,
  test,
  clearStore,
  beforeAll,
  afterAll,
} from 'matchstick-as/assembly/index';
import { Address, BigInt } from '@graphprotocol/graph-ts';
import { AnnotationAdded } from '../generated/schema';
import { AnnotationAdded as AnnotationAddedEvent } from '../generated/SmartReader/SmartReader';
import { handleAnnotationAdded } from '../src/smart-reader';
import { createAnnotationAddedEvent } from './smart-reader-utils';

// Tests structure (matchstick-as >=0.5.0)
// https://thegraph.com/docs/en/developer/matchstick/#tests-structure-0-5-0

describe('Describe entity assertions', () => {
  beforeAll(() => {
    let parentContract = Address.fromString(
      '0x0000000000000000000000000000000000000001'
    );
    let functionId = BigInt.fromI32(234);
    let annotation = 'Example string value';
    let newAnnotationAddedEvent = createAnnotationAddedEvent(
      parentContract,
      functionId,
      annotation
    );
    handleAnnotationAdded(newAnnotationAddedEvent);
  });

  afterAll(() => {
    clearStore();
  });

  // For more test scenarios, see:
  // https://thegraph.com/docs/en/developer/matchstick/#write-a-unit-test

  test('AnnotationAdded created and stored', () => {
    assert.entityCount('AnnotationAdded', 1);

    // 0xa16081f360e3847006db660bae1c6d1b2e17ec2a is the default address used in newMockEvent() function
    assert.fieldEquals(
      'AnnotationAdded',
      '0xa16081f360e3847006db660bae1c6d1b2e17ec2a-1',
      'parentContract',
      '0x0000000000000000000000000000000000000001'
    );
    assert.fieldEquals(
      'AnnotationAdded',
      '0xa16081f360e3847006db660bae1c6d1b2e17ec2a-1',
      'functionId',
      '234'
    );
    assert.fieldEquals(
      'AnnotationAdded',
      '0xa16081f360e3847006db660bae1c6d1b2e17ec2a-1',
      'annotation',
      'Example string value'
    );

    // More assert options:
    // https://thegraph.com/docs/en/developer/matchstick/#asserts
  });
});
