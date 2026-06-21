import React, { useRef } from 'react';
import { BookingState } from '../types';
import { 
  X, 
  Download, 
  CheckCircle2, 
  Receipt, 
  MapPin, 
  Calendar, 
  User, 
  Printer,
  Sparkles,
  ShieldCheck,
  Wrench,
  DollarSign
} from 'lucide-react';

interface ReceiptModalProps {
  booking: BookingState;
  isDarkMode: boolean;
  onClose: () => void;
}

export const ReceiptModal: React.FC<ReceiptModalProps> = ({ 
  booking, 
  isDarkMode, 
  onClose 
}) => {
  const modalRef = useRef<HTMLDivElement>(null);

  const basePricePKR = booking.price.base * 100;
  const workPricePKR = booking.price.work * 100;
  const taxPricePKR = booking.price.tax * 100;
  const totalPricePKR = booking.price.total * 100;

  const providerName = booking.provider?.name || 'Ahmed Kamal';
  const providerSpecialty = booking.provider?.specialty || booking.service;
  const providerPhone = booking.provider?.phone || '0300-7654321';

  // Function to download a fully styles printable HTML version representing the receipt PDF
  const handleDownloadHTMLReceipt = () => {
    const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Haazir Official Invoice - ${booking.id}</title>
  <style>
    body {
      font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
      color: #1e293b;
      margin: 0;
      padding: 40px;
      line-height: 1.5;
      background-color: #f8fafc;
    }
    .invoice-card {
      max-width: 600px;
      margin: 0 auto;
      background-color: #ffffff;
      border-radius: 16px;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
      border: 1px solid #e2e8f0;
      padding: 40px;
      box-sizing: border-box;
    }
    .header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      border-bottom: 2px dashed #f1f5f9;
      padding-bottom: 25px;
      margin-bottom: 25px;
    }
    .logo-section h1 {
      font-size: 24px;
      font-weight: 900;
      color: #0d9488;
      margin: 0;
      text-transform: uppercase;
      letter-spacing: -0.5px;
    }
    .logo-section p {
      font-size: 10px;
      font-weight: 700;
      color: #64748b;
      margin: 4px 0 0 0;
      text-transform: uppercase;
      letter-spacing: 1px;
    }
    .invoice-meta {
      text-align: right;
    }
    .invoice-meta h2 {
      font-size: 12px;
      font-weight: 900;
      color: #475569;
      margin: 0;
      text-transform: uppercase;
    }
    .invoice-meta p {
      font-size: 11px;
      color: #94a3b8;
      margin: 4px 0 0 0;
      font-family: monospace;
    }
    .status-badge {
      display: inline-block;
      background-color: #ccfbf1;
      color: #0f766e;
      font-size: 10px;
      font-weight: 800;
      text-transform: uppercase;
      padding: 4px 10px;
      border-radius: 99px;
      margin-top: 10px;
    }
    .meta-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 20px;
      margin-bottom: 30px;
    }
    .meta-box h3 {
      font-size: 11px;
      font-weight: 800;
      text-transform: uppercase;
      color: #94a3b8;
      margin: 0 0 8px 0;
      letter-spacing: 0.5px;
    }
    .meta-box p {
      font-size: 13px;
      font-weight: 600;
      margin: 0;
      color: #334155;
    }
    .meta-box span {
      font-size: 11px;
      color: #64748b;
      display: block;
      margin-top: 2px;
    }
    .table-header {
      display: grid;
      grid-template-columns: 2.5fr 1fr;
      font-weight: 800;
      font-size: 11px;
      text-transform: uppercase;
      color: #94a3b8;
      border-bottom: 1px solid #e2e8f0;
      padding-bottom: 8px;
      margin-bottom: 12px;
    }
    .row {
      display: grid;
      grid-template-columns: 2.5fr 1fr;
      padding: 8px 0;
      font-size: 13px;
      border-bottom: 1px solid #f8fafc;
    }
    .row .item-title {
      font-weight: 700;
      color: #1e293b;
    }
    .row .item-desc {
      font-size: 11px;
      color: #64748b;
      margin: 2px 0 0 0;
    }
    .row .price {
      text-align: right;
      font-weight: 700;
      color: #334155;
      font-family: monospace;
    }
    .totals {
      margin-top: 20px;
      border-top: 2px solid #f1f5f9;
      padding-top: 15px;
    }
    .totals-row {
      display: flex;
      justify-content: space-between;
      font-size: 12.5px;
      color: #64748b;
      margin-bottom: 6px;
    }
    .totals-row.grand-total {
      font-size: 18px;
      font-weight: 800;
      color: #0f766e;
      margin-top: 12px;
      border-top: 1px solid #f1f5f9;
      padding-top: 12px;
    }
    .totals-row.grand-total .val {
      font-family: monospace;
    }
    .footer {
      margin-top: 40px;
      border-top: 1px solid #f1f5f9;
      padding-top: 20px;
      text-align: center;
    }
    .footer p {
      font-size: 11px;
      color: #94a3b8;
      margin: 0;
      font-weight: 600;
    }
    .footer .security {
      color: #0d9488;
      font-size: 9px;
      text-transform: uppercase;
      font-weight: 800;
      letter-spacing: 1px;
      margin-top: 8px;
    }
    .btn-print {
      display: block;
      width: 100px;
      margin: 20px auto 0 auto;
      text-align: center;
      background-color: #0f766e;
      color: white;
      text-decoration: none;
      padding: 8px 16px;
      border-radius: 8px;
      font-size: 12px;
      font-weight: 700;
    }
    @media print {
      body {
        background-color: white;
        padding: 0;
      }
      .invoice-card {
        border: none;
        box-shadow: none;
        padding: 0;
      }
      .btn-print {
        display: none;
      }
    }
  </style>
