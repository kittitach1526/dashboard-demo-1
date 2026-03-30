"use client";

export default function ModalShell({ title, onClose, children }) {
  return (
    // Backdrop: ใช้ flex + items-center + justify-center เพื่อดึง Modal มาไว้กลางจอพอดี
    <div 
      className="fixed inset-0 z-[2000] flex items-center justify-center bg-black/60 backdrop-blur-[2px] p-4" 
      onClick={onClose}
    >
      <div
        // กำหนด w-[300px] ตรงๆ และใช้ max-w-full กันกรณีเปิดในจอมือถือที่เล็กมากๆ
        className="relative w-[600px] max-w-full overflow-hidden rounded-xl border border-[var(--oee-border-2)] bg-[var(--oee-surface)] shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header: ปรับขนาดตัวอักษรและ Padding ให้เข้ากับ Modal ขนาดเล็ก */}
        <div className="flex items-center justify-between border-b border-[var(--oee-border)] px-4 py-3">
          <span className="text-xs font-bold text-slate-200 uppercase tracking-wider">
            {title}
          </span>
          <button
            onClick={onClose}
            className="flex h-6 w-6 items-center justify-center rounded-md text-slate-400 hover:bg-white/10 hover:text-white transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Content: ส่วนเนื้อหาภายใน */}
        <div className="max-h-[70vh] overflow-y-auto p-4 text-sm text-slate-300">
          {children}
        </div>
      </div>
    </div>
  );
}