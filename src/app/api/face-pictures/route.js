import { supabase } from '@/lib/supabase';

export async function POST(request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file');
    const name = formData.get('name');
    const uploadedBy = formData.get('uploadedBy') || 'admin';

    if (!file) {
      return Response.json(
        { error: 'Tidak ada file yang di-upload' },
        { status: 400 }
      );
    }

    if (!name) {
      return Response.json(
        { error: 'Nama wajib diisi' },
        { status: 400 }
      );
    }

    // Validate file type (only images)
    if (!file.type.startsWith('image/')) {
      return Response.json(
        { error: 'File harus berupa gambar (JPG, PNG, dll)' },
        { status: 400 }
      );
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      return Response.json(
        { error: 'Ukuran file terlalu besar (maksimal 5MB)' },
        { status: 400 }
      );
    }

    // Generate unique filename
    const timestamp = Date.now();
    const fileExt = file.name.split('.').pop();
    const fileName = `${timestamp}-${name.replace(/[^a-zA-Z0-9]/g, '_')}.${fileExt}`;
    const filePath = `faces/${fileName}`;

    // Convert file to buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Upload to Supabase Storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('face-pictures')
      .upload(filePath, buffer, {
        contentType: file.type,
        cacheControl: '3600',
        upsert: false,
      });

    if (uploadError) {
      console.error('Upload error:', uploadError);
      return Response.json(
        { error: `Gagal mengupload file: ${uploadError.message}` },
        { status: 500 }
      );
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from('face-pictures')
      .getPublicUrl(filePath);

    // Save metadata to database
    const { data: dbData, error: dbError } = await supabase
      .from('face_pictures')
      .insert([
        {
          name: name,
          file_path: filePath,
          file_url: urlData.publicUrl,
          file_size: file.size,
          mime_type: file.type,
          uploaded_by: uploadedBy,
          metadata: {
            original_filename: file.name,
            uploaded_at: new Date().toISOString(),
          },
        },
      ])
      .select()
      .single();

    if (dbError) {
      console.error('Database error:', dbError);
      // Try to delete the uploaded file
      await supabase.storage.from('face-pictures').remove([filePath]);

      return Response.json(
        { error: `Gagal menyimpan metadata: ${dbError.message}` },
        { status: 500 }
      );
    }

    return Response.json({
      success: true,
      data: dbData,
      message: 'Foto wajah berhasil diupload',
    });
  } catch (error) {
    console.error('Face picture upload error:', error);
    return Response.json(
      {
        error: `Gagal mengupload foto wajah: ${error.message}`,
        success: false,
      },
      { status: 500 }
    );
  }
}

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const search = searchParams.get('search') || '';

    const from = (page - 1) * limit;
    const to = from + limit - 1;

    let query = supabase
      .from('face_pictures')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(from, to);

    if (search) {
      query = query.ilike('name', `%${search}%`);
    }

    const { data, error, count } = await query;

    if (error) {
      console.error('Database error:', error);
      return Response.json(
        { error: `Gagal mengambil data: ${error.message}` },
        { status: 500 }
      );
    }

    return Response.json({
      success: true,
      data: data,
      pagination: {
        page,
        limit,
        total: count,
        totalPages: Math.ceil(count / limit),
      },
    });
  } catch (error) {
    console.error('Face pictures fetch error:', error);
    return Response.json(
      {
        error: `Gagal mengambil data foto wajah: ${error.message}`,
        success: false,
      },
      { status: 500 }
    );
  }
}

export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return Response.json(
        { error: 'ID wajib diisi' },
        { status: 400 }
      );
    }

    // Get the file path from database
    const { data: picture, error: fetchError } = await supabase
      .from('face_pictures')
      .select('file_path')
      .eq('id', id)
      .single();

    if (fetchError || !picture) {
      return Response.json(
        { error: 'Data tidak ditemukan' },
        { status: 404 }
      );
    }

    // Delete from storage
    const { error: storageError } = await supabase.storage
      .from('face-pictures')
      .remove([picture.file_path]);

    if (storageError) {
      console.error('Storage deletion error:', storageError);
    }

    // Delete from database
    const { error: dbError } = await supabase
      .from('face_pictures')
      .delete()
      .eq('id', id);

    if (dbError) {
      console.error('Database deletion error:', dbError);
      return Response.json(
        { error: `Gagal menghapus data: ${dbError.message}` },
        { status: 500 }
      );
    }

    return Response.json({
      success: true,
      message: 'Foto wajah berhasil dihapus',
    });
  } catch (error) {
    console.error('Face picture deletion error:', error);
    return Response.json(
      {
        error: `Gagal menghapus foto wajah: ${error.message}`,
        success: false,
      },
      { status: 500 }
    );
  }
}
