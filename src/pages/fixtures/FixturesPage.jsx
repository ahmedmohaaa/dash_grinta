import React, { useState, useEffect } from 'react';
import Navbar from '../../components/Navbar';

const FixturesPage = () => {
  const [fixtures, setFixtures] = useState([]);
  
  // 1. إضافة حالات جديدة للتحميل البطيء (Lazy Loading)
  const [visibleCount, setVisibleCount] = useState(30); // عرض 30 مباراة كبداية
  const [isLoading, setIsLoading] = useState(true);

  const API_BASE_URL = 'https://api.algrinta.com/api';
  const token = localStorage.getItem('access_token');

  useEffect(() => {
    fetchFixtures();
  }, []);

  // 2. مستمع التمرير (Scroll Listener) لزيادة عدد المباريات عند النزول لأسفل
  useEffect(() => {
    const handleScroll = () => {
      // إذا وصل المستخدم لأسفل الصفحة (أو قبل النهاية بقليل)
      if (
        window.innerHeight + document.documentElement.scrollTop >= 
        document.documentElement.offsetHeight - 200
      ) {
        // نعرض 30 مباراة إضافية
        setVisibleCount(prevCount => prevCount + 30);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const fetchFixtures = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/fixtures/`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      
      if (res.ok) {
        // حماية إضافية: إذا كان الباك إند يرسل البيانات داخل results أو كمصفوفة مباشرة
        const actualData = Array.isArray(data) ? data : (data.results || []);
        setFixtures(actualData);
      }
    } catch (err) {
      console.error('خطأ في جلب المباريات', err);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleFixtureStatus = async (id, currentStatus) => {
    try {
      const res = await fetch(`${API_BASE_URL}/fixtures/${id}/`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ is_active: !currentStatus })
      });
      
      if (res.ok) {
        setFixtures(fixtures.map(fixture => 
          fixture.id === id ? { ...fixture, is_active: !currentStatus } : fixture
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
            ⚽ إدارة ظهور المباريات ({fixtures.length})
          </h2>
          
          {isLoading ? (
            <div style={{ textAlign: 'center', padding: '50px', fontSize: '18px', color: '#64748b' }}>
              جاري تحميل المباريات...
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', marginTop: '20px' }}>
              
              {/* 3. التعديل السحري هنا: نستخدم slice لعرض العدد المسموح به فقط */}
              {fixtures.slice(0, visibleCount).map(fixture => (
                <div key={fixture.id} style={{ border: '1px solid #e2e8f0', borderRadius: '8px', padding: '15px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: fixture.is_active ? '#ffffff' : '#fef2f2' }}>
                  
                  <div style={{ display: 'flex', alignItems: 'center', gap: '20px', flex: 1 }}>
                    {/* فريق الأرض */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', width: '150px' }}>
                      <img src={fixture.home_team_logo} alt="home" style={{ width: '30px' }} />
                      <strong>{fixture.home_team_name}</strong>
                    </div>
                    
                    {/* النتيجة والتوقيت */}
                    <div style={{ textAlign: 'center', minWidth: '100px', backgroundColor: '#f1f5f9', padding: '5px 15px', borderRadius: '20px' }}>
                      <span style={{ fontSize: '18px', fontWeight: 'bold' }}>{fixture.home_score ?? '-'} : {fixture.away_score ?? '-'}</span>
                      <div style={{ fontSize: '12px', color: '#64748b' }}>{new Date(fixture.date).toLocaleTimeString('ar-EG', {hour: '2-digit', minute:'2-digit'})}</div>
                    </div>

                    {/* الفريق الضيف */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', width: '150px' }}>
                      <img src={fixture.away_team_logo} alt="away" style={{ width: '30px' }} />
                      <strong>{fixture.away_team_name}</strong>
                    </div>
                  </div>
                  
                  {/* زر التحكم */}
                  <button 
                    onClick={() => toggleFixtureStatus(fixture.id, fixture.is_active)}
                    style={{
                      padding: '8px 20px', borderRadius: '8px', border: 'none', cursor: 'pointer', fontWeight: 'bold',
                      backgroundColor: fixture.is_active ? '#10b981' : '#ef4444',
                      color: 'white', transition: '0.3s'
                    }}
                  >
                    {fixture.is_active ? 'عرض في الموقع' : 'مخفية'}
                  </button>
                </div>
              ))}
              
              {/* إشعار بسيط أسفل الصفحة إذا كان هناك مباريات لم تظهر بعد */}
              {visibleCount < fixtures.length && (
                <div style={{ textAlign: 'center', padding: '10px', color: '#64748b' }}>
                  اسحب للأسفل لعرض المزيد...
                </div>
              )}

            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FixturesPage;
