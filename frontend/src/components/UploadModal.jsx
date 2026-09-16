const UploadModal = ({
  open,
  onClose,
  title,
  description,
  accept,
  onFileSelect,
}) => {
  if (!open) return null

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
            onClick={onClose}
            className="text-gray-500 hover:text-white text-xl"
          >
            ×
          </button>
        </div>

        {/* Upload Area */}
        <label className="block mt-6 cursor-pointer">
          <div className="border border-dashed border-[#3a4655] rounded-xl p-8 text-center hover:bg-[#10151c] transition">

            <p className="text-gray-300 font-medium">
              Select a file
            </p>

            <p className="text-gray-500 text-sm mt-2">
              Supported formats: {accept}
            </p>

            <input
              type="file"
              accept={accept}
              onChange={(e) => {
                const file = e.target.files?.[0]

                if (file) {
                  onFileSelect(file)
                }
              }}
              className="hidden"
            />

          </div>
        </label>

        {/* Footer */}
        <div className="flex justify-end gap-3 mt-6">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-[#252d38] hover:bg-[#303a47] text-gray-200 transition"
          >
            Cancel
          </button>
        </div>

      </div>
    </div>
  )
}

export default UploadModal