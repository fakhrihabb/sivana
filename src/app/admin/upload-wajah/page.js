"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Upload, Trash2, Search, Image as ImageIcon, User, Calendar } from "lucide-react";

export default function UploadWajahPage() {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [name, setName] = useState("");
  const [uploading, setUploading] = useState(false);
  const [facePictures, setFacePictures] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [message, setMessage] = useState({ type: "", text: "" });

  // Fetch face pictures
  useEffect(() => {
    fetchFacePictures();
  }, [searchQuery]);

  const fetchFacePictures = async () => {
    try {
      setLoading(true);
      const url = new URL('/api/face-pictures', window.location.origin);
      if (searchQuery) {
        url.searchParams.append('search', searchQuery);
      }

      const response = await fetch(url);
      const data = await response.json();

      if (data.success) {
        setFacePictures(data.data);
      } else {
        showMessage("error", data.error || "Gagal memuat data");
      }
    } catch (error) {
      console.error("Error fetching face pictures:", error);
      showMessage("error", "Gagal memuat data foto wajah");
    } finally {
      setLoading(false);
    }
  };

  const showMessage = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: "", text: "" }), 5000);
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      if (!selectedFile.type.startsWith('image/')) {
        showMessage("error", "File harus berupa gambar");
        return;
      }
      if (selectedFile.size > 5 * 1024 * 1024) {
        showMessage("error", "Ukuran file maksimal 5MB");
        return;
      }
      setFile(selectedFile);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result);
      };
      reader.readAsDataURL(selectedFile);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!file || !name) {
      showMessage("error", "Harap isi nama dan pilih file");
      return;
    }

    setUploading(true);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('name', name);
      formData.append('uploadedBy', 'admin');

      const response = await fetch('/api/face-pictures', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (data.success) {
        showMessage("success", "Foto wajah berhasil diupload");
        // Reset form
        setFile(null);
        setPreview(null);
        setName("");
        // Refresh list
        fetchFacePictures();
      } else {
        showMessage("error", data.error || "Gagal mengupload foto");
      }
    } catch (error) {
      console.error("Upload error:", error);
      showMessage("error", "Gagal mengupload foto wajah");
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id, fileName) => {
    if (!confirm(`Apakah Anda yakin ingin menghapus foto "${fileName}"?`)) {
      return;
    }

    try {
      const response = await fetch(`/api/face-pictures?id=${id}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (data.success) {
        showMessage("success", "Foto berhasil dihapus");
        fetchFacePictures();
      } else {
        showMessage("error", data.error || "Gagal menghapus foto");
      }
    } catch (error) {
      console.error("Delete error:", error);
      showMessage("error", "Gagal menghapus foto");
    }
  };

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    return new Intl.DateTimeFormat('id-ID', options).format(new Date(dateString));
  };

  const formatFileSize = (bytes) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
  };

  return (
    <div className="min-h-screen gradient-bg pt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/admin"
            className="inline-block text-brand-blue hover:text-brand-pink transition-colors mb-4"
          >
            ← Kembali ke Dashboard
          </Link>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Upload Foto Wajah
          </h1>
          <p className="text-lg text-gray-600">
            Upload dan kelola foto wajah untuk sistem verifikasi
          </p>
        </div>

        {/* Message Alert */}
        {message.text && (
          <div
            className={`mb-6 p-4 rounded-lg ${
              message.type === "success"
                ? "bg-green-50 border border-green-200 text-green-800"
                : "bg-red-50 border border-red-200 text-red-800"
            }`}
          >
            {message.text}
          </div>
        )}

        {/* Upload Form */}
        <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Upload Foto Baru</h2>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* File Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Pilih File Foto
              </label>
              <div className="flex items-center gap-4">
                <label
                  htmlFor="file-upload"
                  className="flex items-center gap-2 px-4 py-3 bg-brand-blue text-white rounded-lg hover:bg-opacity-90 transition-all cursor-pointer"
                >
                  <Upload className="w-5 h-5" />
                  Pilih File
                </label>
                <input
                  id="file-upload"
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                />
                {file && (
                  <span className="text-gray-600 text-sm">
                    {file.name} ({formatFileSize(file.size)})
                  </span>
                )}
              </div>
              {preview && (
                <div className="mt-4">
                  <img
                    src={preview}
                    alt="Preview"
                    className="w-48 h-48 object-cover rounded-lg border-2 border-gray-300"
                  />
                </div>
              )}
            </div>

            {/* Name Input */}
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                Nama Pemilik Foto <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Masukkan nama pemilik foto"
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-brand-blue transition-colors"
                required
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={uploading || !file || !name}
              className="w-full md:w-auto px-6 py-3 bg-brand-blue text-white rounded-lg font-medium hover:bg-opacity-90 transition-all disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
              {uploading ? "Mengupload..." : "Upload Foto"}
            </button>
          </form>
        </div>

        {/* Search */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <div className="flex items-center gap-3">
            <Search className="w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Cari berdasarkan nama atau deskripsi..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-brand-blue transition-colors"
            />
          </div>
        </div>

        {/* Face Pictures List */}
        <div className="bg-white rounded-xl shadow-lg p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Daftar Foto Wajah</h2>

          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-brand-blue"></div>
              <p className="mt-4 text-gray-600">Memuat data...</p>
            </div>
          ) : facePictures.length === 0 ? (
            <div className="text-center py-12">
              <ImageIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 text-lg">
                {searchQuery ? "Tidak ada hasil pencarian" : "Belum ada foto yang diupload"}
              </p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {facePictures.map((picture) => (
                <div
                  key={picture.id}
                  className="border-2 border-gray-200 rounded-xl overflow-hidden hover:shadow-lg transition-all"
                >
                  {/* Image */}
                  <div className="h-64 bg-gray-100 overflow-hidden">
                    <img
                      src={picture.file_url}
                      alt={picture.name}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  {/* Details */}
                  <div className="p-4 space-y-3">
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4 text-brand-blue" />
                      <span className="font-semibold text-gray-900">{picture.name}</span>
                    </div>

                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <Calendar className="w-4 h-4" />
                      <span>{formatDate(picture.created_at)}</span>
                    </div>

                    <div className="text-sm text-gray-500">
                      Ukuran: {formatFileSize(picture.file_size)}
                    </div>

                    {/* Delete Button */}
                    <button
                      onClick={() => handleDelete(picture.id, picture.name)}
                      className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-all"
                    >
                      <Trash2 className="w-4 h-4" />
                      Hapus
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
