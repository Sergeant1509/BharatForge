import { useEffect, useState } from "react"

const UploadModal = ({
  open,
  onClose,
  title,
  description,
  accept,
  onFileSelect,
}) => {
  const [selectedFile, setSelectedFile] = useState(null)
  const [preview, setPreview] = useState(null)

  useEffect(() => {
    if (!open) {
      setSelectedFile(null)
      setPreview(null)
    }
  }, [open])

  if (!open) return null

  const handleFileChange = (e) => {
    const file = e.target.files?.[0]

    if (!file) return

    setSelectedFile(file)

    if (file.type.startsWith("image/")) {
      const previewUrl = URL.createObjectURL(file)
      setPreview(previewUrl)
    } else {
      setPreview(null)
    }

    onFileSelect(file)
  }

  const handleClose = () => {
    setSelectedFile(null)
    setPreview(null)
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4">
      <div className="w-full max-w-lg bg-[#151b24] border border-[#252d38] rounded-xl p-6">

        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-lg font-semibold text-white">
              {title}
            </h3>

            <p className="text-sm text-gray-400 mt-1">
              {description}
            </p>
          </div>

          <button
            type="button"
            onClick={handleClose}
            className="text-gray-500 hover:text-white text-xl"
          >
            ×
          </button>
        </div>

        {/* Upload Area */}
        <label className="block mt-6 cursor-pointer">
          <div className="border border-dashed border-[#3a4655] rounded-xl p-6 text-center hover:bg-[#10151c] transition">

            {!preview ? (
              <>
                <div className="text-3xl mb-3">
                  📄
                </div>

                <p className="text-gray-300 font-medium">
                  Select DPR Image
                </p>

                <p className="text-gray-500 text-sm mt-2">
                  Supported formats: {accept}
                </p>

                <p className="text-gray-600 text-xs mt-2">
                  Maximum file size: 10 MB
                </p>
              </>
            ) : (
              <div>
                <img
                  src={preview}
                  alt="DPR Preview"
                  className="max-h-56 mx-auto rounded-lg object-contain"
                />

                <p className="text-gray-300 text-sm mt-3 truncate">
                  {selectedFile?.name}
                </p>
              </div>
            )}

            <input
              type="file"
              accept={accept}
              onChange={handleFileChange}
              className="hidden"
            />

          </div>
        </label>

        {/* Selected file information */}
        {selectedFile && (
          <div className="mt-4 bg-[#10151c] border border-[#252d38] rounded-lg px-4 py-3">
            <p className="text-xs text-gray-500">
              Selected file
            </p>

            <p className="text-sm text-gray-200 mt-1 truncate">
              {selectedFile.name}
            </p>

            <p className="text-xs text-gray-500 mt-1">
              {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
            </p>
          </div>
        )}

        {/* Footer */}
        <div className="flex justify-end gap-3 mt-6">
          <button
            type="button"
            onClick={handleClose}
            className="px-4 py-2 rounded-lg bg-[#252d38] hover:bg-[#303a47] text-gray-200 transition"
          >
            Cancel
          </button>

          {selectedFile && (
            <button
              type="button"
              onClick={() => onFileSelect(selectedFile)}
              className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white transition"
            >
              Process DPR
            </button>
          )}
        </div>

      </div>
    </div>
  )
}

export default UploadModal