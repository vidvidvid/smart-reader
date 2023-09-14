import React from 'react'
import { Box, Heading } from '@chakra-ui/react'
import SyntaxHighlighter from 'react-syntax-highlighter';
import { dracula } from 'react-syntax-highlighter/dist/esm/styles/hljs';

export default function CodeReader({
  inspectContract,
  handleCodeHover,
  handleCodeClick,
}) {
  return (
    <Box
      background="#00000080"
      w={{ base: 'full', lg: '50%' }}
      h="full"
      p={6}
      borderTopLeftRadius="lg"
      borderBottomLeftRadius="lg"
      onMouseOver={(event) => handleCodeHover(event)}
    >
      <Heading as="h3" size="md" noOfLines={1} pb={8}>
        SOURCE CODE
      </Heading>
      <Box h="sm" overflow="auto">
        <SyntaxHighlighter
          language="javascript"
          style={{
            ...dracula,
            display: 'inline-table',
          }}
          onClick={() => handleCodeClick()}
          wrapLines={true}
        >
          {inspectContract?.sourceCode?.content || ''}
        </SyntaxHighlighter>
      </Box>
    </Box>
  )
}
