import React, { useState } from 'react';
import { Box, Typography, TextField, Button, Avatar, Paper } from '@mui/material';
import { useSelector } from 'react-redux';
import { formatDistanceToNow } from 'date-fns';

const Comment = ({ comment, postId, onAddComment }) => {
  const [newComment, setNewComment] = useState('');
  const { user } = useSelector((state) => state.auth);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (newComment.trim()) {
      onAddComment(postId, newComment);
      setNewComment('');
    }
  };

  if (comment) {
    // Display existing comment
    return (
      <Paper sx={{ p: 2, mb: 1, backgroundColor: 'background.paper' }}>
        <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
          <Avatar
            src={comment.user.profile_picture}
            alt={comment.user.username}
            sx={{ width: 32, height: 32 }}
          />
          <Box sx={{ flex: 1 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
              <Typography variant="subtitle2" fontWeight="bold">
                {comment.user.username}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true })}
              </Typography>
            </Box>
            <Typography variant="body2">{comment.content}</Typography>
          </Box>
        </Box>
      </Paper>
    );
  }

  // New comment form
  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
      <Box sx={{ display: 'flex', gap: 2 }}>
        <Avatar
          src={user?.profile_picture}
          alt={user?.username}
          sx={{ width: 32, height: 32 }}
        />
        <TextField
          fullWidth
          size="small"
          placeholder="Add a comment..."
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          sx={{ flex: 1 }}
        />
        <Button
          type="submit"
          variant="contained"
          disabled={!newComment.trim()}
          sx={{ minWidth: 100 }}
        >
          Post
        </Button>
      </Box>
    </Box>
  );
};

export default Comment; 