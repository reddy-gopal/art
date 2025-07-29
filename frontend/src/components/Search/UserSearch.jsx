import React, { useState, useEffect } from 'react';
import {
  Autocomplete,
  TextField,
  Avatar,
  Box,
  Typography,
  Popper,
  Paper,
  CircularProgress,
  ClickAwayListener,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import debounce from 'lodash/debounce';

const API_URL = 'http://127.0.0.1:8000/api';

const StyledPopper = styled(Popper)(({ theme }) => ({
  width: '100%',
  maxWidth: 400,
  marginTop: theme.spacing(1),
  zIndex: theme.zIndex.modal + 1,
}));

const UserSearch = () => {
  const [open, setOpen] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [options, setOptions] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const searchUsers = async (searchTerm) => {
    if (!searchTerm) {
      setOptions([]);
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/users/search/?query=${searchTerm}`, {
        headers: {
          Authorization: token,
        },
      });
      setOptions(response.data);
    } catch (error) {
      console.error('Error searching users:', error);
      setOptions([]);
    } finally {
      setLoading(false);
    }
  };

  // Debounce the search function to avoid too many API calls
  const debouncedSearch = debounce(searchUsers, 300);

  useEffect(() => {
    if (inputValue) {
      debouncedSearch(inputValue);
    }
    return () => {
      debouncedSearch.cancel();
    };
  }, [inputValue]);

  const handleUserSelect = (event, user) => {
    if (user) {
      navigate(`/profile/${user.username}`);
    }
    setOpen(false);
  };

  return (
    <ClickAwayListener onClickAway={() => setOpen(false)}>
      <Box sx={{ position: 'relative', width: '100%', maxWidth: 400 }}>
        <Autocomplete
          open={open}
          onOpen={() => setOpen(true)}
          onClose={() => setOpen(false)}
          inputValue={inputValue}
          onInputChange={(event, newInputValue) => {
            setInputValue(newInputValue);
          }}
          onChange={handleUserSelect}
          options={options}
          getOptionLabel={(option) => option.username || ''}
          loading={loading}
          filterOptions={(x) => x}
          PopperComponent={StyledPopper}
          noOptionsText="No users found"
          renderInput={(params) => (
            <TextField
              {...params}
              placeholder="Search users..."
              variant="outlined"
              size="small"
              fullWidth
              InputProps={{
                ...params.InputProps,
                endAdornment: (
                  <>
                    {loading ? <CircularProgress color="inherit" size={20} /> : null}
                    {params.InputProps.endAdornment}
                  </>
                ),
              }}
            />
          )}
          renderOption={(props, option) => (
            <Box
              component="li"
              {...props}
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 2,
                p: 2,
                cursor: 'pointer',
                '&:hover': {
                  backgroundColor: 'action.hover',
                },
              }}
            >
              <Avatar
                src={option.profile_picture}
                alt={option.username}
                sx={{ width: 32, height: 32 }}
              />
              <Box>
                <Typography variant="subtitle2">
                  {option.username}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {option.first_name} {option.last_name}
                </Typography>
              </Box>
            </Box>
          )}
        />
      </Box>
    </ClickAwayListener>
  );
};

export default UserSearch; 