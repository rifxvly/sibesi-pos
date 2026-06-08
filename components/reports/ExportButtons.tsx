"use client";

import React from "react";

export function ExportButtons({ reportName }: { reportName: string }) {
  const handleExportPDF = () => {
    alert(`Fitur Export PDF untuk ${reportName} sedang diproses...`);
  };

  const handleExportExcel = () => {
    // Generate dummy CSV based on report name
    let csvContent = "data:text/csv;charset=utf-8,";
    csvContent += `Data Laporan ${reportName}\n\n`;
    csvContent += "Kolom 1,Kolom 2,Kolom 3\n";
    csvContent += "Data A,Data B,Data C\n";
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `${reportName.toLowerCase().replace(/ /g, '_')}.csv`);
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  return (
    <div className="flex gap-2">
      <button onClick={handleExportPDF} className="px-3 py-1.5 text-xs font-bold border border-stone-200 rounded-lg hover:bg-stone-50 transition">Export PDF</button>
      <button onClick={handleExportExcel} className="px-3 py-1.5 text-xs font-bold border border-stone-200 rounded-lg hover:bg-stone-50 transition">Export Excel</button>
    </div>
  );
}
