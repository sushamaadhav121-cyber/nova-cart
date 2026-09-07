import React, { useEffect, useState } from 'react';
import DisplayProducts from './DisplayProducts';
import { toast } from 'react-toastify';

export default function FetchProducts() {
  const [products, setProducts] = useState(null);

  const loggedInAdmin = JSON.parse(localStorage.getItem("user"));

  // 1. Fetch All Products (useEffect chya baher)
  async function getAllProducts() {
    try {
      const response = await fetch("http://localhost:8080/api/v1/admin/products", {
        headers: {Authorization: `Bearer ${loggedInAdmin?.token}`}
      });
      const responseObject = await response.json();
      setProducts(responseObject.data || []);
    } catch (error) {
      console.error(error);
      toast.error("Products load karta aale nahit!");
    }
  }

  useEffect(() => {
    getAllProducts();
  }, []);

  // 2. Delete Product Logic (Admin sathi)
  async function deleteProduct(productId) {
    try {
      const response = await fetch(`http://localhost:8080/api/v1/admin/products/${productId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${loggedInAdmin?.token}`
        }
      });

      const responseObject = await response.json();

      if (response.ok) {
        toast.success(responseObject.message || "Product deleted successfully!");
        // Product delete zalya nantar list refresh kara
        getAllProducts();
      } else {
        toast.error(responseObject.message || "Product delete failed!");
      }
    } catch (error) {
      console.error(error);
      toast.error("Server error ala ahe!");
    }
  }

  return (
    <div>
      {products === null ? (
        <h4 className="text-center mt-5">Loading Products...</h4>
      ) : products.length === 0 ? (
        <div className="container mt-5 text-center">
          <div className="alert alert-info">
            <h4>There are no products, please add some!</h4>
          </div>
        </div>
      ) : (
        <DisplayProducts allProducts={products} onDeleteProduct={deleteProduct} />
      )}
    </div>
  );
}