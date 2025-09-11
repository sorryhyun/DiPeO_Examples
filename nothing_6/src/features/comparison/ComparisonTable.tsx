// filepath: src/features/comparison/ComparisonTable.tsx

// [x] Uses `@/` imports as much as possible
// [x] Uses providers/hooks (no direct DOM/localStorage side effects)
// [x] Reads config from `@/app/config`
// [x] Exports default named component
// [x] Adds basic ARIA and keyboard handlers (where relevant)

import React, { useState, useMemo } from 'react'
import Table from '@/shared/components/Table'
import { theme, themeUtils } from '@/theme'
import { config } from '@/app/config'
import { debugLog } from '@/core/utils'

export interface ComparisonProduct {
  id: string
  name: string
  tagline?: string
  price: string
  highlight?: boolean
  features: Array<{
    category: string
    items: Array<{
      feature: string
      nothing: boolean | string
      something: boolean | string
      everything: boolean | string
    }>
  }>
}

export interface ComparisonTableProps {
  products?: ComparisonProduct[]
  className?: string
  stickyHeader?: boolean
  responsiveCollapse?: boolean
}

// Default comparison data for Nothing vs Something vs Everything
const DEFAULT_COMPARISON: ComparisonProduct[] = [
  {
    id: 'nothing',
    name: 'Nothing',
    tagline: 'The purest form of absence',
    price: 'Free',
    highlight: true,
    features: [
      {
        category: 'Core Features',
        items: [
          { feature: 'Existence', nothing: false, something: true, everything: true },
          { feature: 'Complexity', nothing: '0%', something: '50%', everything: '∞%' },
          { feature: 'Learning Curve', nothing: 'None', something: 'Moderate', everything: 'Impossible' },
          { feature: 'Bug Count', nothing: 0, something: '47', everything: 'Yes' },
        ]
      },
      {
        category: 'Performance',
        items: [
          { feature: 'Load Time', nothing: '0ms', something: '2.3s', everything: 'Heat death of universe' },
          { feature: 'Memory Usage', nothing: '0 bytes', something: '512MB', everything: 'All of it' },
          { feature: 'CPU Usage', nothing: '0%', something: '23%', everything: '∞%' },
          { feature: 'Storage Required', nothing: '0 GB', something: '2.4 GB', everything: 'Yes' },
        ]
      },
      {
        category: 'Support & Maintenance',
        items: [
          { feature: 'Updates Required', nothing: false, something: true, everything: 'Constantly' },
          { feature: 'Security Vulnerabilities', nothing: 0, something: '12', everything: 'All of them' },
          { feature: 'Documentation Pages', nothing: 0, something: '1,247', everything: '∞' },
          { feature: 'Support Tickets', nothing: 0, something: '23/day', everything: 'Help' },
        ]
      },
      {
        category: 'User Experience',
        items: [
          { feature: 'User Confusion', nothing: 'None', something: 'Some', everything: 'Total' },
          { feature: 'Overwhelm Factor', nothing: '0/10', something: '6/10', everything: '∞/10' },
          { feature: 'Zen Rating', nothing: '10/10', something: '4/10', everything: '-∞/10' },
          { feature: 'Simplicity', nothing: true, something: false, everything: false },
        ]
      }
    ]
  }
]

function renderFeatureValue(value: boolean | string | number): React.ReactNode {
  if (typeof value === 'boolean') {
    return (
      <span 
        className={themeUtils.cn(
          'inline-flex items-center justify-center w-5 h-5 rounded-full text-xs font-medium',
          value 
            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300'
            : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
        )}
        aria-label={value ? 'Yes' : 'No'}
      >
        {value ? '✓' : '✗'}
      </span>
    )
  }
  
  if (typeof value === 'number') {
    return (
      <span className="font-mono text-sm">
        {value.toLocaleString()}
      </span>
    )
  }
  
  return (
    <span className="text-sm">
      {String(value)}
    </span>
  )
}

