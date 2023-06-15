import { Avatar, Button, Flex, Heading, Input, List, Stack } from '@chakra-ui/react'
import { Comment } from './Comment'

const comments = [
	{
		name: 'amyrobson',
		timeAgo: '1 month ago',
		upvotes: 12,
		message: 'Impressive! Though it seems the drag feature could be improved. But overall it looks incredible. You’ve nailed the design and the responsiveness at various breakpoints works really well.',
		ref: true
	},
	{
		name: 'amyrobson',
		timeAgo: '1 month ago',
		upvotes: 12,
		message: 'Impressive! Though it seems the drag feature could be improved. But overall it looks incredible. You’ve nailed the design and the responsiveness at various breakpoints works really well.',
		ref: false
	},
	{
		name: 'amyrobson',
		timeAgo: '1 month ago',
		upvotes: 12,
		message: 'Impressive! Though it seems the drag feature could be improved. But overall it looks incredible. You’ve nailed the design and the responsiveness at various breakpoints works really well.',
		ref: true
	},
	{
		name: 'amyrobson',
		timeAgo: '1 month ago',
		upvotes: 12,
		message: 'Impressive! Though it seems the drag feature could be improved. But overall it looks incredible. You’ve nailed the design and the responsiveness at various breakpoints works really well.',
		ref: false
	},
]

export const Comments = () => {
	return (
		<Stack gap={4}>
				<Heading as='h1' size='md' fontWeight={600} noOfLines={1}>COMMENTS ({comments.length})</Heading>
				<Flex alignItems='center' background='#FFFFFF1A' borderRadius='lg' w='full' py={4} px={6} gap={4}>
					<Avatar name='Dan Abramov' />
					<Input variant='filled' placeholder='Add a comment' background='#00000026' _hover={{ background: '#00000026' }} _placeholder={{ color: '#ADADAD' }} borderRadius='lg' />
					<Button borderRadius='full' background='white' color='#101D42' fontWeight={400}>Send</Button>
				</Flex>
				<List spacing={4}>
					{comments.map(comment =>
					<Comment comment={comment} />
					)}
				</List>
			</Stack>
	)
}