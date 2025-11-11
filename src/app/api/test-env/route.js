/**
 * Test endpoint to verify environment variables in production
 * DO NOT expose actual values, only check if they exist
 */

export async function GET() {
  const envCheck = {
    NODE_ENV: process.env.NODE_ENV,
    VERCEL: process.env.VERCEL || 'not set',
    VERCEL_ENV: process.env.VERCEL_ENV || 'not set',

    // Check if environment variables are set (but don't expose values)
    hasGeminiKey: !!process.env.NEXT_PUBLIC_GEMINI_API_KEY,
    hasVisionKey: !!process.env.GOOGLE_VISION_API_KEY,
    hasProjectId: !!process.env.GOOGLE_CLOUD_PROJECT_ID,
    hasProcessorId: !!process.env.GOOGLE_DOC_AI_PROCESSOR_ID,
    hasDocAILocation: !!process.env.GOOGLE_DOC_AI_LOCATION,
    hasGoogleCreds: !!process.env.GOOGLE_APPLICATION_CREDENTIALS,
    hasSupabaseUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
    hasSupabaseKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,

    // Partial values for debugging (first 10 chars only)
    geminiKeyPreview: process.env.NEXT_PUBLIC_GEMINI_API_KEY
      ? process.env.NEXT_PUBLIC_GEMINI_API_KEY.substring(0, 10) + '...'
      : 'NOT SET',
    visionKeyPreview: process.env.GOOGLE_VISION_API_KEY
      ? process.env.GOOGLE_VISION_API_KEY.substring(0, 10) + '...'
      : 'NOT SET',
  };

  return Response.json({
    success: true,
    environment: envCheck,
    message: 'Environment check completed',
    timestamp: new Date().toISOString(),
  });
}
