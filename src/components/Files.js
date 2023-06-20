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

export const Files = ({ sourceCode, handleClick }) => {
	return (
		<Stack>
			<Heading as='h2' size='md' fontWeight={600} noOfLines={1}>FILES ({sourceCode.length})</Heading>
			<List spacing={1}>
				 {sourceCode &&
              sourceCode.length > 0 &&
              sourceCode.map((contract) => {
                const contractName = contract.name;
								const file = 	{
									name: contractName,
									selected: false,
									dependency: true
								}
                return (
									<File key={contractName} file={file} handleClick={handleClick} />
                );
              })}
			</List>
			</Stack>
	)
}