</head>
<body>

  <div class="invoice-card">
    <div class="header">
      <div class="logo-section">
        <h1>HAAZIR</h1>
        <p>Premium Local Services</p>
      </div>
      <div class="invoice-meta">
        <h2>TAX INVOICE</h2>
        <p>INV-${booking.id}</p>
        <div class="status-badge">PAID</div>
      </div>
    </div>

    <div class="meta-grid">
      <div class="meta-box">
        <h3>CUSTOMER</h3>
        <p>Ayesha Khan</p>
        <span>Lahore, Pakistan</span>
        <span>${booking.address}</span>
      </div>
      <div class="meta-box">
        <h3>PROVIDER</h3>
        <p>${providerName}</p>
        <span>${providerSpecialty} Specialist</span>
        <span>Phone: ${providerPhone}</span>
      </div>
    </div>

    <div class="meta-grid" style="margin-bottom: 20px; border-top: 1px solid #f1f5f9; padding-top: 15px;">
      <div class="meta-box">
        <h3>BOOKING DATE</h3>
        <p style="font-size: 12px; font-weight: normal; color: #475569;">${booking.slot}</p>
      </div>
      <div class="meta-box">
        <h3>PAYMENT METHOD</h3>
        <p style="font-size: 12px; font-weight: normal; color: #475569;">Cash On Delivery (COD)</p>
      </div>
    </div>

    <div>
      <div class="table-header">
        <span>Job Description / Service</span>
        <span style="text-align: right;">Amount</span>
      </div>
      
      <div class="row">
        <div>
          <span class="item-title">${booking.service} Inspection Fee</span>
          <p class="item-desc">Fixed visiting diagnostic charge for specialist dispatch.</p>
        </div>
        <span class="price">PKR ${basePricePKR.toLocaleString()}</span>
      </div>

      <div class="row">
        <div>
          <span class="item-title">Material & Labor Repair Charges</span>
          <p class="item-desc">${booking.subService} - ${booking.description || 'Verified operator fix procedure'}</p>
        </div>
        <span class="price">PKR ${workPricePKR.toLocaleString()}</span>
      </div>
    </div>

    <div class="totals row-container">
      <div class="totals-row">
        <span>Subtotal</span>
        <span style="font-family: monospace;">PKR ${(basePricePKR + workPricePKR).toLocaleString()}</span>
      </div>
      <div class="totals-row">
        <span>Taxes & platform dispatch fee (5%)</span>
        <span style="font-family: monospace;">PKR ${taxPricePKR.toLocaleString()}</span>
      </div>
      <div class="totals-row grand-total">
        <span>Total Paid In Cash</span>
        <span class="val">PKR ${totalPricePKR.toLocaleString()}</span>
      </div>
    </div>

    <div class="footer">
      <p>Thank you for choosing Haazir - reliable local on-demand utilities!</p>
      <div class="security">🔒 Lahorite Operator Trust Guarantee Verified</div>
      <a href="#" class="btn-print" onclick="window.print(); return false;">Print Receipt</a>
    </div>
  </div>

