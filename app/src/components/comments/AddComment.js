import { Avatar, Button, Flex, Input } from '@chakra-ui/react';

export const AddComment = ({ comment, setComment, addComment }) => {
  return (
    <Flex
      alignItems="center"
      background="#FFFFFF1A"
      borderRadius="lg"
      w="full"
      py={4}
      px={6}
      gap={4}
    >
      <Avatar name="Dan Abramov" />
      <Input
        value={comment} // Bind the value of the input field to the comment state
        onChange={(e) => setComment(e.target.value)}
        variant="filled"
        placeholder="Add a comment"
        background="#00000026"
        _hover={{ background: '#00000026' }}
        _placeholder={{ color: '#ADADAD' }}
        borderRadius="lg"
      />
      <Button
        borderRadius="full"
        background="white"
        color="#101D42"
        fontWeight={400}
        onClick={addComment}
      >
        Send
      </Button>
    </Flex>
  );
};
