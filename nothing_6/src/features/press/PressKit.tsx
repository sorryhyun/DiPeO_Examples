// filepath: src/features/press/PressKit.tsx

// [ ] Uses `@/` imports as much as possible
// [ ] Uses providers/hooks (no direct DOM/localStorage side effects)
// [ ] Reads config from `@/app/config`
// [ ] Exports default named component
// [ ] Adds basic ARIA and keyboard handlers (where relevant)

import { useState } from 'react';
import { config } from '@/app/config';
import Button from '@/shared/components/Button';
import logoSvg from '@/assets/logo.svg';

interface PressAsset {
  id: string;
  name: string;
  description: string;
  formats: Array<{
    type: string;
    size?: string;
    url: string;
  }>;
  category: 'logo' | 'brand' | 'screenshot' | 'document';
}

const pressAssets: PressAsset[] = [
  {
    id: 'logo-primary',
    name: 'Primary Logo',
    description: 'Main Nothing logo in various formats',
    category: 'logo',
    formats: [
      { type: 'SVG', url: logoSvg },
      { type: 'PNG', size: '512x512', url: '/assets/press/logo-512.png' },
      { type: 'PNG', size: '256x256', url: '/assets/press/logo-256.png' },
      { type: 'PNG', size: '128x128', url: '/assets/press/logo-128.png' }
    ]
  },
  {
    id: 'logo-monochrome',
    name: 'Monochrome Logo',
    description: 'Single-color version for various backgrounds',
    category: 'logo',
    formats: [
      { type: 'SVG', url: '/assets/press/logo-mono.svg' },
      { type: 'PNG', size: '512x512', url: '/assets/press/logo-mono-512.png' }
    ]
  },
  {
    id: 'brand-guidelines',
    name: 'Brand Guidelines',
    description: 'Complete brand identity and usage guidelines',
    category: 'document',
    formats: [
      { type: 'PDF', url: '/assets/press/nothing-brand-guidelines.pdf' }
    ]
  },
  {
    id: 'product-screenshots',
    name: 'Product Screenshots',
    description: 'High-resolution product interface screenshots',
    category: 'screenshot',
    formats: [
      { type: 'PNG', size: '1920x1080', url: '/assets/press/screenshot-1.png' },
      { type: 'PNG', size: '1920x1080', url: '/assets/press/screenshot-2.png' }
    ]
  }
];

const brandColors = [
  { name: 'Void Black', hex: '#000000', description: 'Primary brand color' },
  { name: 'Nothing White', hex: '#FFFFFF', description: 'Secondary brand color' },
  { name: 'Accent Gray', hex: '#666666', description: 'Tertiary brand color' }
];

