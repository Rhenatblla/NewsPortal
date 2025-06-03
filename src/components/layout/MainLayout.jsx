import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from '../common/Navbar/Navbar'; 

const MainLayout = () => {
  return (
    <div className="app-container">
      <Navbar />
      <div className="main-content" style={{backgroundColor: 'white'}}>
        <div className="content">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default MainLayout;
