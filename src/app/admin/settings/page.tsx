"use client";

import { useState, useEffect } from "react";

export default function SettingsPage() {
  const [showIeltsLink, setShowIeltsLink] = useState(false);
  const [ieltsUrl, setIeltsUrl] = useState("https://ielts-web-vip.vercel.app/");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    fetch("/api/settings")
      .then((res) => res.json())
      .then((data) => {
        if (data.show_ielts_link === "true") setShowIeltsLink(true);
        if (data.ielts_link_url) setIeltsUrl(data.ielts_link_url);
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
    </div>
  );
}
