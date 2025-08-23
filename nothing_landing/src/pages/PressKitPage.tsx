import React from 'react';
import Layout from '../shared/components/Layout';
import Button from '../shared/components/Button';
import { Icon } from '../shared/components/Icon';

interface Asset {
  id: string;
  name: string;
  description: string;
  format: string;
  size: string;
  preview: string;
  downloadUrl: string;
}

interface ColorSwatch {
  name: string;
  hex: string;
  rgb: string;
  usage: string;
}

const PressKitPage: React.FC = () => {
  const logoAssets: Asset[] = [
    {
      id: 'logo-primary',
      name: 'Primary Nothing Logo',
      description: 'Main logo for light backgrounds',
      format: 'SVG',
      size: '2KB',
      preview: '/assets/logo-preview.svg',
      downloadUrl: '/assets/nothing-logo-primary.svg'
    },
    {
      id: 'logo-dark',
      name: 'Dark Nothing Logo',
      description: 'Logo variant for dark backgrounds',
      format: 'SVG',
      size: '2KB',
      preview: '/assets/logo-dark-preview.svg',
      downloadUrl: '/assets/nothing-logo-dark.svg'
    },
    {
      id: 'logo-icon',
      name: 'Nothing Icon',
      description: 'Square icon version for social media',
      format: 'PNG',
      size: '24KB',
      preview: '/assets/icon-preview.png',
      downloadUrl: '/assets/nothing-icon.png'
    },
    {
      id: 'logo-horizontal',
      name: 'Horizontal Nothing Logo',
      description: 'Wide format for headers and banners',
      format: 'SVG',
      size: '3KB',
      preview: '/assets/logo-horizontal-preview.svg',
      downloadUrl: '/assets/nothing-logo-horizontal.svg'
    }
  ];

  const brandColors: ColorSwatch[] = [
    {
      name: 'Nothing Black',
      hex: '#000000',
      rgb: '0, 0, 0',
      usage: 'Primary text and backgrounds'
    },
    {
      name: 'Nothing White',
      hex: '#FFFFFF',
      rgb: '255, 255, 255',
      usage: 'Contrast and negative space'
    },
    {
      name: 'Void Gray',
      hex: '#808080',
      rgb: '128, 128, 128',
      usage: 'Secondary text and borders'
    },
    {
      name: 'Absence Blue',
      hex: '#1E40AF',
      rgb: '30, 64, 175',
      usage: 'Interactive elements and links'
    }
  ];

  const handleDownload = (asset: Asset) => {
    // Create a temporary link to trigger download
    const link = document.createElement('a');
    link.href = asset.downloadUrl;
    link.download = asset.name.replace(/\s+/g, '-').toLowerCase();
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text).catch(err => {
      console.error('Failed to copy text: ', err);
    });
  };

  return (
    <Layout>
      <div className="min-h-screen bg-white dark:bg-gray-900">
        {/* Header */}
        <div className="bg-gray-50 dark:bg-gray-800 py-16">
          <div className="max-w-6xl mx-auto px-4">
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Press Kit
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl">
              Download our official brand assets, logos, and guidelines for representing Absolutely Nothing™ 
              in your publications, presentations, or media coverage.
            </p>
          </div>
        </div>

        <div className="max-w-6xl mx-auto px-4 py-16">
          {/* Logo Assets Section */}
          <section className="mb-16">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
              Logo Assets
            </h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {logoAssets.map((asset) => (
                <div
                  key={asset.id}
                  className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 hover:shadow-lg transition-shadow"
                >
                  <div className="aspect-square bg-gray-50 dark:bg-gray-700 rounded-lg mb-4 flex items-center justify-center">
                    <img
                      src={asset.preview}
                      alt={asset.name}
                      className="max-w-full max-h-full object-contain"
                      onError={(e) => {
                        // Fallback to a simple text representation if image fails to load
                        const target = e.target as HTMLImageElement;
                        target.style.display = 'none';
                        const parent = target.parentElement;
                        if (parent) {
                          parent.innerHTML = '<div class="text-gray-400 text-xs text-center">Preview</div>';
                        }
                      }}
                    />
                  </div>
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                    {asset.name}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">
                    {asset.description}
                  </p>
                  <div className="flex justify-between items-center text-xs text-gray-500 dark:text-gray-400 mb-4">
                    <span>{asset.format}</span>
                    <span>{asset.size}</span>
                  </div>
                  <Button
                    onClick={() => handleDownload(asset)}
                    className="w-full"
                    size="sm"
                  >
                    <Icon name="download" className="w-4 h-4 mr-2" />
                    Download
                  </Button>
                </div>
              ))}
            </div>
          </section>

          {/* Brand Colors Section */}
          <section className="mb-16">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
              Brand Colors
            </h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {brandColors.map((color) => (
                <div
                  key={color.name}
                  className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6"
                >
                  <div
                    className="w-full h-24 rounded-lg mb-4 border border-gray-200 dark:border-gray-700"
                    style={{ backgroundColor: color.hex }}
                  />
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                    {color.name}
                  </h3>
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600 dark:text-gray-300">HEX</span>
                      <button
                        onClick={() => copyToClipboard(color.hex)}
                        className="text-sm font-mono text-blue-600 dark:text-blue-400 hover:underline"
                      >
                        {color.hex}
                      </button>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600 dark:text-gray-300">RGB</span>
                      <button
                        onClick={() => copyToClipboard(color.rgb)}
                        className="text-sm font-mono text-blue-600 dark:text-blue-400 hover:underline"
                      >
                        {color.rgb}
                      </button>
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {color.usage}
                  </p>
                </div>
              ))}
            </div>
          </section>

          {/* Brand Guidelines Section */}
          <section className="mb-16">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
              Brand Guidelines
            </h2>
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-8">
              <div className="grid md:grid-cols-2 gap-8">
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                    Logo Usage
                  </h3>
                  <ul className="space-y-3 text-gray-600 dark:text-gray-300">
                    <li className="flex items-start">
                      <Icon name="check" className="w-5 h-5 text-green-600 mr-2 mt-0.5 flex-shrink-0" />
                      <span>Always maintain minimum clear space equal to the height of the "N"</span>
                    </li>
                    <li className="flex items-start">
                      <Icon name="check" className="w-5 h-5 text-green-600 mr-2 mt-0.5 flex-shrink-0" />
                      <span>Use official color versions on appropriate backgrounds</span>
                    </li>
                    <li className="flex items-start">
                      <Icon name="x" className="w-5 h-5 text-red-600 mr-2 mt-0.5 flex-shrink-0" />
                      <span>Do not stretch, skew, or alter the proportions</span>
                    </li>
                    <li className="flex items-start">
                      <Icon name="x" className="w-5 h-5 text-red-600 mr-2 mt-0.5 flex-shrink-0" />
                      <span>Do not use unauthorized colors or effects</span>
                    </li>
                  </ul>
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                    Typography
                  </h3>
                  <div className="space-y-4 text-gray-600 dark:text-gray-300">
                    <div>
                      <p className="font-semibold mb-1">Primary Font:</p>
                      <p className="font-mono">Inter (Headings & Body)</p>
                    </div>
                    <div>
                      <p className="font-semibold mb-1">Secondary Font:</p>
                      <p className="font-mono">JetBrains Mono (Code & Technical)</p>
                    </div>
                    <div>
                      <p className="font-semibold mb-1">Voice & Tone:</p>
                      <p>Philosophical yet approachable, embracing the paradox of selling nothing with sophisticated humor.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Download All Section */}
          <section>
            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-8 text-center">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                Complete Brand Package
              </h2>
              <p className="text-gray-600 dark:text-gray-300 mb-6 max-w-2xl mx-auto">
                Download all assets, guidelines, and brand materials in a single ZIP file 
                for your convenience.
              </p>
              <Button size="lg" className="inline-flex items-center">
                <Icon name="download" className="w-5 h-5 mr-2" />
                Download Complete Press Kit
              </Button>
            </div>
          </section>
        </div>
      </div>
    </Layout>
  );
};

export default PressKitPage;
