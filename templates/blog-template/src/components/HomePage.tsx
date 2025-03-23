import { useAIEnhanced } from "aartisan/react";
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { posts } from '../data/posts';
import { authors } from '../data/authors';
import { tags } from '../data/tags';
const HomePage = () => {
  const {
    ref,
    aiProps
  } = useAIEnhanced("HomePage", {
    purpose: "ui-component",
    interactions: []
  });
  const [featuredPost, setFeaturedPost] = useState(null);
  const [recentPosts, setRecentPosts] = useState([]);
  const [categories, setCategories] = useState([]);
  useEffect(() => {
    // Sort posts by date (newest first)
    const sortedPosts = [...posts].sort((a, b) => new Date(b.published_at).getTime() - new Date(a.published_at).getTime());

    // Set featured post (newest)
    if (sortedPosts.length > 0) {
      setFeaturedPost(sortedPosts[0]);
    }

    // Set recent posts (skip the featured post)
    setRecentPosts(sortedPosts.slice(1));

    // Group tags into categories
    const categoryMap = tags.reduce((acc, tag) => {
      const category = tag.id.includes('-') ? tag.id.split('-')[0].charAt(0).toUpperCase() + tag.id.split('-')[0].slice(1) : 'Other';
      if (!acc[category]) {
        acc[category] = [];
      }
      acc[category].push(tag);
      return acc;
    }, {});

    // Convert to array format for rendering
    const categoryArray = Object.entries(categoryMap).map(([name, tags]) => ({
      name,
      tags
    }));
    setCategories(categoryArray);
  }, []);
  if (!featuredPost) return null;
  const featuredAuthor = authors.find(author => author.id === featuredPost.author_id);
  return <div className="max-w-6xl mx-auto px-4 py-8 animate-fadeIn" ref={ref} {...aiProps}>
      {/* Hero Section */}
      <section className="mb-16">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Welcome to Diverse Blog</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Explore articles spanning technology, travel, music, food, and more. 
            Discover new perspectives and broaden your horizons.
          </p>
        </div>
      </section>
      
      {/* Featured Post */}
      <section className="mb-16">
        <h2 className="text-2xl font-bold mb-6 border-b pb-2">Featured Post</h2>
        <div className="bg-white rounded-lg shadow-md overflow-hidden card-hover-effect">
          <div className="md:flex">
            <div className="md:w-2/3 h-80 md:h-auto relative">
              <img src={featuredPost.cover_image} alt={featuredPost.title} className="w-full h-full object-cover" />
              <div className="absolute top-4 left-4">
                <span className="bg-blue-600 text-white text-sm px-3 py-1 rounded-full">
                  Featured
                </span>
              </div>
            </div>
            <div className="md:w-1/3 p-6 md:p-8 flex flex-col justify-between">
              <div>
                <div className="flex items-center mb-4">
                  <img src={featuredAuthor?.avatar} alt={featuredAuthor?.name} className="w-10 h-10 rounded-full mr-3 border-2 border-white shadow-sm" />
                  <div>
                    <p className="font-medium text-gray-900">{featuredAuthor?.name}</p>
                    <p className="text-sm text-gray-500">
                      {new Date(featuredPost.published_at).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                    </p>
                  </div>
                </div>
                <h3 className="text-2xl font-bold mb-3">{featuredPost.title}</h3>
                <p className="text-gray-600 mb-4">{featuredPost.excerpt}</p>
              </div>
              <Link to={`/blog/${featuredPost.id}`} className="inline-block text-blue-600 font-medium hover:text-blue-800 transition-colors group">
                Read more 
                <span className="inline-block transition-transform group-hover:translate-x-1 ml-1">→</span>
              </Link>
            </div>
          </div>
        </div>
      </section>
      
      {/* Recent Posts */}
      <section className="mb-16">
        <h2 className="text-2xl font-bold mb-6 border-b pb-2">Recent Posts</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {recentPosts.map(post => {
          const postAuthor = authors.find(author => author.id === post.author_id);
          return <div key={post.id} className="bg-white rounded-lg shadow-md overflow-hidden card-hover-effect">
                <Link to={`/blog/${post.id}`} className="block">
                  <div className="h-48 overflow-hidden">
                    <img src={post.cover_image} alt={post.title} className="w-full h-full object-cover transition-transform duration-500 hover:scale-105" />
                  </div>
                  <div className="p-6">
                    <h3 className="text-xl font-bold mb-2 hover:text-blue-600 transition-colors">{post.title}</h3>
                    <p className="text-gray-600 mb-4 line-clamp-3">{post.excerpt}</p>
                    <div className="flex items-center text-sm">
                      <img src={postAuthor?.avatar} alt={postAuthor?.name} className="w-8 h-8 rounded-full mr-2 border-2 border-white shadow-sm" />
                      <span className="text-gray-700">{postAuthor?.name}</span>
                    </div>
                  </div>
                </Link>
              </div>;
        })}
        </div>
        <div className="text-center mt-8">
          <Link to="/blog" className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-medium px-6 py-3 rounded-md transition-colors">
            View All Posts
          </Link>
        </div>
      </section>
      
      {/* Categories Section */}
      <section>
        <h2 className="text-2xl font-bold mb-6 border-b pb-2">Explore by Category</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {categories.map(category => <div key={category.name} className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-xl font-bold mb-4">{category.name}</h3>
              <div className="flex flex-wrap gap-2">
                {category.tags.map(tag => <Link key={tag.id} to={`/blog`} state={{
              filterTag: tag.id
            }} className="inline-block bg-gray-100 text-gray-800 text-sm px-3 py-1 rounded-full hover:bg-gray-200 transition-colors">
                    {tag.name}
                  </Link>)}
              </div>
            </div>)}
        </div>
      </section>
    </div>;
};
export default HomePage;