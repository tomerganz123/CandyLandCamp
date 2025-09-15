'use client';

import { useState, useEffect } from 'react';
import { Ticket, Download } from 'lucide-react';

interface TicketsAndFeesProps {
  token: string;
}

export default function TicketsAndFees({ token }: TicketsAndFeesProps) {
  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <div className="flex items-center gap-3">
          <Ticket className="h-6 w-6 text-green-600" />
          <h2 className="text-2xl font-bold text-gray-800">Tickets & Fees</h2>
        </div>
        
        <button className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
          <Download className="h-4 w-4" />
          Export CSV
        </button>
      </div>

      <div className="text-center py-12">
        <Ticket className="h-16 w-16 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">Tickets & Fees Reports</h3>
        <p className="text-gray-600">Coming soon: Ticket status, fee acceptance, and approval reports</p>
      </div>
    </div>
  );
}
