import React, { useCallback, useEffect } from 'react'
import { Box, Heading } from '@chakra-ui/react'
import SyntaxHighlighter from 'react-syntax-highlighter';
import { dracula } from 'react-syntax-highlighter/dist/esm/styles/hljs';

export default function CodeReader({
  inspectContract,
  handleCodeHover,
  handleCodeClick,
}) {

    const handleButtonAdd = useCallback((parent, event, remove = false) => {
        try {
            const { target } = event;

            const highlighted = parent.querySelectorAll('.highlight');

            const button = document.createElement('button');
            button.innerText = 'Explain this function';
            button.classList.add('explain-button');
            button.style.position = 'absolute';
            button.style.top = '-30px';
            button.style.right = '0';
            button.addEventListener('click', handleCodeClick);

            if (highlighted.length === 0) {
                return;
            }



            if (highlighted.length > 0) {
                const wrapper = highlighted.forEach((element, i) => {
                    if (i === 0) {
                        console.log('WWW element', element);
                        return element;
                    }
                });
                highlighted[0].style.position = 'relative';
                highlighted[0].style.borderColor = 'red';
                highlighted[0].style.borderWidth = '2px';
                highlighted[0].appendChild(button);
            }
            if (remove) {
                highlighted[0].style.borderColor = 'transparent';
                highlighted[0].style.borderWidth = '0px';
                highlighted[0].removeChild(button);

            }
        } catch (error) {
            console.log('handleButtonAdd error', {error});
        }
    }, [handleCodeClick]);


    useEffect(() => {
        if (typeof window === 'undefined') return;
        const codeContainer = document.querySelector('.code-container');

        if (codeContainer) {
            codeContainer.addEventListener('mouseenter', (event) => handleButtonAdd(codeContainer, event));
            codeContainer.addEventListener('mouseleave', (event) => handleButtonAdd(codeContainer,event, true));
        }

        return () => {
            if (codeContainer) {
                codeContainer.removeEventListener('mouseover', (event) => handleButtonAdd(codeContainer, event));
                codeContainer.removeEventListener('mouseout', (event) => handleButtonAdd(codeContainer, event));
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
