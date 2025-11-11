import { supabase } from "@/lib/supabase";

/**
 * GET /api/provinces
 * Get all Indonesian provinces with their geocoded coordinates
 */
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const includeCoordinates = searchParams.get('coordinates') !== 'false';

    let query = supabase
      .from('provinces')
      .select('*')
      .order('name');

    const { data, error } = await query;

    if (error) {
      console.error('Supabase error:', error);
      return Response.json({
        success: false,
        error: error.message,
      }, { status: 500 });
    }

    // Transform data to camelCase
    const transformedData = data.map(province => {
      const transformed = {
        id: province.id,
        name: province.name,
        createdAt: province.created_at,
      };

      if (includeCoordinates) {
        transformed.latitude = parseFloat(province.latitude);
        transformed.longitude = parseFloat(province.longitude);
        transformed.formattedAddress = province.formatted_address;
        transformed.geocodedAt = province.geocoded_at;
      }

      return transformed;
    });

    return Response.json({
      success: true,
      data: transformedData,
      count: transformedData.length,
    });
  } catch (err) {
    console.error('API error:', err);
    return Response.json({
      success: false,
      error: err.message,
    }, { status: 500 });
  }
}
