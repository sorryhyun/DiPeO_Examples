import React, { useState } from 'react';
import { Modal } from '@/shared/components/Modal';

interface PressAsset {
  id: string;
  name: string;
  type: 'logo' | 'screenshot' | 'banner' | 'icon';
  format: string;
  size: string;
  previewUrl: string;
  downloadUrl: string;
  description: string;
}

const mockAssets: PressAsset[] = [
  {
    id: '1',
    name: 'Nothing Logo - Dark',
    type: 'logo',
    format: 'PNG',
    size: '512x512',
    previewUrl: '/generated/logo-dark-preview.png',
    downloadUrl: '/generated/logo-dark.png',
    description: 'Primary Nothing™ logo for dark backgrounds'
  },
  {
    id: '2',
    name: 'Nothing Logo - Light',
    type: 'logo',
    format: 'PNG',
    size: '512x512',
    previewUrl: '/generated/logo-light-preview.png',
    downloadUrl: '/generated/logo-light.png',
    description: 'Primary Nothing™ logo for light backgrounds'
  },
  {
    id: '3',
    name: 'Nothing Icon',
    type: 'icon',
    format: 'SVG',
    size: '64x64',
    previewUrl: '/generated/icon-preview.svg',
    downloadUrl: '/generated/icon.svg',
    description: 'Minimalist Nothing™ icon for social media'
  },
  {
    id: '4',
    name: 'Product Screenshot',
    type: 'screenshot',
    format: 'PNG',
    size: '1920x1080',
    previewUrl: '/generated/screenshot-preview.png',
    downloadUrl: '/generated/screenshot.png',
    description: 'Nothing™ application in action'
  },
  {
    id: '5',
    name: 'Banner Ad',
    type: 'banner',
    format: 'PNG',
    size: '728x90',
    previewUrl: '/generated/banner-preview.png',
    downloadUrl: '/generated/banner.png',
    description: 'Promotional banner for Nothing™'
  },
  {
    id: '6',
    name: 'Nothing Logo - Vector',
    type: 'logo',
    format: 'SVG',
    size: 'Scalable',
    previewUrl: '/generated/logo-vector-preview.svg',
    downloadUrl: '/generated/logo-vector.svg',
    description: 'Scalable Nothing™ logo in vector format'
  }
];

export const PressKit: React.FC = () => {
  const [selectedAsset, setSelectedAsset] = useState<PressAsset | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleAssetClick = (asset: PressAsset) => {
    setSelectedAsset(asset);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedAsset(null);
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'logo':
        return '🏷️';
      case 'screenshot':
        return '📸';
      case 'banner':
        return '🎯';
      case 'icon':
        return '🔷';
      default:
        return '📄';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'logo':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
      case 'screenshot':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'banner':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'icon':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  return (
    <section className="py-16 px-4 bg-white dark:bg-gray-900" role="main" aria-labelledby="press-kit-title">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h1 id="press-kit-title" className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Nothing™ Press Kit
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            Download our brand assets, logos, and media materials. Because even nothing needs proper branding.
          </p>
        </div>

        {/* Brand Guidelines */}
        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6 mb-12">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">Brand Guidelines</h2>
          <div className="prose prose-gray dark:prose-invert max-w-none">
            <ul className="space-y-2 text-gray-700 dark:text-gray-300">
              <li>• Please maintain the existential integrity of our brand</li>
              <li>• Do not modify the Nothing™ logo or add your own creative interpretation</li>
              <li>• Use appropriate contrast ratios for accessibility</li>
              <li>• The void must remain void - do not fill it with meaning</li>
              <li>• All usage must embrace the fundamental nothingness of our product</li>
            </ul>
          </div>
        </div>

        {/* Assets Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {mockAssets.map((asset) => (
            <div
              key={asset.id}
              className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
              onClick={() => handleAssetClick(asset)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  handleAssetClick(asset);
                }
              }}
              tabIndex={0}
              role="button"
              aria-label={`Preview ${asset.name}`}
            >
              <div className="aspect-video bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
                <img
                  src={asset.previewUrl}
                  alt={asset.description}
                  className="max-w-full max-h-full object-contain"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'none';
                    target.parentElement!.innerHTML = `<div class="text-6xl">${getTypeIcon(asset.type)}</div>`;
                  }}
                />
              </div>
              <div className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold text-gray-900 dark:text-white">{asset.name}</h3>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(asset.type)}`}>
                    {asset.type}
                  </span>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">{asset.description}</p>
                <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                  <span>{asset.format}</span>
                  <span>{asset.size}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Contact Information */}
        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">Media Contact</h2>
          <div className="text-gray-700 dark:text-gray-300">
            <p className="mb-2">
              For press inquiries, interviews, or existential crisis support, contact:
            </p>
            <p className="font-semibold">
              <a 
                href="mailto:press@absolutelynothing.com" 
                className="text-purple-600 dark:text-purple-400 hover:underline"
                aria-label="Email press team"
              >
                press@absolutelynothing.com
              </a>
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
              We typically respond within 2-3 business days, or whenever we feel like it.
            </p>
          </div>
        </div>

        {/* License Information */}
        <div className="mt-8 text-center text-sm text-gray-500 dark:text-gray-400">
          <p>
            All assets are provided for editorial and promotional use only. 
            Commercial usage requires permission from the void itself.
          </p>
        </div>
      </div>

      {/* Asset Preview Modal */}
      {selectedAsset && (
        <Modal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          title={selectedAsset.name}
        >
          <div className="space-y-4">
            <div className="aspect-video bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center">
              <img
                src={selectedAsset.previewUrl}
                alt={selectedAsset.description}
                className="max-w-full max-h-full object-contain"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.style.display = 'none';
                  target.parentElement!.innerHTML = `<div class="text-8xl text-gray-400">${getTypeIcon(selectedAsset.type)}</div>`;
                }}
              />
            </div>
            
            <div className="space-y-2">
              <p className="text-gray-700 dark:text-gray-300">{selectedAsset.description}</p>
              <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
                <span>Format: {selectedAsset.format}</span>
                <span>Size: {selectedAsset.size}</span>
              </div>
            </div>

            <div className="flex gap-3">
              <a
                href={selectedAsset.downloadUrl}
                download
                className="flex-1 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg text-center font-medium transition-colors"
                aria-label={`Download ${selectedAsset.name}`}
              >
                Download Asset
              </a>
              <button
                onClick={handleCloseModal}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                aria-label="Close preview"
              >
                Close
              </button>
            </div>
          </div>
        </Modal>
      )}
    </section>
  );
};