</body>
</html>`;

    // Create blobs & triggers download
    const blob = new Blob([htmlContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `haazir_receipt_${booking.id}.html`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Plain-text formatted receipt fallback download
  const handleDownloadTextReceipt = () => {
    const divider = '='.repeat(48);
    const textContent = `${divider}
                  HAAZIR SERVICES
          --- CUSTOMER PAYMENT RECEIPT ---
${divider}
INVOICE ID:     INV-${booking.id}
TICKET STATUS:  PAID & COMPLETED
DATE GENERATED: ${new Date().toLocaleDateString()}
BOOKING SLOT:   ${booking.slot}
${divider}

[CUSTOMER DETAILS]
Name:           Ayesha Khan
Zone Area:      Lahore, Pakistan
Service Loc:    ${booking.address}

[OPERATOR DETAILS]
Technician:     ${providerName}
Trade:          ${providerSpecialty}
Mobile Phone:   ${providerPhone}

${divider}
JOB BREAKDOWN & COST OVERVIEW
${divider}
1. Base Visitation Fee:          PKR ${basePricePKR.toLocaleString()}
2. Labor & Material Estimate:    PKR ${workPricePKR.toLocaleString()}
   (Procedure: ${booking.subService})
3. Taxes & Platform Service Fee: PKR ${taxPricePKR.toLocaleString()}

