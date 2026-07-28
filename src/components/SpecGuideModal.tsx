import React from 'react';
import { X, Ruler, Cpu, Check, Shield } from 'lucide-react';

interface SpecGuideProps {
  category: string;
  isOpen: boolean;
  onClose: () => void;
}

export function SpecGuideModal({ category, isOpen, onClose }: SpecGuideProps) {
  if (!isOpen) return null;

  const isFashion = category.toLowerCase().includes('fashion') || category.toLowerCase().includes('clothing');

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full p-6 sm:p-8 space-y-6 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between border-b border-gray-100 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-2xl">
              {isFashion ? <Ruler className="w-6 h-6" /> : <Cpu className="w-6 h-6" />}
            </div>
            <div>
              <h3 className="text-xl font-extrabold text-gray-900">
                {isFashion ? 'Clothing Size & Measurement Guide' : 'Technical Specifications & Standards'}
              </h3>
              <p className="text-xs text-gray-500">Official guide and fit recommendation for {category}</p>
            </div>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-2 rounded-full hover:bg-gray-100">
            <X className="w-5 h-5" />
          </button>
        </div>

        {isFashion ? (
          <div className="space-y-4 text-xs text-gray-700">
            <p className="font-semibold text-gray-900 text-sm">Standard International Size Chart (Centimeters):</p>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse border border-gray-200 rounded-xl overflow-hidden">
                <thead className="bg-gray-50 text-gray-900 font-bold">
                  <tr>
                    <th className="p-3 border border-gray-200">Size</th>
                    <th className="p-3 border border-gray-200">Chest / Bust</th>
                    <th className="p-3 border border-gray-200">Waist</th>
                    <th className="p-3 border border-gray-200">Hips</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  <tr>
                    <td className="p-3 border border-gray-200 font-bold">S</td>
                    <td className="p-3 border border-gray-200">86 - 91 cm</td>
                    <td className="p-3 border border-gray-200">71 - 76 cm</td>
                    <td className="p-3 border border-gray-200">90 - 95 cm</td>
                  </tr>
                  <tr>
                    <td className="p-3 border border-gray-200 font-bold">M</td>
                    <td className="p-3 border border-gray-200">96 - 101 cm</td>
                    <td className="p-3 border border-gray-200">81 - 86 cm</td>
                    <td className="p-3 border border-gray-200">100 - 105 cm</td>
                  </tr>
                  <tr>
                    <td className="p-3 border border-gray-200 font-bold">L</td>
                    <td className="p-3 border border-gray-200">106 - 111 cm</td>
                    <td className="p-3 border border-gray-200">91 - 96 cm</td>
                    <td className="p-3 border border-gray-200">110 - 115 cm</td>
                  </tr>
                  <tr>
                    <td className="p-3 border border-gray-200 font-bold">XL</td>
                    <td className="p-3 border border-gray-200">116 - 121 cm</td>
                    <td className="p-3 border border-gray-200">101 - 106 cm</td>
                    <td className="p-3 border border-gray-200">120 - 125 cm</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p className="text-[11px] text-gray-500 italic">Tip: Measure directly on your body without pulling tight. If between sizes, order the larger size for a relaxed fit.</p>
          </div>
        ) : (
          <div className="space-y-4 text-xs text-gray-700">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="p-3.5 bg-gray-50 rounded-2xl border border-gray-200 space-y-1">
                <span className="font-bold text-gray-900 block text-xs">Voltage & Power Standard</span>
                <p className="text-gray-600">220V - 240V AC, 50Hz (Standard UK/Malawi 3-Pin Type G Plug compatible).</p>
              </div>
              <div className="p-3.5 bg-gray-50 rounded-2xl border border-gray-200 space-y-1">
                <span className="font-bold text-gray-900 block text-xs">Quality Assurance</span>
                <p className="text-gray-600">100% Original sealed box with serial number and authenticity verification.</p>
              </div>
              <div className="p-3.5 bg-gray-50 rounded-2xl border border-gray-200 space-y-1">
                <span className="font-bold text-gray-900 block text-xs">Warranty Guarantee</span>
                <p className="text-gray-600">12-Month local seller replacement warranty against manufacturing defects.</p>
              </div>
              <div className="p-3.5 bg-gray-50 rounded-2xl border border-gray-200 space-y-1">
                <span className="font-bold text-gray-900 block text-xs">Return Policy</span>
                <p className="text-gray-600">7-Day hassle-free returns if unopened and in original packaging.</p>
              </div>
            </div>
          </div>
        )}

        <div className="flex justify-end pt-2">
          <button
            onClick={onClose}
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs px-6 py-3 rounded-2xl shadow-md transition-colors"
          >
            Got It, Thanks
          </button>
        </div>
      </div>
    </div>
  );
}
