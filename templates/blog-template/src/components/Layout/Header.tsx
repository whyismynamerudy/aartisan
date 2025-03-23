import { useAIEnhanced } from "aartisan/react";
import { Link, useLocation } from 'react-router-dom';
const Header = () => {
  const {
    ref,
    aiProps
  } = useAIEnhanced("Header", {
    purpose: "page-header",
    interactions: []
  });
  const location = useLocation();
  const isActive = (path: string) => {
    return location.pathname === path || location.pathname.startsWith(`${path}/`);
  };
  return <header className="bg-white shadow-sm sticky top-0 z-10" ref={ref} {...aiProps}>
      <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
        <Link to="/" className="text-2xl font-bold text-blue-600 flex items-center">
          <svg className="w-7 h-7 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
          </svg>
          Diverse Blog
        </Link>
        
        <nav>
          <ul className="flex space-x-6">
            <li>
              <Link to="/" className={`font-medium ${isActive('/') && !isActive('/blog') ? 'text-blue-600' : 'text-gray-600 hover:text-blue-600'} transition-colors`}>
                Home
              </Link>
            </li>
            <li>
              <Link to="/blog" className={`font-medium ${isActive('/blog') ? 'text-blue-600' : 'text-gray-600 hover:text-blue-600'} transition-colors`}>
                Blog
              </Link>
            </li>
          </ul>
        </nav>
      </div>
    </header>;
};
export default Header;