export function ComparisonTable({
  products = DEFAULT_COMPARISON,
  className,
  stickyHeader = true,
  responsiveCollapse = true,
}: ComparisonTableProps) {
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(
    new Set(products[0]?.features.map(f => f.category) || [])
  )
  const [isMobileView, setIsMobileView] = useState(false)

  // Responsive breakpoint detection
  React.useEffect(() => {
    if (!responsiveCollapse) return

    const checkMobileView = () => {
      setIsMobileView(window.innerWidth < 768)
    }

    checkMobileView()
    window.addEventListener('resize', checkMobileView)
    return () => window.removeEventListener('resize', checkMobileView)
  }, [responsiveCollapse])

  const toggleCategory = (category: string) => {
    const newExpanded = new Set(expandedCategories)
    if (newExpanded.has(category)) {
      newExpanded.delete(category)
    } else {
      newExpanded.add(category)
    }
    setExpandedCategories(newExpanded)
    
    debugLog('ComparisonTable: Toggled category', category, 'expanded:', newExpanded.has(category))
  }

  // Prepare table data
  const tableData = useMemo(() => {
    if (!products.length) return { headers: [], rows: [] }

    const product = products[0] // Assuming single product with multi-column comparison
    const headers = ['Feature', 'Nothing', 'Something', 'Everything']
    
    const rows: Array<{
      id: string
      category?: string
      isCategory?: boolean
      cells: (string | React.ReactNode)[]
      expandable?: boolean
      expanded?: boolean
    }> = []

    product.features.forEach((featureGroup) => {
      // Category header row
      const isExpanded = expandedCategories.has(featureGroup.category)
      rows.push({
        id: `category-${featureGroup.category}`,
        category: featureGroup.category,
        isCategory: true,
        expandable: isMobileView && responsiveCollapse,
        expanded: isExpanded,
        cells: [
          <button
            key="category-button"
            onClick={() => toggleCategory(featureGroup.category)}
            className={themeUtils.cn(
              'flex items-center justify-between w-full text-left font-semibold',
              'text-gray-900 dark:text-gray-100',
              isMobileView && responsiveCollapse && 'hover:text-blue-600 dark:hover:text-blue-400'
            )}
            aria-expanded={isExpanded}
            aria-controls={`category-${featureGroup.category}-content`}
          >
            <span>{featureGroup.category}</span>
            {isMobileView && responsiveCollapse && (
              <span 
                className={themeUtils.cn(
                  'ml-2 transition-transform duration-200',
                  isExpanded ? 'rotate-90' : 'rotate-0'
                )}
                aria-hidden="true"
              >
                ▶
              </span>
            )}
          </button>,
          '', '', '' // Empty cells for product columns
        ]
      })

      // Feature rows (only if expanded or not collapsible)
      if (isExpanded || !isMobileView || !responsiveCollapse) {
        featureGroup.items.forEach((item, index) => {
          rows.push({
            id: `feature-${featureGroup.category}-${index}`,
            category: featureGroup.category,
            cells: [
              item.feature,
              renderFeatureValue(item.nothing),
              renderFeatureValue(item.something),
              renderFeatureValue(item.everything),
            ]
          })
        })
      }
    })

    return { headers, rows }
  }, [products, expandedCategories, isMobileView, responsiveCollapse])

  const tableClassName = themeUtils.cn(
    'comparison-table',
    stickyHeader && 'sticky-header',
    responsiveCollapse && 'responsive-collapse',
    className
  )

  return (
    <div 
      className={tableClassName}
      role="region"
      aria-label="Product comparison table"
    >
      {/* Product header cards (above table) */}
      <div className="mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
        {['Nothing', 'Something', 'Everything'].map((productName, index) => {
          const isHighlighted = productName === 'Nothing'
          return (
            <div
              key={productName}
              className={themeUtils.cn(
                'text-center p-4 rounded-lg border',
                isHighlighted
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 dark:border-blue-400'
                  : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800'
              )}
            >
              <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">
                {productName}
              </h3>
              {productName === 'Nothing' && (
                <>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    The purest form of absence
                  </p>
                  <p className="text-xl font-bold text-blue-600 dark:text-blue-400 mt-2">
                    Free
                  </p>
                  {isHighlighted && (
                    <div className="mt-2">
                      <span className="inline-block px-2 py-1 text-xs font-medium bg-blue-600 text-white rounded-full">
                        Recommended
                      </span>
                    </div>
                  )}
                </>
              )}
              {productName === 'Something' && (
                <>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    More than nothing, less than everything
                  </p>
                  <p className="text-xl font-bold text-gray-900 dark:text-gray-100 mt-2">
                    $9.99/mo
                  </p>
                </>
              )}
              {productName === 'Everything' && (
                <>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    All things that exist and don't exist
                  </p>
                  <p className="text-xl font-bold text-gray-900 dark:text-gray-100 mt-2">
                    ∞
                  </p>
                </>
              )}
            </div>
          )
        })}
      </div>

      {/* Comparison table */}
      <Table
        headers={tableData.headers}
        rows={tableData.rows.map(row => ({
          id: row.id,
          cells: row.cells,
          className: themeUtils.cn(
            row.isCategory && 'bg-gray-50 dark:bg-gray-800/50 font-medium',
            row.category && !row.isCategory && 'category-feature-row'
          )
        }))}
        stickyHeader={stickyHeader}
        className={themeUtils.cn(
          'w-full',
          '[&_th]:text-left [&_th]:font-semibold',
          '[&_td]:py-3 [&_td]:px-4',
          '[&_.category-feature-row_td]:pl-8',
          stickyHeader && '[&_thead]:bg-white [&_thead]:dark:bg-gray-900'
        )}
        caption="Comparison of Nothing, Something, and Everything products"
      />

      {config.isDevelopment && (
        <div className="mt-4 p-3 bg-gray-100 dark:bg-gray-800 rounded text-xs">
          <strong>Debug Info:</strong>{' '}
          Mobile view: {isMobileView ? 'Yes' : 'No'},{' '}
          Expanded categories: {expandedCategories.size},{' '}
          Total rows: {tableData.rows.length}
        </div>
      )}
    </div>
  )
}

export default ComparisonTable
