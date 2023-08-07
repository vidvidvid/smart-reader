import { Button, Flex, Textarea } from '@chakra-ui/react';
import { GelatoRelay } from '@gelatonetwork/relay-sdk';
import React, { useState } from 'react';
import { useNetwork, useWalletClient } from 'wagmi';
import { getContract } from '../utils/contract';

export const Annotate = ({ address, inspectContract }) => {
  const { chain } = useNetwork();
  const network = chain?.name?.toLowerCase();
  const { data: signer } = useWalletClient();
  const [annotation, setAnnotation] = useState('');

  console.log(network, signer);

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
    console.log('annotation relay response', relayResponse);
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
