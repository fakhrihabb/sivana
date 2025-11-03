"use client";

export default function RequirementChecklist({ validationResults }) {
  if (!validationResults || validationResults.checks.length === 0) {
    return null;
  }

  const getStatusColor = (status) => {
    switch (status) {
      case "passed":
        return "bg-green-50 border-green-200 text-green-800";
      case "warning":
        return "bg-yellow-50 border-yellow-200 text-yellow-800";
      case "failed":
        return "bg-red-50 border-red-200 text-red-800";
      default:
        return "bg-gray-50 border-gray-200 text-gray-800";
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "passed":
        return (
          <svg
            className="w-5 h-5 text-green-600"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
              clipRule="evenodd"
            />
          </svg>
        );
      case "warning":
        return (
          <svg
            className="w-5 h-5 text-yellow-600"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
              clipRule="evenodd"
            />
          </svg>
        );
      case "failed":
        return (
          <svg
            className="w-5 h-5 text-red-600"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
              clipRule="evenodd"
            />
          </svg>
        );
      default:
        return null;
    }
  };

  const getOverallStatusBadge = () => {
    const { overall, score, totalChecks } = validationResults;
    const percentage = totalChecks > 0 ? Math.round((score / totalChecks) * 100) : 0;

    let bgColor, textColor, statusText;

    if (overall === "passed") {
      bgColor = "bg-green-100";
      textColor = "text-green-800";
      statusText = "✓ Semua Persyaratan Terpenuhi";
    } else if (overall === "warning") {
      bgColor = "bg-yellow-100";
      textColor = "text-yellow-800";
      statusText = "⚠ Beberapa Persyaratan Perlu Ditinjau";
    } else {
      bgColor = "bg-red-100";
      textColor = "text-red-800";
      statusText = "✗ Ada Persyaratan yang Tidak Terpenuhi";
    }

    return (
      <div className={`${bgColor} ${textColor} rounded-lg p-4 mb-6`}>
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-bold text-lg mb-1">{statusText}</h3>
            <p className="text-sm opacity-90">
              {score} dari {totalChecks} persyaratan terpenuhi ({percentage}%)
            </p>
          </div>
          <div className="text-3xl font-bold">{percentage}%</div>
        </div>
        <div className="mt-3 h-2 bg-white/30 rounded-full overflow-hidden">
          <div
            className={`h-full ${
              overall === "passed"
                ? "bg-green-600"
                : overall === "warning"
                ? "bg-yellow-600"
                : "bg-red-600"
            }`}
            style={{ width: `${percentage}%` }}
          ></div>
        </div>
      </div>
    );
  };

  return (
    <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
      <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
        <svg
          className="w-6 h-6 text-brand-blue"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
        Verifikasi Persyaratan Formasi
      </h2>

      {getOverallStatusBadge()}

      <div className="space-y-3">
        {validationResults.checks.map((check, index) => (
          <div
            key={index}
            className={`border rounded-lg p-4 ${getStatusColor(check.status)}`}
          >
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 mt-0.5">{getStatusIcon(check.status)}</div>
              <div className="flex-1">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h4 className="font-semibold mb-1">{check.label}</h4>
                    <p className="text-sm opacity-90">{check.detail}</p>
                  </div>
                  <span className="px-2 py-1 bg-white/50 rounded text-xs font-medium whitespace-nowrap">
                    {check.category}
                  </span>
                </div>

                {check.similarity !== undefined && (
                  <div className="mt-2">
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span>Tingkat Kecocokan</span>
                      <span className="font-medium">{check.similarity}%</span>
                    </div>
                    <div className="h-1.5 bg-white/50 rounded-full overflow-hidden">
                      <div
                        className={`h-full ${
                          check.similarity >= 90
                            ? "bg-green-600"
                            : check.similarity >= 70
                            ? "bg-yellow-600"
                            : "bg-red-600"
                        }`}
                        style={{ width: `${check.similarity}%` }}
                      ></div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <div className="flex gap-3">
          <svg
            className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
              clipRule="evenodd"
            />
          </svg>
          <div className="text-sm text-blue-800">
            <p className="font-medium mb-1">Informasi</p>
            <p>
              Verifikasi persyaratan dilakukan secara otomatis menggunakan AI dan OCR. 
              {validationResults.overall === "warning" && " Dokumen dengan status 'Perlu Ditinjau' akan diperiksa oleh tim verifikator."}
              {validationResults.overall === "failed" && " Mohon perbaiki dokumen yang tidak memenuhi syarat sebelum melanjutkan."}
              {validationResults.overall === "passed" && " Selamat! Semua dokumen Anda memenuhi persyaratan."}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
