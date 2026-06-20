import React, { useState, useEffect } from 'react';
import Navbar from '../../components/Navbar';

const AdPage = () => {
  // بيانات السيرفر
  const [ads, setAds] = useState([]);
  
  // حالات النموذج
  const [name, setName] = useState('');
  const [position, setPosition] = useState('top'); // قيمة افتراضية
  const [page, setPage] = useState('home'); // قيمة افتراضية
  const [code, setCode] = useState('');
  const [status, setStatus] = useState('active');
  
  // حالات التحكم
  const [editId, setEditId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

const API_BASE_URL = 'https://api.algrinta.com/api';
  const token = localStorage.getItem('access_token');

  useEffect(() => {
    fetchAds();
  }, []);

  const fetchAds = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/ads/`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setAds(data);
      } else {
        showMsg('error', 'غير مصرح لك بجلب الإعلانات، يجب أن تكون مديراً.');
      }
    } catch (err) {
      showMsg('error', 'فشل الاتصال بالسيرفر.');
    }
  };

  const showMsg = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: '', text: '' }), 4000);
  };

  // إضافة أو تعديل إعلان
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const adData = { name, position, page, code, status };
    let url = `${API_BASE_URL}/ads/`;
    let method = 'POST';

    if (editId) {
      url = `${API_BASE_URL}/ads/${editId}/`;
      method = 'PUT';
    }

    try {
      const res = await fetch(url, {
        method: method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(adData)
      });

      if (res.ok) {
        showMsg('success', editId ? 'تم تحديث الإعلان بنجاح!' : 'تم إضافة الإعلان بنجاح!');
        resetForm();
        fetchAds();
      } else {
        showMsg('error', 'حدث خطأ، تأكد من صحة البيانات أو صلاحياتك.');
      }
    } catch (err) {
      showMsg('error', 'فشل الاتصال بالسيرفر.');
    } finally {
      setLoading(false);
    }
  };

  // تغيير حالة الإعلان بسرعة (مفعل/معطل)
  const toggleAdStatus = async (ad) => {
    const newStatus = ad.status === 'active' ? 'inactive' : 'active';
    try {
      // نستخدم PATCH لتحديث حقل واحد فقط
      const res = await fetch(`${API_BASE_URL}/ads/${ad.id}/`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status: newStatus })
      });

      if (res.ok) {
        showMsg('success', `تم ${newStatus === 'active' ? 'تفعيل' : 'إيقاف'} الإعلان بنجاح.`);
        fetchAds();
      }
    } catch (err) {
      showMsg('error', 'حدث خطأ أثناء تغيير حالة الإعلان.');
    }
  };

  const handleEditSetup = (ad) => {
    setEditId(ad.id);
    setName(ad.name);
    setPosition(ad.position);
    setPage(ad.page);
    setCode(ad.code);
    setStatus(ad.status);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id) => {
    if (!window.confirm('هل أنت متأكد من حذف هذا الإعلان نهائياً؟')) return;

    try {
      const res = await fetch(`${API_BASE_URL}/ads/${id}/`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (res.ok) {
        showMsg('success', 'تم حذف الإعلان.');
        fetchAds();
        if (editId === id) resetForm();
      }
    } catch (err) {
      showMsg('error', 'حدث خطأ أثناء الحذف.');
    }
  };

  const resetForm = () => {
    setEditId(null);
    setName('');
    setPosition('top');
    setPage('home');
    setCode('');
    setStatus('active');
  };

  return (
    <div className="dashboard-container">
      <style>{`
        .dashboard-container { background-color: #f8fafc; min-height: 100vh; font-family: 'Segoe UI', system-ui, sans-serif; direction: rtl; }
        .main-content { padding: 30px 20px; max-width: 1400px; margin: 0 auto; }
        
        .alert { padding: 16px 20px; border-radius: 10px; margin-bottom: 30px; font-weight: 600; box-shadow: 0 4px 12px rgba(0,0,0,0.05); }
        .alert-success { background: #dcfce7; color: #166534; border-right: 5px solid #22c55e; }
        .alert-error { background: #fee2e2; color: #991b1b; border-right: 5px solid #ef4444; }
        
        .grid-layout { display: grid; grid-template-columns: 1.1fr 1.9fr; gap: 30px; }
        @media (max-width: 1100px) { .grid-layout { grid-template-columns: 1fr; } }
        
        .card { background: #ffffff; border-radius: 16px; box-shadow: 0 4px 20px rgba(0,0,0,0.03); padding: 30px; border: 1px solid #f1f5f9; height: fit-content; }
        .card-title { font-size: 20px; font-weight: 700; color: #1e293b; margin-bottom: 25px; display: flex; align-items: center; gap: 10px; }
        
        .form-group { margin-bottom: 20px; }
        .form-group label { display: block; margin-bottom: 8px; font-weight: 600; color: #475569; font-size: 14px; }
        .form-control { width: 100%; padding: 12px 16px; border: 1px solid #e2e8f0; border-radius: 10px; font-size: 14px; outline: none; transition: all 0.2s; box-sizing: border-box; }
        .form-control:focus { border-color: #3b82f6; box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.1); }
        textarea.form-control { min-height: 120px; font-family: monospace; direction: ltr; text-align: left; background: #f8fafc; }
        
        .btn-submit { width: 100%; padding: 14px; background: #3b82f6; color: white; border: none; border-radius: 10px; font-size: 15px; font-weight: bold; cursor: pointer; transition: 0.3s; }
        .btn-submit:hover:not(:disabled) { background: #2563eb; transform: translateY(-2px); }
        .btn-cancel { width: 100%; padding: 12px; background: transparent; color: #64748b; border: 1px solid #e2e8f0; border-radius: 10px; margin-top: 10px; cursor: pointer; font-weight: 600; }
        .btn-cancel:hover { background: #f1f5f9; }

        .ads-list { display: flex; flex-direction: column; gap: 15px; }
        .ad-item { display: flex; justify-content: space-between; align-items: center; padding: 20px; background: #fff; border: 1px solid #e2e8f0; border-radius: 12px; transition: 0.2s; }
        .ad-item:hover { border-color: #cbd5e1; box-shadow: 0 4px 12px rgba(0,0,0,0.02); }
        
        .ad-info h4 { margin: 0 0 5px 0; color: #0f172a; font-size: 16px; font-weight: bold; }
        .ad-meta { display: flex; gap: 15px; font-size: 13px; color: #64748b; }
        .badge { background: #f1f5f9; padding: 3px 8px; border-radius: 6px; font-weight: 500; }
        
        /* تصميم زر التفعيل/الإيقاف الذكي */
        .toggle-switch { position: relative; display: inline-block; width: 50px; height: 26px; }
        .toggle-switch input { opacity: 0; width: 0; height: 0; }
        .slider { position: absolute; cursor: pointer; top: 0; left: 0; right: 0; bottom: 0; background-color: #cbd5e1; transition: .4s; border-radius: 34px; }
        .slider:before { position: absolute; content: ""; height: 20px; width: 20px; left: 3px; bottom: 3px; background-color: white; transition: .4s; border-radius: 50%; }
        input:checked + .slider { background-color: #22c55e; }
        input:checked + .slider:before { transform: translateX(24px); }
        
        .actions { display: flex; gap: 10px; align-items: center; }
        .btn-icon { background: none; border: none; font-size: 18px; cursor: pointer; padding: 5px; border-radius: 6px; transition: 0.2s; }
        .btn-edit { color: #3b82f6; } .btn-edit:hover { background: #eff6ff; }
        .btn-delete { color: #ef4444; } .btn-delete:hover { background: #fef2f2; }
      `}</style>

      <Navbar />

      <div className="main-content">
        {message.text && (
          <div className={`alert alert-${message.type}`}>
            {message.type === 'success' ? '✅ ' : '❌ '} {message.text}
          </div>
        )}

        <div className="grid-layout">
          
          {/* العمود الأول: إضافة إعلان */}
          <div className="card">
            <h3 className="card-title">📢 {editId ? 'تعديل الإعلان' : 'إضافة إعلان جديد'}</h3>
            <form onSubmit={handleSubmit}>
              
              <div className="form-group">
                <label>اسم الإعلان (لتمييزه في الإدارة)</label>
                <input type="text" className="form-control" value={name} onChange={(e) => setName(e.target.value)} required placeholder="مثال: إعلان هيدر الرئيسية" />
              </div>

              <div style={{display: 'flex', gap: '15px'}}>
                <div className="form-group" style={{flex: 1}}>
                  <label>موضع الإعلان (Position)</label>
                  <select className="form-control" value={position} onChange={(e) => setPosition(e.target.value)} required>
                    <option value="top">أعلى الصفحة (Top)</option>
                    <option value="middle">وسط الصفحة (Middle)</option>
                    <option value="bottom">أسفل الصفحة (Bottom)</option>
                    <option value="sidebar">الشريط الجانبي (Sidebar)</option>
                  </select>
                </div>

                <div className="form-group" style={{flex: 1}}>
                  <label>الصفحة المستهدفة (Page)</label>
                  <select className="form-control" value={page} onChange={(e) => setPage(e.target.value)} required>
                    <option value="home">الرئيسية (Home)</option>
                    <option value="article">صفحة المقال (Article)</option>
                    <option value="video">صفحة الفيديو (Video)</option>
                    <option value="all">كل الصفحات (All)</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label>كود الإعلان (AdSense / HTML / JS)</label>
                <textarea 
                  className="form-control" 
                  value={code} 
                  onChange={(e) => setCode(e.target.value)} 
                  required 
                  placeholder=""
                ></textarea>
              </div>

              <div className="form-group" style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f8fafc', padding: '15px', borderRadius: '10px'}}>
                <label style={{margin: 0}}>حالة الإعلان عند النشر</label>
                <label className="toggle-switch">
                  <input type="checkbox" checked={status === 'active'} onChange={(e) => setStatus(e.target.checked ? 'active' : 'inactive')} />
                  <span className="slider"></span>
                </label>
              </div>

              <button type="submit" className="btn-submit" disabled={loading}>
                {loading ? '⏳ جاري الحفظ...' : (editId ? 'حفظ التعديلات' : 'نشر الإعلان')}
              </button>
              
              {editId && <button type="button" className="btn-cancel" onClick={resetForm}>إلغاء التعديل</button>}
            </form>
          </div>

          {/* العمود الثاني: قائمة الإعلانات */}
          <div className="card">
            <h3 className="card-title">📊 إدارة الإعلانات النشطة والمعطلة ({ads.length})</h3>
            <div className="ads-list">
              {ads.length === 0 ? (
                <p style={{textAlign: 'center', color: '#94a3b8', padding: '20px'}}>لا توجد إعلانات حالياً.</p>
              ) : (
                ads.map(ad => (
                  <div key={ad.id} className="ad-item">
                    <div className="ad-info">
                      <h4>{ad.name}</h4>
                      <div className="ad-meta">
                        <span className="badge">📄 {ad.page}</span>
                        <span className="badge">📌 {ad.position}</span>
                      </div>
                    </div>
                    
                    <div className="actions">
                      <div style={{display: 'flex', alignItems: 'center', gap: '8px', marginRight: '15px'}}>
                        <span style={{fontSize: '12px', fontWeight: 'bold', color: ad.status === 'active' ? '#16a34a' : '#94a3b8'}}>
                          {ad.status === 'active' ? 'نشط' : 'معطل'}
                        </span>
                        {/* زر التبديل السريع */}
                        <label className="toggle-switch">
                          <input type="checkbox" checked={ad.status === 'active'} onChange={() => toggleAdStatus(ad)} />
                          <span className="slider"></span>
                        </label>
                      </div>

                      <button className="btn-icon btn-edit" onClick={() => handleEditSetup(ad)} title="تعديل">✏️</button>
                      <button className="btn-icon btn-delete" onClick={() => handleDelete(ad.id)} title="حذف">🗑️</button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default AdPage;