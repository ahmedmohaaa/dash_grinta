import React, { useState, useEffect } from 'react';
import Navbar from '../../components/Navbar';

const SeoPage = () => {
  // بيانات السيرفر
  const [seoSettings, setSeoSettings] = useState([]);
  
  // حالات النموذج المطابقة لـ SeoSetting Model
  const [page, setPage] = useState('');
  const [metaTitle, setMetaTitle] = useState('');
  const [metaDescription, setMetaDescription] = useState('');
  const [keywords, setKeywords] = useState('');
  
  // التحكم والتنبيهات
  const [editId, setEditId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

const API_BASE_URL = 'https://api.algrinta.com/api';
  const token = localStorage.getItem('access_token');

  // جلب الإعدادات الحالية
  useEffect(() => {
    fetchSeoSettings();
  }, []);

  const fetchSeoSettings = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/seo/`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setSeoSettings(data);
      } else {
        showMsg('error', 'غير مصرح لك بجلب إعدادات السيو، تأكد من صلاحياتك كمدير.');
      }
    } catch (err) {
      showMsg('error', 'فشل الاتصال بالسيرفر.');
    }
  };

  const showMsg = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: '', text: '' }), 4000);
  };

  // حفظ أو تعديل السيو
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const seoData = { 
      page: page, 
      meta_title: metaTitle, 
      meta_description: metaDescription, 
      keywords: keywords 
    };

    let url = `${API_BASE_URL}/seo/`;
    let method = 'POST';

    if (editId) {
      url = `${API_BASE_URL}/seo/${editId}/`;
      method = 'PUT';
    }

    try {
      const res = await fetch(url, {
        method: method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(seoData)
      });

      if (res.ok) {
        showMsg('success', editId ? '🚀 تم تحديث إعدادات السيو بنجاح!' : '🎉 تم إضافة إعدادات السيو للصفحة بنجاح!');
        resetForm();
        fetchSeoSettings();
      } else {
        const errData = await res.json();
        if (errData.page) {
            showMsg('error', 'هذه الصفحة تمتلك إعدادات سيو مسبقاً، يرجى تعديلها بدلاً من إضافة جديد.');
        } else {
            showMsg('error', 'حدث خطأ أثناء حفظ البيانات.');
        }
      }
    } catch (err) {
      showMsg('error', 'فشل الاتصال بالسيرفر.');
    } finally {
      setLoading(false);
    }
  };

  // تهيئة التعديل
  const handleEditSetup = (item) => {
    setEditId(item.id);
    setPage(item.page);
    setMetaTitle(item.meta_title);
    setMetaDescription(item.meta_description);
    setKeywords(item.keywords);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // حذف السيو
  const handleDelete = async (id) => {
    if (!window.confirm('🚨 هل أنت متأكد من حذف إعدادات السيو لهذه الصفحة؟ سيؤثر هذا على تصدرك في محركات البحث.')) return;

    try {
      const res = await fetch(`${API_BASE_URL}/seo/${id}/`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (res.ok) {
        showMsg('success', 'تم الحذف بنجاح.');
        fetchSeoSettings();
        if (editId === id) resetForm();
      }
    } catch (err) {
      showMsg('error', 'حدث خطأ أثناء الاتصال بالخادم.');
    }
  };

  const resetForm = () => {
    setEditId(null);
    setPage('');
    setMetaTitle('');
    setMetaDescription('');
    setKeywords('');
  };

  return (
    <div className="dashboard-container">
      <style>{`
        .dashboard-container { background-color: #0f172a; min-height: 100vh; font-family: 'Segoe UI', system-ui, sans-serif; direction: rtl; color: #e2e8f0; }
        .main-content { padding: 40px 20px; max-width: 1400px; margin: 0 auto; }
        
        .alert { padding: 16px 20px; border-radius: 12px; margin-bottom: 30px; font-weight: 600; animation: slideDown 0.3s ease; }
        .alert-success { background: rgba(16, 185, 129, 0.1); color: #34d399; border: 1px solid #10b981; }
        .alert-error { background: rgba(239, 68, 68, 0.1); color: #f87171; border: 1px solid #ef4444; }
        
        .grid-layout { display: grid; grid-template-columns: 1.2fr 1.8fr; gap: 30px; }
        @media (max-width: 1100px) { .grid-layout { grid-template-columns: 1fr; } }
        
        .card { background: #1e293b; border-radius: 20px; box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2); padding: 30px; border: 1px solid #334155; height: fit-content; }
        .card-title { font-size: 22px; font-weight: 700; color: #f8fafc; margin-bottom: 30px; display: flex; align-items: center; gap: 10px; border-bottom: 1px solid #334155; padding-bottom: 15px; }
        
        .form-group { margin-bottom: 24px; }
        .form-group label { display: flex; justify-content: space-between; margin-bottom: 10px; font-weight: 600; color: #cbd5e1; font-size: 14.5px; }
        .char-counter { font-size: 12px; color: #64748b; font-weight: normal; }
        .char-counter.warning { color: #f59e0b; }
        .char-counter.danger { color: #ef4444; }

        .form-control { width: 100%; padding: 14px 16px; border: 1px solid #475569; border-radius: 12px; font-size: 15px; background-color: #0f172a; color: #f8fafc; outline: none; transition: all 0.3s; box-sizing: border-box; }
        .form-control:focus { border-color: #3b82f6; box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.15); }
        textarea.form-control { min-height: 100px; resize: vertical; }
        
        /* تصميم معاينة جوجل (Google Preview) */
        .google-preview { background: #ffffff; padding: 20px; border-radius: 12px; margin-bottom: 25px; box-shadow: 0 4px 6px rgba(0,0,0,0.05); direction: rtl; font-family: Arial, sans-serif; }
        .google-preview-title { font-size: 20px; color: #1a0dab; margin: 0 0 4px 0; font-weight: normal; cursor: pointer; text-decoration: none; display: block; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
        .google-preview-title:hover { text-decoration: underline; }
        .google-preview-url { color: #006621; font-size: 14px; margin: 0 0 4px 0; }
        .google-preview-desc { color: #545454; font-size: 14px; line-height: 1.57; margin: 0; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
        
        .btn-submit { width: 100%; padding: 15px; background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%); color: white; border: none; border-radius: 12px; font-size: 16px; font-weight: 700; cursor: pointer; transition: 0.3s; box-shadow: 0 4px 15px rgba(59, 130, 246, 0.3); }
        .btn-submit:hover:not(:disabled) { box-shadow: 0 6px 20px rgba(59, 130, 246, 0.4); transform: translateY(-2px); }
        .btn-cancel { width: 100%; padding: 14px; background: transparent; color: #94a3b8; border: 1px solid #475569; border-radius: 12px; margin-top: 15px; cursor: pointer; font-weight: 600; transition: 0.3s; }
        .btn-cancel:hover { background: #1e293b; color: #f8fafc; }

        .seo-list { display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 20px; }
        .seo-item { background: #0f172a; border: 1px solid #334155; border-radius: 16px; padding: 20px; transition: 0.3s; position: relative; overflow: hidden; }
        .seo-item:hover { border-color: #3b82f6; transform: translateY(-3px); box-shadow: 0 10px 20px rgba(0,0,0,0.2); }
        .seo-item::before { content: ''; position: absolute; top: 0; left: 0; width: 4px; height: 100%; background: #3b82f6; }
        
        .seo-page-name { font-size: 18px; font-weight: bold; color: #f8fafc; margin: 0 0 10px 0; }
        .seo-meta-title { color: #94a3b8; font-size: 14px; margin-bottom: 15px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .keywords-tags { display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 20px; }
        .keyword-tag { background: #1e293b; color: #38bdf8; border: 1px solid #0369a1; padding: 4px 10px; border-radius: 20px; font-size: 12px; }
        
        .actions { display: flex; gap: 10px; border-top: 1px solid #334155; padding-top: 15px; }
        .btn-edit { flex: 1; background: rgba(59, 130, 246, 0.1); color: #60a5fa; border: 1px solid #3b82f6; padding: 8px; border-radius: 8px; cursor: pointer; font-weight: 600; transition: 0.2s; }
        .btn-edit:hover { background: #3b82f6; color: white; }
        .btn-delete { flex: 1; background: rgba(239, 68, 68, 0.1); color: #f87171; border: 1px solid #ef4444; padding: 8px; border-radius: 8px; cursor: pointer; font-weight: 600; transition: 0.2s; }
        .btn-delete:hover { background: #ef4444; color: white; }
      `}</style>

      <Navbar />

      <div className="main-content">
        {message.text && (
          <div className={`alert alert-${message.type}`}>
            {message.type === 'success' ? '✨ ' : '⚠️ '} {message.text}
          </div>
        )}

        <div className="grid-layout">
          
          {/* العمود الأول: إضافة/تعديل إعدادات السيو ومعاينة جوجل */}
          <div className="card">
            <h3 className="card-title">🔍 {editId ? 'تحديث السيو للصفحة' : 'تهيئة صفحة لمحركات البحث'}</h3>
            
            {/* المعاينة الحية لجوجل */}
            <div className="google-preview">
              <h4 style={{margin: '0 0 10px 0', fontSize: '14px', color: '#1a73e8', borderBottom: '1px solid #eee', paddingBottom: '8px'}}>معاينة شكل النتيجة في Google</h4>
              <p className="google-preview-url">yoursite.com › {page.toLowerCase().replace(/\s+/g, '-') || 'page-name'}</p>
              <h3 className="google-preview-title">{metaTitle || 'عنوان الصفحة سيظهر هنا (Meta Title)'}</h3>
              <p className="google-preview-desc">
                {metaDescription || 'وصف الصفحة سيظهر هنا. يفضل أن يكون جذاباً ويشرح محتوى الصفحة بدقة لجذب النقرات من الزوار (Meta Description).'}
              </p>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>اسم الصفحة (Page Name) أو الرابط</label>
                <input type="text" className="form-control" value={page} onChange={(e) => setPage(e.target.value)} required placeholder="مثال: home أو about-us" disabled={editId !== null} title={editId ? "لا يمكن تعديل اسم الصفحة بعد إنشائها، يمكنك حذفها وإنشاء جديدة." : ""} />
              </div>

              <div className="form-group">
                <label>
                  <span>عنوان السيو (Meta Title)</span>
                  <span className={`char-counter ${metaTitle.length > 60 ? 'danger' : metaTitle.length > 50 ? 'warning' : ''}`}>
                    {metaTitle.length} / 60
                  </span>
                </label>
                <input type="text" className="form-control" value={metaTitle} onChange={(e) => setMetaTitle(e.target.value)} required placeholder="العنوان الذي يظهر في بحث جوجل المتصفح" />
              </div>

              <div className="form-group">
                <label>
                  <span>وصف السيو (Meta Description)</span>
                  <span className={`char-counter ${metaDescription.length > 160 ? 'danger' : metaDescription.length > 150 ? 'warning' : ''}`}>
                    {metaDescription.length} / 160
                  </span>
                </label>
                <textarea className="form-control" value={metaDescription} onChange={(e) => setMetaDescription(e.target.value)} required placeholder="وصف دقيق للمحتوى يجذب الزائر للنقر..."></textarea>
              </div>

              <div className="form-group">
                <label>الكلمات المفتاحية (Keywords)</label>
                <input type="text" className="form-control" value={keywords} onChange={(e) => setKeywords(e.target.value)} placeholder="مثال: رياضة، كرة قدم، أخبار عاجلة (مفصولة بفاصلة)" />
              </div>

              <button type="submit" className="btn-submit" disabled={loading}>
                {loading ? '⏳ جاري الحفظ...' : (editId ? 'حفظ إعدادات السيو' : 'اعتماد ونشر السيو')}
              </button>
              
              {editId && <button type="button" className="btn-cancel" onClick={resetForm}>إلغاء التعديل</button>}
            </form>
          </div>

          {/* العمود الثاني: صفحات الموقع المجهزة بالسيو */}
          <div className="card">
            <h3 className="card-title">📈 الصفحات المهيأة برمجياً ({seoSettings.length})</h3>
            
            {seoSettings.length === 0 ? (
              <p style={{textAlign: 'center', color: '#64748b', padding: '40px 20px'}}>لم تقم بتهيئة أي صفحة لمحركات البحث بعد.</p>
            ) : (
              <div className="seo-list">
                {seoSettings.map(item => (
                  <div key={item.id} className="seo-item">
                    <h4 className="seo-page-name">/{item.page}</h4>
                    <p className="seo-meta-title">{item.meta_title}</p>
                    
                    <div className="keywords-tags">
                      {/* تقسيم الكلمات المفتاحية وعرضها كـ Tags */}
                      {item.keywords.split(',').slice(0, 3).map((kw, index) => (
                        kw.trim() && <span key={index} className="keyword-tag">#{kw.trim()}</span>
                      ))}
                      {item.keywords.split(',').length > 3 && <span className="keyword-tag">+{item.keywords.split(',').length - 3}</span>}
                    </div>
                    
                    <div className="actions">
                      <button className="btn-edit" onClick={() => handleEditSetup(item)}>تعديل السيو</button>
                      <button className="btn-delete" onClick={() => handleDelete(item.id)}>حذف</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
};

export default SeoPage;