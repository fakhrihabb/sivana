// Mapping of education levels to appropriate programs/majors
export const educationProgramMapping = {
  // SD (Sekolah Dasar) - Elementary School
  'SD': {
    displayName: 'SD (Sekolah Dasar)',
    programs: [
      { id: "a", text: "Tidak ada jurusan (pendidikan umum)", value: "Umum" },
      { id: "b", text: "Lainnya", value: "Lainnya" }
    ]
  },

  // SMP (Sekolah Menengah Pertama) - Junior High School
  'SMP': {
    displayName: 'SMP (Sekolah Menengah Pertama)',
    programs: [
      { id: "a", text: "Tidak ada jurusan (pendidikan umum)", value: "Umum" },
      { id: "b", text: "Lainnya", value: "Lainnya" }
    ]
  },

  // SMA/SMK - Senior High School / Vocational High School
  'SMA/SMK': {
    displayName: 'SMA/SMK',
    programs: [
      // SMA (General)
      { id: "a", text: "IPA (Ilmu Pengetahuan Alam)", value: "IPA" },
      { id: "b", text: "IPS (Ilmu Pengetahuan Sosial)", value: "IPS" },
      { id: "c", text: "Bahasa", value: "Bahasa" },
      
      // SMK (Vocational)
      { id: "d", text: "Teknik Komputer dan Jaringan", value: "Teknik Komputer dan Jaringan" },
      { id: "e", text: "Rekayasa Perangkat Lunak", value: "Rekayasa Perangkat Lunak" },
      { id: "f", text: "Akuntansi", value: "Akuntansi" },
      { id: "g", text: "Administrasi Perkantoran", value: "Administrasi Perkantoran" },
      { id: "h", text: "Perhotelan", value: "Perhotelan" },
      { id: "i", text: "Tata Boga", value: "Tata Boga" },
      { id: "j", text: "Keperawatan", value: "Keperawatan" },
      { id: "k", text: "Farmasi", value: "Farmasi" },
      { id: "l", text: "Pertanian", value: "Pertanian" },
      { id: "m", text: "Otomotif", value: "Otomotif" },
      { id: "n", text: "Elektro", value: "Elektro" },
      { id: "o", text: "Desain Grafis", value: "Desain Grafis" },
      { id: "p", text: "Lainnya", value: "Lainnya" }
    ]
  },

  // D3 (Diploma III) - Associate Degree
  'Diploma III/Sarjana Muda': {
    displayName: 'D3 (Diploma III)',
    programs: [
      // Technology & Engineering
      { id: "a", text: "Teknik Informatika", value: "Teknik Informatika" },
      { id: "b", text: "Teknik Komputer", value: "Teknik Komputer" },
      { id: "c", text: "Sistem Informasi", value: "Sistem Informasi" },
      { id: "d", text: "Teknik Elektro", value: "Teknik Elektro" },
      { id: "e", text: "Teknik Mesin", value: "Teknik Mesin" },
      { id: "f", text: "Teknik Sipil", value: "Teknik Sipil" },
      
      // Health Sciences
      { id: "g", text: "Keperawatan", value: "Keperawatan" },
      { id: "h", text: "Kebidanan", value: "Kebidanan" },
      { id: "i", text: "Farmasi", value: "Farmasi" },
      { id: "j", text: "Analis Kesehatan", value: "Analis Kesehatan" },
      { id: "k", text: "Gizi", value: "Gizi" },
      { id: "l", text: "Fisioterapi", value: "Fisioterapi" },
      
      // Business & Administration
      { id: "m", text: "Akuntansi", value: "Akuntansi" },
      { id: "n", text: "Manajemen", value: "Manajemen" },
      { id: "o", text: "Administrasi Bisnis", value: "Administrasi Bisnis" },
      { id: "p", text: "Sekretaris", value: "Sekretaris" },
      { id: "q", text: "Perpajakan", value: "Perpajakan" },
      
      // Arts & Design
      { id: "r", text: "Desain Grafis", value: "Desain Grafis" },
      { id: "s", text: "Desain Komunikasi Visual", value: "Desain Komunikasi Visual" },
      { id: "t", text: "Multimedia", value: "Multimedia" },
      
      // Others
      { id: "u", text: "Pariwisata", value: "Pariwisata" },
      { id: "v", text: "Perhotelan", value: "Perhotelan" },
      { id: "w", text: "Kearsipan", value: "Kearsipan" },
      { id: "x", text: "Perpustakaan", value: "Perpustakaan" },
      { id: "y", text: "Lainnya", value: "Lainnya" }
    ]
  },

  // D4 (Diploma IV)
  'D-4': {
    displayName: 'D4 (Diploma IV)',
    programs: [
      // Computer Science & IT
      { id: "a", text: "Ilmu Komputer", value: "Ilmu Komputer" },
      { id: "b", text: "Teknik Informatika", value: "Teknik Informatika" },
      { id: "c", text: "Sistem Informasi", value: "Sistem Informasi" },
      { id: "d", text: "Teknik Komputer", value: "Teknik Komputer" },
      { id: "e", text: "Teknologi Informasi", value: "Teknologi Informasi" },

      // Engineering
      { id: "f", text: "Teknik Elektro", value: "Teknik Elektro" },
      { id: "g", text: "Teknik Mesin", value: "Teknik Mesin" },
      { id: "h", text: "Teknik Sipil", value: "Teknik Sipil" },
      { id: "i", text: "Teknik Industri", value: "Teknik Industri" },
      { id: "j", text: "Teknik Kimia", value: "Teknik Kimia" },

      // Health Sciences
      { id: "k", text: "Keperawatan", value: "Keperawatan" },
      { id: "l", text: "Kebidanan", value: "Kebidanan" },
      { id: "m", text: "Farmasi", value: "Farmasi" },
      { id: "n", text: "Kesehatan Masyarakat", value: "Kesehatan Masyarakat" },
      { id: "o", text: "Gizi", value: "Gizi" },

      // Business & Economics
      { id: "p", text: "Akuntansi", value: "Akuntansi" },
      { id: "q", text: "Manajemen", value: "Manajemen" },
      { id: "r", text: "Administrasi Bisnis", value: "Administrasi Bisnis" },
      { id: "s", text: "Ekonomi", value: "Ekonomi" },

      // Agriculture & Environment
      { id: "t", text: "Agroteknologi", value: "Agroteknologi" },
      { id: "u", text: "Peternakan", value: "Peternakan" },
      { id: "v", text: "Kehutanan", value: "Kehutanan" },

      // Social Sciences
      { id: "w", text: "Administrasi Publik", value: "Administrasi Publik" },
      { id: "x", text: "Ilmu Komunikasi", value: "Ilmu Komunikasi" },

      // Education & Arts
      { id: "y", text: "Pendidikan", value: "Pendidikan" },
      { id: "z", text: "Desain", value: "Desain" },
      { id: "aa", text: "Pariwisata", value: "Pariwisata" },
      { id: "ab", text: "Lainnya", value: "Lainnya" }
    ]
  },

  // S1 (Bachelor's Degree)
  'S-1/Sarjana': {
    displayName: 'S1 (Sarjana)',
    programs: [
      // Computer Science & IT
      { id: "a", text: "Ilmu Komputer", value: "Ilmu Komputer" },
      { id: "b", text: "Teknik Informatika", value: "Teknik Informatika" },
      { id: "c", text: "Sistem Informasi", value: "Sistem Informasi" },
      { id: "d", text: "Teknik Komputer", value: "Teknik Komputer" },
      { id: "e", text: "Teknologi Informasi", value: "Teknologi Informasi" },
      
      // Engineering
      { id: "f", text: "Teknik Elektro", value: "Teknik Elektro" },
      { id: "g", text: "Teknik Mesin", value: "Teknik Mesin" },
      { id: "h", text: "Teknik Sipil", value: "Teknik Sipil" },
      { id: "i", text: "Teknik Industri", value: "Teknik Industri" },
      { id: "j", text: "Teknik Kimia", value: "Teknik Kimia" },
      { id: "k", text: "Arsitektur", value: "Arsitektur" },
      
      // Natural Sciences
      { id: "l", text: "Matematika", value: "Matematika" },
      { id: "m", text: "Fisika", value: "Fisika" },
      { id: "n", text: "Kimia", value: "Kimia" },
      { id: "o", text: "Biologi", value: "Biologi" },
      { id: "p", text: "Statistika", value: "Statistika" },
      
      // Economics & Business
      { id: "q", text: "Ilmu Ekonomi", value: "Ilmu Ekonomi" },
      { id: "r", text: "Manajemen", value: "Manajemen" },
      { id: "s", text: "Akuntansi", value: "Akuntansi" },
      { id: "t", text: "Ekonomi Pembangunan", value: "Ekonomi Pembangunan" },
      { id: "u", text: "Administrasi Bisnis", value: "Administrasi Bisnis" },
      { id: "v", text: "Administrasi Publik", value: "Administrasi Publik" },
      { id: "w", text: "Administrasi Negara", value: "Administrasi Negara" },
      
      // Health Sciences
      { id: "x", text: "Kedokteran", value: "Kedokteran" },
      { id: "y", text: "Keperawatan", value: "Keperawatan" },
      { id: "z", text: "Farmasi", value: "Farmasi" },
      { id: "aa", text: "Kesehatan Masyarakat", value: "Kesehatan Masyarakat" },
      { id: "ab", text: "Gizi", value: "Gizi" },
      { id: "ac", text: "Kebidanan", value: "Kebidanan" },
      
      // Education
      { id: "ad", text: "Pendidikan Matematika", value: "Pendidikan Matematika" },
      { id: "ae", text: "Pendidikan Bahasa Inggris", value: "Pendidikan Bahasa Inggris" },
      { id: "af", text: "Pendidikan Bahasa Indonesia", value: "Pendidikan Bahasa Indonesia" },
      { id: "ag", text: "Pendidikan Guru Sekolah Dasar (PGSD)", value: "Pendidikan Guru Sekolah Dasar" },
      { id: "ah", text: "Pendidikan Guru PAUD", value: "Pendidikan Guru PAUD" },
      { id: "ai", text: "Pendidikan Fisika", value: "Pendidikan Fisika" },
      { id: "aj", text: "Pendidikan Kimia", value: "Pendidikan Kimia" },
      { id: "ak", text: "Pendidikan Biologi", value: "Pendidikan Biologi" },
      { id: "al", text: "Administrasi Pendidikan", value: "Administrasi Pendidikan" },
      { id: "am", text: "Teknologi Pendidikan", value: "Teknologi Pendidikan" },
      
      // Social Sciences
      { id: "an", text: "Ilmu Hukum", value: "Ilmu Hukum" },
      { id: "ao", text: "Ilmu Politik", value: "Ilmu Politik" },
      { id: "ap", text: "Ilmu Komunikasi", value: "Ilmu Komunikasi" },
      { id: "aq", text: "Sosiologi", value: "Sosiologi" },
      { id: "ar", text: "Psikologi", value: "Psikologi" },
      { id: "as", text: "Hubungan Internasional", value: "Hubungan Internasional" },
      
      // Agriculture
      { id: "at", text: "Agronomi", value: "Agronomi" },
      { id: "au", text: "Pertanian", value: "Pertanian" },
      { id: "av", text: "Peternakan", value: "Peternakan" },
      { id: "aw", text: "Kehutanan", value: "Kehutanan" },
      { id: "ax", text: "Perikanan", value: "Perikanan" },
      
      // Arts & Humanities
      { id: "ay", text: "Sastra Indonesia", value: "Sastra Indonesia" },
      { id: "az", text: "Sastra Inggris", value: "Sastra Inggris" },
      { id: "ba", text: "Sejarah", value: "Sejarah" },
      { id: "bb", text: "Filsafat", value: "Filsafat" },
      
      // Library & Information
      { id: "bc", text: "Ilmu Perpustakaan", value: "Ilmu Perpustakaan" },
      { id: "bd", text: "Kearsipan", value: "Kearsipan" },
      
      // Others
      { id: "be", text: "Lainnya", value: "Lainnya" }
    ]
  },

  // S2 (Master's Degree)
  'S-2': {
    displayName: 'S2 (Magister)',
    programs: [
      // Computer Science & IT
      { id: "a", text: "Magister Ilmu Komputer", value: "Ilmu Komputer" },
      { id: "b", text: "Magister Teknik Informatika", value: "Teknik Informatika" },
      { id: "c", text: "Magister Sistem Informasi", value: "Sistem Informasi" },
      
      // Engineering
      { id: "d", text: "Magister Teknik Elektro", value: "Teknik Elektro" },
      { id: "e", text: "Magister Teknik Mesin", value: "Teknik Mesin" },
      { id: "f", text: "Magister Teknik Sipil", value: "Teknik Sipil" },
      { id: "g", text: "Magister Teknik Industri", value: "Teknik Industri" },
      
      // Economics & Business
      { id: "h", text: "Magister Manajemen (MM)", value: "Manajemen" },
      { id: "i", text: "Magister Akuntansi", value: "Akuntansi" },
      { id: "j", text: "Magister Ekonomi", value: "Ilmu Ekonomi" },
      { id: "k", text: "Magister Administrasi Publik", value: "Administrasi Publik" },
      { id: "l", text: "Magister Administrasi Bisnis", value: "Administrasi Bisnis" },
      
      // Health Sciences
      { id: "m", text: "Magister Kesehatan Masyarakat", value: "Kesehatan Masyarakat" },
      { id: "n", text: "Magister Kedokteran", value: "Kedokteran" },
      { id: "o", text: "Magister Keperawatan", value: "Keperawatan" },
      { id: "p", text: "Magister Farmasi", value: "Farmasi" },
      
      // Education
      { id: "q", text: "Magister Pendidikan", value: "Pendidikan" },
      { id: "r", text: "Magister Administrasi Pendidikan", value: "Administrasi Pendidikan" },
      { id: "s", text: "Magister Teknologi Pendidikan", value: "Teknologi Pendidikan" },
      
      // Social Sciences
      { id: "t", text: "Magister Hukum", value: "Ilmu Hukum" },
      { id: "u", text: "Magister Ilmu Politik", value: "Ilmu Politik" },
      { id: "v", text: "Magister Komunikasi", value: "Ilmu Komunikasi" },
      { id: "w", text: "Magister Psikologi", value: "Psikologi" },
      { id: "x", text: "Magister Sosiologi", value: "Sosiologi" },
      
      // Natural Sciences
      { id: "y", text: "Magister Matematika", value: "Matematika" },
      { id: "z", text: "Magister Statistika", value: "Statistika" },
      { id: "aa", text: "Magister Fisika", value: "Fisika" },
      { id: "ab", text: "Magister Kimia", value: "Kimia" },
      { id: "ac", text: "Magister Biologi", value: "Biologi" },
      
      // Agriculture
      { id: "ad", text: "Magister Pertanian", value: "Pertanian" },
      { id: "ae", text: "Magister Agronomi", value: "Agronomi" },
      { id: "af", text: "Magister Peternakan", value: "Peternakan" },
      
      // Others
      { id: "ag", text: "Lainnya", value: "Lainnya" }
    ]
  },

  // S3 (Doctoral Degree)
  'S-3': {
    displayName: 'S3 (Doktor)',
    programs: [
      // Computer Science & IT
      { id: "a", text: "Doktor Ilmu Komputer", value: "Ilmu Komputer" },
      { id: "b", text: "Doktor Teknik Informatika", value: "Teknik Informatika" },
      
      // Engineering
      { id: "c", text: "Doktor Teknik Elektro", value: "Teknik Elektro" },
      { id: "d", text: "Doktor Teknik Mesin", value: "Teknik Mesin" },
      { id: "e", text: "Doktor Teknik Sipil", value: "Teknik Sipil" },
      { id: "f", text: "Doktor Teknik Industri", value: "Teknik Industri" },
      
      // Economics & Business
      { id: "g", text: "Doktor Ilmu Ekonomi", value: "Ilmu Ekonomi" },
      { id: "h", text: "Doktor Manajemen", value: "Manajemen" },
      { id: "i", text: "Doktor Administrasi Publik", value: "Administrasi Publik" },
      
      // Health Sciences
      { id: "j", text: "Doktor Kesehatan Masyarakat", value: "Kesehatan Masyarakat" },
      { id: "k", text: "Doktor Kedokteran", value: "Kedokteran" },
      { id: "l", text: "Doktor Farmasi", value: "Farmasi" },
      
      // Education
      { id: "m", text: "Doktor Pendidikan", value: "Pendidikan" },
      { id: "n", text: "Doktor Administrasi Pendidikan", value: "Administrasi Pendidikan" },
      
      // Social Sciences
      { id: "o", text: "Doktor Ilmu Hukum", value: "Ilmu Hukum" },
      { id: "p", text: "Doktor Ilmu Politik", value: "Ilmu Politik" },
      { id: "q", text: "Doktor Ilmu Komunikasi", value: "Ilmu Komunikasi" },
      { id: "r", text: "Doktor Psikologi", value: "Psikologi" },
      { id: "s", text: "Doktor Sosiologi", value: "Sosiologi" },
      
      // Natural Sciences
      { id: "t", text: "Doktor Matematika", value: "Matematika" },
      { id: "u", text: "Doktor Statistika", value: "Statistika" },
      { id: "v", text: "Doktor Fisika", value: "Fisika" },
      { id: "w", text: "Doktor Kimia", value: "Kimia" },
      { id: "x", text: "Doktor Biologi", value: "Biologi" },
      
      // Agriculture
      { id: "y", text: "Doktor Pertanian", value: "Pertanian" },
      { id: "z", text: "Doktor Agronomi", value: "Agronomi" },
      
      // Others
      { id: "aa", text: "Lainnya", value: "Lainnya" }
    ]
  },

  // D4 (Diploma IV) - Often equivalent to S1
  'Diploma IV': {
    displayName: 'D4 (Diploma IV)',
    programs: [
      // Reference to S-1/Sarjana programs since they're equivalent
      // This will be handled in the API to use the same programs as S-1/Sarjana
    ]
  }
};

// Helper function to get programs by education level
export function getProgramsByEducation(educationLevel) {
  // Normalize the education level
  const normalizedLevel = educationLevel?.trim();
  
  // Handle D4 separately - use S1 programs
  if (normalizedLevel === 'Diploma IV' || normalizedLevel === 'D4') {
    return educationProgramMapping['S-1/Sarjana']?.programs || [];
  }
  
  // Return programs for the specified education level
  return educationProgramMapping[normalizedLevel]?.programs || [];
}

// Helper function to check if education level exists
export function isValidEducationLevel(educationLevel) {
  const normalizedLevel = educationLevel?.trim();
  return normalizedLevel in educationProgramMapping || normalizedLevel === 'Diploma IV';
}
