import React, { useCallback, useEffect } from 'react'
import { Box, Heading } from '@chakra-ui/react'
import SyntaxHighlighter from 'react-syntax-highlighter';
import { dracula } from 'react-syntax-highlighter/dist/esm/styles/hljs';

export default function CodeReader({
  inspectContract,
  handleCodeHover,
  handleCodeClick,
}) {

    const handleButtonAdd = useCallback((event) => {
        try {
            console.log('event', event);
            const highlightedFunction = document.querySelectorAll('.highlight');
            const button = document.createElement('button');
            button.innerText = 'Explain this function';
            button.classList.add('explain-button');
            button.style.position = 'absolute';
            button.style.top = '-30px';
            button.style.right = '-250px';
            button.addEventListener('click', handleCodeClick);
            if (highlightedFunction.length === 0) {
                return;
            }
            highlightedFunction.forEach((element, i) => {
                if (i === 0) {
                    element.style.position = 'relative';
                    element.appendChild(button);
                }
            });
        } catch (error) {
            console.log('error', error);
        }
    }, [handleCodeClick]);


    useEffect(() => {
        if (typeof window === 'undefined') return;
        const codeContainer = document.querySelector('.code-container');

        if (codeContainer) {
            codeContainer.addEventListener('mouseover', (event) => handleButtonAdd(event));
        }

        return () => {
            if (codeContainer) {
                codeContainer.removeEventListener('mouseover', (event) => handleButtonAdd(event));
            }
        }

    }, []);


  return (
    <Box
      background="#101D42"
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
          <Box
            className="code-container"
              h="sm" overflow="auto" sx={{
        "pre": {
          bgColor: '#101D42!important',
        }
      }}>
        <SyntaxHighlighter
          language="javascript"
          style={{
            ...dracula,
            display: 'inline-table',
            bgColor: '#101D42'
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