${divider}
GRAND TOTAL PAID:                PKR ${totalPricePKR.toLocaleString()}
${textToWords(totalPricePKR)}
${divider}
Thank you for booking with Karachi/Lahore Haazir Operator Network.
Verify digitally at http://haazir.pk
Have questions? Call helpline 111-HAAZIR
${divider}`;

    const blob = new Blob([textContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `haazir_receipt_${booking.id}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  function textToWords(num: number): string {
    return `Paid in Pakistani Rupees Cash.`;
  }

  return (
    <div id="receipt-modal-backdrop" className="absolute inset-0 z-50 bg-black/60 backdrop-blur-2xs flex items-center justify-center p-3.5 animate-fade-in">
      <div 
        ref={modalRef}
        className={`w-full max-w-[285px] rounded-2xl overflow-hidden border flex flex-col max-h-[90%] shadow-2xl transition-colors duration-150 ${
          isDarkMode ? 'bg-slate-950 border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-850'
        }`}
      >
        {/* Header toolbar */}
        <div className={`p-3.5 flex items-center justify-between border-b shrink-0 ${
          isDarkMode ? 'bg-slate-900/60 border-slate-850' : 'bg-slate-50 border-slate-150'
        }`}>
          <div className="flex items-center gap-1.5">
            <Receipt size={14} className="text-teal-600" />
            <span className="font-black text-2xs uppercase tracking-wider">Payment Receipt</span>
          </div>
          <button 
            type="button" 
            onClick={onClose}
            className={`p-1 rounded-full transition-colors cursor-pointer ${
              isDarkMode ? 'hover:bg-slate-800 text-slate-400' : 'hover:bg-slate-200 text-slate-500'
            }`}
          >
            <X size={14} />
          </button>
        </div>

        {/* Content detail wrapper */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* Main green circle */}
          <div className="text-center">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center mx-auto mb-2 ${
              isDarkMode ? 'bg-emerald-950/40 text-emerald-400' : 'bg-emerald-50 text-emerald-600'
            }`}>
              <CheckCircle2 size={20} className="stroke-2" />
            </div>
            <div className="text-[10px] uppercase font-black text-slate-400 font-mono tracking-tight leading-none mb-1">
              Booking Ref #{booking.id}
            </div>
            <h3 className={`text-xs font-black ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
              Invoice Fully Settled
            </h3>
            <span className="inline-block bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 text-[7px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full mt-1.5">
              Cash on delivery
            </span>
          </div>

          {/* Quick core info bar */}
          <div className={`border rounded-xl p-2.5 space-y-2 text-[9px] ${
            isDarkMode ? 'bg-slate-900/60 border-slate-800/80' : 'bg-slate-50/70 border-slate-150'
          }`}>
            <div className="flex items-start gap-1.5 leading-tight">
              <User size={10} className="text-slate-400 shrink-0 mt-0.5" />
              <div>
                <span className="text-slate-400 font-medium block">Technician Provider:</span>
                <span className="font-extrabold text-slate-800 dark:text-slate-200">{providerName}</span>
                <span className="text-slate-400 font-mono text-[8px] block">({providerSpecialty} trade)</span>
              </div>
            </div>
            <div className="flex items-start gap-1.5 leading-tight border-t pt-2 dark:border-slate-800">
              <Calendar size={10} className="text-slate-400 shrink-0 mt-0.5" />
              <div>
                <span className="text-slate-400 font-medium block">Dispatch Schedule:</span>
                <span className="font-extrabold text-slate-800 dark:text-slate-200">{booking.slot}</span>
              </div>
            </div>
          </div>

          {/* Ledger table items */}
          <div className="space-y-1.5">
            <div className="text-[7.5px] font-black uppercase text-slate-400 tracking-wider">
              Itemized service billing
            </div>
            
            <div className={`border rounded-xl p-3 space-y-2 text-[9.5px] ${
              isDarkMode ? 'bg-slate-900/30 border-slate-800' : 'bg-white border-slate-150'
            }`}>
              {/* Item 1 */}
              <div className="flex justify-between items-start gap-2">
                <div className="text-left">
                  <span className="font-extrabold text-slate-800 dark:text-slate-200 block">Dispatch Diagnostic Fee</span>
                  <span className="text-[7.5px] text-slate-450 block leading-tight">Fixed booking diagnostic visit charges</span>
                </div>
                <span className="font-bold text-slate-700 dark:text-slate-350 shrink-0">PKR {basePricePKR.toLocaleString()}</span>
              </div>
              
              {/* Item 2 */}
              <div className="flex justify-between items-start gap-2 border-t pt-2 dark:border-slate-800">
                <div className="text-left">
                  <span className="font-extrabold text-slate-800 dark:text-slate-200 block">Procedure fix and parts</span>
                  <span className="text-[7.5px] text-slate-450 block leading-tight truncate max-w-[150px]">{booking.subService}</span>
                </div>
                <span className="font-bold text-slate-700 dark:text-slate-350 shrink-0">PKR {workPricePKR.toLocaleString()}</span>
              </div>

              {/* Item 3 */}
              <div className="flex justify-between items-start gap-2 border-t pt-2 dark:border-slate-800">
                <div className="text-left">
                  <span className="font-extrabold text-slate-800 dark:text-slate-200 block">Surcharges & service regulatory taxes</span>
                  <span className="text-[7.5px] text-slate-455 block leading-tight">5% platform fee with local labor levy</span>
                </div>
                <span className="font-bold text-slate-700 dark:text-slate-350 shrink-0">PKR {taxPricePKR.toLocaleString()}</span>
              </div>

              {/* Total final */}
              <div className="flex justify-between items-center border-t border-dashed pt-2.5 dark:border-slate-800">
                <span className="font-black text-teal-650 dark:text-teal-400 text-[10px] uppercase">Cash paid total</span>
                <span className="font-black text-xs text-teal-650 dark:text-teal-400">PKR {totalPricePKR.toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Downloader Action Panel */}
        <div className={`p-3.5 border-t space-y-2 shrink-0 ${
          isDarkMode ? 'bg-slate-900 border-slate-850' : 'bg-slate-50 border-slate-150'
        }`}>
          <button
            type="button"
            onClick={handleDownloadHTMLReceipt}
            className="w-full bg-teal-600 hover:bg-teal-700 text-white font-extrabold py-2 px-3 rounded-xl text-[9px] flex items-center justify-center gap-1.5 transition-all shadow-xs cursor-pointer active:scale-98"
          >
            <Download size={11} />
            <span>Download Invoice PDF (HTML)</span>
          </button>
          
          <button
            type="button"
            onClick={handleDownloadTextReceipt}
            className={`w-full border font-extrabold py-1.5 px-3 rounded-xl text-[8px] flex items-center justify-center gap-1.2 transition-all cursor-pointer active:scale-98 ${
              isDarkMode 
                ? 'border-slate-800 text-slate-300 bg-slate-950 hover:bg-slate-900 hover:text-white' 
                : 'border-slate-200 text-slate-600 bg-white hover:bg-slate-50 hover:text-slate-850'
            }`}
          >
            <Printer size={10} />
            <span>Download Plain-Text Invoice</span>
          </button>

          <p className="text-[6.5px] text-slate-400 uppercase font-bold tracking-widest text-center mt-1">
            Certified Pakistani on-demand utility receipt
          </p>
        </div>
      </div>
    </div>
  );
};
