import React, { useState, useRef } from 'react';
import { Upload, X, Image as ImageIcon, Star, ArrowLeft, ArrowRight, Link as LinkIcon, Plus, CheckCircle2, Sparkles } from 'lucide-react';
import toast from 'react-hot-toast';

interface MultiImageUploaderProps {
  images: string[];
  onChange: (images: string[]) => void;
  category?: string;
  minImages?: number;
}

const SAMPLE_GALLERY_PRESETS: Record<string, string[]> = {
  Electronics: [
    'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=800&q=80',
    'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80',
    'https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=800&q=80',
    'https://images.unsplash.com/photo-1527443195645-1133f7f28990?w=800&q=80',
    'https://images.unsplash.com/photo-1595225476474-87563907a212?w=800&q=80',
  ],
  Fashion: [
    'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&q=80',
    'https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=800&q=80',
    'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800&q=80',
    'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=800&q=80',
    'https://images.unsplash.com/photo-1576995853123-5a10305d93c0?w=800&q=80',
  ],
  'Home & Kitchen': [
    'https://images.unsplash.com/photo-1583847268964-b28dc8f51f92?w=800&q=80',
    'https://images.unsplash.com/photo-1612196808214-b8e1d6145a8c?w=800&q=80',
    'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=800&q=80',
    'https://images.unsplash.com/photo-1584992236310-6edddc08acff?w=800&q=80',
    'https://images.unsplash.com/photo-1585515320310-259814833e62?w=800&q=80',
  ],
  Beauty: [
    'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=800&q=80',
    'https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?w=800&q=80',
    'https://images.unsplash.com/photo-1586495777744-4413f21062fa?w=800&q=80',
    'https://images.unsplash.com/photo-1608248597261-83325805435f?w=800&q=80',
    'https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?w=800&q=80',
  ],
  General: [
    'https://images.unsplash.com/photo-1526738549149-8e07eca6c147?w=800&q=80',
    'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80',
    'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&q=80',
    'https://images.unsplash.com/photo-1583847268964-b28dc8f51f92?w=800&q=80',
    'https://images.unsplash.com/photo-1532012197267-da84d127e765?w=800&q=80',
  ],
};

