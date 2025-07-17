import React, { useState, useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { Upload, User, X, Check } from 'lucide-react'
import toast from 'react-hot-toast'

interface AvatarUploadProps {
  currentAvatar?: string
  onAvatarChange: (file: File | null) => void
  loading?: boolean
}

const AvatarUpload: React.FC<AvatarUploadProps> = ({
  currentAvatar,
  onAvatarChange,
  loading = false
}) => {
  const [preview, setPreview] = useState<string | null>(currentAvatar || null)
  const [isDragActive, setIsDragActive] = useState(false)

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0]
    if (file) {
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error('File size must be less than 5MB')
        return
      }

      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast.error('Please upload an image file')
        return
      }

      // Create preview
      const reader = new FileReader()
      reader.onload = () => {
        setPreview(reader.result as string)
      }
      reader.readAsDataURL(file)

      onAvatarChange(file)
      toast.success('Avatar uploaded successfully!')
    }
  }, [onAvatarChange])

  const { getRootProps, getInputProps, isDragActive: dropzoneActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.gif', '.webp']
    },
    multiple: false,
    onDragEnter: () => setIsDragActive(true),
    onDragLeave: () => setIsDragActive(false),
    onDropAccepted: () => setIsDragActive(false),
    onDropRejected: () => setIsDragActive(false)
  })

  const removeAvatar = () => {
    setPreview(null)
    onAvatarChange(null)
    toast.success('Avatar removed')
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-center">
        <div className="relative group">
          {/* Avatar Display */}
          <div className="w-32 h-32 rounded-full overflow-hidden bg-gradient-to-r from-purple-400 to-blue-400 p-1">
            <div className="w-full h-full rounded-full overflow-hidden bg-slate-800 flex items-center justify-center">
              {preview ? (
                <img
                  src={preview}
                  alt="Avatar"
                  className="w-full h-full object-cover"
                />
              ) : (
                <User className="w-12 h-12 text-slate-400" />
              )}
            </div>
          </div>

          {/* Remove Button */}
          {preview && (
            <button
              onClick={removeAvatar}
              className="absolute -top-2 -right-2 w-8 h-8 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center transition-all duration-300 transform hover:scale-110 shadow-lg"
            >
              <X className="w-4 h-4" />
            </button>
          )}

          {/* Loading Overlay */}
          {loading && (
            <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center">
              <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            </div>
          )}
        </div>
      </div>

      {/* Upload Area */}
      <div
        {...getRootProps()}
        className={`
          relative border-2 border-dashed rounded-xl p-8 text-center cursor-pointer
          transition-all duration-300 ease-out
          ${isDragActive || dropzoneActive
            ? 'border-purple-400 bg-purple-500/10 scale-105'
            : 'border-white/20 hover:border-purple-400/50 hover:bg-white/5'
          }
          ${loading ? 'pointer-events-none opacity-50' : ''}
        `}
      >
        <input {...getInputProps()} />
        
        <div className="space-y-4">
          <div className={`
            w-16 h-16 mx-auto rounded-full flex items-center justify-center
            transition-all duration-300
            ${isDragActive || dropzoneActive
              ? 'bg-gradient-to-r from-purple-500 to-blue-500 scale-110'
              : 'bg-white/10'
            }
          `}>
            {loading ? (
              <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : isDragActive || dropzoneActive ? (
              <Check className="w-8 h-8 text-white" />
            ) : (
              <Upload className="w-8 h-8 text-slate-400" />
            )}
          </div>

          <div>
            <p className="text-white font-medium mb-2">
              {isDragActive || dropzoneActive
                ? 'Drop your image here'
                : 'Upload your avatar'
              }
            </p>
            <p className="text-slate-400 text-sm">
              Drag and drop an image, or click to browse
            </p>
            <p className="text-slate-500 text-xs mt-2">
              Supports: JPG, PNG, GIF, WebP (max 5MB)
            </p>
          </div>
        </div>

        {/* Drag Overlay */}
        {(isDragActive || dropzoneActive) && (
          <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 to-blue-500/20 rounded-xl border-2 border-purple-400 flex items-center justify-center">
            <div className="text-center">
              <Upload className="w-12 h-12 text-purple-400 mx-auto mb-2 animate-bounce" />
              <p className="text-purple-400 font-semibold">Drop to upload</p>
            </div>
          </div>
        )}
      </div>

      {/* Upload Tips */}
      <div className="bg-white/5 rounded-lg p-4">
        <h4 className="text-white font-medium mb-2">Tips for best results:</h4>
        <ul className="text-slate-400 text-sm space-y-1">
          <li>• Use a square image for best fit</li>
          <li>• Minimum resolution: 200x200 pixels</li>
          <li>• Keep file size under 5MB</li>
          <li>• Avoid images with text or small details</li>
        </ul>
      </div>
    </div>
  )
}

export default AvatarUpload