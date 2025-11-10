import { NextResponse } from 'next/server';
import { RekognitionClient, CompareFacesCommand } from '@aws-sdk/client-rekognition';
import { createClient } from '@supabase/supabase-js';

const rekognitionClient = new RekognitionClient({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export async function POST(request) {
  try {
    const { image } = await request.json();

    if (!image) {
      return NextResponse.json({ error: 'No image provided' }, { status: 400 });
    }

    // Convert base64 image to buffer
    const base64Data = image.replace(/^data:image\/\w+;base64,/, '');
    const sourceImageBuffer = Buffer.from(base64Data, 'base64');

    // Get all face pictures from database
    const { data: facePictures, error: dbError } = await supabase
      .from('face_pictures')
      .select('*');

    if (dbError) {
      console.error('Database error:', dbError);
      return NextResponse.json({ error: 'Database error' }, { status: 500 });
    }

    if (!facePictures || facePictures.length === 0) {
      return NextResponse.json({
        matched: false,
        message: 'Tidak ada wajah di database untuk dibandingkan',
      });
    }

    // Compare with each face in database
    let bestMatch = null;
    let highestSimilarity = 0;

    for (const facePicture of facePictures) {
      try {
        // Fetch the reference image
        const response = await fetch(facePicture.file_url);
        const arrayBuffer = await response.arrayBuffer();
        const targetImageBuffer = Buffer.from(arrayBuffer);

        // Compare faces using AWS Rekognition
        const command = new CompareFacesCommand({
          SourceImage: { Bytes: sourceImageBuffer },
          TargetImage: { Bytes: targetImageBuffer },
          SimilarityThreshold: 98, // Minimum 98% similarity - extremely strict
          QualityFilter: 'HIGH', // Only accept high quality faces
        });

        const result = await rekognitionClient.send(command);

        if (result.FaceMatches && result.FaceMatches.length > 0) {
          const match = result.FaceMatches[0];
          const similarity = match.Similarity;
          const confidence = match.Face.Confidence;
          const faceQuality = match.Face.Quality;

          console.log(`Comparing with ${facePicture.name}:`, {
            similarity: similarity.toFixed(2),
            confidence: confidence.toFixed(2),
            brightness: faceQuality?.Brightness?.toFixed(2),
            sharpness: faceQuality?.Sharpness?.toFixed(2),
            passed: similarity >= 98 && confidence >= 98
          });

          // Extremely strict validation: 98% threshold for both similarity and confidence
          // Also validate face quality metrics
          const qualityCheck = !faceQuality || (
            faceQuality.Brightness >= 40 &&
            faceQuality.Sharpness >= 40
          );

          if (similarity >= 98 && confidence >= 98 && qualityCheck && similarity > highestSimilarity) {
            highestSimilarity = similarity;
            bestMatch = {
              ...facePicture,
              similarity,
              confidence,
              quality: faceQuality,
            };
          }
        } else {
          console.log(`No face match for ${facePicture.name} (below 98% threshold)`);
        }
      } catch (err) {
        console.error(`Error comparing with ${facePicture.name}:`, err);
        // Continue to next face picture
      }
    }

    if (bestMatch) {
      console.log('✅ MATCH FOUND:', {
        name: bestMatch.name,
        similarity: bestMatch.similarity.toFixed(2) + '%',
        confidence: bestMatch.confidence.toFixed(2) + '%'
      });

      return NextResponse.json({
        matched: true,
        matchedPerson: {
          id: bestMatch.id,
          name: bestMatch.name,
          description: bestMatch.description,
          file_url: bestMatch.file_url,
        },
        similarity: Math.round(bestMatch.similarity * 10) / 10,
      });
    } else {
      console.log('❌ NO MATCH: No faces met the 98% similarity + 98% confidence + quality threshold');

      return NextResponse.json({
        matched: false,
        message: 'Wajah tidak cocok dengan data di database',
      });
    }
  } catch (error) {
    console.error('Verification error:', error);
    return NextResponse.json(
      { error: 'Terjadi kesalahan saat verifikasi wajah' },
      { status: 500 }
    );
  }
}
