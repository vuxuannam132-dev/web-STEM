"use client";

import { useState, useEffect } from "react";

export default function SettingsPage() {
  const [showIeltsLink, setShowIeltsLink] = useState(false);
  const [ieltsUrl, setIeltsUrl] = useState("https://ielts-web-vip.vercel.app/");
  const [telegramBotPassword, setTelegramBotPassword] = useState("Vunam15022009@dkhbt");
  const [telegramAdminIds, setTelegramAdminIds] = useState("[]");
  const [newAdminId, setNewAdminId] = useState("");
  const [adminOtpEmail, setAdminOtpEmail] = useState("");
  const [trustedDevices, setTrustedDevices] = useState<string[]>([]);
  const [blockedDevices, setBlockedDevices] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [resetTarget, setResetTarget] = useState('ALL');
  const [isResetting, setIsResetting] = useState(false);

  useEffect(() => {
    fetch("/api/settings")
      .then((res) => res.json())
      .then((data) => {
        if (data.show_ielts_link === "true") setShowIeltsLink(true);
        if (data.ielts_link_url) setIeltsUrl(data.ielts_link_url);
        if (data.telegram_bot_password) setTelegramBotPassword(data.telegram_bot_password);
        if (data.telegram_admin_ids) setTelegramAdminIds(data.telegram_admin_ids);
        if (data.admin_otp_email) setAdminOtpEmail(data.admin_otp_email);
        if (data.trusted_devices) {
          try { setTrustedDevices(JSON.parse(data.trusted_devices)); } catch (e) {}
        }
        if (data.blocked_devices) {
          try { setBlockedDevices(JSON.parse(data.blocked_devices)); } catch (e) {}
        }
        setIsLoading(false);
      })
      .catch((err) => {
        console.error("Failed to fetch settings", err);
        setIsLoading(false);
      });
  }, []);

  const saveSetting = async (key: string, value: string) => {
    try {
      await fetch("/api/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key, value }),
      });
    } catch (error) {
      console.error("Failed to save setting", error);
    }
  };

  const handleToggle = async () => {
    const newValue = !showIeltsLink;
    setShowIeltsLink(newValue);
    setIsSaving(true);
    await saveSetting("show_ielts_link", newValue.toString());
    setIsSaving(false);
  };

  const handleSaveUrl = async () => {
    setIsSaving(true);
    await saveSetting("ielts_link_url", ieltsUrl);
    setIsSaving(false);
    alert("Đã lưu đường dẫn thành công!");
  };

  const handleSaveTelegramPassword = async () => {
    setIsSaving(true);
    await saveSetting("telegram_bot_password", telegramBotPassword);
    setIsSaving(false);
    alert("Đã lưu mật khẩu Bot Telegram!");
  };

  const handleAddTelegramAdminId = async () => {
    if (!newAdminId) return;
    setIsSaving(true);
    try {
      let currentIds = [];
      try {
        currentIds = JSON.parse(telegramAdminIds);
        if (!Array.isArray(currentIds)) currentIds = [];
      } catch (e) {
        currentIds = [];
      }
      
      if (!currentIds.includes(newAdminId)) {
        currentIds.push(newAdminId);
        const newIdsStr = JSON.stringify(currentIds);
        setTelegramAdminIds(newIdsStr);
        await saveSetting("telegram_admin_ids", newIdsStr);
        alert("Đã thêm Telegram Chat ID thành công!");
      } else {
        alert("Chat ID này đã tồn tại!");
      }
      setNewAdminId("");
    } catch (err) {
      console.error(err);
    }
    setIsSaving(false);
  };

  const handleReset = async () => {
    if (!confirm('Bạn có chắc chắn muốn xóa dữ liệu này không? Hành động này không thể hoàn tác!')) return;
    
    setIsResetting(true);
    try {
      const res = await fetch('/api/admin/reset', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ target: resetTarget })
      });
      if (res.ok) {
        alert('Đã xóa dữ liệu thành công!');
      } else {
        alert('Có lỗi xảy ra khi xóa dữ liệu.');
      }
    } catch (err) {
      alert('Lỗi kết nối.');
    } finally {
      setIsResetting(false);
    }
  };

  const handleSaveAdminEmail = async () => {
    setIsSaving(true);
    await saveSetting("admin_otp_email", adminOtpEmail);
    setIsSaving(false);
    alert("Đã lưu Email nhận OTP Admin!");
  };

  const handleRemoveTrusted = async (deviceId: string) => {
    if (!confirm('Bạn có chắc muốn xóa thiết bị này khỏi Sổ trắng?')) return;
    const newList = trustedDevices.filter(id => id !== deviceId);
    setTrustedDevices(newList);
    await saveSetting("trusted_devices", JSON.stringify(newList));
  };

  const handleRemoveBlocked = async (deviceId: string) => {
    if (!confirm('Bạn có chắc muốn mở khóa thiết bị này?')) return;
    const newList = blockedDevices.filter(b => (typeof b === 'string' ? b : b.id) !== deviceId);
    setBlockedDevices(newList);
    await saveSetting("blocked_devices", JSON.stringify(newList));
  };

  const handleBlockTrusted = async (deviceId: string) => {
    if (!confirm('Đưa thiết bị này vào Sổ đen ngay lập tức?')) return;
    const newTrusted = trustedDevices.filter(id => id !== deviceId);
    setTrustedDevices(newTrusted);
    await saveSetting("trusted_devices", JSON.stringify(newTrusted));
    
    const newBlocked = [...blockedDevices, { id: deviceId, name: deviceId, time: new Date().toISOString() }];
    setBlockedDevices(newBlocked);
    await saveSetting("blocked_devices", JSON.stringify(newBlocked));
  };

  if (isLoading) return <div className="p-8">Đang tải...</div>;

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-8 text-gray-800">Cài đặt Hệ thống</h1>
      
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <h2 className="text-xl font-semibold mb-4 text-gray-700">Liên kết sang Web IELTS</h2>
        
        <div className="flex items-center justify-between py-4 border-b border-gray-100">
          <div>
            <p className="font-medium text-gray-800">Hiển thị nút liên kết IELTS</p>
            <p className="text-sm text-gray-500">Bật nút này để hiển thị liên kết sang web IELTS trên thanh menu trang chủ.</p>
          </div>
          <button
            onClick={handleToggle}
            disabled={isSaving}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${
              showIeltsLink ? "bg-blue-600" : "bg-gray-200"
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                showIeltsLink ? "translate-x-6" : "translate-x-1"
              }`}
            />
          </button>
        </div>

        <div className="py-4">
          <label className="block font-medium text-gray-800 mb-2">Đường dẫn (URL) tới trang IELTS</label>
          <div className="flex gap-4">
            <input
              type="url"
              value={ieltsUrl}
              onChange={(e) => setIeltsUrl(e.target.value)}
              className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="https://ielts-web-vip.vercel.app/"
            />
            <button
              onClick={handleSaveUrl}
              disabled={isSaving}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors font-medium"
            >
              {isSaving ? "Đang lưu..." : "Lưu đường dẫn"}
            </button>
          </div>
        </div>
      </div>

      <div className="mt-8 bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <h2 className="text-xl font-semibold mb-4 text-gray-700">Quản lý Quyền Telegram Bot</h2>
        
        <div className="py-4 border-b border-gray-100">
          <label className="block font-medium text-gray-800 mb-2">Mật khẩu Bot Telegram</label>
          <div className="flex gap-4">
            <input
              type="text"
              value={telegramBotPassword}
              onChange={(e) => setTelegramBotPassword(e.target.value)}
              className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Nhập mật khẩu..."
            />
            <button
              onClick={handleSaveTelegramPassword}
              disabled={isSaving}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors font-medium"
            >
              Lưu
            </button>
          </div>
        </div>

        <div className="py-4">
          <label className="block font-medium text-gray-800 mb-2">Thêm Telegram Chat ID (Admin)</label>
          <p className="text-sm text-gray-500 mb-2">Danh sách hiện tại: {telegramAdminIds}</p>
          <div className="flex gap-4">
            <input
              type="number"
              value={newAdminId}
              onChange={(e) => setNewAdminId(e.target.value)}
              className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Nhập Chat ID (ví dụ: 123456789)"
            />
            <button
              onClick={handleAddTelegramAdminId}
              disabled={isSaving}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors font-medium"
            >
              Thêm ID
            </button>
          </div>
        </div>
      </div>

      <div className="mt-8 bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <h2 className="text-xl font-semibold mb-4 text-gray-700">Bảo mật Đăng nhập (Admin 2FA)</h2>
        
        <div className="py-4 border-b border-gray-100">
          <label className="block font-medium text-gray-800 mb-2">Email chuyên nhận mã OTP Admin (10 số)</label>
          <p className="text-sm text-gray-500 mb-2">Nếu để trống, mã sẽ được gửi vào email của tài khoản đang đăng nhập.</p>
          <div className="flex gap-4">
            <input
              type="email"
              value={adminOtpEmail}
              onChange={(e) => setAdminOtpEmail(e.target.value)}
              className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="admin@example.com"
            />
            <button
              onClick={handleSaveAdminEmail}
              disabled={isSaving}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors font-medium"
            >
              Lưu Email
            </button>
          </div>
        </div>

        <div className="py-4 border-b border-gray-100">
          <label className="block font-medium text-gray-800 mb-2">🛡️ Sổ Trắng (Thiết bị Tin cậy)</label>
          <p className="text-sm text-gray-500 mb-4">Các thiết bị này khi đăng nhập Admin sẽ không bị hỏi mã OTP.</p>
          {trustedDevices.length === 0 ? (
            <p className="text-sm text-gray-400 italic">Chưa có thiết bị tin cậy nào.</p>
          ) : (
            <ul className="space-y-2">
              {trustedDevices.map((devId, idx) => (
                <li key={idx} className="flex items-center justify-between bg-green-50 px-4 py-2 rounded border border-green-100">
                  <span className="font-mono text-sm text-green-800">{devId}</span>
                  <div className="space-x-2">
                    <button onClick={() => handleRemoveTrusted(devId)} className="text-xs bg-white text-gray-600 px-2 py-1 rounded border hover:bg-gray-100">Xóa tin cậy</button>
                    <button onClick={() => handleBlockTrusted(devId)} className="text-xs bg-red-100 text-red-600 px-2 py-1 rounded border border-red-200 hover:bg-red-200">Chặn ngay</button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="py-4">
          <label className="block font-medium text-gray-800 mb-2">📱 Sổ Đen (Thiết bị bị Chặn)</label>
          <p className="text-sm text-gray-500 mb-4">Các thiết bị này sẽ không thể truy cập bất cứ tính năng nào của hệ thống.</p>
          {blockedDevices.length === 0 ? (
            <p className="text-sm text-gray-400 italic">Sổ đen đang trống.</p>
          ) : (
            <ul className="space-y-2">
              {blockedDevices.map((b, idx) => {
                const devId = typeof b === 'string' ? b : b.id;
                const name = typeof b === 'string' ? devId : b.name;
                return (
                  <li key={idx} className="flex items-center justify-between bg-gray-50 px-4 py-2 rounded border border-gray-200">
                    <div>
                      <span className="font-medium text-sm text-gray-800 block">{name}</span>
                      <span className="font-mono text-xs text-gray-500">{devId}</span>
                    </div>
                    <button onClick={() => handleRemoveBlocked(devId)} className="text-xs bg-blue-100 text-blue-600 px-3 py-1 rounded border border-blue-200 hover:bg-blue-200">Bỏ chặn</button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>

      <div className="mt-8 bg-red-50 p-6 rounded-xl shadow-sm border border-red-100">
        <h2 className="text-xl font-semibold mb-4 text-red-700">Khu vực nguy hiểm (Danger Zone)</h2>
        <div className="py-4">
          <label className="block font-medium text-red-800 mb-2">Dọn dẹp và khôi phục hệ thống</label>
          <div className="flex gap-4">
            <select
              value={resetTarget}
              onChange={(e) => setResetTarget(e.target.value)}
              className="flex-1 px-4 py-2 border border-red-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 bg-white"
            >
              <option value="ALL">Xóa toàn bộ dữ liệu (Giữ lại Admin)</option>
              <option value="PRODUCTS">Chỉ xóa Sản phẩm (Bài đăng)</option>
              <option value="LOGS">Chỉ xóa Nhật ký hệ thống</option>
              <option value="USERS">Chỉ xóa Người dùng (Giữ lại Admin)</option>
            </select>
            <button
              onClick={handleReset}
              disabled={isResetting}
              className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 transition-colors font-medium"
            >
              {isResetting ? "Đang xử lý..." : "Thực hiện Xóa"}
            </button>
          </div>
          <p className="text-sm text-red-600 mt-3">Lưu ý: Hành động này sẽ xóa vĩnh viễn dữ liệu khỏi cơ sở dữ liệu và không thể khôi phục.</p>
        </div>
      </div>
    </div>
  );
}
