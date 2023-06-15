import { CopyIcon } from '@chakra-ui/icons';
import { Button, Flex, Heading, Image, Link, Stack, Text } from "@chakra-ui/react";
import { Comments } from './Comments';
import { Details } from './Details';
import { Files } from './Files';

export const Content = () => {
	return (
		<Stack h='full' w='full' background="#FFFFFF1A" backdropFilter="blur(8px)" p={6} borderRadius='8px' gap={8}>
			<Stack>
				<Flex alignItems='center' gap={2}>
					<Image
						src={'/images/document.svg'}
					/>
					<Heading as='h1' size='lg' fontWeight={600} noOfLines={1}>MoonToken</Heading>
				</Flex>
				<Flex alignItems='center'>
					<Link fontSize='sm' color='#A4BCFF'>0x4C0d3F7d561532427A91E671eF1657c9c3e17cAF</Link>
					<Button variant='unstyled' size='sm'>
						<CopyIcon color='white' />
					</Button>
				</Flex>
				<Heading as='h1' size='md' fontWeight={600} noOfLines={1}>CREATOR</Heading>
				<Flex gap={1}>
					<Link fontSize='sm' color='#A4BCFF'>0xbce100...9E4fd09aat</Link> <Text fontSize='sm'>txn</Text> <Link fontSize='sm' color='#A4BCFF'>0x92c6b267070c05800d61</Link>
				</Flex>
			</Stack>
			<Files />
			<Details />
			<Comments />
		</Stack>
	)
}