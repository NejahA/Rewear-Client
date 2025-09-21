import React, { useEffect, useState } from 'react'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'
import { Link } from 'react-router-dom'
import Button from '@mui/material/Button'
import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import DialogContentText from '@mui/material/DialogContentText'
import DialogTitle from '@mui/material/DialogTitle'
import IconButton from '@mui/material/IconButton'
import Slide from '@mui/material/Slide'
import { createTheme, alpha, getContrastRatio } from '@mui/material/styles'
import { ThemeProvider } from '@mui/material/styles'
import LogoutIcon from '@mui/icons-material/Logout'
import CloseIcon from '@mui/icons-material/Close'
import WarningAmberIcon from '@mui/icons-material/WarningAmber'

const violetBase = '#7745B9'
const violetMain = alpha(violetBase, 0.8)

const theme = createTheme({
  palette: {
    violet: {
      main: violetMain,
      light: alpha(violetBase, 0.1),
      dark: alpha(violetBase, 0.9),
      contrastText: getContrastRatio(violetMain, '#fff') > 4.5 ? '#fff' : '#111',
    },
  },
  components: {
    MuiDialog: {
      styleOverrides: {
        paper: {
          borderRadius: 16,
          padding: '8px',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.12)',
        },
      },
    },
    MuiDialogTitle: {
      styleOverrides: {
        root: {
          paddingBottom: '8px',
          fontSize: '1.25rem',
          fontWeight: 600,
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 500,
          borderRadius: 8,
          padding: '8px 20px',
          boxShadow: 'none',
          '&:hover': {
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)',
          },
        },
      },
    },
  },
})

const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />
})

const Logout = ({ setLogged }) => {
  const navigate = useNavigate()
  const [openDialog, setOpenDialog] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const handleLogoutClick = () => {
    setOpenDialog(true)
  }

  const handleConfirmLogout = () => {
    setIsLoading(true)
    performLogout()
  }

  const handleCancelLogout = () => {
    setOpenDialog(false)
  }

  const performLogout = () => {
    axios
      .post(
        `${import.meta.env.VITE_VERCEL_URI}/api/logout`,
        {},
        {
          withCredentials: true,
        }
      )
      .then((res) => {
        console.log('User logged out successfully')
        setLogged(false)
        navigate('/')
      })
      .catch((err) => {
        console.log('Logout error:', err)
        setIsLoading(false)
      })
      .finally(() => {
        setOpenDialog(false)
        setIsLoading(false)
      })
  }

  useEffect(() => {
    // Component initialization if needed
  }, [])

  return (
    <ThemeProvider theme={theme}>
      <Button
        variant="contained"
        color="violet"
        startIcon={<LogoutIcon />}
        onClick={handleLogoutClick}
        sx={{
          minWidth: '120px',
          transition: 'all 0.2s ease-in-out',
          '&:hover': {
            transform: 'translateY(-1px)',
          },
        }}
      >
        Logout
      </Button>

      <Dialog
        open={openDialog}
        TransitionComponent={Transition}
        keepMounted
        onClose={handleCancelLogout}
        aria-labelledby="logout-dialog-title"
        aria-describedby="logout-dialog-description"
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle
          id="logout-dialog-title"
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            pb: 1,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <WarningAmberIcon color="error" />
            Confirm Logout
          </div>
          <IconButton
            aria-label="close"
            onClick={handleCancelLogout}
            sx={{
              color: (theme) => theme.palette.grey[500],
              '&:hover': {
                backgroundColor: (theme) => theme.palette.grey[100],
              },
            }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>

        <DialogContent sx={{ pt: '8px !important' }}>
          <DialogContentText
            id="logout-dialog-description"
            sx={{
              color: 'text.secondary',
              fontSize: '0.95rem',
              lineHeight: 1.6,
            }}
          >
            Are you sure you want to log out? You'll need to sign in again to
            access your account.
          </DialogContentText>
        </DialogContent>

        <DialogActions sx={{ p: 3, pt: 2, gap: 1 }}>
          <Button
            onClick={handleCancelLogout}
            color="inherit"
            variant="outlined"
            sx={{
              borderColor: 'grey.300',
              color: 'text.secondary',
              '&:hover': {
                borderColor: 'grey.400',
                backgroundColor: 'grey.50',
              },
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleConfirmLogout}
            color="violet"
            variant="contained"
            disabled={isLoading}
            startIcon={isLoading ? null : <LogoutIcon />}
            sx={{
              minWidth: '100px',
            }}
          >
            {isLoading ? 'Logging out...' : 'Logout'}
          </Button>
        </DialogActions>
      </Dialog>
    </ThemeProvider>
  )
}

export default Logout