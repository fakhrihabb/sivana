'use client';
import { useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';

export default function QuestionnaireModal({ isOpen, onClose }) {
  const [step, setStep] = useState(0); // 0=opening, 1-5=questions, 6=loading, 7=results
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [answers, setAnswers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [recommendations, setRecommendations] = useState([]);
  const [analysisSummary, setAnalysisSummary] = useState('');
  const [sessionId] = useState(() => uuidv4());
  const [error, setError] = useState(null);
  const [userLocation, setUserLocation] = useState(null);
  const [filteredFormasi, setFilteredFormasi] = useState([]); // Progressive filtering
  const [filteringInProgress, setFilteringInProgress] = useState(false);

  // Get user's location on mount
  useEffect(() => {
    if (isOpen && !userLocation) {
      getUserLocation();
    }
  }, [isOpen]);

  const getUserLocation = async () => {
    if (!navigator.geolocation) {
      console.log('Geolocation not supported');
      return;
    }

    try {
      const position = await new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          timeout: 5000,
          enableHighAccuracy: false
        });
      });

      const { latitude, longitude } = position.coords;

      // Reverse geocode using Google Maps Geocoding API
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}`
      );
      const data = await response.json();

      if (data.results && data.results[0]) {
        const addressComponents = data.results[0].address_components;

        // Extract province and city
        let province = '';
        let city = '';

        for (const component of addressComponents) {
          if (component.types.includes('administrative_area_level_1')) {
            province = component.long_name;
          }
          if (component.types.includes('administrative_area_level_2') ||
              component.types.includes('locality')) {
            city = component.long_name;
          }
        }

        setUserLocation({ province, city, latitude, longitude });
        console.log('User location:', { province, city });
      }
    } catch (error) {
      console.log('Could not get user location:', error);
      // Continue without location - questions will use fallback
    }
  };

  // Fetch question when step changes (for questions 1-5)
  useEffect(() => {
    if (step >= 1 && step <= 5) {
      fetchQuestion(step);
    }
  }, [step]);

  const fetchQuestion = async (questionNumber) => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/questionnaire/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          questionNumber,
          previousAnswers: answers,
          userLocation: userLocation,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setCurrentQuestion(data.data);
      } else {
        setError('Gagal memuat pertanyaan');
      }
    } catch (err) {
      console.error('Error fetching question:', err);
      setError('Terjadi kesalahan saat memuat pertanyaan');
    } finally {
      setLoading(false);
    }
  };

  const handleAnswerSelect = (option) => {
    const newAnswers = [...answers];
    newAnswers[step - 1] = option;
    setAnswers(newAnswers);
  };

  const handleNext = () => {
    if (step === 0) {
      setStep(1);
    } else if (step >= 1 && step <= 4) {
      // Trigger background filtering before moving to next question
      filterFormasiInBackground(step, answers[step - 1]);
      setStep(step + 1);
    } else if (step === 5) {
      // Last question, trigger final filter then submit
      filterFormasiInBackground(step, answers[step - 1]).then(() => {
        submitAnswers();
      });
    }
  };

  // Background filtering - doesn't block user progress
  const filterFormasiInBackground = async (questionNumber, answer) => {
    if (!answer) return;

    try {
      setFilteringInProgress(true);
      console.log(`Background filtering for Q${questionNumber}...`);

      const response = await fetch('/api/questionnaire/filter', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          questionNumber,
          answer,
          previousFilters: filteredFormasi,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setFilteredFormasi(data.data.filteredFormasi);
        console.log(`Q${questionNumber} filtered: ${data.data.remainingCount} remaining`);
      }
    } catch (err) {
      console.error('Error filtering formasi:', err);
      // Don't block user, just log error
    } finally {
      setFilteringInProgress(false);
    }
  };

  const handleBack = () => {
    if (step > 1 && step <= 5) {
      setStep(step - 1);
    }
  };

  const submitAnswers = async () => {
    try {
      setStep(6); // Loading step
      setError(null);

      // Build questions array from current answers
      const questions = answers.map((answer, idx) => ({
        id: idx + 1,
        question: `Question ${idx + 1}`, // This will be replaced with actual question text
        options: []
      }));

      console.log(`Submitting with ${filteredFormasi.length} pre-filtered formasi`);

      const response = await fetch('/api/questionnaire/recommend', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          questions,
          answers,
          sessionId,
          preFilteredFormasi: filteredFormasi, // Pass pre-filtered data
        }),
      });

      const data = await response.json();

      if (data.success) {
        setRecommendations(data.data.recommendations);
        setAnalysisSummary(data.data.analysis_summary);
        setStep(7); // Results step
      } else {
        setError(data.error || 'Gagal mendapatkan rekomendasi');
        setStep(5); // Go back to last question
      }
    } catch (err) {
      console.error('Error submitting answers:', err);
      setError('Terjadi kesalahan saat memproses jawaban');
      setStep(5); // Go back to last question
    }
  };

  const handleReset = () => {
    setStep(0);
    setAnswers([]);
    setCurrentQuestion(null);
    setFilteredFormasi([]);
    setRecommendations([]);
    setAnalysisSummary('');
    setError(null);
  };

  const handleClose = () => {
    // Reset state
    setStep(0);
    setAnswers([]);
    setCurrentQuestion(null);
    setRecommendations([]);
    setAnalysisSummary('');
    setError(null);
    onClose();
  };

  if (!isOpen) return null;

  const currentAnswer = answers[step - 1];

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden shadow-2xl transform animate-scale-in">
        {/* Modal Header */}
        <div className="sticky top-0 bg-gradient-to-r from-brand-blue to-brand-pink px-6 py-5 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
              </svg>
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">
                Temukan Formasi Ideal Anda
              </h2>
              <p className="text-xs text-white/80">
                {step === 0 && 'Siap memulai?'}
                {step >= 1 && step <= 5 && `Pertanyaan ${step} dari 5`}
                {step === 6 && 'Menganalisis jawaban...'}
                {step === 7 && 'Hasil Rekomendasi'}
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="text-white/80 hover:text-white hover:bg-white/20 w-8 h-8 rounded-lg flex items-center justify-center transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Progress Bar */}
        {step >= 1 && step <= 5 && (
          <div className="w-full h-2 bg-gray-200">
            <div
              className="h-full bg-gradient-to-r from-brand-blue to-brand-pink transition-all duration-300"
              style={{ width: `${(step / 5) * 100}%` }}
            />
          </div>
        )}

        {/* Modal Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-80px)]">
          {error && (
            <div className="mb-4 bg-red-50 border-2 border-red-200 rounded-xl p-4">
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          )}

          {/* Step 0: Opening */}
          {step === 0 && (
            <div className="text-center space-y-6 py-8">
              <div className="w-24 h-24 bg-gradient-to-br from-brand-blue/20 to-brand-pink/20 rounded-full flex items-center justify-center mx-auto">
                <svg className="w-12 h-12 text-brand-blue" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                </svg>
              </div>
              <div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">
                  Jawab 5 Pertanyaan Singkat
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  AI kami akan menganalisis jawaban Anda dan merekomendasikan 10 formasi ASN yang paling sesuai dengan latar belakang, keahlian, dan preferensi Anda.
                </p>
              </div>
              <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl p-6 space-y-3">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-brand-blue text-white rounded-full flex items-center justify-center text-xs flex-shrink-0 mt-0.5">1</div>
                  <p className="text-sm text-gray-700 text-left">Pertanyaan akan disesuaikan dengan jawaban Anda sebelumnya</p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-brand-blue text-white rounded-full flex items-center justify-center text-xs flex-shrink-0 mt-0.5">2</div>
                  <p className="text-sm text-gray-700 text-left">Lokasi kerja dipersonalisasi berdasarkan lokasi Anda saat ini</p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-brand-blue text-white rounded-full flex items-center justify-center text-xs flex-shrink-0 mt-0.5">3</div>
                  <p className="text-sm text-gray-700 text-left">AI akan mencocokkan dengan {'>'}300 formasi tersedia</p>
                </div>
              </div>
              <button
                onClick={handleNext}
                className="w-full py-4 bg-gradient-to-r from-brand-blue to-brand-pink text-white rounded-xl font-semibold hover:shadow-xl transition-all transform hover:scale-105"
              >
                Mulai Sekarang
              </button>
            </div>
          )}

          {/* Steps 1-5: Questions */}
          {step >= 1 && step <= 5 && (
            <div className="space-y-6">
              {loading ? (
                <div className="flex justify-center items-center py-12">
                  <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 border-4 border-brand-blue border-t-transparent rounded-full animate-spin"></div>
                    <p className="text-gray-600">Memuat pertanyaan...</p>
                  </div>
                </div>
              ) : currentQuestion ? (
                <>
                  <div>
                    <div className="flex items-center gap-2 mb-4">
                      <span className="w-8 h-8 bg-gradient-to-br from-brand-blue to-brand-pink text-white rounded-lg flex items-center justify-center text-sm font-bold">
                        {step}
                      </span>
                      <h3 className="text-xl font-bold text-gray-900">
                        {currentQuestion.question}
                      </h3>
                    </div>
                  </div>

                  <div className="space-y-3">
                    {currentQuestion.options.map((option) => (
                      <button
                        key={option.id}
                        onClick={() => handleAnswerSelect(option)}
                        className={`w-full text-left p-4 rounded-xl border-2 transition-all transform hover:scale-102 ${
                          currentAnswer?.id === option.id
                            ? 'border-brand-blue bg-gradient-to-br from-brand-blue/10 to-brand-pink/10 shadow-lg'
                            : 'border-gray-200 hover:border-brand-blue/50 hover:bg-gray-50'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                            currentAnswer?.id === option.id
                              ? 'border-brand-blue bg-brand-blue'
                              : 'border-gray-300'
                          }`}>
                            {currentAnswer?.id === option.id && (
                              <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                              </svg>
                            )}
                          </div>
                          <span className={`font-medium ${
                            currentAnswer?.id === option.id ? 'text-brand-blue' : 'text-gray-700'
                          }`}>
                            {option.text}
                          </span>
                        </div>
                      </button>
                    ))}
                  </div>

                  <div className="flex gap-3 pt-4">
                    {step > 1 && (
                      <button
                        onClick={handleBack}
                        className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-all"
                      >
                        Kembali
                      </button>
                    )}
                    <button
                      onClick={handleNext}
                      disabled={!currentAnswer}
                      className={`flex-1 py-3 rounded-xl font-semibold transition-all ${
                        currentAnswer
                          ? 'bg-gradient-to-r from-brand-blue to-brand-pink text-white hover:shadow-xl transform hover:scale-105'
                          : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                      }`}
                    >
                      {step === 5 ? 'Dapatkan Rekomendasi' : 'Lanjut'}
                    </button>
                  </div>
                </>
              ) : null}
            </div>
          )}

          {/* Step 6: Loading */}
          {step === 6 && (
            <div className="relative bg-gradient-to-br from-brand-blue/5 via-purple-50/50 to-brand-pink/5 rounded-2xl p-12 border-2 border-brand-blue/20 overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-brand-blue/5 to-brand-pink/5 animate-pulse"></div>

              <div className="relative flex flex-col items-center space-y-6">
                <div className="relative">
                  <div className="absolute inset-0 bg-brand-blue/30 rounded-full animate-ping"></div>
                  <div className="absolute inset-0 bg-brand-pink/30 rounded-full animate-ping" style={{ animationDelay: '0.5s' }}></div>
                  <div className="relative w-24 h-24 bg-gradient-to-br from-brand-blue via-purple-500 to-brand-pink rounded-full flex items-center justify-center shadow-2xl">
                    <svg className="w-12 h-12 text-white animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                    </svg>
                  </div>
                </div>

                <div className="text-center space-y-2">
                  <p className="text-xl font-bold bg-gradient-to-r from-brand-blue to-brand-pink bg-clip-text text-transparent">
                    AI sedang menganalisis profil Anda
                  </p>
                  <p className="text-gray-600">Mencocokkan dengan ratusan formasi tersedia...</p>
                </div>

                <div className="w-full max-w-xs">
                  <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-brand-blue via-purple-500 to-brand-pink animate-pulse"></div>
                  </div>
                </div>

                <div className="flex space-x-2">
                  <div className="w-3 h-3 bg-brand-blue rounded-full animate-bounce"></div>
                  <div className="w-3 h-3 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                  <div className="w-3 h-3 bg-brand-pink rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                </div>
              </div>
            </div>
          )}

          {/* Step 7: Results */}
          {step === 7 && (
            <div className="space-y-6">
              {/* Success Banner */}
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200 rounded-2xl p-5 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-green-300/20 rounded-full blur-2xl"></div>
                <div className="relative flex items-start gap-3">
                  <div className="w-10 h-10 bg-green-500 rounded-xl flex items-center justify-center flex-shrink-0">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-green-900 mb-1">Analisis Selesai!</p>
                    <p className="text-sm text-green-700">{analysisSummary}</p>
                  </div>
                </div>
              </div>

              {/* Recommendations Header */}
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                  <span className="w-8 h-8 bg-gradient-to-br from-brand-blue to-brand-pink text-white rounded-lg flex items-center justify-center text-sm">
                    {recommendations.length}
                  </span>
                  Top 10 Formasi untuk Anda
                </h3>
                <span className="text-xs text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                  Urutan berdasarkan kecocokan
                </span>
              </div>

              {/* Recommendations List */}
              <div className="space-y-3">
                {recommendations.map((formasi, index) => (
                  <div
                    key={formasi.id}
                    className="group relative border-2 border-gray-200 rounded-2xl p-5 hover:border-brand-blue hover:shadow-xl transition-all duration-300 cursor-pointer overflow-hidden"
                    onClick={() => {
                      window.location.href = `/formasi/${formasi.id}`;
                    }}
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-brand-blue/5 to-brand-pink/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

                    <div className="absolute top-3 left-3 w-8 h-8 bg-gradient-to-br from-yellow-400 to-orange-500 text-white rounded-lg flex items-center justify-center font-bold text-sm shadow-lg">
                      {index + 1}
                    </div>

                    <div className="relative pl-10">
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex-1 pr-4">
                          <h4 className="font-bold text-gray-900 text-lg mb-1 group-hover:text-brand-blue transition-colors">
                            {formasi.name}
                          </h4>
                          <p className="text-sm text-gray-600 font-medium mb-1">
                            {formasi.lembaga}
                          </p>
                          <p className="text-sm text-gray-500 flex items-center gap-1">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                            {formasi.lokasi}
                          </p>
                        </div>

                        <div className={`relative px-4 py-2 rounded-xl text-sm font-bold shadow-lg flex-shrink-0 ${
                          formasi.match_score >= 85
                            ? 'bg-gradient-to-r from-green-400 to-emerald-500 text-white'
                            : formasi.match_score >= 75
                            ? 'bg-gradient-to-r from-blue-400 to-cyan-500 text-white'
                            : formasi.match_score >= 65
                            ? 'bg-gradient-to-r from-purple-400 to-pink-500 text-white'
                            : 'bg-gradient-to-r from-gray-400 to-gray-500 text-white'
                        }`}>
                          <div className="flex items-center gap-1">
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                            </svg>
                            {formasi.match_score}%
                          </div>
                        </div>
                      </div>

                      <div className="mt-3 pt-3 border-t border-gray-200">
                        <p className="text-xs font-semibold text-gray-500 mb-2 flex items-center gap-1">
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          Alasan kecocokan:
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {formasi.reasons.map((reason, idx) => (
                            <span
                              key={idx}
                              className="text-xs bg-gradient-to-r from-brand-blue/10 to-brand-pink/10 text-brand-blue font-medium px-3 py-1.5 rounded-lg border border-brand-blue/20"
                            >
                              {reason}
                            </span>
                          ))}
                        </div>
                      </div>

                      <div className="mt-3 flex items-center text-brand-blue text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                        <span>Klik untuk lihat detail</span>
                        <svg className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col gap-3 pt-4 border-t border-gray-200">
                <p className="text-center text-sm text-gray-600">
                  Tidak ada yang cocok?
                </p>
                <button
                  onClick={handleReset}
                  className="w-full py-3 bg-gradient-to-r from-brand-blue to-brand-pink text-white rounded-xl font-semibold hover:shadow-xl transition-all transform hover:scale-105"
                >
                  <span className="flex items-center justify-center gap-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    Coba Kuis Lagi
                  </span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
