import React from 'react';
import { AuthProvider } from './contexts/JWTAuthContext';
import { GlobalStoreProvider } from './contexts/GlobalStoreContext';
// import "bootstrap/dist/css/bootstrap.min.css";
// import './scss/main.scss';
import RenderRoutes from './routes';
import { Toaster } from 'react-hot-toast';
import { Provider } from 'react-redux';
import { store } from './redux/store';

const App = () => {
  return (
    <Provider store={store}>
      <AuthProvider>
        <GlobalStoreProvider>
          <Toaster position="bottom-center" reverseOrder={false} toastOptions={{ className: 'hot-toast-opening-class', duration: 3000, success: { duration: 3000, }, }} />
          <RenderRoutes />
        </GlobalStoreProvider>
      </AuthProvider>
    </Provider>
  );
};

export default App;
