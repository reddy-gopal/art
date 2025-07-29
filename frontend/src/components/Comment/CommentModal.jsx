import React from 'react';
import {
  Dialog,
  DialogContent,
  IconButton,
  Typography,
  Box,
  Divider,
  CircularProgress,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import { Close as CloseIcon } from '@mui/icons-material';
import Comment from './index';

const CommentModal = ({ 
  open, 
  onClose, 
  comments, 
  postId, 
  onAddComment, 
  loading,
  post 
}) => {
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down('sm'));

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullScreen={fullScreen}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: { xs: 0, sm: 2 },
          height: { xs: '100%', sm: '80vh' },
        },
      }}
    >
      {/* Header */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          p: 2,
          borderBottom: 1,
          borderColor: 'divider',
        }}
      >
        <Typography variant="h6" component="h2">
          Comments
        </Typography>
        <IconButton onClick={onClose} size="small">
          <CloseIcon />
        </IconButton>
      </Box>

      {/* Post Preview */}
      <Box
        sx={{
          p: 2,
          borderBottom: 1,
          borderColor: 'divider',
          display: 'flex',
          alignItems: 'center',
          gap: 2,
        }}
      >
        <Box
          component="img"
          src={post?.image}
          alt={post?.title}
          sx={{
            width: 60,
            height: 60,
            objectFit: 'cover',
            borderRadius: 1,
          }}
        />
        <Box>
          <Typography variant="subtitle1" fontWeight="bold">
            {post?.title}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            by {post?.user?.username}
          </Typography>
        </Box>
      </Box>

      {/* Comments Section */}
      <DialogContent
        sx={{
          p: 0,
          display: 'flex',
          flexDirection: 'column',
          height: '100%',
        }}
      >
        {loading ? (
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              py: 4,
            }}
          >
            <CircularProgress />
          </Box>
        ) : (
          <>
            {/* Comments List */}
            <Box
              sx={{
                flex: 1,
                overflowY: 'auto',
                p: 2,
                display: 'flex',
                flexDirection: 'column',
                gap: 2,
              }}
            >
              {comments?.length === 0 ? (
                <Box
                  sx={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    py: 4,
                  }}
                >
                  <Typography color="text.secondary">
                    No comments yet. Be the first to comment!
                  </Typography>
                </Box>
              ) : (
                comments?.map((comment) => (
                  <Comment
                    key={comment.id}
                    comment={comment}
                    postId={postId}
                    onAddComment={onAddComment}
                  />
                ))
              )}
            </Box>

            {/* Add Comment Form */}
            <Box
              sx={{
                p: 2,
                borderTop: 1,
                borderColor: 'divider',
                backgroundColor: 'background.paper',
              }}
            >
              <Comment
                postId={postId}
                onAddComment={onAddComment}
              />
            </Box>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default CommentModal; 