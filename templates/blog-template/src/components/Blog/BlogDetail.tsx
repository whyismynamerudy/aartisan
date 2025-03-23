import { useAIEnhanced } from "aartisan/react";
import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Post } from '../../types';
import { posts } from '../../data/posts';
import { authors } from '../../data/authors';
import { tags as allTags } from '../../data/tags';

// Simple markdown renderer (you could use a library like react-markdown in a real app)
const renderMarkdown = (markdown: string) => {
  // This is a very simplified markdown renderer
  // In a real app, you'd use a proper markdown library
  const html = markdown.replace(/^# (.*$)/gm, '<h1 class="text-3xl font-bold my-6">$1</h1>').replace(/^## (.*$)/gm, '<h2 class="text-2xl font-bold my-5">$1</h2>').replace(/^### (.*$)/gm, '<h3 class="text-xl font-bold my-4">$1</h3>').replace(/\*\*(.*)\*\*/gm, '<strong>$1</strong>').replace(/\*(.*)\*/gm, '<em>$1</em>').replace(/\n/gm, '<br>')
  // Images
  .replace(/!\[(.*?)\]\((.*?)\)/gm, '<figure class="my-6"><img src="$2" alt="$1" class="w-full h-auto rounded-lg shadow-md"><figcaption class="text-center text-sm text-gray-500 mt-2">$1</figcaption></figure>')
  // Code blocks
  .replace(/```(.*?)```/gs, (match, p1) => `<pre class="bg-gray-100 p-4 rounded-lg my-5 overflow-x-auto"><code class="text-sm font-mono text-gray-800">${p1.trim()}</code></pre>`);
  return {
    __html: html
  };
};
const BlogDetail = () => {
  const {
    ref,
    aiProps
  } = useAIEnhanced("BlogDetail", {
    purpose: "ui-component",
    interactions: ["click", "click", "click"]
  });
  const {
    id
  } = useParams<{
    id: string;
  }>();
  const [post, setPost] = useState<Post | null>(null);
  const [author, setAuthor] = useState(null);
  const [postTags, setPostTags] = useState([]);
  const [relatedPosts, setRelatedPosts] = useState([]);
  const navigate = useNavigate();
  useEffect(() => {
    if (id) {
      const foundPost = posts.find(p => p.id === id) || null;
      setPost(foundPost);
      if (foundPost) {
        const postAuthor = authors.find(a => a.id === foundPost.author_id) || null;
        setAuthor(postAuthor);
        const tags = allTags.filter(tag => foundPost.tags.includes(tag.id));
        setPostTags(tags);

        // Find related posts (same author or at least one tag in common)
        const related = posts.filter(p => p.id !== foundPost.id && (p.author_id === foundPost.author_id || p.tags.some(tag => foundPost.tags.includes(tag)))).slice(0, 3);
        setRelatedPosts(related);
      }
    }

    // Scroll to top when post changes
    window.scrollTo(0, 0);
  }, [id]);
  const handleAuthorClick = (authorId: string) => {
    navigate('/blog', {
      state: {
        filterAuthor: authorId
      }
    });
  };
  const handleTagClick = (tagId: string) => {
    navigate('/blog', {
      state: {
        filterTag: tagId
      }
    });
  };
  if (!post) {
    return <div className="max-w-3xl mx-auto px-4 py-8" ref={ref} {...aiProps}>
        <p>Post not found</p>
        <Link to="/blog" className="text-blue-600 hover:underline">Back to blog</Link>
      </div>;
  }
  const formattedDate = new Date(post.published_at).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
  return <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="mb-5">
        <Link to="/blog" className="text-blue-600 hover:text-blue-800 inline-flex items-center group font-medium">
          <svg className="w-5 h-5 mr-1 transform group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to all posts
        </Link>
      </div>
      
      <article className="bg-white rounded-lg shadow-md overflow-hidden">
        {/* Header image for the blog post */}
        <div className="h-80 overflow-hidden">
          <img src={post.cover_image} alt={post.title} className="w-full h-full object-cover" />
        </div>
        
        <div className="p-6 md:p-10">
          {/* Post metadata */}
          <div className="flex flex-wrap justify-between items-center mb-6">
            <div className="flex items-center mb-3 md:mb-0">
              {author?.avatar && <img src={author.avatar} alt={author.name} className="w-12 h-12 rounded-full mr-4 border-2 border-white shadow" />}
              <div>
                <button onClick={() => handleAuthorClick(author?.id || '')} className="font-medium text-lg text-gray-900 hover:text-blue-600 transition-colors">
                  {author?.name}
                </button>
                <p className="text-gray-500">{formattedDate}</p>
              </div>
            </div>
            
            <div className="flex flex-wrap gap-2">
              {postTags.map(tag => <button key={tag.id} onClick={() => handleTagClick(tag.id)} className="inline-block bg-gray-100 text-gray-800 text-sm px-3 py-1 rounded-full hover:bg-gray-200 transition-colors">
                  #{tag.name}
                </button>)}
            </div>
          </div>
          
          {/* Post title and content */}
          <h1 className="text-3xl md:text-4xl font-bold mb-6">{post.title}</h1>
          <p className="text-xl text-gray-600 mb-8 leading-relaxed">{post.excerpt}</p>
          
          <div className="prose prose-lg max-w-none" dangerouslySetInnerHTML={renderMarkdown(post.content)} />
          
          {/* Author section at the bottom */}
          <div className="mt-12 pt-8 border-t border-gray-100">
            <h3 className="text-lg font-medium mb-4">About the author</h3>
            <div className="flex items-start bg-gray-50 p-5 rounded-lg">
              {author?.avatar && <img src={author.avatar} alt={author.name} className="w-16 h-16 rounded-full mr-5 border-2 border-white shadow" />}
              <div>
                <button onClick={() => handleAuthorClick(author?.id || '')} className="font-medium text-lg text-gray-900 hover:text-blue-600 transition-colors">
                  {author?.name}
                </button>
                <p className="text-gray-600 mt-2 leading-relaxed">{author?.bio}</p>
              </div>
            </div>
          </div>
        </div>
      </article>
      
      {/* Related posts section */}
      {relatedPosts.length > 0 && <div className="mt-12">
          <h3 className="text-2xl font-bold mb-6">You might also enjoy</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {relatedPosts.map(relatedPost => {
          const relatedPostAuthor = authors.find(a => a.id === relatedPost.author_id);
          return <div key={relatedPost.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-all transform hover:-translate-y-1">
                  <Link to={`/blog/${relatedPost.id}`} className="block">
                    <div className="h-40 overflow-hidden">
                      <img src={relatedPost.cover_image} alt={relatedPost.title} className="w-full h-full object-cover" />
                    </div>
                    <div className="p-4">
                      <h4 className="font-bold text-gray-900 mb-2">{relatedPost.title}</h4>
                      <div className="flex items-center text-sm">
                        <img src={relatedPostAuthor?.avatar} alt={relatedPostAuthor?.name} className="w-6 h-6 rounded-full mr-2" />
                        <span className="text-gray-600">{relatedPostAuthor?.name}</span>
                      </div>
                    </div>
                  </Link>
                </div>;
        })}
          </div>
        </div>}
    </div>;
};
export default BlogDetail;