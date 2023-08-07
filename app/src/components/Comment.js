import { AddIcon, MinusIcon } from '@chakra-ui/icons';
import { Avatar, Button, Flex, IconButton, Link, ListItem, Stack, Text } from '@chakra-ui/react';
import { Reply } from 'lucide-react';

export const Comment = ({ comment: { name, upvotes, ref, timeAgo, message } }) => {
	return (
		<ListItem background='#FFFFFF1A' py={4} px={6} borderRadius='lg' display='flex' gap={4}>
			<Stack w='fit-content' background='#0000001A' borderRadius='xl' alignItems='center'>
				<IconButton
					color='#A4BCFF'
					variant='unstyled'
					aria-label='Upvote'
					icon={<AddIcon />}
				/>
				<Text fontSize="md" fontWeight="medium" mr={2}>
					{upvotes}
				</Text>
				<IconButton
					color='#A4BCFF'
					variant='unstyled'
					aria-label='Downvote'
					icon={<MinusIcon />}
				/>
			</Stack>
			<Stack flex={1}>
				<Flex alignItems='center' justifyContent='space-between'>
					<Flex alignItems='center' gap={4}>
						<Avatar size='sm' name={name}/>
						<Link color='#A4BCFF' fontWeight='semibold'>{name}</Link>
						<Text color='#FFFFFFCC' fontSize='sm'>{timeAgo}</Text>
						{ref && <Text color='#A8DFF5' fontWeight='semibold'>{`#ref to <line of code or function>`}</Text>}
					</Flex>
					<Button leftIcon={<Reply />} variant='ghost' color='#A4BCFF' _hover={{ background: 'transparent' }}>
						Reply
					</Button>
				</Flex>
				<Text>{message}</Text>
			</Stack>
	</ListItem>
	)
}