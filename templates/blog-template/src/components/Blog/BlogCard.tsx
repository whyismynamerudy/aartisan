import { useAIEnhanced } from "aartisan/react";
import { Post, Author, Tag } from '../../types';
import { authors } from '../../data/authors';
import { tags as allTags } from '../../data/tags';
import { Link } from 'react-router-dom';
interface BlogCardProps {
  post: Post;
  onAuthorClick: (authorId: string) => void;
  onTagClick: (tagId: string) => void;
}
const BlogCard = ({
  post,
  onAuthorClick,
  onTagClick
}: BlogCardProps) => {
  const {
    ref,
    aiProps
  } = useAIEnhanced("BlogCard", {
    purpose: "display-card",
    interactions: ["click", "click", "click"]
  });
  const author = authors.find(author => author.id === post.author_id);
  const postTags = allTags.filter(tag => post.tags.includes(tag.id));
  const date = new Date(post.published_at);
  const formattedDate = date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
  return <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300 w-full transform hover:-translate-y-1 transition-transform" ref={ref} {...aiProps}>
      <div className="flex flex-col">
        <div className="h-64 overflow-hidden relative">
          <img src={post.cover_image} alt={post.title} className="w-full h-full object-cover transition-transform duration-500 hover:scale-105" />
          <div className="absolute top-4 left-4 flex gap-1">
            {postTags.slice(0, 1).map(tag => <button key={tag.id} onClick={e => {
            e.preventDefault();
            onTagClick(tag.id);
          }} className="bg-black bg-opacity-70 text-white text-xs px-3 py-1 rounded-full hover:bg-opacity-90">
                {tag.name}
              </button>)}
          </div>
          <div className="absolute bottom-4 right-4">
            <div className="bg-white bg-opacity-90 text-gray-700 text-xs font-medium px-3 py-1 rounded-md">
              {formattedDate}
            </div>
          </div>
        </div>
        
        <div className="p-6">
          <div className="flex items-center mb-4">
            {author?.avatar && <img src={author.avatar} alt={author.name} className="w-10 h-10 rounded-full mr-3 border-2 border-white shadow-sm" />}
            <div>
              <button onClick={e => {
              e.preventDefault();
              onAuthorClick(author?.id || '');
            }} className="font-medium text-gray-900 hover:text-blue-600 transition-colors">
                {author?.name}
              </button>
            </div>
          </div>
          
          <Link to={`/blog/${post.id}`} className="block group">
            <h3 className="text-xl font-bold mb-2 group-hover:text-blue-600 transition-colors">{post.title}</h3>
            <p className="text-gray-600 mb-4 line-clamp-2">{post.excerpt}</p>
          </Link>
          
          <div className="flex flex-wrap gap-2 mb-4">
            {postTags.slice(1).map(tag => <button key={tag.id} onClick={() => onTagClick(tag.id)} className="inline-block bg-gray-100 text-gray-800 text-xs px-3 py-1 rounded-full hover:bg-gray-200 transition-colors">
                {tag.name}
              </button>)}
          </div>
          
          <Link to={`/blog/${post.id}`} className="inline-block text-blue-600 font-medium hover:text-blue-800 transition-colors group">
            Read more 
            <span className="inline-block transition-transform group-hover:translate-x-1 ml-1">→</span>
          </Link>
        </div>
      </div>
    </div>;
};
export default BlogCard;