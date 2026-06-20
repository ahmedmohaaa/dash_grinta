import React, { useState, useEffect } from 'react';
import Navbar from '../../components/Navbar';
// استيراد مكونات CKEditor 5
import { CKEditor } from '@ckeditor/ckeditor5-react';
import ClassicEditor from '@ckeditor/ckeditor5-build-classic';

class MyUploadAdapter {
    constructor(loader) {
        this.loader = loader;
    }

    // دالة الرفع التي يستدعيها CKEditor تلقائياً
    upload() {
        return this.loader.file
            .then(file => new Promise((resolve, reject) => {
                const data = new FormData();
                data.append('upload', file);

                fetch('https://api.algrinta.com/api/ckeditor/upload/', {
                    method: 'POST',
                    headers: {
                        // إذا كان الـ API يحتاج توثيق فك تشفير التوكين، قم بإلغاء التعليق عن السطر التالي:
                        // 'Authorization': `Bearer ${localStorage.getItem('access_token')}`
                    },
                    body: data
                })
                .then(response => response.json())
                .then(result => {
                    if (result.url) {
                        // إرجاع الرابط للمحرر ليقوم بعرض الصورة للمستخدم
                        resolve({ default: result.url });
                    } else {
                        reject(result.error || 'فشلت عملية الرفع');
                    }
                })
                .catch(error => {
                    reject('حدث خطأ أثناء الاتصال بالسيرفر');
                });
            }));
    }

    abort() {
        // يمكنك تركها فارغة، تستدعي في حال إلغاء الرفع
    }
}

