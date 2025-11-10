import { NextResponse } from 'next/server';
import { RekognitionClient, CompareFacesCommand, DetectFacesCommand } from '@aws-sdk/client-rekognition';
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

// Liveness detection function
async function performLivenessCheck(frames) {
  try {
    const frameBuffers = frames.map(frame => {
      const base64Data = frame.replace(/^data:image\/\w+;base64,/, '');
      return Buffer.from(base64Data, 'base64');
    });

    // Detect faces in all frames
    const faceDetections = [];

    for (const frameBuffer of frameBuffers) {
      const command = new DetectFacesCommand({
        Image: { Bytes: frameBuffer },
        Attributes: ['ALL'] // Get all face attributes including quality
      });

      const result = await rekognitionClient.send(command);

      if (!result.FaceDetails || result.FaceDetails.length === 0) {
        return {
          isLive: false,
          reason: 'Tidak ada wajah terdeteksi di beberapa frame'
        };
      }

      faceDetections.push(result.FaceDetails[0]);
    }

    // Check 1: Multiple faces detected (someone showing a photo)
    const multipleFacesDetected = faceDetections.some(face => face.length > 1);
    if (multipleFacesDetected) {
      return {
        isLive: false,
        reason: 'Terdeteksi lebih dari satu wajah'
      };
    }

    // Check 2: Quality consistency - real faces should have consistent quality
    const qualities = faceDetections.map(face => ({
      brightness: face.Quality?.Brightness || 0,
      sharpness: face.Quality?.Sharpness || 0
    }));

    const brightnessDiff = Math.max(...qualities.map(q => q.brightness)) -
                           Math.min(...qualities.map(q => q.brightness));
    const sharpnessDiff = Math.max(...qualities.map(q => q.sharpness)) -
                          Math.min(...qualities.map(q => q.sharpness));

    // Real faces should have some variation between frames (natural micro-movements)
    // Photos/screens tend to have very consistent quality across frames
    if (brightnessDiff < 2 && sharpnessDiff < 2) {
      return {
        isLive: false,
        reason: 'Kualitas gambar terlalu konsisten (kemungkinan foto/layar)'
      };
    }

    // Check 3: Face position consistency - face should move slightly between frames
    const positions = faceDetections.map(face => face.BoundingBox);
    const positionDiffs = [];

    for (let i = 1; i < positions.length; i++) {
      const diff = Math.abs(positions[i].Left - positions[i-1].Left) +
                   Math.abs(positions[i].Top - positions[i-1].Top);
      positionDiffs.push(diff);
    }

    const avgPositionDiff = positionDiffs.reduce((a, b) => a + b, 0) / positionDiffs.length;

    // Face should move slightly (natural breathing/micro-movements) but not too much
    if (avgPositionDiff < 0.001) {
      return {
        isLive: false,
        reason: 'Tidak ada gerakan alami terdeteksi (kemungkinan foto statis)'
      };
    }

    if (avgPositionDiff > 0.05) {
      return {
        isLive: false,
        reason: 'Gerakan terlalu besar atau tidak stabil'
      };
    }

    // Check 4: Confidence consistency - real faces should have high, consistent confidence
    const confidences = faceDetections.map(face => face.Confidence);
    const avgConfidence = confidences.reduce((a, b) => a + b, 0) / confidences.length;

    if (avgConfidence < 95) {
      return {
        isLive: false,
        reason: 'Kualitas deteksi wajah tidak memadai'
      };
    }

    // All checks passed
    return {
      isLive: true,
      confidence: avgConfidence,
      qualityMetrics: qualities
    };

  } catch (error) {
    console.error('Liveness check error:', error);
    return {
      isLive: false,
      reason: 'Terjadi kesalahan saat memeriksa keaslian wajah'
    };
  }
}

export async function POST(request) {
  try {
    const { image, frames } = await request.json();

    if (!image) {
      return NextResponse.json({ error: 'No image provided' }, { status: 400 });
    }

    // Convert base64 image to buffer
    const base64Data = image.replace(/^data:image\/\w+;base64,/, '');
    const sourceImageBuffer = Buffer.from(base64Data, 'base64');

    // === LIVENESS CHECK ===
    if (frames && frames.length >= 3) {
      console.log('🔍 Starting liveness check...');

      const livenessCheck = await performLivenessCheck(frames);

      if (!livenessCheck.isLive) {
        console.log('❌ LIVENESS CHECK FAILED:', livenessCheck.reason);
        return NextResponse.json({
          matched: false,
          message: 'Deteksi kecurangan: ' + livenessCheck.reason,
          livenessCheck: false
        });
      }

      console.log('✅ LIVENESS CHECK PASSED');
    }

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
