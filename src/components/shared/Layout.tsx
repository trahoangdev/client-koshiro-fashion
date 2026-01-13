import { useNavigate, Outlet, useLocation } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';
import { useCart } from '@/hooks/useCart';

const Layout = () => {
    const { itemsCount } = useCart();
    const location = useLocation();
    const navigate = useNavigate();

    const handleSearch = (query: string) => {
        navigate(`/search?q=${encodeURIComponent(query)}`);
    };

    // Determine if we should show the full header/footer (e.g., hide on 404 or auth pages if desired, strictly implied by current Usage)
    // For now, we apply it to all main routes.

    return (
        <div className="flex flex-col min-h-screen">
            <Header cartItemsCount={itemsCount} onSearch={handleSearch} />
            <main className="flex-1">
                <Outlet />
            </main>
            <Footer />
        </div>
    );
};

export default Layout;
