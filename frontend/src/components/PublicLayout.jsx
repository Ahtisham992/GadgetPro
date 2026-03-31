import Header from './Header';
import Footer from './Footer';
import CompareBar from './CompareBar';

const PublicLayout = ({ children }) => {
  return (
    <div className="flex flex-col" style={{ minHeight: '100vh', background: 'var(--color-bg)' }}>
      <Header />
      <main style={{ flex: 1 }}>
        {children}
      </main>
      <CompareBar />
      <Footer />
    </div>
  );
};

export default PublicLayout;
