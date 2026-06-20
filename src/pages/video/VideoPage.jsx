import React, { useState, useEffect } from 'react';
import Navbar from '../../components/Navbar';

const VideoPage = () => {
  // حالات البيانات القادمة من السيرفر
  const [videos, setVideos] = useState([]);
  
  // حقول النموذج (العنوان وملف الفيديو المرفوع)
  const [title, setTitle] = useState('');
  const [videoFile, setVideoFile] = useState(null); 
  
  // التحكم في حالة التعديل والتحميل والإشعارات
  const [editId, setEditId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

const API_BASE_URL = 'https://api.algrinta.com/api';
  const token = localStorage.getItem('access_token');

  // جلب الفيديوهات عند تحميل الصفحة
  useEffect(() => {
    fetchVideos();
  }, []);

  const fetchVideos = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/videos/`);
      const data = await res.json();
      if (res.ok) {
        setVideos(data);
      }
    } catch (err) {
      showMsg('error', 'خطأ في جلب الفيديوهات من السيرفر');
    }
  };

  const showMsg = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: '', text: '' }), 4000);
  };

  // معالجة إرسال البيانات (إضافة أو تعديل فيديو) باستخدام FormData
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    // استخدام FormData بدلاً من JSON لتمكين رفع ملفات الفيديو
    const formData = new FormData();
    formData.append('title', title);
    
    // نرسل الملف فقط في حال قام المستخدم باختياره
    if (videoFile) {
      formData.append('video_file', videoFile);
    }

    let url = `${API_BASE_URL}/videos/`;
    let method = 'POST';

    if (editId) {
      url = `${API_BASE_URL}/videos/${editId}/`;
      method = 'PATCH'; // نستخدم PATCH في التعديل مع الملفات لمرونة أكبر
    }

    try {
      const res = await fetch(url, {
        method: method,
        headers: {
          // هامة جداً: لا تضع Content-Type هنا، المتصفح سيقوم بوضعها مع الـ boundary تلقائياً
          'Authorization': `Bearer ${token}`
        },
        body: formData // إرسال كائن الـ FormData مباشرة
      });

      if (res.ok) {
        showMsg('success', editId ? '🚀 تم تحديث الفيديو بنجاح!' : '🎉 تم رفع الفيديو إلى قاعدة البيانات بنجاح!');
        resetForm();
        fetchVideos();
      } else {
        showMsg('error', 'حدث خطأ أثناء حفظ الفيديو، تحقق من حجم الملف والمدخلات');
      }
    } catch (err) {
      showMsg('error', 'فشل الاتصال بالسيرفر، تأكد من تشغيل دجانغو');
    } finally {
      setLoading(false);
    }
  };

  // تجهيز البيانات ونقلها إلى الفورم عند التعديل
  const handleEditSetup = (video) => {
    setEditId(video.id);
    setTitle(video.title);
    setVideoFile(null); // نترك حقل الملف فارغاً إلا إذا أراد تغيير الفيديو القديم
    
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // حذف فيديو
  const handleDelete = async (id) => {
    if (!window.confirm('🚨 هل أنت متأكد تماماً من حذف هذا الفيديو؟ لا يمكن التراجع عن هذا الإجراء.')) return;

    try {
      const res = await fetch(`${API_BASE_URL}/videos/${id}/`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (res.ok) {
        showMsg('success', 'تم حذف الفيديو بنجاح');
        fetchVideos();
        if (editId === id) resetForm();
      } else {
        showMsg('error', 'فشلت عملية الحذف');
      }
    } catch (err) {
      showMsg('error', 'حدث خطأ أثناء الاتصال بالخادم');
    }
  };

  const resetForm = () => {
    setEditId(null);
    setTitle('');
    setVideoFile(null);
    // تصفية قيمة حقل اختيار الملفات في واجهة المستخدم
    const fileInput = document.getElementById('video-file-input');
    if (fileInput) fileInput.value = '';
  };

  return (
    <div className="dashboard-container">
      <style>{`
        .dashboard-container { background-color: #f1f5f9; min-height: 100vh; font-family: 'Segoe UI', system-ui, sans-serif; direction: rtl; }
        .main-content { padding: 30px 20px; max-width: 1400px; margin: 0 auto; }
        .alert { padding: 16px 20px; border-radius: 12px; margin-bottom: 30px; font-weight: 600; box-shadow: 0 4px 12px rgba(0,0,0,0.05); animation: slideDown 0.3s ease; }
        .alert-success { background: #d1fae5; color: #065f46; border-right: 5px solid #10b981; }
        .alert-error { background: #fee2e2; color: #991b1b; border-right: 5px solid #ef4444; }
        .grid-layout { display: grid; grid-template-columns: 1.2fr 1.8fr; gap: 30px; }
        @media (max-width: 1100px) { .grid-layout { grid-template-columns: 1fr; } }
        .card { background: #ffffff; border-radius: 18px; box-shadow: 0 10px 30px rgba(15, 23, 42, 0.04); padding: 30px; border: 1px solid #e2e8f0; height: fit-content; }
        .card-title { font-size: 20px; font-weight: 700; color: #0f172a; margin-bottom: 25px; position: relative; padding-bottom: 12px; }
        .card-title::after { content: ''; position: absolute; bottom: 0; right: 0; width: 50px; height: 4px; background: linear-gradient(to left, #10b981, #34d399); border-radius: 2px; }
        .form-group { margin-bottom: 22px; }
        .form-group label { display: block; margin-bottom: 8px; font-weight: 600; color: #334155; font-size: 14.5px; }
        .form-control { width: 100%; padding: 12px 16px; border: 1px solid #cbd5e1; border-radius: 10px; font-size: 15px; background-color: #ffffff; color: #1e293b; outline: none; transition: all 0.25s ease; box-sizing: border-box; }
        .form-control:focus { border-color: #10b981; box-shadow: 0 0 0 4px rgba(16, 185, 129, 0.12); }
        .btn-submit { width: 100%; padding: 14px; background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; border: none; border-radius: 10px; font-size: 16px; font-weight: 700; cursor: pointer; transition: all 0.3s ease; box-shadow: 0 4px 12px rgba(16, 185, 129, 0.2); }
        .btn-submit:hover:not(:disabled) { box-shadow: 0 6px 20px rgba(16, 185, 129, 0.35); transform: translateY(-2px); }
        .btn-submit:disabled { background: #94a3b8; cursor: not-allowed; box-shadow: none; }
        .btn-cancel { width: 100%; padding: 11px; background: #f1f5f9; color: #475569; border: 1px solid #e2e8f0; border-radius: 10px; margin-top: 12px; cursor: pointer; font-weight: 600; transition: all 0.2s; }
        .btn-cancel:hover { background: #e2e8f0; }
        .videos-list { display: flex; flex-direction: column; gap: 16px; }
        .video-item { display: flex; justify-content: space-between; align-items: center; padding: 18px 24px; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 14px; transition: all 0.25s ease; }
        .video-item:hover { box-shadow: 0 6px 20px rgba(0,0,0,0.03); border-color: #cbd5e1; }
        .video-info h4 { margin: 0 0 8px 0; color: #0f172a; font-size: 16.5px; font-weight: 600; }
        .video-preview { margin-top: 8px; max-width: 200px; border-radius: 8px; display: block; }
        .actions-cell { display: flex; gap: 10px; align-items: center; }
        .btn-edit { background: #eff6ff; color: #1d4ed8; border: 1px solid #bfdbfe; padding: 8px 16px; border-radius: 8px; cursor: pointer; font-weight: 600; transition: all 0.2s; }
        .btn-edit:hover { background: #1d4ed8; color: white; }
        .btn-delete { background: #fef2f2; color: #b91c1c; border: 1px solid #fecaca; padding: 8px 16px; border-radius: 8px; cursor: pointer; font-weight: 600; transition: all 0.2s; }
        .btn-delete:hover { background: #b91c1c; color: white; }
        @keyframes slideDown { from { transform: translateY(-15px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
      `}</style>

      <Navbar />

      <div className="main-content">
        {message.text && (
          <div className={`alert alert-${message.type}`}>
            {message.type === 'success' ? '🚀 ' : '❌ '}
            {message.text}
          </div>
        )}

        <div className="grid-layout">
          
          {/* العمود الأول: إضافة وتعديل الفيديوهات */}
          <div className="card">
            <h3 className="card-title">
              {editId ? '📝 تعديل بيانات الفيديو' : '📹 رفع فيديو جديد'}
            </h3>
            <form onSubmit={handleSubmit}>
              
              <div className="form-group">
                <label>عنوان الفيديو</label>
                <input 
                  type="text" 
                  className="form-control" 
                  value={title} 
                  onChange={(e) => setTitle(e.target.value)} 
                  placeholder="أدخل عنواناً جذاباً للفيديو"
                  required 
                />
              </div>

              <div className="form-group">
                <label>ملف الفيديو ({editId ? 'اختياري إذا لم ترغب بتغييره' : 'مطلوب'})</label>
                <input 
                  id="video-file-input"
                  type="file" 
                  accept="video/*"
                  className="form-control" 
                  onChange={(e) => setVideoFile(e.target.files[0])} 
                  required={!editId} 
                />
              </div>

              <button type="submit" className="btn-submit" disabled={loading}>
                {loading ? '⏳ جاري رفع ملف الفيديو للسيرفر...' : (editId ? '🔄 حفظ التعديلات الحالية' : '🚀 رفع ونشر الفيديو')}
              </button>

              {editId && (
                <button type="button" className="btn-cancel" onClick={resetForm}>
                  إلغاء التعديل والعودة للوضع الافتراضي
                </button>
              )}
            </form>
          </div>

          {/* العمود الثاني: الأرشيف وعرض قائمة الفيديوهات المرفوعة */}
          <div className="card">
            <h3 className="card-title">🎬 الفيديوهات المرفوعة بالأرشيف ({videos.length})</h3>
            <div className="videos-list">
              {videos.length === 0 ? (
                <p style={{textAlign: 'center', color: '#64748b', padding: '20px'}}>لا توجد فيديوهات منشورة حالياً.</p>
              ) : (
                videos.map(video => (
                  <div key={video.id} className="video-item">
                    <div className="video-info">
                      <h4>{video.title}</h4>
                      {/* مشغل فيديو صغير اختياري لمشاهدة الفيديو داخل لوحة التحكم */}
                      <video className="video-preview" controls src={video.video_file}>
                        متصفحك لا يدعم تشغيل الفيديو.
                      </video>
                    </div>
                    <div className="actions-cell">
                      <button className="btn-edit" onClick={() => handleEditSetup(video)}>تعديل</button>
                      <button className="btn-delete" onClick={() => handleDelete(video.id)}>حذف</button>
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

export default VideoPage;