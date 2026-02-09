import Sidebar from './Sidebar';
import TopBar from './TopBar';
import './MainLayout.css';

const MainLayout = ({ children, pageTitle }) => {
    return (
        <div className="main-layout">
            <Sidebar />
            <div className="content-wrapper">
                <TopBar pageTitle={pageTitle} />
                <main className="page-content">
                    {children}
                </main>
            </div>
        </div>
    );
};

export default MainLayout;
