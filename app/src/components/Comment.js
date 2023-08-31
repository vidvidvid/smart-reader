import { AddIcon, MinusIcon } from '@chakra-ui/icons';
import {
  Avatar,
  Button,
  Flex,
  IconButton,
  Link,
  ListItem,
  Stack,
  Text,
} from '@chakra-ui/react';
import { Reply } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useAccount } from 'wagmi';
import { useSupabase } from '../utils/supabaseContext';
import { AddComment } from './AddComment';

export const Comment = ({
  comment: { id, name, ref, timeAgo, message, isLoggedIn },
}) => {
  const [showReply, setShowReply] = useState(false);
  const [upvotes, setUpvotes] = useState(0);
  const { supabase } = useSupabase();
  const {
    address: userAddress,
    isConnected,
    isConnecting,
    isDisconnected,
  } = useAccount();

  async function getUpvotes() {
    try {
      const { data, error } = await supabase
        .from('votes')
        .select('*')
        .eq('id', id)
        .single();

      if (error && error.code === 'PGRST116') {
        // Handle 406 error, i.e., create object if it doesn't exist
        await supabase
          .from('votes')
          .insert([{ id: id, upvotes: [], downvotes: [] }]);
        const { error: insertError } = await supabase
          .from('votes')
          .insert([{ id: id, upvotes: [], downvotes: [] }]);

        if (insertError) {
          throw insertError;
        }
        return 0;
      } else if (error) {
        throw error;
      }

      // subtract length of downvotes from upvotes
      return data.upvotes.length - data.downvotes.length;
    } catch (err) {
      console.error('Error getting upvotes:', err);
      return 0;
    }
  }

  async function upvote() {
    if (!isLoggedIn || !isConnected) return;

    try {
      const { data, error } = await supabase
        .from('votes')
        .select('*')
        .eq('id', id)
        .single();

      if (error && error.statusCode === 406) {
        // Handle 406 error, i.e., create object if it doesn't exist
        await supabase
          .from('votes')
          .insert([{ id: id, upvotes: [userAddress], downvotes: [] }]);
        const { error: insertError } = await supabase
          .from('votes')
          .insert([{ id: id, upvotes: [], downvotes: [] }]);

        if (insertError) {
          throw insertError;
        }
        return;
      } else if (error) {
        throw error;
      }
      let updatedUpvotes = [];

      if (data.upvotes.includes(userAddress)) {
        // this indicates they want to remove their positive vote
        updatedUpvotes = data.upvotes.filter(
          (address) => address !== userAddress
        );
      } else {
        // add the wallet address to the upvote list
        updatedUpvotes = [...data.upvotes, userAddress];
      }

      // remove from downvotes if it exists
      const updatedDownvotes = data.upvotes.filter(
        (address) => address !== userAddress
      );

      // update item
      await supabase
        .from('votes')
        .update({ upvotes: updatedUpvotes, downvotes: updatedDownvotes })
        .eq('id', id);

      setUpvotes(updatedUpvotes.length - updatedDownvotes.length);
    } catch (err) {
      console.error('Error upvoting:', err);
    }
  }

  async function downvote() {
    if (!isLoggedIn || !isConnected) return;
    try {
      const { data, error } = await supabase
        .from('votes')
        .select('*')
        .eq('id', id)
        .single();

      if (error && error.statusCode === 'PGRST116') {
        // Handle 406 error, i.e., create object if it doesn't exist

        await supabase
          .from('votes')
          .insert([{ id: id, upvotes: [], downvotes: [userAddress] }]);
        const { error: insertError } = await supabase
          .from('votes')
          .insert([{ id: id, upvotes: [], downvotes: [] }]);

        if (insertError) {
          throw insertError;
        }
        return;
      } else if (error) {
        throw error;
      }

      let updatedDownvotes = [];

      if (data.downvotes.includes(userAddress)) {
        // this indicates they want to remove their positive vote
        updatedDownvotes = data.downvotes.filter(
          (address) => address !== userAddress
        );
      } else {
        // add the wallet address to the upvote list
        updatedDownvotes = [...data.downvotes, userAddress];
      }
      // remove from upvotes if exists
      const updatedUpvotes = data.upvotes.filter(
        (address) => address !== userAddress
      );

      // update item
      await supabase
        .from('votes')
        .update({ upvotes: updatedUpvotes, downvotes: updatedDownvotes })
        .eq('id', id);
      setUpvotes(updatedUpvotes.length - updatedDownvotes.length);
    } catch (err) {
      console.error('Error downvoting:', err);
    }
  }

  useEffect(() => {
    async function fetchUpvotes() {
      const count = await getUpvotes();
      setUpvotes(count);
    }

    fetchUpvotes();
  }, []);
  return (
    <>
      <ListItem
        background="#FFFFFF1A"
        py={4}
        px={6}
        borderRadius="lg"
        display="flex"
        gap={4}
      >
        <Stack
          w="fit-content"
          background="#0000001A"
          borderRadius="xl"
          alignItems="center"
        >
          <IconButton
            color="#A4BCFF"
            variant="unstyled"
            aria-label="Upvote"
            icon={<AddIcon />}
            onClick={upvote}
          />
          <Text fontSize="md" fontWeight="medium" mr={2}>
            {upvotes}
          </Text>
          <IconButton
            color="#A4BCFF"
            variant="unstyled"
            aria-label="Downvote"
            icon={<MinusIcon />}
            onClick={downvote}
          />
        </Stack>
        <Stack flex={1}>
          <Flex alignItems="center" justifyContent="space-between">
            <Flex alignItems="center" gap={4}>
              <Avatar size="sm" name={name} />
              <Link color="#A4BCFF" fontWeight="semibold">
                {name}
              </Link>
              <Text color="#FFFFFFCC" fontSize="sm">
                {timeAgo}
              </Text>
              {ref && (
                <Text
                  color="#A8DFF5"
                  fontWeight="semibold"
                >{`#ref to <line of code or function>`}</Text>
              )}
            </Flex>
            <Button
              leftIcon={<Reply />}
              variant="ghost"
              color="#A4BCFF"
              _hover={{ background: 'transparent' }}
              onClick={() => setShowReply(!showReply)}
            >
              Reply
            </Button>
          </Flex>
          <Text>{message}</Text>
        </Stack>
      </ListItem>
      {showReply && (
        <ListItem>
          <AddComment />
        </ListItem>
      )}
    </>
  );
};
