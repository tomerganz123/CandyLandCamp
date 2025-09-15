'use client';

import { Car, Download } from 'lucide-react';

interface LogisticsArrivalProps {
  token: string;
}

export default function LogisticsArrival({ token }: LogisticsArrivalProps) {
  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <div className="flex items-center gap-3">
          <Car className="h-6 w-6 text-purple-600" />
          <h2 className="text-2xl font-bold text-gray-800">Logistics & Arrival</h2>
        </div>
        
        <button className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors">
          <Download className="h-4 w-4" />
          Export CSV
        </button>
      </div>

      <div className="text-center py-12">
        <Car className="h-16 w-16 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">Logistics & Arrival Reports</h3>
        <p className="text-gray-600">Coming soon: Arrival schedule, transportation needs, and vehicle inventory</p>
      </div>
    </div>
  );
}
