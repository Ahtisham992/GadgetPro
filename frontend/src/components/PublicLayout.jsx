import Header from './Header';
import Footer from './Footer';

const PublicLayout = ({ children }) => {
  return (
    <div className="flex flex-col" style={{ minHeight: '100vh', background: 'var(--color-bg)' }}>
      <Header />
      <main style={{ flex: 1 }}>
        {children}
      </main>
      <Footer />
    </div>
  );
};

export default PublicLayout;
