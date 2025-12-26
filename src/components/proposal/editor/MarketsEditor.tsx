'use client';

import { useState, memo, useCallback } from 'react';
import { Button, Input } from '@/components/ui';
import type { Market } from '@/types';

interface MarketsEditorProps {
  markets: Market[];
  onChange: (markets: Market[]) => void;
}

export const MarketsEditor = memo(function MarketsEditor({
  markets,
  onChange,
}: MarketsEditorProps) {
  const [newMarket, setNewMarket] = useState({ country: '', language: '', sampleSize: 0 });

  const addMarket = useCallback(() => {
    if (newMarket.country && newMarket.language && newMarket.sampleSize > 0) {
      onChange([...markets, newMarket]);
      setNewMarket({ country: '', language: '', sampleSize: 0 });
    }
  }, [newMarket, markets, onChange]);

  const removeMarket = useCallback((index: number) => {
    onChange(markets.filter((_, i) => i !== index));
  }, [markets, onChange]);

  return (
    <div className="space-y-4">
      {markets.length > 0 && (
        <div className="rounded-lg border border-gray-200 dark:border-gray-700">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-800">
              <tr>
                <th className="px-4 py-2 text-left text-sm font-medium text-gray-600 dark:text-gray-400">
                  Country
                </th>
                <th className="px-4 py-2 text-left text-sm font-medium text-gray-600 dark:text-gray-400">
                  Language
                </th>
                <th className="px-4 py-2 text-left text-sm font-medium text-gray-600 dark:text-gray-400">
                  Sample Size
                </th>
                <th className="px-4 py-2"></th>
              </tr>
            </thead>
            <tbody>
              {markets.map((market, index) => (
                <tr
                  key={`${market.country}-${market.language}-${index}`}
                  className="border-t border-gray-200 dark:border-gray-700"
                >
                  <td className="px-4 py-2 text-sm text-gray-900 dark:text-gray-100">
                    {market.country}
                  </td>
                  <td className="px-4 py-2 text-sm text-gray-900 dark:text-gray-100">
                    {market.language}
                  </td>
                  <td className="px-4 py-2 text-sm text-gray-900 dark:text-gray-100">
                    {market.sampleSize}
                  </td>
                  <td className="px-4 py-2">
                    <Button variant="ghost" size="sm" onClick={() => removeMarket(index)}>
                      Remove
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="grid grid-cols-4 gap-2">
        <Input
          placeholder="Country"
          value={newMarket.country}
          onChange={(e) => setNewMarket({ ...newMarket, country: e.target.value })}
        />
        <Input
          placeholder="Language"
          value={newMarket.language}
          onChange={(e) => setNewMarket({ ...newMarket, language: e.target.value })}
        />
        <Input
          type="number"
          placeholder="Sample Size"
          value={newMarket.sampleSize || ''}
          onChange={(e) => setNewMarket({ ...newMarket, sampleSize: parseInt(e.target.value) || 0 })}
        />
        <Button onClick={addMarket}>Add Market</Button>
      </div>
    </div>
  );
});
