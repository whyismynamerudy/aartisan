import { useAIEnhanced } from "aartisan/react";
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout/Layout';
import HomePage from './components/HomePage';
import BlogList from './components/Blog/BlogList';
import BlogDetail from './components/Blog/BlogDetail';
function App() {
  return <Router data-aartisan="true" data-aartisan-purpose="application-root" data-aartisan-component="App">
      <Layout>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/blog" element={<BlogList />} />
          <Route path="/blog/:id" element={<BlogDetail />} />
          <Route path="*" element={<div className="p-12 text-center">Page not found</div>} />
        </Routes>
      </Layout>
    </Router>;
}
export default App;