// دالة لربط الـ Adapter بالمحرر
function MyCustomUploadAdapterPlugin(editor) {
    editor.plugins.get('FileRepository').createUploadAdapter = (loader) => {
        return new MyUploadAdapter(loader);
    };
}
const ArticlePage = () => {
  // حالات البيانات القادمة من السيرفر
  const [articles, setArticles] = useState([]);
  
  // حالات النموذج المطابقة تماماً للموديل الحالي الخاص بك
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [publishedAt, setPublishedAt] = useState(''); // لحمل تاريخ ووقت النشر الاختياري
  
  // التحكم في حالة التعديل والتحميل والإشعارات
  const [editId, setEditId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  const API_BASE_URL = 'https://api.algrinta.com/api';
  const token = localStorage.getItem('access_token');

  // جلب المقالات عند تحميل الصفحة مباشرة
  useEffect(() => {
    fetchArticles();
  }, []);

  const fetchArticles = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/articles/`);
      const data = await res.json();
      if (res.ok) {
        setArticles(data);
      }
    } catch (err) {
      showMsg('error', 'خطأ في جلب المقالات من السيرفر');
    }
  };

  const showMsg = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: '', text: '' }), 4000);
  };

  // معالجة إرسال البيانات (إضافة أو تعديل) عبر JSON
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    // بناء كائن البيانات المطابق تماماً لحقول الـ Serializer الخاص بك
    const articleData = {
      title: title,
      content: content,
      // إذا كان الحقل فارغاً نرسله كـ null حتى يقبله الـ DateTimeField في دجانغو دون مشاكل
      published_at: publishedAt || null 
    };

    let url = `${API_BASE_URL}/articles/`;
    let method = 'POST';

    if (editId) {
      url = `${API_BASE_URL}/articles/${editId}/`;
      method = 'PUT'; // أو PATCH كلاهما سيعملان بشكل ممتاز مع الـ JSON
    }

    try {
      const res = await fetch(url, {
        method: method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(articleData)
      });

      if (res.ok) {
        showMsg('success', editId ? '🚀 تم تحديث المقال بنجاح!' : '🎉 تم إضافة المقال إلى قاعدة البيانات بنجاح!');
        resetForm();
        fetchArticles();
      } else {
        const errData = await res.json();
        showMsg('error', 'حدث خطأ أثناء حفظ البيانات، تحقق من المدخلات');
      }
    } catch (err) {
      showMsg('error', 'فشل الاتصال بالسيرفر، تأكد من تشغيل دجانغو');
    } finally {
      setLoading(false);
    }
  };

  // تجهيز البيانات ونقلها إلى الفورم عند الضغط على زر تعديل
  const handleEditSetup = (article) => {
    setEditId(article.id);
    setTitle(article.title);
    setContent(article.content);
    
    // تنسيق التاريخ ليناسب حقل الـ datetime-local في المتصفح إذا كان موجوداً
    if (article.published_at) {
      setPublishedAt(article.published_at.substring(0, 16));
    } else {
      setPublishedAt('');
    }
    
    // صعود تلقائي لأعلى الصفحة بسلاسة لرؤية النموذج
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // حذف مقال
  const handleDelete = async (id) => {
    if (!window.confirm('🚨 هل أنت متأكد تماماً من حذف هذا المقال؟ لا يمكن التراجع عن هذا الإجراء.')) return;

    try {
      const res = await fetch(`${API_BASE_URL}/articles/${id}/`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (res.ok) {
        showMsg('success', 'تم حذف المقال بنجاح');
        fetchArticles();
        if (editId === id) resetForm();
      } else {
        showMsg('error', 'فشلت عملية الحذف، قد لا تملك الصلاحية');
      }
    } catch (err) {
      showMsg('error', 'حدث خطأ أثناء الاتصال بالخادم');
    }
  };

  // إعادة تعيين الحقول للوضع الافتراضي
  const resetForm = () => {
    setEditId(null);
    setTitle('');
    setContent('');
    setPublishedAt('');
  };

  return (
    <div className="dashboard-container">
      {/* تصميم CSS خرافي ومتجاوب مخصص للوحة التحكم الرياضية */}
      <style>{`
        .dashboard-container {
          background-color: #f1f5f9;
          min-height: 100vh;
          font-family: 'Segoe UI', system-ui, -apple-system, sans-serif;
          direction: rtl;
        }
        .main-content {
          padding: 30px 20px;
          max-width: 1400px;
          margin: 0 auto;
        }
        
        /* تصميم شريط التنبيهات */
        .alert {
          padding: 16px 20px;
          border-radius: 12px;
          margin-bottom: 30px;
          font-weight: 600;
          box-shadow: 0 4px 12px rgba(0,0,0,0.05);
          animation: slideDown 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .alert-success { background: #d1fae5; color: #065f46; border-right: 5px solid #10b981; }
        .alert-error { background: #fee2e2; color: #991b1b; border-right: 5px solid #ef4444; }
        
        /* تقسيم الشاشة المتجاوب (Responsive Grid) */
        .grid-layout {
          display: grid;
          grid-template-columns: 1.2fr 1.8fr;
          gap: 30px;
        }
        @media (max-width: 1100px) {
          .grid-layout { grid-template-columns: 1fr; }
        }

        /* تصميم الكروت الاحترافي */
        .card {
          background: #ffffff;
          border-radius: 18px;
          box-shadow: 0 10px 30px rgba(15, 23, 42, 0.04);
          padding: 30px;
          border: 1px solid #e2e8f0;
          height: fit-content;
        }
        .card-title {
          font-size: 20px;
          font-weight: 700;
          color: #0f172a;
          margin-bottom: 25px;
          position: relative;
          padding-bottom: 12px;
        }
        .card-title::after {
          content: '';
          position: absolute;
          bottom: 0;
          right: 0;
          width: 50px;
          height: 4px;
          background: linear-gradient(to left, #10b981, #34d399);
          border-radius: 2px;
        }

        .form-group {
          margin-bottom: 22px;
        }
        .form-group label {
          display: block;
          margin-bottom: 8px;
          font-weight: 600;
          color: #334155;
          font-size: 14.5px;
        }
        .form-control {
          width: 100%;
          padding: 12px 16px;
          border: 1px solid #cbd5e1;
          border-radius: 10px;
          font-size: 15px;
          background-color: #ffffff;
          color: #1e293b;
          outline: none;
          transition: all 0.25s ease;
          box-sizing: border-box;
        }
        .form-control:focus {
          border-color: #10b981;
          box-shadow: 0 0 0 4px rgba(16, 185, 129, 0.12);
        }
        
        /* تخصيص الـ CKEditor */
        .ck-editor__editable {
          min-height: 280px !important;
          border-bottom-left-radius: 10px !important;
          border-bottom-right-radius: 10px !important;
          font-size: 15px;
          direction: rtl;
        }
        .ck-toolbar {
          border-top-left-radius: 10px !important;
          border-top-right-radius: 10px !important;
          background: #f8fafc !important;
        }

        /* تصميم الأزرار الرياضية الانسيابية */
        .btn-submit {
          width: 100%;
          padding: 14px;
          background: linear-gradient(135deg, #10b981 0%, #059669 100%);
          color: white;
          border: none;
          border-radius: 10px;
          font-size: 16px;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.3s ease;
          box-shadow: 0 4px 12px rgba(16, 185, 129, 0.2);
        }
        .btn-submit:hover:not(:disabled) {
          box-shadow: 0 6px 20px rgba(16, 185, 129, 0.35);
          transform: translateY(-2px);
        }
        .btn-submit:disabled {
          background: #94a3b8;
          cursor: not-allowed;
          box-shadow: none;
        }
        .btn-cancel {
          width: 100%;
          padding: 11px;
          background: #f1f5f9;
          color: #475569;
          border: 1px solid #e2e8f0;
          border-radius: 10px;
          margin-top: 12px;
          cursor: pointer;
          font-weight: 600;
          transition: all 0.2s;
        }
        .btn-cancel:hover { background: #e2e8f0; }

        /* ستايل قائمة الأرشيف وعرض المقالات */
        .articles-list {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }
        .article-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 18px 24px;
          background: #ffffff;
          border: 1px solid #e2e8f0;
          border-radius: 14px;
          transition: all 0.25s ease;
        }
        .article-item:hover {
          box-shadow: 0 6px 20px rgba(0,0,0,0.03);
          border-color: #cbd5e1;
          transform: scale(1.002);
        }
        .article-info h4 {
          margin: 0 0 8px 0;
          color: #0f172a;
          font-size: 16.5px;
          font-weight: 600;
        }
        .info-meta {
          display: flex;
          align-items: center;
          gap: 12px;
          color: #64748b;
          font-size: 13px;
        }
        .date-badge {
          background: #f1f5f9;
          padding: 2px 8px;
          border-radius: 6px;
          font-weight: 500;
        }

        .actions-cell {
          display: flex;
          gap: 10px;
        }
        .btn-edit {
          background: #eff6ff; color: #1d4ed8; border: 1px solid #bfdbfe; padding: 8px 16px; border-radius: 8px; cursor: pointer; font-weight: 600; transition: all 0.2s;
        }
        .btn-edit:hover { background: #1d4ed8; color: white; }
        .btn-delete {
          background: #fef2f2; color: #b91c1c; border: 1px solid #fecaca; padding: 8px 16px; border-radius: 8px; cursor: pointer; font-weight: 600; transition: all 0.2s;
        }
        .btn-delete:hover { background: #b91c1c; color: white; }

        @keyframes slideDown {
          from { transform: translateY(-15px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
      `}</style>

      {/* استدعاء مكون النافبار المشترك */}
      <Navbar />

      <div className="main-content">
        {/* شريط الإشعارات الذكي */}
        {message.text && (
          <div className={`alert alert-${message.type}`}>
            {message.type === 'success' ? '🚀 ' : '❌ '}
            {message.text}
          </div>
        )}

        <div className="grid-layout">
          
          {/* العمود الأول: إضافة وتعديل المقالات */}
          <div className="card">
            <h3 className="card-title">
              {editId ? '📝 تعديل المقال الرياضي' : '✍️ كتابة مقال جديد'}
            </h3>
            <form onSubmit={handleSubmit}>
              
              <div className="form-group">
                <label>عنوان المقال</label>
                <input 
                  type="text" 
                  className="form-control" 
                  value={title} 
                  onChange={(e) => setTitle(e.target.value)} 
                  placeholder="أدخل عنوان الخبر أو التحليل الرياضي"
                  required 
                />
              </div>

              <div className="form-group">
                <label>تاريخ ووقت النشر (اختياري)</label>
                <input 
                  type="datetime-local" 
                  className="form-control" 
                  value={publishedAt} 
                  onChange={(e) => setPublishedAt(e.target.value)} 
                />
              </div>

              {/* حقل محرر النصوص المتقدم CKEditor 5 مرتبط بـ content */}
<div className="form-group">
  <label>محتوى المقال التفصيلي</label>
  <CKEditor
    editor={ClassicEditor}
    data={content}
    config={{
      placeholder: 'اكتب تفاصيل المقال الرياضي والتشكيلات هنا...',
      language: 'ar',
      // ربط دالة رفع الصور بالمحرر 
      extraPlugins: [MyCustomUploadAdapterPlugin] 
    }}
    onChange={(event, editor) => {
      const data = editor.getData();
      setContent(data);
    }}
  />
</div>

              <button type="submit" className="btn-submit" disabled={loading}>
                {loading ? '⏳ جاري الحفظ في السيرفر...' : (editId ? '🔄 حفظ التغييرات الحالية' : '🚀 نشر المقال')}
              </button>

              {editId && (
                <button type="button" className="btn-cancel" onClick={resetForm}>
                  إلغاء التعديل والعودة للوضع الافتراضي
                </button>
              )}
            </form>
          </div>

          {/* العمود الثاني: قائمة وأرشيف المقالات الحالية */}
          <div className="card">
            <h3 className="card-title">📰 المقالات المنشورة بالأرشيف ({articles.length})</h3>
            <div className="articles-list">
              {articles.length === 0 ? (
                <p style={{textAlign: 'center', color: '#64748b', padding: '20px'}}>لا توجد مقالات منشورة حالياً في قاعدة البيانات.</p>
              ) : (
                articles.map(article => (
                  <div key={article.id} className="article-item">
                    <div className="article-info">
                      <h4>{article.title}</h4>
                      <div className="info-meta">
                        <span>الآيدي: #{article.id}</span>
                        {article.published_at && (
                          <span className="date-badge">
                            📅 {new Date(article.published_at).toLocaleDateString('ar-EG')}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="actions-cell">
                      <button className="btn-edit" onClick={() => handleEditSetup(article)}>تعديل</button>
                      <button className="btn-delete" onClick={() => handleDelete(article.id)}>حذف</button>
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

export default ArticlePage;
