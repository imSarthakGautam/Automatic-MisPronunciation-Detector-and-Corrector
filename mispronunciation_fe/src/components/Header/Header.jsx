import React, { useState } from "react";

function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen((prev) => !prev);
  };

  return (
    <header className="bg-[#73A1B2] text-white p-4 shadow-md">
      <div className="flex justify-between items-center">
        <h1 className="text-xl font-bold">pronouncePerfect.AI</h1>
        {/* Desktop Navigation */}
        <nav className="hidden lg:flex space-x-4">
          <a href="/" className="hover:text-gray-200">
            Home
          </a>
          <a href="/check-pronunciations" className="hover:text-gray-200">
            Check Pronunciations
          </a>
          <a href="/practice-samples" className="hover:text-gray-200">
            Practice Samples
          </a>
          <a href="/about" className="hover:text-gray-200">
            About
          </a>
        </nav>
        {/* Mobile Hamburger Menu */}
        <button
          onClick={toggleMobileMenu}
          className="lg:hidden p-2 focus:outline-none"
        >
          <span>☰</span>
        </button>
      </div>
      {/* Mobile Menu (Overlay) */}
      {isMobileMenuOpen && (
        <nav className="lg:hidden bg-teal-600 p-4 absolute top-16 left-0 w-full z-50">
          <a href="/" className="block py-2 hover:text-gray-200">
            Home
          </a>
          <a
            href="/check-pronunciations"
            className="block py-2 hover:text-gray-200"
          >
            Check Pronunciations
          </a>
          <a
            href="/practice-samples"
            className="block py-2 hover:text-gray-200"
          >
            Practice Samples
          </a>
          <a href="/about" className="block py-2 hover:text-gray-200">
            About
          </a>
        </nav>
      )}
    </header>
  );
}

export default Header;
