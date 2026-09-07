import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="bg-white border-t border-slate-200/80 mt-auto py-8 transition-colors duration-300">
      <div className="flex flex-col md:flex-row justify-between items-center px-margin-desktop max-w-container-max mx-auto gap-6 text-on-surface">
        <div className="flex flex-col items-center md:items-start text-left">
          <Link to="/" className="inline-block mb-2">
            <img
              src="/aashmi-logo.png"
              alt="Aashmi Tours & Travels"
              className="h-12 md:h-14 w-auto object-contain transition-transform hover:scale-105"
            />
          </Link>
          <p className="text-xs text-on-surface-variant font-medium">
            © 2026 Aashmi Tours & Travels. All rights reserved.
          </p>
        </div>
        <div className="flex flex-wrap justify-center gap-x-6 gap-y-2 text-xs font-semibold text-on-surface-variant">
          <a className="hover:text-primary transition-colors" href="#">Terms of Service</a>
          <a className="hover:text-primary transition-colors" href="#">Privacy Policy</a>
          <a className="hover:text-primary transition-colors" href="#">Fare Rules</a>
          <a className="hover:text-primary transition-colors" href="#">Contact Us</a>
          <a className="hover:text-primary transition-colors" href="#">FAQ</a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
