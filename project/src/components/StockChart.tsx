import { useEffect, useRef, useState } from 'react';
import { createChart, ColorType } from 'lightweight-charts';
import { HistoricalDataRange } from '../types';

interface StockChartProps {
  data: Array<{
    time: string;
    value: number;
  }>;
  onRangeChange?: (range: HistoricalDataRange) => void;
  loading?: boolean;
}

const RANGES: { label: string; value: HistoricalDataRange }[] = [
  { label: '1W', value: '1W' },
  { label: '1M', value: '1M' },
  { label: '3M', value: '3M' },
  { label: '6M', value: '6M' },
  { label: '1Y', value: '1Y' },
  { label: '5Y', value: '5Y' },
  { label: 'ALL', value: 'ALL' },
];

const StockChart = ({ data, onRangeChange, loading }: StockChartProps) => {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const [selectedRange, setSelectedRange] = useState<HistoricalDataRange>('1W');

  useEffect(() => {
    if (!chartContainerRef.current || !data.length) return;

    const chart = createChart(chartContainerRef.current, {
      layout: {
        background: { color: 'transparent' },
        textColor: '#333',
      },
      grid: {
        vertLines: { color: '#f0f0f0' },
        horzLines: { color: '#f0f0f0' },
      },
      width: chartContainerRef.current.clientWidth,
      height: 400,
    });

    const lineSeries = chart.addLineSeries({
      color: '#2563eb',
      lineWidth: 2,
    });

    lineSeries.setData(data);

    const handleResize = () => {
      if (chartContainerRef.current) {
        chart.applyOptions({
          width: chartContainerRef.current.clientWidth,
        });
      }
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      chart.remove();
    };
  }, [data]);

  const handleRangeChange = (range: HistoricalDataRange) => {
    setSelectedRange(range);
    onRangeChange?.(range);
  };

  return (
    <div>
      <div className="flex justify-end space-x-2 mb-4">
        {RANGES.map(({ label, value }) => (
          <button
            key={value}
            onClick={() => handleRangeChange(value)}
            className={`px-3 py-1 rounded ${
              selectedRange === value
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            } ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
            disabled={loading}
          >
            {label}
          </button>
        ))}
      </div>
      {loading ? (
        <div className="h-[400px] flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        </div>
      ) : (
        <div ref={chartContainerRef} className="w-full h-[400px]" />
      )}
    </div>
  );
};

export default StockChart;