import React, { useEffect, useState } from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from './manageNavbar/Navbar';

export default function Home() {
  // 1. Loading state declare kela (Suruvatila true thevla)
  const [loading, setLoading] = useState(true);

  // Collecting token sent from URL params and saving to localStorage
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get("token");

    if (token) {
      const user = JSON.parse(decodeURIComponent(params.get("token")));
      localStorage.setItem("user", JSON.stringify(user));
    }

    // 2. Token save jhalya nantarch loading false keli
    setLoading(false);
  }, []);

  // 3. Jo paryant localStorage madhe data set hot nahi, to paryant Loading dakhva
  if (loading) {
    return <h2 className="text-center mt-5">Loading...</h2>;
  }

  return (
    <div>
      <Navbar />
      <Outlet />
    </div>
  );
}