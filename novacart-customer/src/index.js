import React from 'react';
import ReactDOM from 'react-dom/client';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { ToastContainer, Zoom } from 'react-toastify';

// Bootstrap & Toastify Styles
import '../node_modules/bootstrap/dist/css/bootstrap.min.css';
import '../node_modules/bootstrap/dist/js/bootstrap.bundle.min.js';
import '../node_modules/bootstrap-icons/font/bootstrap-icons.min.css';
import 'react-toastify/dist/ReactToastify.css';

// Components
import Home from './components/Home';
import FetchProducts from './components/products/FetchProducts';
import Register from './components/authentication/Register';
import Login from './components/authentication/Login';
import Cart from './components/cart/Cart';
import Orders from './components/orders/Orders';
import ProductDetails from './components/products/ProductDetails';

const projectRoutes = createBrowserRouter([
  {
    path: "/",
    element: <Home />,
    children: [
      {
        index: true,
        element: <FetchProducts />
      },
      { path: "/register", element: <Register /> },
      { path: "/login", element: <Login /> },
      { path: "/my-cart", element: <Cart /> },
      { path: "/products/:id", element: <ProductDetails /> },
      { path: "/my-orders", element: <Orders /> }
    ]
  }
]);

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <>
    <RouterProvider router={projectRoutes} />
    <ToastContainer
      position="top-right"
      autoClose={2000}
      hideProgressBar={false}
      newestOnTop={false}
      closeOnClick
      rtl={false}
      pauseOnFocusLoss
      draggable
      pauseOnHover
      theme="light"
      transition={Zoom}
    />
  </>
);