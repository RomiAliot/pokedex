import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { ThemeProvider } from 'styled-components';
import { BrowserRouter } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { store, persistor } from './app/store';
import { theme } from './styles/global';
import GlobalStyle from './styles/global';
import App from './App.jsx';

// Orden de providers: Redux > PersistGate > Theme > Router.
// PersistGate espera la rehidratación para no mostrar favoritos vacíos por un instante.
createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <ThemeProvider theme={theme}>
          <GlobalStyle />
          <BrowserRouter>
            <App />
            {/* Toaster global: se monta una sola vez y toma los colores del theme. */}
            <Toaster
              position="bottom-center"
              toastOptions={{
                duration: 2500,
                style: {
                  background: theme.colors.surface,
                  color: theme.colors.text,
                  border: `1px solid ${theme.colors.border}`,
                  borderRadius: theme.radii.md,
                  boxShadow: theme.shadows.md,
                  fontWeight: 600,
                  padding: '12px 16px',
                },
                success: {
                  iconTheme: { primary: theme.colors.primary, secondary: '#fff' },
                },
                error: {
                  iconTheme: { primary: theme.colors.danger, secondary: '#fff' },
                },
              }}
            />
          </BrowserRouter>
        </ThemeProvider>
      </PersistGate>
    </Provider>
  </StrictMode>
);
