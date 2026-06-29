'use client'

import { useState, useRef } from 'react'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/client'

const BUCKET = 'listing-images'
const MAX_SIZE_MB = 10

interface ImageUploaderProps {
  urls: string[]
  onChange: (urls: string[]) => void
  maxImages?: number
}

export default function ImageUploader({ urls, onChange, maxImages = 5 }: ImageUploaderProps) {
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const upload = async (files: FileList) => {
    const remaining = maxImages - urls.length
    if (remaining <= 0) return

    const toUpload = Array.from(files).slice(0, remaining)
    for (const f of toUpload) {
      if (f.size > MAX_SIZE_MB * 1024 * 1024) {
        setError(`파일 크기는 ${MAX_SIZE_MB}MB 이하여야 합니다.`)
        return
      }
    }

    setUploading(true)
    setError(null)
    const supabase = createClient()
    const newUrls: string[] = []

    for (const file of toUpload) {
      const ext = file.name.split('.').pop() ?? 'jpg'
      const path = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`

      const { error: uploadErr } = await supabase.storage
        .from(BUCKET)
        .upload(path, file, { cacheControl: '31536000', upsert: false })

      if (uploadErr) {
        setError(`업로드 실패: ${uploadErr.message}`)
        setUploading(false)
        return
      }

      const { data } = supabase.storage.from(BUCKET).getPublicUrl(path)
      newUrls.push(data.publicUrl)
    }

    onChange([...urls, ...newUrls])
    setUploading(false)
    if (inputRef.current) inputRef.current.value = ''
  }

  const remove = (index: number) => {
    onChange(urls.filter((_, i) => i !== index))
  }

  return (
    <div>
      <div className="grid grid-cols-3 sm:grid-cols-5 gap-2 mb-3">
        {urls.map((url, i) => (
          <div key={url} className="relative aspect-square rounded-2xl overflow-hidden bg-zinc-800 group border border-zinc-700">
            <Image src={url} alt={`이미지 ${i + 1}`} fill className="object-cover" sizes="120px" />
            <button
              type="button"
              onClick={() => remove(i)}
              className="absolute top-1.5 right-1.5 w-6 h-6 bg-black/80 rounded-full text-white text-xs flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
            >
              ✕
            </button>
            {i === 0 && (
              <span className="absolute bottom-1.5 left-1.5 text-[10px] bg-lime-400 text-black px-1.5 py-0.5 rounded-full font-bold leading-none">
                대표
              </span>
            )}
          </div>
        ))}

        {urls.length < maxImages && (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={uploading}
            className="aspect-square rounded-2xl border-2 border-dashed border-zinc-700 hover:border-lime-400 flex flex-col items-center justify-center gap-1.5 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {uploading ? (
              <div className="w-5 h-5 border-2 border-lime-400 border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <svg className="w-6 h-6 text-zinc-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
                </svg>
                <span className="text-[11px] text-zinc-500">사진 추가</span>
              </>
            )}
          </button>
        )}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={e => { if (e.target.files?.length) upload(e.target.files) }}
      />

      {error && (
        <p className="mt-1.5 text-xs text-red-400">{error}</p>
      )}
      <p className="mt-1 text-xs text-zinc-600">
        첫 번째 사진이 대표 이미지입니다 · 최대 {maxImages}개 · {MAX_SIZE_MB}MB 이하
      </p>
    </div>
  )
}
