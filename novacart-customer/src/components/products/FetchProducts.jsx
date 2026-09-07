import React, { useEffect, useState } from 'react';
import DisplayProducts from './DisplayProducts';
import FilterNavbar from '../navbar/FilterNavbar';

export default function FetchProducts() {
  const [products, setProducts] = useState(null);

  // 1. Initial load
  useEffect(() => {
    async function fetchAllProducts() {
      try {
        let response = await fetch("http://localhost:8080/api/v1/get/products");
        let responseObject = await response.json();
        if (response.ok && responseObject.data) {
          setProducts(responseObject.data);
        } else {
          setProducts([]);
        }
      } catch (error) {
        console.error("Fetch products error:", error);
        setProducts([]);
      }
    }
    fetchAllProducts();
  }, []);

  // 2. Filter, Sort, & Search function
  async function filterProducts(categoryName, subCategoryName, sortDirection, productName) {
    try {
      let urlParams = new URLSearchParams();

      if (categoryName && categoryName !== "All" && categoryName !== "Select Category") {
        urlParams.append("categoryName", categoryName);
      }
      if (subCategoryName && subCategoryName !== "All" && subCategoryName !== "Select Sub-Category") {
        urlParams.append("subCategoryName", subCategoryName);
      }
      if (sortDirection && sortDirection !== "All" && sortDirection !== "") {
        urlParams.append("sortDirection", sortDirection);
      }
      if (productName && productName.trim() !== "") {
        urlParams.append("productName", productName.trim());
      }

      let response = await fetch(`http://localhost:8080/api/v1/get/filtered-products?${urlParams.toString()}`);
      let responseObject = await response.json();

      if (response.ok && responseObject.data) {
        setProducts(responseObject.data);
      } else {
        setProducts([]);
      }
    } catch (error) {
      console.error("Filter error:", error);
      setProducts([]);
    }
  }

  return (
    <div>
      {products === null ? (
        <h5 className="text-center mt-5">Loading....</h5>
      ) : (
        <>
          <FilterNavbar onFilterProducts={filterProducts} />
          <DisplayProducts productsValue={products} />
        </>
      )}
    </div>
  );
}