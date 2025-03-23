import { useAIEnhanced } from "aartisan/react";
import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import BlogCard from './BlogCard';
import SearchFilterBar from './SearchFilterBar';
import { Post } from '../../types';
import { posts } from '../../data/posts';
import { authors } from '../../data/authors';
import { tags } from '../../data/tags';
type SortOption = 'newest' | 'oldest';
const BlogList = () => {
  const {
    ref,
    aiProps
  } = useAIEnhanced("BlogList", {
    purpose: "list-container",
    interactions: ["search", "filterchange", "change", "click", "authorclick", "tagclick"]
  });
  const location = useLocation();
  const [filteredPosts, setFilteredPosts] = useState<Post[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedAuthors, setSelectedAuthors] = useState<string[]>([]);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [sortOption, setSortOption] = useState<SortOption>('newest');

  // Handle location state (for filtering from BlogDetail page)
  useEffect(() => {
    if (location.state) {
      if (location.state.filterAuthor) {
        setSelectedAuthors([location.state.filterAuthor]);
      }
      if (location.state.filterTag) {
        setSelectedTags([location.state.filterTag]);
      }
      // Clear location state to prevent it from persisting on browser refresh
      window.history.replaceState({}, document.title);
    }
  }, [location]);
  useEffect(() => {
    // First filter posts
    let result = [...posts];

    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(post => post.title.toLowerCase().includes(query) || post.excerpt.toLowerCase().includes(query) || post.content.toLowerCase().includes(query) || authors.find(a => a.id === post.author_id)?.name.toLowerCase().includes(query) || post.tags.some(tagId => tags.find(t => t.id === tagId)?.name.toLowerCase().includes(query)));
    }

    // Apply author filter
    if (selectedAuthors.length > 0) {
      result = result.filter(post => selectedAuthors.includes(post.author_id));
    }

    // Apply tag filter
    if (selectedTags.length > 0) {
      result = result.filter(post => post.tags.some(tagId => selectedTags.includes(tagId)));
    }

    // Then sort the filtered posts
    result = sortPosts(result, sortOption);
    setFilteredPosts(result);
  }, [searchQuery, selectedAuthors, selectedTags, sortOption]);
  const sortPosts = (postsToSort: Post[], option: SortOption): Post[] => {
    return [...postsToSort].sort((a, b) => {
      const dateA = new Date(a.published_at).getTime();
      const dateB = new Date(b.published_at).getTime();
      return option === 'newest' ? dateB - dateA : dateA - dateB;
    });
  };
  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };
  const handleFilterChange = (filters: {
    authors: string[];
    tags: string[];
  }) => {
    setSelectedAuthors(filters.authors);
    setSelectedTags(filters.tags);
  };
  const handleAuthorClick = (authorId: string) => {
    setSelectedAuthors([authorId]);
  };
  const handleTagClick = (tagId: string) => {
    setSelectedTags([tagId]);
  };
  const handleSortChange = (option: SortOption) => {
    setSortOption(option);
  };
  return <div className="max-w-5xl mx-auto px-4" ref={ref} {...aiProps}>
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Blog</h1>
        <p className="text-gray-600 text-lg mb-6">Explore articles across technology, travel, music, and food</p>
        <SearchFilterBar authors={authors} tags={tags} onSearch={handleSearch} onFilterChange={handleFilterChange} selectedAuthors={selectedAuthors} selectedTags={selectedTags} />
      </div>
      
      {filteredPosts.length > 0 && <div className="mb-6 flex justify-between items-center">
          <div className="text-gray-600">
            {filteredPosts.length} {filteredPosts.length === 1 ? 'post' : 'posts'} found
          </div>
          
          <div className="flex items-center">
            <label htmlFor="sortOrder" className="text-gray-600 mr-2 font-medium">Sort by:</label>
            <select id="sortOrder" value={sortOption} onChange={e => handleSortChange(e.target.value as SortOption)} className="bg-white border border-gray-300 text-gray-700 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 min-w-[100px]">
              <option value="newest">Newest</option>
              <option value="oldest">Oldest</option>
            </select>
          </div>
        </div>}
      
      {filteredPosts.length === 0 ? <div className="text-center py-16 bg-white rounded-lg shadow-md">
          <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h3 className="text-xl font-medium text-gray-700 mb-2">No posts found</h3>
          <p className="text-gray-500">Try changing your search or filters</p>
          <button onClick={() => {
        setSearchQuery('');
        setSelectedAuthors([]);
        setSelectedTags([]);
      }} className="mt-4 text-blue-600 hover:text-blue-800 font-medium">
            Clear all filters
          </button>
        </div> : <div className="space-y-8">
          {filteredPosts.map(post => <BlogCard key={post.id} post={post} onAuthorClick={handleAuthorClick} onTagClick={handleTagClick} />)}
        </div>}
    </div>;
};
export default BlogList;