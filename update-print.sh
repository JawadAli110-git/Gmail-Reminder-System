sed -i '/@media print/,$d' src/index.css
cat << 'CSS' >> src/index.css

@media print {
  @page { margin: 1cm; }
  body {
    background: white !important;
    color: black !important;
    print-color-adjust: exact;
    -webkit-print-color-adjust: exact;
  }
  .no-print, button, form {
    display: none !important;
  }
  .liquid-glass, .liquid-glass-heavy {
    background: white !important;
    backdrop-filter: none !important;
    border: 1px solid #e2e8f0 !important;
    box-shadow: none !important;
    color: black !important;
    page-break-inside: avoid;
    break-inside: avoid;
  }
  .text-slate-900, .text-slate-700, .text-slate-500, .dark\\:text-white, .dark\\:text-slate-300 {
    color: #0f172a !important;
  }
  .printable-header {
    margin-bottom: 24px !important;
  }
  .fixed, .absolute {
    display: none !important;
  }
  /* Show only printable content */
  #timetable-content {
    padding: 0 !important;
    margin: 0 !important;
    max-width: none !important;
  }
}
CSS
