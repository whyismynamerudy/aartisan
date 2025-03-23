import { useAIEnhanced } from "aartisan/react";
const AboutPage = () => {
  const {
    ref,
    aiProps
  } = useAIEnhanced("AboutPage", {
    purpose: "ui-component",
    interactions: []
  });
  return <div className="max-w-4xl mx-auto px-4 py-12" ref={ref} {...aiProps}>
      <h1 className="text-3xl font-bold mb-6">About This Blog</h1>
      
      <div className="bg-white rounded-lg shadow-md p-8 mb-8">
        <h2 className="text-2xl font-bold mb-4">Our Mission</h2>
        <p className="text-gray-700 mb-4">
          This blog is dedicated to sharing knowledge and insights about web development, 
          design, and the latest technologies. Our goal is to create a resource that 
          helps developers stay up-to-date with best practices and emerging trends.
        </p>
        <p className="text-gray-700">
          Whether you're a beginner or an experienced developer, we hope you'll find 
          valuable content that helps you grow your skills and stay inspired.
        </p>
      </div>
      
      <div className="bg-white rounded-lg shadow-md p-8">
        <h2 className="text-2xl font-bold mb-4">Our Authors</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <img src="https://i.pravatar.cc/150?img=1" alt="John Doe" className="w-24 h-24 rounded-full mx-auto mb-4" />
            <h3 className="text-lg font-bold">John Doe</h3>
            <p className="text-gray-600 text-sm">Frontend Developer</p>
            <p className="text-gray-700 mt-2">
              Frontend developer with a passion for React and TypeScript
            </p>
          </div>
          
          <div className="text-center">
            <img src="https://i.pravatar.cc/150?img=5" alt="Jane Smith" className="w-24 h-24 rounded-full mx-auto mb-4" />
            <h3 className="text-lg font-bold">Jane Smith</h3>
            <p className="text-gray-600 text-sm">UX Designer</p>
            <p className="text-gray-700 mt-2">
              UX designer and occasional technical writer
            </p>
          </div>
          
          <div className="text-center">
            <img src="https://i.pravatar.cc/150?img=8" alt="Bob Johnson" className="w-24 h-24 rounded-full mx-auto mb-4" />
            <h3 className="text-lg font-bold">Bob Johnson</h3>
            <p className="text-gray-600 text-sm">Full-stack Developer</p>
            <p className="text-gray-700 mt-2">
              Full-stack developer specialized in modern web technologies
            </p>
          </div>
        </div>
      </div>
    </div>;
};
export default AboutPage;