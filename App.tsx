import React, { useState, useEffect, useRef } from 'react';

export default function App() {
  // حالات التطبيق الأساسية
  const [status, setStatus] = useState<'idle' | 'scanning' | 'out_of_frame' | 'completed'>('idle');
  const [progress, setProgress] = useState<number>(0);
  const [format, setFormat] = useState<'phone' | 'pc' | null>(null);
  
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const timerRef = useRef<number | null>(null);

  // تشغيل الكاميرا الخلفية للهاتف فور فتح التطبيق
  useEffect(() => {
    async function startCamera() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'environment' } // الكاميرا الخلفية
        });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (err) {
        console.error("خطأ في تشغيل الكاميرا:", err);
      }
    }
    startCamera();

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  // بدء التصوير بنقرة واحدة (Single Tap)
  const startScanning = () => {
    setStatus('scanning');
    setProgress(0);

    timerRef.current = window.setInterval(() => {
      setProgress((prev) => {
        // محاكاة ذكية: إذا تحرك الهاتف أو خرج الجسم (احتمالية عشوائية خفيفة للتجربة)
        if (Math.random() < 0.02 && prev > 15 && prev < 85) {
          if (timerRef.current) clearInterval(timerRef.current);
          setStatus('out_of_frame'); // إلغاء التقدم وإظهار التحذير
          return 0;
        }

        if (prev >= 100) {
          if (timerRef.current) clearInterval(timerRef.current);
          setStatus('completed');
          return 100;
        }
        return prev + 2; // زيادة العداد
      });
    }, 100);
  };

  // إعادة البدء عند حدوث خطأ خروج الجسم من الإطار
  const restartScanning = () => {
    setStatus('idle');
    setProgress(0);
  };

  // حفظ المجسم المؤقت ومسحه من الذاكرة فوراً
  const saveAndCleanup = (selectedFormat: 'phone' | 'pc') => {
    setFormat(selectedFormat);
    
    // محاكاة تحميل ملف المجسم (GLB للهاتف أو OBJ للكمبيوتر)
    alert(`تم تحميل المجسم بصيغة [${selectedFormat === 'phone' ? 'GLB' : 'OBJ'}] بنجاح! جاري تنظيف الذاكرة المؤقتة (RAM) تماماً...`);
    
    // إعادة التصفير الفوري وتنظيف الذاكرة
    setStatus('idle');
    setProgress(0);
    setFormat(null);
  };

  return (
    <div style={{ width: '100vw', height: '100vh', backgroundColor: '#000', color: '#fff', fontFamily: 'sans-serif', overflow: 'hidden', display: 'flex', flexDirection: 'col' }}>
      
      {/* 1. مساحة الإعلان الثابتة فوق (10% من الشاشة تماماً) */}
      <div style={{ height: '10vh', width: '100%', backgroundColor: '#222', display: 'flex', alignItems: 'center', justifyContent: 'center', borderBottom: '1px solid #333', zIndex: 10 }}>
        <div style={{ width: '90%', height: '80%', backgroundColor: '#443300', border: '1px solid #ffcc00', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 10px' }}>
          <span style={{ fontSize: '11px', color: '#ffcc00', fontWeight: 'bold' }}>إعلان مساحة 10% ثابته</span>
          <span style={{ fontSize: '12px', color: '#ccc' }}>شاهد الإعلان للحصول على مسح مجاني</span>
        </div>
      </div>

      {/* 2. منطقة الكاميرا والمجسم (90% من الشاشة المتبقية) */}
      <div style={{ height: '90vh', width: '100%', relative: 'relative', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', position: 'relative' }}>
        
        {/* فيديو الكاميرا الحية مع تطبيق فلاتر CSS الذكية حسب الحالة */}
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            zIndex: 1,
            // فلتر أبيض وأسود ونقش إذا كان التطبيق في وضع الاستعداد، وتسترد الألوان في وضع التصوير
            filter: status === 'idle' ? 'grayscale(100%) contrast(200%)' : 'none',
            transition: 'filter 0.5s ease'
          }}
        />

        {/* سحابة النقاط والشبكة ثلاثية الأبعاد (محاكاة بصرية مبسطة ملتفة حول الجسم) */}
        {status === 'scanning' && (
          <div style={{ position: 'absolute', inset: 0, zIndex: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none' }}>
            <div style={{ width: '200px', height: '200px', border: '2px dotted #00ffcc', borderRadius: '50%', animation: 'spin 4s linear infinite', opacity: 0.7 }} />
            <div style={{ position: 'absolute', color: '#00ffcc', fontSize: '10px', fontWeight: 'bold', animate: 'pulse 1s infinite' }}>
              [ جاري مصفوفة تضاريس 3D ]
            </div>
          </div>
        )}

        {/* طريقة مسح الجسم: دائرة بوسطها علامة + (تختفي فور اختيار/بدء المسح) */}
        {status === 'idle' && (
          <div style={{ position: 'absolute', inset: 0, zIndex: 3, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none' }}>
            <div style={{ width: '100px', height: '100px', border: '2px solid #00ff88', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
              <span style={{ fontSize: '28px', color: '#00ff88', fontWeight: 'bold' }}>+</span>
            </div>
            <p style={{ marginTop: '10px', fontSize: '12px', backgroundColor: 'rgba(0,0,0,0.6)', padding: '4px 8px', borderRadius: '4px' }}>ضع الجسم داخل علامة + للبدء</p>
          </div>
        )}

        {/* تحذير فوري: إذا ابتعد المستخدم أو خرج الجسم من الصورة يتم حذف التقدم بالكامل */}
        {status === 'out_of_frame' && (
          <div style={{ position: 'absolute', inset: 0, zIndex: 4, backgroundColor: 'rgba(0,0,0,0.85)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '20px', textAlign: 'center' }}>
            <span style={{ fontSize: '40px' }}>⚠️</span>
            <h3 style={{ color: '#ff4444', margin: '10px 0' }}>تم حذف التقدم!</h3>
            <p style={{ fontSize: '13px', color: '#ccc', maxWidth: '280px', marginBottom: '20px' }}>يرجى إبقاء الجسم داخل الإطار والحدود أثناء التصوير ليتم البناء بشكل صحيح.</p>
            <button onClick={restartScanning} style={{ padding: '10px 20px', backgroundColor: '#ff4444', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}>
              🔄 إعادة البدء من جديد
            </button>
          </div>
        )}

        {/* واجهة اختيار الصيغة بعد مشاهدة الإعلان الكامل واكتمال العداد */}
        {status === 'completed' && (
          <div style={{ position: 'absolute', inset: 0, zIndex: 5, backgroundColor: 'rgba(0,0,0,0.9)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
            <span style={{ fontSize: '40px', color: '#00ff88' }}>✅</span>
            <h3 style={{ margin: '10px 0' }}>اكتمل المسح 100%</h3>
            <p style={{ fontSize: '12px', color: '#aaa', marginBottom: '20px', textAlign: 'center' }}>تمت مشاهدة الإعلان الكامل. اختر الآن صيغة الحفظ (سيتم تنظيف الذاكرة المؤقتة فوراً بعد الاختيار):</p>
            <div style={{ display: 'flex', gap: '15px' }}>
              <button onClick={() => saveAndCleanup('phone')} style={{ padding: '12px 20px', backgroundColor: '#00ff88', color: '#000', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}>
                📱 صيغة الهاتف (GLB)
              </button>
              <button onClick={() => saveAndCleanup('pc')} style={{ padding: '12px 20px', backgroundColor: '#00ccff', color: '#000', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}>
                💻 صيغة الكمبيوتر (OBJ)
              </button>
            </div>
          </div>
        )}

        {/* 3. لوحة التحكم السفلية ومؤشر الاكتمال (تظهر في أسفل الشاشة) */}
        <div style={{ zIndex: 3, padding: '20px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '15px', background: 'linear-gradient(transparent, rgba(0,0,0,0.9))', marginTop: 'auto' }}>
          
          {/* مؤشر الاكتمال الدقيق شريط التقدم */}
          {status === 'scanning' && (
            <div style={{ width: '100%', maxWidth: '300px' }}>
              <div style={{ display: 'flex', justifyContent: 'between', fontSize: '12px', color: '#00ffcc', marginBottom: '5px' }}>
                <span>جاري بناء تضاريس الجسم...</span>
                <span style={{ marginLeft: 'auto' }}>{progress}%</span>
              </div>
              <div style={{ width: '100%', height: '8px', backgroundColor: '#333', borderRadius: '4px', overflow: 'hidden' }}>
                <div style={{ width: `${progress}%`, height: '100%', backgroundColor: '#00ffcc', transition: 'width 0.1s ease' }} />
              </div>
            </div>
          )}

          {/* أزرار التحكم بنقرة واحدة مريحة للمستخدم */}
          <div>
            {status === 'idle' && (
              <button onClick={startScanning} style={{ padding: '12px 30px', backgroundColor: '#00ff88', color: '#000', border: 'none', borderRadius: '12px', fontWeight: 'bold', fontSize: '14px', cursor: 'pointer' }}>
                📸 ابدأ التصوير والمسح
              </button>
            )}
            {status === 'scanning' && (
              <button onClick={() => setStatus('completed')} style={{ padding: '10px 20px', backgroundColor: '#333', color: '#fff', border: '1px solid #555', borderRadius: '8px', fontSize: '12px', cursor: 'pointer' }}>
                🛑 إنهاء المسح يدوياً
              </button>
            )}
          </div>

        </div>

      </div>

      {/* كود أنيميشن الدوران البسيط للشبكة */}
      <style>{`
        @keyframes spin { 100% { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}