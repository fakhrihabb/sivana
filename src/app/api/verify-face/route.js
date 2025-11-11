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
// Strategy: Use minimal hard-rejections, rely on suspicion scoring for nuanced detection
// Hard-reject: Only EXTREME cases (very low quality, excessive movement)
// Suspicion scoring (0-17): Combines 6 factors, threshold = 8
// - Photos typically score 9-15 (multiple perfect consistencies)
// - Real faces typically score 2-5 (natural micro-variations)
async function performLivenessCheck(frames) {
  try {
    const frameBuffers = frames.map(frame => {
      const base64Data = frame.replace(/^data:image\/\w+;base64,/, '');
      return Buffer.from(base64Data, 'base64');
    });

    // Detect faces in all frames
    const faceDetections = [];
    const allFrameFaces = [];

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

      allFrameFaces.push(result.FaceDetails);
      faceDetections.push(result.FaceDetails[0]);
    }

    // Check 1: Multiple faces or inconsistent detection
    // Check if any frame has multiple faces (showing a photo with people in background)
    const hasMultipleFaces = allFrameFaces.some(faces => faces.length > 1);
    if (hasMultipleFaces) {
      return {
        isLive: false,
        reason: 'Terdeteksi lebih dari satu wajah (kemungkinan menunjukkan foto)'
      };
    }

    // Check if face count varies (unstable = someone moving photo in/out of frame)
    const faceCounts = allFrameFaces.map(faces => faces.length);
    const faceCountVariation = Math.max(...faceCounts) - Math.min(...faceCounts);
    if (faceCountVariation > 0) {
      return {
        isLive: false,
        reason: 'Deteksi wajah tidak stabil antar frame (kemungkinan foto bergerak)'
      };
    }

    // Check 2: Face quality - photos from phones often have compression artifacts
    const qualities = faceDetections.map(face => ({
      brightness: face.Quality?.Brightness || 0,
      sharpness: face.Quality?.Sharpness || 0
    }));

    const avgBrightness = qualities.reduce((sum, q) => sum + q.brightness, 0) / qualities.length;
    const avgSharpness = qualities.reduce((sum, q) => sum + q.sharpness, 0) / qualities.length;

    // Calculate quality VARIANCE - photos have more consistent quality across frames
    const brightnessVariance = qualities.reduce((sum, q) => 
      sum + Math.pow(q.brightness - avgBrightness, 2), 0) / qualities.length;
    const sharpnessVariance = qualities.reduce((sum, q) => 
      sum + Math.pow(q.sharpness - avgSharpness, 2), 0) / qualities.length;

    console.log('Quality metrics:', { 
      avgBrightness: avgBrightness.toFixed(2), 
      avgSharpness: avgSharpness.toFixed(2),
      brightnessVar: brightnessVariance.toFixed(2),
      sharpnessVar: sharpnessVariance.toFixed(2)
    });

    // Only hard-reject EXTREME cases - most detection done via suspicion scoring
    // Very low quality indicates photo of a photo
    if (avgSharpness < 30) {
      return {
        isLive: false,
        reason: 'Kualitas gambar terlalu rendah (kemungkinan foto dari foto)'
      };
    }

    // Extremely high brightness + zero variance = screen
    if (avgBrightness > 95 && brightnessVariance < 1) {
      return {
        isLive: false,
        reason: 'Kecerahan tidak natural dan identik (kemungkinan layar)'
      };
    }

    // Check 3: Face position and size variation - detect static photos vs live faces
    const positions = faceDetections.map(face => face.BoundingBox);
    const positionDiffs = [];
    const sizeDiffs = [];

    for (let i = 1; i < positions.length; i++) {
      // Position difference
      const diff = Math.abs(positions[i].Left - positions[i-1].Left) +
                   Math.abs(positions[i].Top - positions[i-1].Top);
      positionDiffs.push(diff);

      // Size difference (width + height)
      const sizeDiff = Math.abs(positions[i].Width - positions[i-1].Width) +
                       Math.abs(positions[i].Height - positions[i-1].Height);
      sizeDiffs.push(sizeDiff);
    }

    const avgPositionDiff = positionDiffs.reduce((a, b) => a + b, 0) / positionDiffs.length;
    const avgSizeDiff = sizeDiffs.reduce((a, b) => a + b, 0) / sizeDiffs.length;

    console.log('Movement metrics:', { avgPositionDiff, avgSizeDiff });

    // Real faces have SOME natural movement (breathing, micro-movements)
    // Photos held still have ALMOST ZERO movement, or only hand shake movement
    // We want to see natural face movement, not just camera/hand shake
    
    // Only hard-reject EXTREME movement cases
    // Check for excessive movement (someone waving a photo around quickly to fake movement)
    if (avgPositionDiff > 0.1 || avgSizeDiff > 0.1) {
      return {
        isLive: false,
        reason: 'Gerakan terlalu besar atau tidak stabil (tetap diam dan hadap kamera)'
      };
    }

    // Check 4: Confidence and emotion analysis
    const confidences = faceDetections.map(face => face.Confidence);
    const avgConfidence = confidences.reduce((a, b) => a + b, 0) / confidences.length;

    if (avgConfidence < 95) {
      return {
        isLive: false,
        reason: 'Kualitas deteksi wajah tidak memadai'
      };
    }

    // Analyze emotions - photos have VERY stable emotion values
    // Real faces have micro-expressions that cause slight fluctuations
    const emotions = faceDetections.map(face => {
      const emotionList = face.Emotions || [];
      // Get top emotion confidence
      const topEmotion = emotionList.length > 0 ? emotionList[0].Confidence : 0;
      return topEmotion;
    });

    const emotionVariance = emotions.reduce((sum, e, i, arr) => {
      const avg = arr.reduce((a, b) => a + b, 0) / arr.length;
      return sum + Math.pow(e - avg, 2);
    }, 0) / emotions.length;

    console.log('Emotion variance:', emotionVariance.toFixed(4));

    // Only reject EXTREME emotion consistency (photos)
    // Don't hard-reject here - let suspicion scoring handle it

    // Check 5: Texture and detail consistency
    // Photos lose micro-details due to camera resolution and compression
    // This check looks at face landmark consistency - photos are TOO perfect
    const poses = faceDetections.map(face => ({
      pitch: face.Pose?.Pitch || 0,
      roll: face.Pose?.Roll || 0,
      yaw: face.Pose?.Yaw || 0
    }));

    // Calculate pose variance - real faces have natural micro-movements
    // Photos held still have almost zero pose variance
    const pitchValues = poses.map(p => p.pitch);
    const rollValues = poses.map(p => p.roll);
    const yawValues = poses.map(p => p.yaw);

    const pitchRange = Math.max(...pitchValues) - Math.min(...pitchValues);
    const rollRange = Math.max(...rollValues) - Math.min(...rollValues);
    const yawRange = Math.max(...yawValues) - Math.min(...yawValues);

    console.log('Pose variation:', { 
      pitch: pitchRange.toFixed(2), 
      roll: rollRange.toFixed(2), 
      yaw: yawRange.toFixed(2) 
    });

    // Don't hard-reject on pose alone - let suspicion scoring handle it

    // Check 6: Combined suspicion score
    // Multiple weak signals can indicate a spoof even if no single check fails
    // Made MORE LENIENT - real faces need to be allowed through
    let suspicionScore = 0;
    const suspicionReasons = [];

    // Face size too consistent (Score: 0-3) - STRICTER thresholds
    const widths = positions.map(p => p.Width);
    const maxWidth = Math.max(...widths);
    const minWidth = Math.min(...widths);
    const widthVariation = maxWidth - minWidth;

    console.log('Face width variation:', widthVariation.toFixed(6));

    if (widthVariation < 0.0002) {
      suspicionScore += 3;
      suspicionReasons.push('ukuran wajah identik');
    } else if (widthVariation < 0.0005) {
      suspicionScore += 2;
      suspicionReasons.push('ukuran wajah sangat konsisten');
    } else if (widthVariation < 0.001) {
      suspicionScore += 1;
      suspicionReasons.push('ukuran wajah konsisten');
    }

    // Quality too stable (Score: 0-4) - Most important indicator
    if (brightnessVariance < 0.3 && sharpnessVariance < 0.5) {
      suspicionScore += 4;
      suspicionReasons.push('kualitas identik');
    } else if (brightnessVariance < 0.8 && sharpnessVariance < 1.2) {
      suspicionScore += 3;
      suspicionReasons.push('kualitas sangat stabil');
    } else if (brightnessVariance < 1.5 && sharpnessVariance < 2.0) {
      suspicionScore += 2;
      suspicionReasons.push('kualitas stabil');
    }

    // Movement too minimal (Score: 0-3) - STRICTER thresholds
    if (avgPositionDiff < 0.0002 && avgSizeDiff < 0.0002) {
      suspicionScore += 3;
      suspicionReasons.push('tidak ada gerakan');
    } else if (avgPositionDiff < 0.0005 && avgSizeDiff < 0.0005) {
      suspicionScore += 2;
      suspicionReasons.push('gerakan sangat minimal');
    } else if (avgPositionDiff < 0.001 && avgSizeDiff < 0.001) {
      suspicionScore += 1;
      suspicionReasons.push('gerakan minimal');
    }

    // Pose too stable (Score: 0-3) - STRICTER thresholds
    if (pitchRange < 0.15 && rollRange < 0.15 && yawRange < 0.15) {
      suspicionScore += 3;
      suspicionReasons.push('pose identik');
    } else if (pitchRange < 0.3 && rollRange < 0.3 && yawRange < 0.3) {
      suspicionScore += 2;
      suspicionReasons.push('pose sangat stabil');
    } else if (pitchRange < 0.5 && rollRange < 0.5 && yawRange < 0.5) {
      suspicionScore += 1;
      suspicionReasons.push('pose stabil');
    }

    // Emotion too stable (Score: 0-2) - STRICTER thresholds
    if (emotionVariance < 0.03) {
      suspicionScore += 2;
      suspicionReasons.push('ekspresi identik');
    } else if (emotionVariance < 0.1) {
      suspicionScore += 1;
      suspicionReasons.push('ekspresi stabil');
    }

    // Perfect alignment across frames (Score: 0-2) - STRICTER
    const avgPitch = pitchValues.reduce((a, b) => a + b, 0) / pitchValues.length;
    const avgRoll = rollValues.reduce((a, b) => a + b, 0) / rollValues.length;
    if (Math.abs(avgPitch) < 1.5 && Math.abs(avgRoll) < 1.5 && pitchRange < 0.2 && rollRange < 0.2) {
      suspicionScore += 2;
      suspicionReasons.push('sempurna teralign');
    } else if (Math.abs(avgPitch) < 3 && Math.abs(avgRoll) < 3 && pitchRange < 0.4 && rollRange < 0.4) {
      suspicionScore += 1;
      suspicionReasons.push('alignment konsisten');
    }

    console.log('🔍 Suspicion Analysis:', {
      score: suspicionScore,
      maxScore: 17,
      threshold: 8,
      widthVar: widthVariation.toFixed(6),
      brightVar: brightnessVariance.toFixed(2),
      sharpVar: sharpnessVariance.toFixed(2),
      posMove: avgPositionDiff.toFixed(6),
      sizeMove: avgSizeDiff.toFixed(6),
      poseRanges: `${pitchRange.toFixed(2)}/${rollRange.toFixed(2)}/${yawRange.toFixed(2)}`,
      emotionVar: emotionVariance.toFixed(4),
      reasons: suspicionReasons
    });

    // RAISED THRESHOLD: Score >= 8 out of 17 = photo
    // This requires STRONG evidence across multiple factors
    // Real faces typically score 2-5, photos score 9-15
    if (suspicionScore >= 8) {
      return {
        isLive: false,
        reason: `Terdeteksi pola foto (skor ${suspicionScore}/17): ${suspicionReasons.join(', ')}`
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
