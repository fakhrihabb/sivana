'use client';

export default function DocumentStatus({ result, index }) {
  return (
    <div className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h4 className="font-bold text-gray-900">
            #{index + 1} - {result.fileName || 'Dokumen'}
          </h4>
          <p className="text-xs text-gray-500">
            Tipe: {result.documentType?.toUpperCase()} • {result.timestamp?.toLocaleString('id-ID')}
          </p>
        </div>
        <div
          className={`px-3 py-1 rounded-full text-sm font-bold ${
            result.verdict?.status === 'APPROVED'
              ? 'bg-green-100 text-green-700'
              : result.verdict?.status === 'REJECTED'
                ? 'bg-red-100 text-red-700'
                : 'bg-yellow-100 text-yellow-700'
          }`}
        >
          {result.verdict?.status === 'APPROVED' && '✅ DISETUJUI'}
          {result.verdict?.status === 'REJECTED' && '❌ DITOLAK'}
          {result.verdict?.status === 'NEED_REVIEW' && '⚠️ REVIEW'}
        </div>
      </div>

      <div className="grid grid-cols-4 gap-2 mb-4 text-center">
        <div className="bg-gray-50 p-2 rounded">
          <p className="text-xs text-gray-600">OCR</p>
          <p className="text-sm font-bold text-gray-900">
            {Math.round((result.ocr?.confidence || 0) * 100)}%
          </p>
        </div>
        <div className="bg-gray-50 p-2 rounded">
          <p className="text-xs text-gray-600">Quality</p>
          <p className="text-sm font-bold text-gray-900">
            {Math.round((result.analysis?.analysis?.completeness || 0) * 100)}%
          </p>
        </div>
        <div className="bg-gray-50 p-2 rounded">
          <p className="text-xs text-gray-600">Authenticity</p>
          <p className="text-sm font-bold text-gray-900">
            {Math.round((result.fraud?.confidence || 0) * 100)}%
          </p>
        </div>
        <div className="bg-gray-50 p-2 rounded">
          <p className="text-xs text-gray-600">Fraud Risk</p>
          <p className={`text-sm font-bold ${result.fraud?.isSuspicious ? 'text-red-600' : 'text-green-600'}`}>
            {result.fraud?.isSuspicious ? '⚠️ HIGH' : '✓ LOW'}
          </p>
        </div>
      </div>

      {result.verdict?.reasons?.length > 0 && (
        <div className="bg-gray-50 p-3 rounded text-sm">
          <p className="font-medium text-gray-700 mb-2">Catatan:</p>
          <ul className="list-disc list-inside space-y-1 text-gray-600">
            {result.verdict.reasons.map((reason, idx) => (
              <li key={idx}>{reason}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
