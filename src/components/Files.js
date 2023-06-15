import { Heading, List, Stack } from '@chakra-ui/react'
import { File } from './File'

const files = [
	{
		name: '@openzeppelin/contracts/access/Ownable.sol',
		selected: true,
		dependency: false
	},
	{
		name: '@openzeppelin/contracts/token/ERC20/ERC20.sol',
		selected: false,
		dependency: true
	},
	{
		name: '@openzeppelin/contracts/token/ERC20/extensions/IERC20Metadata.sol',
		selected: false,
		dependency: true
	},
	{
		name: '@openzeppelin/contracts/token/ERC20/IERC20.sol',
		selected: false,
		dependency: true
	}
]

export const Files = () => {
	return (
		<Stack>
			<Heading as='h1' size='md' fontWeight={600} noOfLines={1}>FILES ({files.length})</Heading>
			<List spacing={1}>
				{files.map(file =>
					<File key={file} file={file} />
				)}
			</List>
			</Stack>
	)
}