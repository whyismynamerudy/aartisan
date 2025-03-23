import { useAIEnhanced } from "aartisan/react";
import { useState, useRef } from 'react';
import { Author, Tag } from '../../types';
import { useClickAway } from '../../hooks/useClickAway';
interface SearchFilterBarProps {
  authors: Author[];
  tags: Tag[];
  onSearch: (query: string) => void;
  onFilterChange: (filters: {
    authors: string[];
    tags: string[];
  }) => void;
  selectedAuthors: string[];
  selectedTags: string[];
}
const SearchFilterBar = ({
  authors,
  tags,
  onSearch,
  onFilterChange,
  selectedAuthors,
  selectedTags
}: SearchFilterBarProps) => {
  const {
    ref,
    aiProps
  } = useAIEnhanced("SearchFilterBar", {
    purpose: "ui-component",
    interactions: ["submit", "change", "click", "change", "click", "change", "click", "click", "click"]
  });
  const [query, setQuery] = useState('');
  const [showAuthorDropdown, setShowAuthorDropdown] = useState(false);
  const [showTagDropdown, setShowTagDropdown] = useState(false);
  const authorDropdownRef = useRef<HTMLDivElement>(null);
  const tagDropdownRef = useRef<HTMLDivElement>(null);
  useClickAway(authorDropdownRef, () => setShowAuthorDropdown(false));
  useClickAway(tagDropdownRef, () => setShowTagDropdown(false));
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(query);
  };
  const handleAuthorSelect = (authorId: string) => {
    const newAuthors = selectedAuthors.includes(authorId) ? selectedAuthors.filter(id => id !== authorId) : [...selectedAuthors, authorId];
    onFilterChange({
      authors: newAuthors,
      tags: selectedTags
    });
  };
  const handleTagSelect = (tagId: string) => {
    const newTags = selectedTags.includes(tagId) ? selectedTags.filter(id => id !== tagId) : [...selectedTags, tagId];
    onFilterChange({
      authors: selectedAuthors,
      tags: newTags
    });
  };
  const getSelectedAuthorsText = () => {
    if (selectedAuthors.length === 0) return 'All Authors';
    if (selectedAuthors.length === 1) {
      return authors.find(a => a.id === selectedAuthors[0])?.name || 'Author';
    }
    return `${selectedAuthors.length} Authors`;
  };
  const getSelectedTagsText = () => {
    if (selectedTags.length === 0) return 'All Topics';
    if (selectedTags.length === 1) {
      return tags.find(t => t.id === selectedTags[0])?.name || 'Topic';
    }
    return `${selectedTags.length} Topics`;
  };

  // Group tags by category
  const groupedTags = tags.reduce((acc, tag) => {
    const category = tag.id.includes('-') ? tag.id.split('-')[0].charAt(0).toUpperCase() + tag.id.split('-')[0].slice(1) : 'Other';
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(tag);
    return acc;
  }, {} as Record<string, Tag[]>);
  return <div className="bg-white rounded-lg shadow-md p-6 mb-8" ref={ref} {...aiProps}>
      <form onSubmit={handleSearch} className="mb-5">
        <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden shadow-sm focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-blue-500 transition-all">
          <input type="text" placeholder="Search posts, authors, topics..." value={query} onChange={e => setQuery(e.target.value)} className="w-full px-4 py-3 focus:outline-none text-gray-700" />
          <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 font-medium transition-colors">
            Search
          </button>
        </div>
      </form>
      
      <div className="flex flex-wrap gap-4">
        <div className="relative" ref={authorDropdownRef}>
          <button onClick={() => setShowAuthorDropdown(!showAuthorDropdown)} className="flex items-center justify-between bg-gray-100 hover:bg-gray-200 rounded-md px-4 py-2 min-w-[180px] text-gray-700 transition-colors">
            <span className="font-medium">{getSelectedAuthorsText()}</span>
            <svg className="w-4 h-4 ml-2 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          
          {showAuthorDropdown && <div className="absolute z-10 mt-2 w-64 bg-white border rounded-md shadow-lg max-h-80 overflow-y-auto">
              <div className="p-3">
                <h3 className="text-sm font-semibold text-gray-500 mb-2 uppercase tracking-wider">Authors</h3>
                {authors.map(author => <div key={author.id} className="mb-2 last:mb-0">
                    <label className="flex items-center space-x-3 cursor-pointer p-2 hover:bg-gray-50 rounded transition-colors">
                      <input type="checkbox" checked={selectedAuthors.includes(author.id)} onChange={() => handleAuthorSelect(author.id)} className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 transition-colors" />
                      <div className="flex items-center">
                        <img src={author.avatar} alt={author.name} className="w-8 h-8 rounded-full mr-2" />
                        <span className="text-gray-700">{author.name}</span>
                      </div>
                    </label>
                  </div>)}
              </div>
            </div>}
        </div>
        
        <div className="relative" ref={tagDropdownRef}>
          <button onClick={() => setShowTagDropdown(!showTagDropdown)} className="flex items-center justify-between bg-gray-100 hover:bg-gray-200 rounded-md px-4 py-2 min-w-[180px] text-gray-700 transition-colors">
            <span className="font-medium">{getSelectedTagsText()}</span>
            <svg className="w-4 h-4 ml-2 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          
          {showTagDropdown && <div className="absolute z-10 mt-2 w-72 bg-white border rounded-md shadow-lg max-h-96 overflow-y-auto">
              <div className="p-3">
                <h3 className="text-sm font-semibold text-gray-500 mb-2 uppercase tracking-wider">Topics</h3>
                
                {Object.entries(groupedTags).map(([category, categoryTags]) => <div key={category} className="mb-3 last:mb-0">
                    <h4 className="text-xs font-medium text-gray-500 mb-2 ml-2">{category}</h4>
                    <div className="space-y-1">
                      {categoryTags.map(tag => <label key={tag.id} className="flex items-center space-x-3 cursor-pointer p-2 hover:bg-gray-50 rounded transition-colors">
                          <input type="checkbox" checked={selectedTags.includes(tag.id)} onChange={() => handleTagSelect(tag.id)} className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 transition-colors" />
                          <span className="text-gray-700">{tag.name}</span>
                        </label>)}
                    </div>
                  </div>)}
              </div>
            </div>}
        </div>
        
        {(selectedAuthors.length > 0 || selectedTags.length > 0) && <button onClick={() => onFilterChange({
        authors: [],
        tags: []
      })} className="text-sm text-red-600 hover:text-red-800 self-center font-medium transition-colors flex items-center">
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
            Clear filters
          </button>}
      </div>
      
      {(selectedAuthors.length > 0 || selectedTags.length > 0) && <div className="mt-4 pt-3 border-t border-gray-100">
          <div className="flex flex-wrap gap-2 items-center">
            <span className="text-sm text-gray-500">Active filters:</span>
            
            {selectedAuthors.map(authorId => {
          const author = authors.find(a => a.id === authorId);
          return <div key={authorId} className="bg-blue-100 text-blue-800 text-xs px-3 py-1 rounded-full flex items-center gap-1">
                  <span>{author?.name}</span>
                  <button onClick={() => handleAuthorSelect(authorId)} className="text-blue-800 hover:text-blue-900">
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>;
        })}
            
            {selectedTags.map(tagId => {
          const tag = tags.find(t => t.id === tagId);
          return <div key={tagId} className="bg-green-100 text-green-800 text-xs px-3 py-1 rounded-full flex items-center gap-1">
                  <span>{tag?.name}</span>
                  <button onClick={() => handleTagSelect(tagId)} className="text-green-800 hover:text-green-900">
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>;
        })}
          </div>
        </div>}
    </div>;
};
export default SearchFilterBar;