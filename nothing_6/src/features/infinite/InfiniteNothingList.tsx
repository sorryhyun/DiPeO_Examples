// filepath: src/features/infinite/InfiniteNothingList.tsx
// [ ] Uses `@/` imports as much as possible
// [ ] Uses providers/hooks (no direct DOM/localStorage side effects)
// [ ] Reads config from `@/app/config`
// [ ] Exports default named component
// [ ] Adds basic ARIA and keyboard handlers (where relevant)

import React from 'react';
import { useInfiniteScroll } from '@/hooks/useInfiniteScroll';
import { nothingService } from '@/services/nothingService';
import Skeleton from '@/shared/components/Skeleton';
import { config } from '@/app/config';

interface NothingItem {
  id: string;
  description: string;
  timestamp: number;
  void_level: number;
}

export default function InfiniteNothingList() {
  const {
    items,
    isLoading,
    error,
    hasMore,
    loadMore,
    containerRef,
    isLoadingMore
  } = useInfiniteScroll<NothingItem>({
    loadItems: async (page, pageSize) => {
      const response = await nothingService.fetchNothing({
        page,
        limit: pageSize
      });
      return {
        items: response.items,
        hasMore: response.hasMore
      };
    },
    initialPageSize: config.pagination.defaultPageSize || 20,
    threshold: 0.8
  });

  const renderNothingItem = (item: NothingItem) => (
    <div
      key={item.id}
      className="p-4 border border-gray-200 rounded-lg bg-white shadow-sm hover:shadow-md transition-shadow duration-200"
      role="article"
      aria-labelledby={`nothing-${item.id}`}
    >
      <h3 
        id={`nothing-${item.id}`}
        className="text-lg font-medium text-gray-900 mb-2"
      >
        Nothing #{item.id}
      </h3>
      <p className="text-gray-600 mb-3">{item.description}</p>
      <div className="flex justify-between items-center text-sm text-gray-500">
        <span>Void Level: {item.void_level}</span>
        <time dateTime={new Date(item.timestamp).toISOString()}>
          {new Date(item.timestamp).toLocaleDateString()}
        </time>
      </div>
    </div>
  );

  const renderSkeletons = (count: number) => (
    <>
      {Array.from({ length: count }).map((_, index) => (
        <div
          key={`skeleton-${index}`}
          className="p-4 border border-gray-200 rounded-lg bg-white"
        >
          <Skeleton className="h-6 w-32 mb-2" />
          <Skeleton className="h-4 w-full mb-1" />
          <Skeleton className="h-4 w-3/4 mb-3" />
          <div className="flex justify-between">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-4 w-24" />
          </div>
        </div>
      ))}
    </>
  );

  if (error) {
    return (
      <div 
        className="p-8 text-center"
        role="alert"
        aria-live="assertive"
      >
        <h2 className="text-xl font-semibold text-red-600 mb-2">
          Error Loading Nothing
        </h2>
        <p className="text-gray-600 mb-4">
          Failed to load the infinite void of nothingness.
        </p>
        <button
          onClick={() => loadMore()}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          aria-label="Retry loading nothing"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Infinite Nothing Collection
        </h1>
        <p className="text-gray-600">
          An endless scroll through the void of nothingness
        </p>
        {items.length > 0 && (
          <p className="text-sm text-gray-500 mt-2">
            Loaded {items.length} instances of nothing so far
          </p>
        )}
      </div>

      <div
        ref={containerRef}
        className="space-y-4"
        role="feed"
        aria-label="Infinite list of nothing items"
        aria-live="polite"
        aria-busy={isLoading || isLoadingMore}
      >
        {isLoading && items.length === 0 ? (
          renderSkeletons(6)
        ) : (
          <>
            {items.map(renderNothingItem)}
            
            {isLoadingMore && renderSkeletons(3)}
            
            {!hasMore && items.length > 0 && (
              <div className="text-center py-8 text-gray-500">
                <p>You've reached the end of nothing.</p>
                <p className="text-sm mt-1">
                  (But nothing is infinite, so this shouldn't happen...)
                </p>
              </div>
            )}
          </>
        )}
      </div>

      {hasMore && !isLoading && !isLoadingMore && (
        <div className="text-center mt-8">
          <button
            onClick={loadMore}
            className="px-6 py-3 bg-gray-900 text-white rounded-lg hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors duration-200"
            aria-label="Load more nothing"
          >
            Load More Nothing
          </button>
        </div>
      )}
    </div>
  );
}
