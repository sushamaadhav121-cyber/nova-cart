import React from 'react';
import ReactDOM from 'react-dom/client';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { ToastContainer, Zoom } from 'react-toastify';

import '../node_modules/bootstrap/dist/css/bootstrap.min.css';
import '../node_modules/bootstrap/dist/js/bootstrap.bundle.min.js';
import '../node_modules/bootstrap-icons/font/bootstrap-icons.min.css';
import 'react-toastify/dist/ReactToastify.css';

import Home from './components/Home';
import FetchProducts from './components/manageProduct/FetchProducts';
import Profile from './components/manageProfile/Profile';
import Categories from './components/manageCategories/Categories';
import SubCategories from './components/manageSubCategories/SubCategories';
import AddProduct from './components/manageProduct/AddProduct';
import UpdateProduct from './components/manageProduct/UpdateProduct';
import Orders from './components/manageOrders/Orders';

let vendorRoutes = createBrowserRouter([
  {
    path: "/",
    element: <Home />,
    children: [
               {index:true, element:<FetchProducts/>},


            {path:"profile", element:<Profile/>},


            {path:"manage-categories", element:<Categories/>},
            {path:"manage-sub-categories", element:<SubCategories/>},

            {path:"add-product", element:<AddProduct/>},
            {path:"update-product/:id", element:<UpdateProduct/>},
            {path: "orders", element: <Orders /> }


        ]
    }
])


const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <>
    <RouterProvider router={vendorRoutes} />
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