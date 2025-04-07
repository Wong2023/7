// Entry point already provided in index.js, now full App with features
import React, { useState, useEffect } from 'react';
import {
  Container, Typography, Switch, Button, TextField, Box, Snackbar,
  IconButton, Card, CardContent, CardActions, CssBaseline,
  createTheme, ThemeProvider, Dialog, DialogActions,
  DialogContent, DialogTitle
} from '@mui/material';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { Close, Delete, Edit, Done } from '@mui/icons-material';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import dayjs from 'dayjs';

const getInitialTasks = () => JSON.parse(localStorage.getItem('tasks') || '[]');
const getInitialUser = () => localStorage.getItem('user') || '';

export default function App() {
  const [darkMode, setDarkMode] = useState(false);
  const [username, setUsername] = useState(getInitialUser());
  const [inputName, setInputName] = useState('');
  const [tasks, setTasks] = useState(getInitialTasks());
  const [newTask, setNewTask] = useState('');
  const [reminder, setReminder] = useState(dayjs());
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [editId, setEditId] = useState(null);
  const [editText, setEditText] = useState('');
  const [cookieDialog, setCookieDialog] = useState(true);

  const theme = createTheme({ palette: { mode: darkMode ? 'dark' : 'light' } });

  useEffect(() => {
    localStorage.setItem('tasks', JSON.stringify(tasks));
  }, [tasks]);

  useEffect(() => {
    if (username) localStorage.setItem('user', username);
  }, [username]);

  useEffect(() => {
    const interval = setInterval(() => {
      tasks.forEach(task => {
        if (!task.notified && dayjs(task.time).isBefore(dayjs())) {
          new Notification(`Reminder: ${task.text}`);
          task.notified = true;
          setTasks([...tasks]);
        }
      });
    }, 60000);
    return () => clearInterval(interval);
  }, [tasks]);

  const handleAddTask = () => {
    if (!newTask) return;
    setTasks([...tasks, {
      id: Date.now(),
      text: newTask,
      time: reminder,
      done: false,
      notified: false
    }]);
    setNewTask('');
  };

  const handleDelete = id => setTasks(tasks.filter(t => t.id !== id));
  const handleToggleDone = id => setTasks(tasks.map(t => t.id === id ? { ...t, done: !t.done } : t));
  const handleEdit = id => {
    const task = tasks.find(t => t.id === id);
    setEditId(id);
    setEditText(task.text);
  };

  const handleSaveEdit = () => {
    setTasks(tasks.map(t => t.id === editId ? { ...t, text: editText } : t));
    setEditId(null);
    setEditText('');
  };

  if (!('Notification' in window)) {
    alert('Browser does not support notifications.');
  } else if (Notification.permission !== 'granted') {
    Notification.requestPermission();
  }

  const handleLogin = () => {
    if (inputName) setUsername(inputName);
  };

  const handleLogout = () => {
    setUsername('');
    localStorage.removeItem('user');
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <LocalizationProvider dateAdapter={AdapterDayjs}>
        <Container maxWidth="sm" sx={{ mt: 5 }}>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Typography variant="h4">ToDo List</Typography>
            <Box>
              <Typography variant="body2" component="span">Dark Mode</Typography>
              <Switch checked={darkMode} onChange={() => setDarkMode(!darkMode)} />
            </Box>
          </Box>

          {!username ? (
            <Box mt={3}>
              <TextField
                label="Enter username"
                value={inputName}
                onChange={e => setInputName(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleLogin()}
                fullWidth
              />
            </Box>
          ) : (
            <Box mt={2} display="flex" justifyContent="space-between">
              <Typography variant="h6">Hello, {username}!</Typography>
              <Button onClick={handleLogout} variant="outlined">Log Out</Button>
            </Box>
          )}

          {username && (
            <>
              <Box mt={3} display="flex" flexDirection="column" gap={2}>
                <TextField
                  label="New Task"
                  value={newTask}
                  onChange={e => setNewTask(e.target.value)}
                  fullWidth
                />
                <DateTimePicker
                  label="Set Reminder"
                  value={reminder}
                  onChange={setReminder}
                />
                <Button variant="contained" onClick={handleAddTask}>Add Task</Button>
              </Box>

              <Box mt={4}>
                {tasks.map(task => (
                  <Card key={task.id} sx={{ mb: 2 }}>
                    <CardContent>
                      <Typography variant="h6" sx={{ textDecoration: task.done ? 'line-through' : 'none' }}>
                        {task.text}
                      </Typography>
                      <Typography variant="body2">
                        Time left: {dayjs(task.time).diff(dayjs(), 'minute')} mins
                      </Typography>
                    </CardContent>
                    <CardActions>
                      <IconButton onClick={() => handleToggleDone(task.id)}><Done /></IconButton>
                      <IconButton onClick={() => handleEdit(task.id)}><Edit /></IconButton>
                      <IconButton onClick={() => handleDelete(task.id)}><Delete /></IconButton>
                    </CardActions>
                  </Card>
                ))}
              </Box>
            </>
          )}
        </Container>

        <Dialog open={editId !== null} onClose={() => setEditId(null)}>
          <DialogTitle>Edit Task</DialogTitle>
          <DialogContent>
            <TextField
              fullWidth
              value={editText}
              onChange={e => setEditText(e.target.value)}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setEditId(null)}>Cancel</Button>
            <Button onClick={handleSaveEdit}>Save</Button>
          </DialogActions>
        </Dialog>

        <Snackbar
          open={openSnackbar}
          autoHideDuration={3000}
          message="Task Added!"
          onClose={() => setOpenSnackbar(false)}
          action={<IconButton size="small" onClick={() => setOpenSnackbar(false)}><Close fontSize="small" /></IconButton>}
        />

        <Dialog open={cookieDialog} onClose={() => setCookieDialog(false)}>
          <DialogTitle>Cookie Consent</DialogTitle>
          <DialogContent>
            <Typography>This site uses cookies to enhance your experience. Accept?</Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setCookieDialog(false)}>Decline</Button>
            <Button onClick={() => setCookieDialog(false)}>Accept</Button>
          </DialogActions>
        </Dialog>
      </LocalizationProvider>
    </ThemeProvider>
  );
}
