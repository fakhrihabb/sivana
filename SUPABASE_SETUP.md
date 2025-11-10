# 🗄️ Supabase Setup Guide - SIVANA

## Langkah 1: Buat Project di Supabase

1. Buka [https://app.supabase.com](https://app.supabase.com)
2. Klik **"New Project"**
3. Isi:
   - **Name**: `sivana-casn`
   - **Database Password**: (gunakan password yang kuat, simpan!)
   - **Region**: `Southeast Asia (Singapore)` (paling dekat dengan Indonesia)
4. Klik **"Create New Project"** (tunggu 2-3 menit)

---

## Langkah 2: Jalankan SQL Schema

1. Di dashboard Supabase, klik **"SQL Editor"** di sidebar kiri
2. Klik **"New Query"**
3. Copy paste seluruh isi file `supabase_schema.sql`
4. Klik **"Run"** atau tekan `Ctrl+Enter`
5. Pastikan muncul pesan sukses: ✅ "Success. No rows returned"

**Schema yang dibuat:**
- ✅ Tabel `formasi` dengan 16 data awal
- ✅ Indexes untuk performa query
- ✅ Row Level Security (RLS) policies
- ✅ Auto-update `updated_at` trigger
- ✅ View `formasi_stats` untuk statistik

---

## Langkah 3: Dapatkan API Keys

1. Di dashboard Supabase, klik **"Settings"** (ikon gear) di sidebar
2. Klik **"API"**
3. Copy 2 values ini:

### a. Project URL
```
URL: https://xyzcompany.supabase.co
```

### b. anon/public Key
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS...
```

---

## Langkah 4: Update `.env.local`

Buka file `.env.local` dan isi:

```bash
# SUPABASE CONFIGURATION
NEXT_PUBLIC_SUPABASE_URL=https://xyzcompany.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

⚠️ **Ganti** `xyzcompany` dan `eyJ...` dengan nilai asli dari dashboard Anda!

---

## Langkah 5: Test Koneksi

Restart dev server:

```bash
npm run dev
```

Buka browser dan cek console untuk memastikan tidak ada error koneksi.

---

## 📊 Verifikasi Data

1. Di Supabase dashboard, klik **"Table Editor"**
2. Klik tabel **"formasi"**
3. Pastikan ada **16 rows** data formasi
4. Coba filter/search untuk test

---

## 🔐 Security Notes

### Row Level Security (RLS) sudah aktif:
- ✅ **Read (SELECT)**: Public access - siapa saja bisa baca
- 🔒 **Insert/Update/Delete**: Hanya authenticated users

### Untuk production:
1. Jangan commit `.env.local` ke Git
2. Gunakan Supabase Auth untuk authentication
3. Enable RLS policies yang lebih ketat sesuai role
4. Monitor usage di Supabase dashboard

---

## 🚀 Next Steps

1. Update `DaftarFormasi.js` untuk fetch dari Supabase
2. Update `formasi/[id]/page.js` untuk fetch detail dari Supabase
3. Buat admin page untuk CRUD formasi
4. Setup Supabase Auth untuk login admin

---

## 📖 Useful Queries

### Get semua formasi periode 2025:
```sql
SELECT * FROM formasi WHERE periode = 2025;
```

### Get statistik per jenis pengadaan:
```sql
SELECT * FROM formasi_stats;
```

### Search formasi by nama atau lembaga:
```sql
SELECT * FROM formasi 
WHERE name ILIKE '%komputer%' 
   OR lembaga ILIKE '%komputer%';
```

---

## 🆘 Troubleshooting

### Error: "Missing Supabase environment variables"
- Pastikan `.env.local` sudah diisi dengan benar
- Restart dev server setelah update `.env.local`

### Error: "relation 'formasi' does not exist"
- Jalankan ulang `supabase_schema.sql` di SQL Editor

### Error: "new row violates row-level security policy"
- Untuk testing, disable RLS sementara:
  ```sql
  ALTER TABLE formasi DISABLE ROW LEVEL SECURITY;
  ```

---

## 📞 Support

- [Supabase Documentation](https://supabase.com/docs)
- [Supabase Discord](https://discord.supabase.com)
