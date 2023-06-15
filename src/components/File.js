import { Badge, ListItem, Text } from "@chakra-ui/react"

export const File = ({ file: { name, selected, dependency } }) => {
	return (
		<ListItem bgColor={selected ? '#5B6D9F' : 'transparent'} border='2px solid #FFFFFF33' p={3} borderRadius='lg' display='flex' alignItems='center' justifyContent='space-between'>
			<Text>{name}</Text>
			{dependency && (
				<Badge ml='1' fontSize='0.8em' background='#FFFFFF1A' color='white' p={1.5} borderRadius='md'>
					<Text fontWeight={400}>DEPENDENCY</Text>
				</Badge>)
			}
		</ListItem>
	)
}