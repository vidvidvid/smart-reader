import { Textarea, Flex, Button } from '@chakra-ui/react';
import React, { useState } from 'react';

export const Annotate = ({ address }) => {
  console.log('addres', address);
  const [annotation, setAnnotation] = useState('');

  const sendAnnotation = async () => {
    const data = {
      address,
      annotation,
    };
    console.log('data', data);
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
