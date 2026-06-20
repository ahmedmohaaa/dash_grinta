import React, { useState, useEffect } from 'react';
import Navbar from '../../components/Navbar';

const LeaguesPage = () => {
  const [leagues, setLeagues] = useState([]);
  const [loading, setLoading] = useState(false);

const API_BASE_URL = 'https://api.algrinta.com/api';
  const token = localStorage.getItem('access_token');

  useEffect(() => {
    fetchLeagues();
  }, []);

  const fetchLeagues = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/leagues/`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) setLeagues(data);
    } catch (err) {
      console.error('خطأ في جلب الدوريات', err);
    }
  };

  const toggleLeagueStatus = async (id, currentStatus) => {
    try {
      const res = await fetch(`${API_BASE_URL}/leagues/${id}/`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ is_active: !currentStatus })
      });
      
      if (res.ok) {
        // تحديث الحالة محلياً لتغيير لون الزر فوراً
        setLeagues(leagues.map(league => 
          league.id === id ? { ...league, is_active: !currentStatus } : league
        ));
      } else {
        alert('حدث خطأ أثناء تعديل الحالة');
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div style={{ backgroundColor: '#f8fafc', minHeight: '100vh', direction: 'rtl', fontFamily: 'Segoe UI' }}>
      <Navbar />
      <div style={{ padding: '30px', maxWidth: '1200px', margin: '0 auto' }}>
        <div className="card" style={{ backgroundColor: '#fff', padding: '20px', borderRadius: '8px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
          <h2 style={{ color: '#1e293b', borderBottom: '2px solid #e2e8f0', paddingBottom: '10px' }}>
            🏆 إدارة ظهور الدوريات ({leagues.length})
          </h2>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px', marginTop: '20px' }}>
            {leagues.map(league => (
              <div key={league.id} style={{ border: '1px solid #e2e8f0', borderRadius: '8px', padding: '15px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  {league.logo && <img src={league.logo} alt="logo" style={{ width: '40px', height: '40px', objectFit: 'contain' }} />}
                  <div>
                    <h4 style={{ margin: '0 0 5px 0', color: '#334155' }}>{league.name}</h4>
                    <span style={{ fontSize: '12px', color: '#64748b' }}>{league.country} - {league.season}</span>
                  </div>
                </div>
                
                <button 
                  onClick={() => toggleLeagueStatus(league.id, league.is_active)}
                  style={{
                    padding: '8px 15px', borderRadius: '20px', border: 'none', cursor: 'pointer', fontWeight: 'bold',
                    backgroundColor: league.is_active ? '#10b981' : '#ef4444',
                    color: 'white', transition: '0.3s'
                  }}
                >
                  {league.is_active ? '✅ ظاهر' : '❌ مخفي'}
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LeaguesPage;