import { useAIEnhanced } from "aartisan/react";
import { Link } from 'react-router-dom';
const NotFoundPage = () => {
  const {
    ref,
    aiProps
  } = useAIEnhanced("NotFoundPage", {
    purpose: "ui-component",
    interactions: []
  });
  return <div className="max-w-4xl mx-auto px-4 py-16 text-center" ref={ref} {...aiProps}>
      <h1 className="text-6xl font-bold text-gray-800 mb-6">404</h1>
      <h2 className="text-3xl font-semibold text-gray-700 mb-4">Page Not Found</h2>
      <p className="text-xl text-gray-600 mb-8">
        The page you are looking for doesn't exist or has been moved.
      </p>
      <Link to="/" className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-medium px-6 py-3 rounded-md transition-colors">
        Go Home
      </Link>
    </div>;
};
export default NotFoundPage;