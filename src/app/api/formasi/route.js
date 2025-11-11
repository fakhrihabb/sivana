import { supabase } from "@/lib/supabase";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);

    // Pagination parameters
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '9');

    // Filter parameters
    const periode = searchParams.get('periode');
    const jenjangPendidikan = searchParams.get('jenjangPendidikan');
    const programStudi = searchParams.get('programStudi');
    const instansi = searchParams.get('instansi');
    const jenisPengadaan = searchParams.get('jenisPengadaan');

    // Calculate range for pagination
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    // Build query using the view that includes provinces
    let query = supabase
      .from('formasi_with_provinces')
      .select('*', { count: 'exact' })
      .order('id', { ascending: true });

    // Apply filters if provided
    if (periode) {
      query = query.eq('periode', parseInt(periode));
    }
    if (jenjangPendidikan) {
      query = query.eq('jenjang_pendidikan', jenjangPendidikan);
    }
    if (programStudi) {
      query = query.eq('program_studi', programStudi);
    }
    if (instansi) {
      query = query.eq('lembaga', instansi);
    }
    if (jenisPengadaan) {
      query = query.eq('jenis_pengadaan', jenisPengadaan);
    }

    // Apply pagination
    query = query.range(from, to);

    const { data, error, count } = await query;

    if (error) {
      console.error('Supabase error:', error);
      return Response.json({
        success: false,
        error: error.message,
      }, { status: 500 });
    }

    // Transform data from snake_case to camelCase for compatibility
    const transformedData = data.map(item => ({
      id: item.id,
      name: item.name,
      lembaga: item.lembaga,
      kantorPusat: item.kantor_pusat, // Headquarters/main office location
      locations: item.provinces || [], // Placement locations (provinces)
      provinceIds: item.province_ids || [], // Province IDs for filtering
      description: item.description,
      quota: item.quota,
      periode: item.periode,
      jenjangPendidikan: item.jenjang_pendidikan,
      programStudi: item.program_studi,
      jenisPengadaan: item.jenis_pengadaan
    }));

    return Response.json({
      success: true,
      data: transformedData,
      pagination: {
        page,
        limit,
        total: count,
        totalPages: Math.ceil(count / limit),
      },
    });
  } catch (err) {
    console.error('API error:', err);
    return Response.json({
      success: false,
      error: err.message,
    }, { status: 500 });
  }
}
