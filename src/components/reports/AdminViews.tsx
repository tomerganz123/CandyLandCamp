'use client';

import { FileText, Download } from 'lucide-react';

interface AdminViewsProps {
  token: string;
}

export default function AdminViews({ token }: AdminViewsProps) {
  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <div className="flex items-center gap-3">
          <FileText className="h-6 w-6 text-gray-600" />
          <h2 className="text-2xl font-bold text-gray-800">Admin Views</h2>
        </div>
        
        <button className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors">
          <Download className="h-4 w-4" />
          Export CSV
        </button>
      </div>

      <div className="text-center py-12">
        <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">Admin Views</h3>
        <p className="text-gray-600">Coming soon: Contact sheets, emergency info, and comments log</p>
      </div>
    </div>
  );
}
