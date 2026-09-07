import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';

export default function FilterNavbar(props) {
  let filterProducts = props.onFilterProducts;
  let { register, formState, watch } = useForm();
  
  let [categories, setCategories] = useState(null);
  const selectedCategoryId = watch("category");
  const [subCategories, setSubCategories] = useState([]);

  let [categoryName, setCategoryName] = useState("");
  let [subCategoryName, setSubCategoryName] = useState("");
  let [sortDirection, setSortDirection] = useState("");
  let [productName, setProductName] = useState("");

  // 1. Fetch all categories
  useEffect(() => {
    async function fetchAllCategories() {
      try {
        let response = await fetch("http://localhost:8080/api/v1/get/categories");
        let responseObject = await response.json();
        setCategories(responseObject.data);
      } catch (error) {
        console.error("Categories load failed:", error);
      }
    }
    fetchAllCategories();
  }, []);

  // 2. Trigger filter on change
  useEffect(() => {
    if (filterProducts) {
      filterProducts(categoryName, subCategoryName, sortDirection, productName);
    }
  }, [categoryName, subCategoryName, sortDirection, productName]);

  // 3. Dynamic Sub-Categories
  useEffect(() => {
    if (!selectedCategoryId) {
      setSubCategories([]);
      return;
    }
    let selectedCategory = categories?.find((category) => {
      return category.id === Number(selectedCategoryId);
    });
    setSubCategories(selectedCategory?.subCategories || []);
  }, [selectedCategoryId, categories]);

  return (
    <div className="container mt-3 mb-4">
      <div className="row g-2 align-items-center">
        
        {/* Category Select */}
        <div className="col-12 col-md-3">
          <select
            className={`form-select ${formState.errors?.category ? "is-invalid" : ""}`}
            {...register("category", {
              onChange: (event) => {
                let selectedText = event.target.options[event.target.selectedIndex].text;
                setCategoryName(selectedText === "Select Category" ? "" : selectedText);
                setSubCategoryName("");
              }
            })}
          >
            <option value="">Select Category</option>
            <option value="All">All</option>
            {categories === null ? (
              <option disabled>Loading Categories...</option>
            ) : (
              categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))
            )}
          </select>
        </div>

        {/* Sub-Category Select */}
        <div className="col-12 col-md-3">
          <select
            className={`form-select ${formState.errors?.subCategory ? "is-invalid" : ""}`}
            {...register("subCategory", {
              onChange: (event) => {
                let selectedText = event.target.options[event.target.selectedIndex].text;
                setSubCategoryName(selectedText === "Select Sub-Category" ? "" : selectedText);
              }
            })}
            disabled={!subCategories.length}
          >
            <option value="">Select Sub-Category</option>
            <option value="All">All</option>
            {subCategories
              .filter((sub) => sub && sub.name)
              .map((sub) => (
                <option key={sub.id} value={sub.id}>
                  {sub.name}
                </option>
              ))}
          </select>
        </div>

        {/* Sort by Price */}
        <div className="col-12 col-md-3">
          <select
            className="form-select"
            {...register("sortDirection", {
              onChange: (event) => {
                setSortDirection(event.target.value);
              }
            })}
          >
            <option value="">Sort By Price</option>
            <option value="All">Reset</option>
            <option value="desc">Price: High to Low</option>
            <option value="asc">Price: Low to High</option>
          </select>
        </div>

        {/* Search by Product Name */}
        <div className="col-12 col-md-3">
          <input
            type="text"
            className="form-control"
            placeholder="Type Product Name"
            {...register("productName", {
              onChange: (event) => {
                setProductName(event.target.value);
              }
            })}
          />
        </div>

      </div>
    </div>
  );
}