import React from 'react';
import { Outlet } from 'react-router-dom';
import Navigation from '../landing/sections/Navigation';
import { Footer } from '../landing/sections/Footer';

export const PublicLayout = () => {
  return (
    <div className="flex flex-col min-h-screen">
      <Navigation />
      <main className="flex-grow">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};

export default PublicLayout;