export default function PressKit() {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [downloadedAssets, setDownloadedAssets] = useState<Set<string>>(new Set());

  const filteredAssets = selectedCategory === 'all' 
    ? pressAssets 
    : pressAssets.filter(asset => asset.category === selectedCategory);

  const handleDownload = async (asset: PressAsset, format: { type: string; url: string }) => {
    try {
      const response = await fetch(format.url);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = `nothing-${asset.id}.${format.type.toLowerCase()}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      window.URL.revokeObjectURL(url);
      
      setDownloadedAssets(prev => new Set([...prev, `${asset.id}-${format.type}`]));
    } catch (error) {
      console.error('Download failed:', error);
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
    } catch (error) {
      console.error('Copy failed:', error);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="max-w-6xl mx-auto px-6 py-12">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
            Nothing Press Kit
          </h1>
          <p className="text-xl text-gray-400 max-w-3xl mx-auto">
            Official brand assets, logos, and resources for media coverage and partnerships.
            All assets are available for editorial use with proper attribution.
          </p>
        </div>

        {/* Brand Guidelines */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold mb-8">Brand Guidelines</h2>
          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-gray-900/50 rounded-lg p-6 border border-gray-800">
              <h3 className="text-xl font-semibold mb-4">Company Description</h3>
              <p className="text-gray-300 leading-relaxed">
                Nothing is a revolutionary platform that transforms the concept of absence into 
                a tangible digital experience. We provide premium nothing-as-a-service solutions 
                for individuals and enterprises seeking the purest form of digital minimalism.
              </p>
            </div>
            <div className="bg-gray-900/50 rounded-lg p-6 border border-gray-800">
              <h3 className="text-xl font-semibold mb-4">Key Facts</h3>
              <ul className="space-y-2 text-gray-300">
                <li>• Founded: {config.version === '0.1.0' ? '2024' : '2024'}</li>
                <li>• Industry: Digital Minimalism</li>
                <li>• Headquarters: The Void</li>
                <li>• Employees: Quantum Superposition</li>
                <li>• Status: Actively Nothing</li>
              </ul>
            </div>
          </div>
        </section>

        {/* Brand Colors */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold mb-8">Brand Colors</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {brandColors.map(color => (
              <div 
                key={color.hex}
                className="bg-gray-900/50 rounded-lg p-6 border border-gray-800"
              >
                <div 
                  className="w-full h-24 rounded-lg mb-4 border border-gray-700"
                  style={{ backgroundColor: color.hex }}
                />
                <h3 className="text-lg font-semibold mb-2">{color.name}</h3>
                <p className="text-sm text-gray-400 mb-3">{color.description}</p>
                <button
                  onClick={() => copyToClipboard(color.hex)}
                  className="text-sm font-mono bg-gray-800 px-3 py-1 rounded hover:bg-gray-700 transition-colors"
                  aria-label={`Copy ${color.name} hex code`}
                >
                  {color.hex}
                </button>
              </div>
            ))}
          </div>
        </section>

        {/* Asset Categories */}
        <section className="mb-8">
          <div className="flex flex-wrap gap-4 justify-center">
            {['all', 'logo', 'brand', 'screenshot', 'document'].map(category => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-6 py-2 rounded-full capitalize transition-all ${
                  selectedCategory === category
                    ? 'bg-white text-black'
                    : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                }`}
                aria-pressed={selectedCategory === category}
              >
                {category === 'all' ? 'All Assets' : category}
              </button>
            ))}
          </div>
        </section>

        {/* Press Assets */}
        <section className="mb-16">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredAssets.map(asset => (
              <div 
                key={asset.id}
                className="bg-gray-900/50 rounded-lg p-6 border border-gray-800 hover:border-gray-700 transition-colors"
              >
                <div className="mb-4">
                  <span className="inline-block px-3 py-1 text-xs font-semibold bg-gray-800 text-gray-300 rounded-full capitalize mb-3">
                    {asset.category}
                  </span>
                  <h3 className="text-xl font-semibold mb-2">{asset.name}</h3>
                  <p className="text-gray-400 text-sm">{asset.description}</p>
                </div>
                
                <div className="space-y-3">
                  {asset.formats.map((format, index) => (
                    <div 
                      key={index}
                      className="flex items-center justify-between p-3 bg-gray-800/50 rounded border border-gray-700"
                    >
                      <div>
                        <span className="font-semibold text-sm">{format.type}</span>
                        {format.size && (
                          <span className="text-gray-400 text-xs ml-2">({format.size})</span>
                        )}
                      </div>
                      <Button
                        onClick={() => handleDownload(asset, format)}
                        size="sm"
                        variant="secondary"
                        disabled={downloadedAssets.has(`${asset.id}-${format.type}`)}
                        aria-label={`Download ${asset.name} in ${format.type} format`}
                      >
                        {downloadedAssets.has(`${asset.id}-${format.type}`) ? '✓' : '↓'}
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Contact Information */}
<section className="text-center bg-gray-900/30 rounded-lg p-8 border border-gray-800">
          <h2 className="text-2xl font-bold mb-4">Media Contact</h2>
          <p className="text-gray-300 mb-6">
            For press inquiries, interviews, or additional assets, please contact our media team.
          </p>
          <div className="space-y-2 text-sm">
            <p>Email: <span className="font-mono">press@nothing.com</span></p>
            <p>Phone: <span className="font-mono">1-800-NOTHING</span></p>
          </div>
        </section>
      </div>
    </div>
  );
}
