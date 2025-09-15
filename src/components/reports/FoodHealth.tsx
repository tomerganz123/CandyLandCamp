'use client';

import { Utensils, Download } from 'lucide-react';

interface FoodHealthProps {
  token: string;
}

export default function FoodHealth({ token }: FoodHealthProps) {
  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <div className="flex items-center gap-3">
          <Utensils className="h-6 w-6 text-red-600" />
          <h2 className="text-2xl font-bold text-gray-800">Food & Health</h2>
        </div>
        
        <button className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors">
          <Download className="h-4 w-4" />
          Export CSV
        </button>
      </div>

      <div className="text-center py-12">
        <Utensils className="h-16 w-16 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">Food & Health Reports</h3>
        <p className="text-gray-600">Coming soon: Dietary restrictions, medical conditions, and health summaries</p>
      </div>
    </div>
  );
}
