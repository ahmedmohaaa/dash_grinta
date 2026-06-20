import React, { useState } from 'react';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);

  const handleLogout = () => {
    localStorage.clear();
    window.location.href = '/login';
  };

  return (
    <>
      <style>{`
        .navbar {
          background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%);
          padding: 15px 30px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
          position: sticky;
          top: 0;
          z-index: 1000;
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          direction: rtl;
        }
        .nav-brand {
          color: #34d399;
          font-size: 22px;
          font-weight: 800;
          text-decoration: none;
          display: flex;
          align-items: center;
          gap: 10px;
        }
        .nav-links {
          display: flex;
          gap: 25px;
          align-items: center;
        }
        .nav-link {
          color: #e2e8f0;
          text-decoration: none;
          font-size: 15px;
          font-weight: 500;
          transition: all 0.3s ease;
          padding: 8px 16px;
          border-radius: 6px;
        }
        .nav-link:hover, .nav-link.active {
          color: #fff;
          background: rgba(52, 211, 153, 0.15);
          box-shadow: inset 0 0 10px rgba(52, 211, 153, 0.2);
        }
        .logout-btn {
          background: #ef4444;
          color: white;
          border: none;
          padding: 8px 18px;
          border-radius: 6px;
          cursor: pointer;
          font-weight: 600;
          transition: all 0.3s ease;
        }
        .logout-btn:hover {
          background: #dc2626;
          box-shadow: 0 4px 12px rgba(239, 68, 68, 0.3);
        }
        .menu-toggle {
          display: none;
          flex-direction: column;
          gap: 5px;
          cursor: pointer;
          background: none;
          border: none;
        }
        .menu-toggle span {
          width: 25px;
          height: 3px;
          background-color: #e2e8f0;
          border-radius: 2px;
          transition: 0.3s;
        }
        @media (max-width: 768px) {
          .nav-links {
            display: ${isOpen ? 'flex' : 'none'};
            flex-direction: column;
            position: absolute;
            top: 100%;
            left: 0;
            right: 0;
            background: #1e293b;
            padding: 20px;
            box-shadow: 0 10px 15px rgba(0,0,0,0.1);
            gap: 15px;
          }
          .menu-toggle {
            display: flex;
          }
          .logout-btn {
            width: 100%;
            text-align: center;
          }
        }
      `}</style>

      <nav className="navbar">
        <a href="/dashboard" className="nav-brand">
          ⚽ لوحة التحكم GRINTA
        </a>

        <button className="menu-toggle" onClick={() => setIsOpen(!isOpen)}>
          <span></span>
          <span></span>
          <span></span>
        </button>

{/* داخل الـ nav-links */}
<div className="nav-links">
  <a href="/dashboard" className="nav-link active">📰 إدارة المقالات</a>
  <a href="/video" className="nav-link">🎬 الفيديوهات</a>
  
  {/* الروابط الجديدة */}
  <a href="/leagues" className="nav-link">🏆 الدوريات</a>
  <a href="/fixtures" className="nav-link">⚽ المباريات</a>
  
  <a href="/ads" className="nav-link">💰 الإعلانات</a>
  <a href="/seo" className="nav-link">🔍 الـ SEO</a>
  
  <button onClick={handleLogout} className="logout-btn">
    تسجيل الخروج 🚪
  </button>
</div>
      </nav>
    </>
  );
};

export default Navbar;