export const MultiImageUploader: React.FC<MultiImageUploaderProps> = ({
  images,
  onChange,
  category = 'Electronics',
  minImages = 3,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [urlInput, setUrlInput] = useState('');
  const [showUrlField, setShowUrlField] = useState(false);

  const processFiles = async (files: FileList | File[]) => {
    const fileList = Array.from(files).filter(f => f.type.startsWith('image/'));
    if (fileList.length === 0) {
      toast.error('Please select valid image files');
      return;
    }

    setIsProcessing(true);
    try {
      const processed: string[] = [];

      for (const file of fileList) {
        const dataUrl = await new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onload = (e) => {
            const img = new Image();
            img.onload = () => {
              const canvas = document.createElement('canvas');
              const MAX_SIZE = 1000;
              let width = img.width;
              let height = img.height;

              if (width > height) {
                if (width > MAX_SIZE) {
                  height = Math.round((height * MAX_SIZE) / width);
                  width = MAX_SIZE;
                }
              } else {
                if (height > MAX_SIZE) {
                  width = Math.round((width * MAX_SIZE) / height);
                  height = MAX_SIZE;
                }
              }

              canvas.width = width;
              canvas.height = height;
              const ctx = canvas.getContext('2d');
              ctx?.drawImage(img, 0, 0, width, height);

              // 82% quality JPEG data URL
              resolve(canvas.toDataURL('image/jpeg', 0.82));
            };
            img.onerror = () => resolve('');
            img.src = e.target?.result as string;
          };
          reader.onerror = () => resolve('');
          reader.readAsDataURL(file);
        });

        if (dataUrl) {
          processed.push(dataUrl);
        }
      }

      if (processed.length > 0) {
        const updated = [...images, ...processed];
        onChange(updated);
        toast.success(`Added ${processed.length} image${processed.length > 1 ? 's' : ''}`);
      }
    } catch (error) {
      console.error('Error uploading image files:', error);
      toast.error('Failed to process image files');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processFiles(e.target.files);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFiles(e.dataTransfer.files);
    }
  };

  const handleAddUrl = () => {
    if (!urlInput.trim()) return;
    if (!urlInput.startsWith('http://') && !urlInput.startsWith('https://')) {
      toast.error('Please enter a valid HTTP or HTTPS image URL');
      return;
    }
    onChange([...images, urlInput.trim()]);
    setUrlInput('');
    toast.success('Image URL added!');
  };

  const handleRemoveImage = (index: React.SetStateAction<number>) => {
    const idx = typeof index === 'function' ? index(0) : index;
    const next = images.filter((_, i) => i !== idx);
    onChange(next);
  };

  const handleSetCover = (index: number) => {
    if (index === 0) return;
    const next = [...images];
    const [selected] = next.splice(index, 1);
    next.unshift(selected);
    onChange(next);
    toast.success('Set as primary cover photo!');
  };

  const handleMove = (index: number, direction: 'left' | 'right') => {
    const targetIdx = direction === 'left' ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= images.length) return;
    const next = [...images];
    const temp = next[index];
    next[index] = next[targetIdx];
    next[targetIdx] = temp;
    onChange(next);
  };

  const handleAddPresetGallery = () => {
    const presets = SAMPLE_GALLERY_PRESETS[category] || SAMPLE_GALLERY_PRESETS.General;
    const combined = [...images];
    presets.forEach((p) => {
      if (!combined.includes(p)) {
        combined.push(p);
      }
    });
    onChange(combined);
    toast.success(`Added ${presets.length} real sample photos!`);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <label className="block text-sm font-bold text-gray-900">
            Product Images Gallery ({images.length})
          </label>
          <p className="text-xs text-gray-500 mt-0.5">
            Upload multiple real photos of the same product from different angles.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleAddPresetGallery}
            className="text-xs font-bold text-indigo-600 hover:text-indigo-800 bg-indigo-50 hover:bg-indigo-100 px-3 py-1.5 rounded-lg border border-indigo-100 transition-colors flex items-center gap-1"
          >
            <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
            + Add Sample Real Photos
          </button>
        </div>
      </div>

      {/* Drag & Drop File Upload Box */}
      <div
        onDragEnter={handleDrag}
        onDragOver={handleDrag}
        onDragLeave={handleDrag}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`relative border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all ${
          dragActive
            ? 'border-indigo-600 bg-indigo-50/80 scale-[1.01]'
            : 'border-gray-200 bg-gray-50/60 hover:bg-gray-50 hover:border-indigo-400'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          onChange={handleFileChange}
          className="hidden"
        />

        <div className="flex flex-col items-center justify-center gap-2">
          <div className="w-12 h-12 bg-white rounded-full shadow-xs border border-gray-200 flex items-center justify-center text-indigo-600">
            {isProcessing ? (
              <div className="w-6 h-6 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
            ) : (
              <Upload className="w-6 h-6" />
            )}
          </div>

          <div>
            <p className="text-sm font-bold text-gray-900">
              {isProcessing ? 'Processing image files...' : 'Click to Upload Image Files'}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              Select multiple photos at once from your phone or computer (JPG, PNG, WEBP)
            </p>
          </div>

          <div className="flex items-center gap-2 mt-2">
            <span className="px-3 py-1 bg-white border border-gray-200 rounded-full text-[11px] font-bold text-gray-700 shadow-2xs">
              📷 Choose Multiple Files
            </span>
            <span className="text-xs text-gray-400">or drag & drop here</span>
          </div>
        </div>
      </div>

      {/* URL Toggle Field */}
      <div className="flex items-center justify-between text-xs">
        <button
          type="button"
          onClick={() => setShowUrlField(!showUrlField)}
          className="text-gray-500 hover:text-indigo-600 font-semibold flex items-center gap-1 underline underline-offset-2"
        >
          <LinkIcon className="w-3.5 h-3.5" />
          {showUrlField ? 'Hide URL input' : '+ Add photo via web URL link'}
        </button>

        {images.length < minImages && (
          <span className="text-amber-600 font-bold text-[11px] bg-amber-50 px-2 py-0.5 rounded-md border border-amber-100">
            ⚠️ Recommend at least {minImages} images for buyers to slide
          </span>
        )}
      </div>

      {showUrlField && (
        <div className="flex gap-2 animate-in fade-in duration-200">
          <input
            type="url"
            placeholder="Paste image URL (https://...)"
            value={urlInput}
            onChange={(e) => setUrlInput(e.target.value)}
            className="flex-1 px-3.5 py-2 text-sm border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
          />
          <button
            type="button"
            onClick={handleAddUrl}
            className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-sm font-bold hover:bg-indigo-700 shrink-0"
          >
            Add URL
          </button>
        </div>
      )}

      {/* Image Preview Thumbnails Grid */}
      {images.length > 0 && (
        <div className="space-y-2 pt-2">
          <div className="flex items-center justify-between text-xs font-semibold text-gray-500">
            <span>Uploaded Photos ({images.length})</span>
            <span>First photo is the main cover image</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {images.map((img, idx) => (
              <div
                key={idx}
                className={`relative group rounded-xl overflow-hidden border bg-white shadow-xs transition-all ${
                  idx === 0 ? 'border-indigo-500 ring-2 ring-indigo-500/20' : 'border-gray-200'
                }`}
              >
                <div className="aspect-square w-full relative bg-gray-50">
                  <img
                    src={img}
                    alt={`Product image ${idx + 1}`}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src =
                        'https://images.unsplash.com/photo-1526738549149-8e07eca6c147?w=500&q=80';
                    }}
                  />

                  {/* Badge */}
                  <div className="absolute top-1.5 left-1.5 z-10">
                    {idx === 0 ? (
                      <span className="px-2 py-0.5 bg-indigo-600 text-white text-[10px] font-extrabold rounded-md shadow-xs flex items-center gap-1">
                        <Star className="w-3 h-3 fill-white" /> Cover
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 bg-black/60 backdrop-blur-xs text-white text-[10px] font-extrabold rounded-md">
                        Photo #{idx + 1}
                      </span>
                    )}
                  </div>

                  {/* Hover Overlay Controls */}
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-between p-2">
                    <div className="flex justify-end">
                      <button
                        type="button"
                        onClick={() => handleRemoveImage(idx)}
                        title="Delete photo"
                        className="p-1 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="flex items-center justify-between gap-1">
                      <div className="flex gap-1">
                        {idx > 0 && (
                          <button
                            type="button"
                            onClick={() => handleMove(idx, 'left')}
                            title="Move left"
                            className="p-1 bg-white/80 text-gray-900 rounded-md hover:bg-white text-xs font-bold"
                          >
                            <ArrowLeft className="w-3.5 h-3.5" />
                          </button>
                        )}
                        {idx < images.length - 1 && (
                          <button
                            type="button"
                            onClick={() => handleMove(idx, 'right')}
                            title="Move right"
                            className="p-1 bg-white/80 text-gray-900 rounded-md hover:bg-white text-xs font-bold"
                          >
                            <ArrowRight className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>

                      {idx !== 0 && (
                        <button
                          type="button"
                          onClick={() => handleSetCover(idx)}
                          className="px-2 py-1 bg-indigo-600 text-white text-[10px] font-bold rounded-md hover:bg-indigo-700"
                        >
                          Make Cover
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
