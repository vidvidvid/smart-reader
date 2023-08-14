import { Textarea, Flex, Button } from '@chakra-ui/react';
import React, { useState } from 'react';
import { useNetwork, useWalletClient } from 'wagmi';
import { getContract } from '../utils/contract';
import { GelatoRelay } from '@gelatonetwork/relay-sdk';

export const Annotate = ({ address, inspectContract }) => {
  const { chain } = useNetwork();
  const network = chain?.name?.toLowerCase();
    const { data: signer } = useWalletClient();
  const [annotation, setAnnotation] = useState('');

  const sendAnnotation = async () => {
    const relay = new GelatoRelay();

    const smartReader = getContract(network, signer);

    const { data: sponsoredData } =
    await smartReader.populateTransaction.addAnnotation(
      address,
      inspectContract?.name,
      annotation
    );

  const sponsoredCallRequest = {
    chainId: chain?.id,
    target: smartReader.address,
    data: sponsoredData,
  };

  const relayResponse = await relay.sponsoredCall(
    sponsoredCallRequest,
    process.env.REACT_APP_GELATO_API_KEY
  );
  };

  return (
    <Flex direction="column" gap={3}>
      <Textarea
        placeholder="Add your annotation here"
        value={annotation}
        onChange={(e) => {
          setAnnotation(e.target.value);
        }}
      />
      <Flex alignSelf="end">
        <Button onClick={sendAnnotation}>Send annotation!</Button>
      </Flex>
    </Flex>
  );
};
