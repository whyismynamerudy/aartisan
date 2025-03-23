import { useAIEnhanced } from "aartisan/react";
import { ReactNode } from 'react';
import Header from './Header';
import Footer from './Footer';
interface LayoutProps {
  children: ReactNode;
}
const Layout = ({
  children
}: LayoutProps) => {
  const {
    ref,
    aiProps
  } = useAIEnhanced("Layout", {
    purpose: "page-layout",
    interactions: []
  });
  return <div className="flex flex-col min-h-screen" ref={ref} {...aiProps}>
      <Header />
      <main className="flex-grow bg-gray-50 py-6">{children}</main>
      <Footer />
    </div>;
};
export default Layout;