import { useState, useCallback } from 'react'
import clsx from 'clsx'
import { formatBytes } from '../../utils/formatters'

export default function DatasetUpload({ onUpload, modelType, className = '' }) {
  const [dragging, setDragging] = useState(false)
  const [file, setFile] = useState(null)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState(null)
  const [uploaded, setUploaded] = useState(false)

  const acceptedExt = modelType === 'CNN' ? '.zip' : '.csv'
  const acceptedDesc = modelType === 'CNN' ? 'ZIP archive' : 'CSV file'

  const processFile = useCallback(async (f) => {
    setError(null)
    const ext = '.' + f.name.split('.').pop().toLowerCase()
    if (ext !== acceptedExt) {
      setError(`Expected ${acceptedDesc} (${acceptedExt}), got ${ext}`)
      return
    }
    setFile(f)
    setUploading(true)
    try {
      const formData = new FormData()
      formData.append('dataset', f)
      await onUpload(formData)
      setUploaded(true)
    } catch (e) {
      setError(e?.message || 'Upload failed')
    } finally {
      setUploading(false)
    }
  }, [acceptedExt, acceptedDesc, onUpload])

  const onDrop = (e) => {
    e.preventDefault()
    setDragging(false)
    const f = e.dataTransfer.files[0]
    if (f) processFile(f)
  }

  const onFileChange = (e) => {
    const f = e.target.files[0]
    if (f) processFile(f)
  }

  return (
    <div className={clsx('flex flex-col gap-2', className)}>
      <label
        className={clsx(
          'relative flex flex-col items-center justify-center rounded-lg border-2 border-dashed',
          'p-8 transition-all duration-200 cursor-pointer min-h-[140px]',
          dragging
            ? 'border-[#ff6b6b] bg-[rgba(255,107,107,0.06)] shadow-[inset_0_0_20px_rgba(255,107,107,0.06)]'
            : uploaded
            ? 'border-[rgba(255,107,107,0.4)] bg-[rgba(255,107,107,0.03)]'
            : 'border-[rgba(255,107,107,0.2)] bg-transparent hover:border-[rgba(255,107,107,0.4)]'
        )}
        onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
      >
        <input
          type="file"
          accept={acceptedExt}
          onChange={onFileChange}
          className="absolute inset-0 opacity-0 cursor-pointer"
        />

        {file ? (
          <div className="text-center">
            <div className="text-2xl mb-2">{uploaded ? '✅' : '📁'}</div>
            <div className="text-sm font-mono text-[#e0e0e0] font-bold truncate max-w-[200px]">{file.name}</div>
            <div className="text-xs text-[#555] mt-1">{formatBytes(file.size)}</div>
            {uploaded && <div className="text-xs mt-1" style={{ color: '#ff6b6b' }}>Upload complete ✓</div>}
            {uploading && <div className="text-xs text-[#00d4ff] mt-1 animate-pulse">Uploading...</div>}
          </div>
        ) : (
          <div className="text-center">
            <div className="text-3xl mb-2">📤</div>
            <div className="text-sm font-mono text-[#666]">Drop {acceptedDesc} here</div>
            <div className="text-xs text-[#444] mt-1">or click to browse</div>
          </div>
        )}
      </label>

      <div className="text-xs text-[#444] font-mono">
        Accepted: <span style={{ color: '#ff6b6b' }}>{acceptedExt}</span>
        {modelType === 'CNN' ? ' — ZIP with train/test image folders' : ' — tabular data with header row'}
      </div>

      {error && <div className="text-xs text-[#ff4444] font-mono">{error}</div>}
    </div>
  )
}
