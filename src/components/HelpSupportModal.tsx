import React, { useState, useMemo } from 'react';
import { 
  X, 
  Search, 
  HelpCircle, 
  Mail, 
  FileText, 
  MessageSquare, 
  Send, 
  CheckCircle2, 
  ArrowLeft, 
  ChevronDown, 
  ChevronUp, 
  AlertCircle,
  ShieldCheck,
  Scale
} from 'lucide-react';
import { AppUser } from '../types';

interface HelpSupportModalProps {
  currentUser: AppUser | null;
  isDarkMode: boolean;
  onClose: () => void;
  language: 'en' | 'ur';
}

interface FAQItem {
  qEn: string;
  qUr: string;
  aEn: string;
  aUr: string;
  category: 'booking' | 'payment' | 'safety' | 'general';
}

export const HelpSupportModal: React.FC<HelpSupportModalProps> = ({
  currentUser,
  isDarkMode,
  onClose,
  language
}) => {
  const [activeTab, setActiveTab] = useState<'faq' | 'contact' | 'terms'>('faq');
  const [searchQuery, setSearchQuery] = useState('');
  const [openedFaqIdx, setOpenedFaqIdx] = useState<number | null>(null);

  // Form State
  const [contactEmail, setContactEmail] = useState(currentUser?.email || 'customer@haazir.com.pk');
  const [contactSubject, setContactSubject] = useState('billing');
  const [contactMessage, setContactMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitSuccess, setIsSubmitSuccess] = useState(false);
  const [simulatedTicketId, setSimulatedTicketId] = useState('');

  // Static FAQ items
  const faqList: FAQItem[] = useMemo(() => [
    {
      category: 'booking',
      qEn: 'How long does a technician take to arrive?',
      qUr: 'ٹیکنیشن کو پہنچنے میں کتنا وقت لگتا ہے؟',
      aEn: 'Usually, an matched technician is dispatched instantly and reaches your DHA/Karachi coordinate within 25 to 45 minutes, depending on local traffic mesh load.',
      aUr: 'عام طور پر، مل جل کر منتخب کردہ ٹیکنیشن فوری طور پر روانہ کیا جاتا ہے اور مقامی ٹریفک کے دباؤ کے لحاظ سے 25 سے 45 منٹ کے اندر آپ کے پتہ پر پہنچ جاتا ہے۔'
    },
    {
      category: 'payment',
      qEn: 'How are Haazir job rates calculated?',
      qUr: 'حاضر سروس کے ریٹس کا حساب کیسے لگایا جاتا ہے؟',
      aEn: 'Rates are transparent! They include a basic visitation check fee (PKR 250) + standard repair task work costs. Material expenses are billed extra based on actual shop receipts.',
      aUr: 'ریٹس مکمل طور پر شفاف ہیں! ان میں ایک بنیادی وزٹ فیس (250 روپے) اور مرمت کے کام کی اجرت شامل ہے۔ پائپ، اسکرو یا دیگر سامان کے اخراجات دکان کی لائیو رسید کے مطابق الگ ہوں گے۔'
    },
    {
      category: 'safety',
      qEn: 'Are technicians safe and verified?',
      qUr: 'کیا ٹیکنیشنز محفوظ اور تصدیق شدہ ہیں؟',
      aEn: 'Absolutely. Every technician carries biometric NADRA registration, clear criminal background certificates, and wears official Haazir identification gear with a custom check OTP.',
      aUr: 'جی بالکل۔ حاضر کے ہر ٹیکنیشن کی نادرا بائیو میٹرک تصدیق کی جاتی ہے، اور تھانے کا کرمنل ریکارڈ کلیئر ہوتا ہے، وہ اپنی آفیشل شرٹ اور تصدیقی کوڈ کے ساتھ حاضر ہوتے ہیں۔'
    },
    {
      category: 'booking',
      qEn: 'Can I cancel an active booking?',
      qUr: 'کیا میں بکنگ منسوخ کر سکتا ہوں؟',
      aEn: 'Yes, cancellation is free before technician dispatch. If the worker is already on-route, a minor mileage fuel surcharge of PKR 150 may apply to support our vendor partner.',
      aUr: 'جی ہاں، ٹیکنیشن کے روانہ ہونے سے پہلے منسوخی بالکل مفت ہے۔ اگر ٹیکنیشن سفر شروع کر چکا ہو، تو فیول کی مد میں 150 روپے کا معمولی چارج لاگو ہو سکتا ہے۔'
    },
    {
      category: 'payment',
      qEn: 'What is Haazir Pay and is cash accepted?',
      qUr: 'حاضر پے کیا ہے اور کیا کیش قبول کیا جاتا ہے؟',
      aEn: 'Cash is strictly accepted, but you can also pay digitally! After task sheet sign-off, you can generate a digital system receipt voucher enabling bank transfer, credit cards, or mobile wallets.',
      aUr: 'کیش مکمل طور پر قبول کیا جاتا ہے، تاہم آپ ڈیجیٹل پیمنٹ بھی کر سکتے ہیں! کام ختم ہونے کے بعد، بینک ٹرانسفر، کارڈ، یا ایزی پیسہ کے ذریعے رسید پے کی جا سکتی ہے۔'
    },
    {
      category: 'general',
      qEn: 'How do I dispute a quality issue?',
      qUr: 'اگر کام ٹھیک نہ ہو تو شکایت کیسے درج کریں؟',
      aEn: 'We offer a 7-day workmanship warranty! If any diagnostic fix fails, simply open this support portal or raise an alert under the completed booking detail tab to get it resolved for free.',
      aUr: 'ہم کام کرنے کے بعد 7 دن کی وارنٹی دیتے ہیں! اگر کوئی کام دوبارہ خراب ہو جائے تو آپ بکنگ ہسٹری میں جا کر لائیو کلیم مینو استعمال کر کے مفت کام کروا سکتے ہیں۔'
    }
  ], []);

  // Filtered FAQ Items
  const filteredFaqs = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return faqList;
    return faqList.filter(item => 
      item.qEn.toLowerCase().includes(q) || 
      item.aEn.toLowerCase().includes(q) ||
      item.qUr.includes(q) ||
      item.aUr.includes(q)
    );
  }, [faqList, searchQuery]);

  const toggleFaq = (idx: number) => {
    setOpenedFaqIdx(openedFaqIdx === idx ? null : idx);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!contactMessage.trim()) return;

    setIsSubmitting(true);
    // Simulate API delay
    setTimeout(() => {
      const randomId = Math.floor(100000 + Math.random() * 900000);
      setSimulatedTicketId(`HZ-${randomId}`);
      setIsSubmitting(false);
      setIsSubmitSuccess(true);
    }, 1200);
  };

  const handleResetForm = () => {
    setContactMessage('');
    setIsSubmitSuccess(false);
  };

  const textDict = {
    helpSupport: language === 'en' ? 'Help & Support' : 'مدد اور رہنمائی',
    faqs: language === 'en' ? 'FAQs' : 'سوالات',
    contact: language === 'en' ? 'Contact Support' : 'رابطہ فارم',
    terms: language === 'en' ? 'Terms' : 'قوانین',
    searchPlaceholder: language === 'en' ? 'Search common solutions...' : 'حل تلاش کریں...',
    notifTitle: language === 'en' ? 'Support Request Logged' : 'درخواست وصول کر لی گئی',
    ticketNo: language === 'en' ? 'Ticket ID' : 'ٹکٹ آئی ڈی',
    email: language === 'en' ? 'Your Registered Email' : 'آپ کا ای میل پتہ',
    issueType: language === 'en' ? 'What do you need help with?' : 'آپ کو کس چیز میں مدد چاہیے؟',
    issueBilling: language === 'en' ? 'Billing & Payment Issue' : 'بلنگ اور ادائیگی کا مسئلہ',
    issueTech: language === 'en' ? 'Technician Behavior / Arrive Delay' : 'ٹیکنیشن کا رویہ یا تاخیر',
    issueSchedule: language === 'en' ? 'Job Reservation Adjustment' : 'بکنگ کا وقت بدلنا',
    issueFeedback: language === 'en' ? 'Submit App Improvement Idea' : 'ایپ کے بارے میں رائے',
    issueOther: language === 'en' ? 'Other Technical Snag' : 'دیگر وجوہات',
    message: language === 'en' ? 'Elaborate your issue details' : 'تفصیل لکھیں',
    messagePlaceholder: language === 'en' ? 'Write as much info as possible (minimum 10 characters)...' : 'تفصیل فراہم کریں (کم از کم 10 حروف)...',
    btnSubmit: language === 'en' ? 'File Simulated Ticket' : 'درخواست جمع کروائیں',
    submitting: language === 'en' ? 'Filing Security Ticket...' : 'درخواست جا رہی ہے...',
    successTitle: language === 'en' ? 'Ticket Dispatched!' : 'درخواست روانہ ہو گئی!',
    successDesc: language === 'en' 
      ? 'Your support ticket has been successfully created. A dedicated regional supervisor has been assigned.' 
      : 'آپ کا حاضری سپورٹ ٹکٹ قائم کر دیا گیا ہے۔ ضلعی ہیڈ جلد رابطہ کریں گے۔',
    successContactBack: language === 'en' 
      ? 'We will review your logs and contact you back at:' 
      : 'ہم آپ کی لاگز چیک کر کے جواب بھیجیں گے:',
    btnFinish: language === 'en' ? 'Submit Another Issue' : 'نیا مسئلہ درج کریں',
    noFaqResult: language === 'en' ? 'No solutions match your search query.' : 'آپ کی تلاش کے مطابق کوئی حل نہیں ملا۔',
    tosTitle: language === 'en' ? 'Haazir Terms of Services' : 'شرائط و ضوابط',
    tosSubtitle: language === 'en' ? 'Governance, Security & Billing Laws' : 'حفاظتی اور انتظامی قوانین'
  };

  return (
    <div className="absolute inset-0 z-40 bg-slate-900/40 backdrop-blur-xs flex items-end justify-center p-4">
      <div 
        className={`w-full max-h-[85%] rounded-t-3xl shadow-2xl flex flex-col overflow-hidden text-left transition-all ${
          isDarkMode ? 'bg-slate-950 text-white border-t border-slate-900' : 'bg-white text-slate-800'
        }`}
      >
        {/* Modal Header bar */}
        <div className={`p-4 pb-3 flex items-center justify-between border-b ${
          isDarkMode ? 'border-slate-900' : 'border-slate-100'
        }`}>
          <div className="flex items-center gap-2">
            <HelpCircle size={14} className="text-teal-600 shrink-0" />
            <h3 className="text-xs font-black truncate leading-none uppercase tracking-wide">
              {textDict.helpSupport}
            </h3>
          </div>
          <button 
            type="button"
            onClick={onClose}
            className={`p-1.5 rounded-full transition-colors cursor-pointer ${
              isDarkMode ? 'bg-slate-900 hover:bg-slate-800 text-slate-400' : 'bg-slate-100 hover:bg-slate-250 text-slate-500'
            }`}
          >
            <X size={12} />
          </button>
        </div>

        {/* Modal Sub-navigation tabs */}
        <div className={`px-4 py-1.5 flex gap-1 bg-slate-50/50 justify-between select-none border-b ${
          isDarkMode ? 'bg-slate-900/20 border-slate-900' : 'border-slate-100'
        }`}>
          <button
            type="button"
            onClick={() => setActiveTab('faq')}
            className={`flex-1 py-1 px-1 rounded-lg text-[9.5px] font-black uppercase text-center transition-all ${
              activeTab === 'faq' 
                ? 'bg-teal-600 text-white shadow-3xs'
                : (isDarkMode ? 'text-slate-400 hover:text-slate-200' : 'text-slate-500 hover:text-slate-800')
            }`}
          >
            {textDict.faqs}
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('contact')}
            className={`flex-1 py-1 px-1 rounded-lg text-[9.5px] font-black uppercase text-center transition-all ${
              activeTab === 'contact' 
                ? 'bg-teal-600 text-white shadow-3xs'
                : (isDarkMode ? 'text-slate-400 hover:text-slate-200' : 'text-slate-500 hover:text-slate-800')
            }`}
          >
            {textDict.contact}
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('terms')}
            className={`flex-1 py-1 px-1 rounded-lg text-[9.5px] font-black uppercase text-center transition-all ${
              activeTab === 'terms' 
                ? 'bg-teal-600 text-white shadow-3xs'
                : (isDarkMode ? 'text-slate-400 hover:text-slate-200' : 'text-slate-500 hover:text-slate-800')
            }`}
          >
            {textDict.terms}
          </button>
        </div>

        {/* Scrollable Content Container */}
        <div className="flex-grow overflow-y-auto p-4 content-box pb-12 max-h-[420px] scrollbar-none">
          
          {/* FAQ Tab view */}
          {activeTab === 'faq' && (
            <div className="space-y-4 animate-fade-in text-left">
              
              {/* Search bar specifically for FAQs */}
              <div className="relative">
                <span className={`absolute left-3 top-1/2 -translate-y-1/2 ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>
                  <Search size={12} className="shrink-0" />
                </span>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={textDict.searchPlaceholder}
                  className={`w-full text-[10px] pl-8.5 pr-8 py-2.5 rounded-xl border outline-none transition-all focus:ring-1 focus:ring-teal-500 font-bold ${
                    isDarkMode 
                      ? 'bg-slate-900 border-slate-800 text-white placeholder-slate-500' 
                      : 'bg-white border-slate-200 text-slate-800 placeholder-slate-400 shadow-3xs'
                  }`}
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-250 p-1 rounded-full flex items-center justify-center"
                  >
                    <X size={10} />
                  </button>
                )}
              </div>

              {/* Accordion list */}
              <div className="space-y-2.5">
                {filteredFaqs.length === 0 ? (
                  <div className={`text-center py-8 px-4 rounded-2xl border border-dashed ${
                    isDarkMode ? 'border-slate-800 text-slate-550' : 'border-slate-200 text-slate-450'
                  }`}>
                    <AlertCircle size={18} className="mx-auto mb-2 text-slate-400 shrink-0" />
                    <p className="text-[10px] font-extrabold">{textDict.noFaqResult}</p>
                    <button
                      type="button"
                      onClick={() => setSearchQuery('')}
                      className="mt-2 text-[9px] uppercase tracking-wide font-black text-teal-650 hover:underline"
                    >
                      Clear search
                    </button>
                  </div>
                ) : (
                  filteredFaqs.map((faq, idx) => {
                    const isOpened = openedFaqIdx === idx;
                    const question = language === 'en' ? faq.qEn : faq.qUr;
                    const answer = language === 'en' ? faq.aEn : faq.aUr;
                    const isUrdu = language === 'ur';

                    return (
                      <div 
                        key={idx}
                        className={`border rounded-2xl overflow-hidden transition-all duration-200 ${
                          isOpened 
                            ? (isDarkMode ? 'bg-slate-900 border-teal-500/30' : 'bg-teal-50/20 border-teal-150 shadow-3xs')
                            : (isDarkMode ? 'bg-slate-900/40 border-slate-900 hover:bg-slate-900/60' : 'bg-white border-slate-150 hover:bg-slate-50/50')
                        }`}
                      >
                        <button
                          type="button"
                          onClick={() => toggleFaq(idx)}
                          className="w-full p-3.5 flex items-start gap-2.5 justify-between select-none text-left"
                        >
                          <span className={`text-[10px] font-black leading-snug flex-1 ${isUrdu ? 'text-right' : ''} ${
                            isOpened 
                              ? 'text-teal-600 dark:text-teal-400' 
                              : (isDarkMode ? 'text-slate-202' : 'text-slate-800')
                          }`}>
                            {question}
                          </span>
                          <span className={`shrink-0 mt-0.5 ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>
                            {isOpened ? <ChevronUp size={12} className="text-teal-600" /> : <ChevronDown size={12} />}
                          </span>
                        </button>
                        
                        {isOpened && (
                          <div className={`px-3.5 pb-3.5 pt-0 text-[9.5px] leading-relaxed select-text ${
                            isUrdu ? 'text-right' : ''
                          } ${isDarkMode ? 'text-slate-400' : 'text-slate-550'}`}>
                            <div className="border-t pb-2.5 dark:border-slate-800/80 border-slate-100" />
                            {answer}
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
              </div>

              {/* Rapid Call-To-Action to contact support directly from bottom of FAQs */}
              <div className={`p-3.5 border rounded-2xl text-center flex flex-col items-center select-none ${
                isDarkMode ? 'bg-slate-900/30 border-slate-900' : 'bg-slate-50 border-slate-150'
              }`}>
                <MessageSquare size={16} className="text-teal-600 mb-1.5 shrink-0" />
                <p className="text-[10px] font-black uppercase tracking-wide mb-1 text-slate-800 dark:text-slate-100">
                  {language === 'en' ? 'Stuck with something else?' : 'کوئی اور مسئلہ ہے؟'}
                </p>
                <p className="text-[8px] text-slate-400 max-w-[200px] mb-2.5 leading-normal">
                  {language === 'en' ? 'Our live operations cell in Karachi can resolve issues immediately.' : 'کراچی میں ہمارا آپریشنز پینل شکایات حل کرنے کیلئے فوری حاضر ہے۔'}
                </p>
                <button
                  type="button"
                  onClick={() => setActiveTab('contact')}
                  className="px-4 py-1.5 bg-teal-600 hover:bg-teal-700 text-white text-[8.5px] font-black rounded-lg transition-transform hover:scale-103 active:scale-97 cursor-pointer"
                >
                  {language === 'en' ? 'Contact live representative' : 'ٹکٹ درج کریں'}
                </button>
              </div>

            </div>
          )}

          {/* Contact Support Tab view */}
          {activeTab === 'contact' && (
            <div className="space-y-4 animate-fade-in text-left">
              {isSubmitSuccess ? (
                <div className="text-center p-6 space-y-4 select-none">
                  <div className="inline-flex w-12 h-12 rounded-full bg-teal-100 dark:bg-teal-900/30 items-center justify-center text-teal-600 animate-bounce">
                    <CheckCircle2 size={24} className="stroke-[2.5]" />
                  </div>
                  <div>
                    <h4 className="text-xs font-black uppercase tracking-wider text-slate-800 dark:text-white leading-normal">
                      {textDict.successTitle}
                    </h4>
                    <p className={`text-[9px] mt-1.5 leading-relaxed max-w-[210px] mx-auto ${isDarkMode ? 'text-slate-400' : 'text-slate-550'}`}>
                      {textDict.successDesc}
                    </p>
                  </div>

                  <div className={`p-3 border rounded-xl font-mono text-left text-[8.5px] max-w-[220px] mx-auto leading-normal ${
                    isDarkMode ? 'bg-slate-900 border-slate-800 text-slate-300' : 'bg-slate-50 border-slate-150 text-slate-700'
                  }`}>
                    <div className="flex justify-between font-bold border-b pb-1 mb-1.5 dark:border-slate-800">
                      <span>{textDict.ticketNo}:</span>
                      <span className="text-teal-600">{simulatedTicketId}</span>
                    </div>
                    <div className="text-[8px] text-slate-400 block mb-1">
                      {textDict.successContactBack}
                    </div>
                    <div className="font-extrabold truncate text-teal-650">
                      {contactEmail}
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handleResetForm}
                    className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white text-[9px] font-black rounded-lg shadow-sm transition-all cursor-pointer"
                  >
                    {textDict.btnFinish}
                  </button>
                </div>
              ) : (
                <form onSubmit={handleFormSubmit} className="space-y-3.5">
                  
                  {/* Email Input */}
                  <div>
                    <label className={`text-[8.5px] font-black uppercase tracking-wider block mb-1.5 ${
                      isDarkMode ? 'text-slate-400' : 'text-slate-600'
                    }`}>
                      {textDict.email}
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                        <Mail size={12} />
                      </span>
                      <input
                        type="email"
                        required
                        value={contactEmail}
                        onChange={(e) => setContactEmail(e.target.value)}
                        className={`w-full text-[9px] pl-8.5 pr-3 py-2 rounded-xl border outline-none font-sans font-extrabold focus:ring-1 focus:ring-teal-500 transition-all ${
                          isDarkMode 
                            ? 'bg-slate-900 border-slate-800 text-white' 
                            : 'bg-white border-slate-200 text-slate-800 shadow-3xs'
                        }`}
                      />
                    </div>
                  </div>

                  {/* Subject Dropdown */}
                  <div>
                    <label className={`text-[8.5px] font-black uppercase tracking-wider block mb-1.5 ${
                      isDarkMode ? 'text-slate-400' : 'text-slate-600'
                    }`}>
                      {textDict.issueType}
                    </label>
                    <select
                      value={contactSubject}
                      onChange={(e) => setContactSubject(e.target.value)}
                      className={`w-full text-[9px] px-3 py-2 rounded-xl border outline-none font-bold focus:ring-1 focus:ring-teal-500 transition-all cursor-pointer ${
                        isDarkMode 
                          ? 'bg-slate-900 border-slate-800 text-white' 
                          : 'bg-white border-slate-200 text-slate-800 shadow-3xs'
                      }`}
                    >
                      <option value="billing">{textDict.issueBilling}</option>
                      <option value="technician">{textDict.issueTech}</option>
                      <option value="scheduling">{textDict.issueSchedule}</option>
                      <option value="feedback">{textDict.issueFeedback}</option>
                      <option value="other">{textDict.issueOther}</option>
                    </select>
                  </div>

                  {/* Message details */}
                  <div>
                    <label className={`text-[8.5px] font-black uppercase tracking-wider block mb-1.5 ${
                      isDarkMode ? 'text-slate-400' : 'text-slate-600'
                    }`}>
                      {textDict.message}
                    </label>
                    <textarea
                      required
                      value={contactMessage}
                      onChange={(e) => setContactMessage(e.target.value)}
                      placeholder={textDict.messagePlaceholder}
                      rows={4}
                      className={`w-full text-[9px] p-3 rounded-xl border outline-none font-medium focus:ring-1 focus:ring-teal-500 transition-all ${
                        isDarkMode 
                          ? 'bg-slate-900 border-slate-800 text-white placeholder-slate-500' 
                          : 'bg-white border-slate-200 text-slate-800 placeholder-slate-400 shadow-3xs'
                      }`}
                    />
                  </div>

                  {/* Simulation warning */}
                  <div className={`p-2.5 rounded-xl border flex gap-2 items-start select-none ${
                    isDarkMode ? 'bg-slate-900 border-slate-800 text-slate-400' : 'bg-slate-100 border-slate-200 text-slate-500 hover:bg-slate-200/50'
                  }`}>
                    <AlertCircle size={12} className="text-teal-600 shrink-0 mt-0.5" />
                    <p className="text-[7.5px] leading-relaxed">
                      {language === 'en' 
                        ? 'Simulated environment: Filing this ticket mimics a real-time push to the regional support board, triggering logs & instant supervisor routing.' 
                        : 'یہ حاضر سپورٹ سینٹر کا نقلی سمیلیشن ماڈل ہے۔ درخواست سے کراچی ریجنل ہیڈ کو لائیو سگنل جائے گا۔'}
                    </p>
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={isSubmitting || contactMessage.trim().length < 10}
                    className={`w-full py-2.5 text-[9.5px] font-black uppercase tracking-wider text-white bg-teal-600 hover:bg-teal-700 disabled:bg-slate-350 disabled:cursor-not-allowed rounded-xl transition-all shadow-3xs cursor-pointer flex items-center justify-center gap-1.5`}
                  >
                    {isSubmitting ? (
                      <>
                        <span className="w-2.5 h-2.5 border-2 border-white/30 border-t-white rounded-full animate-spin shrink-0" />
                        <span>{textDict.submitting}</span>
                      </>
                    ) : (
                      <>
                        <Send size={10} />
                        <span>{textDict.btnSubmit}</span>
                      </>
                    )}
                  </button>

                </form>
              )}
            </div>
          )}

          {/* Terms Of Service view */}
          {activeTab === 'terms' && (
            <div className="space-y-4 animate-fade-in text-left select-text">
              
              <div className="flex gap-2.5 items-center select-none">
                <div className="w-8 h-8 rounded-xl bg-teal-100 dark:bg-teal-900/30 flex items-center justify-center text-teal-600 shrink-0">
                  <Scale size={14} className="stroke-[2.5]" />
                </div>
                <div>
                  <h4 className="text-[10.5px] font-black uppercase leading-tight">{textDict.tosTitle}</h4>
                  <p className="text-[8px] text-slate-400">{textDict.tosSubtitle}</p>
                </div>
              </div>

              {/* TOS Document Clauses Container */}
              <div className={`p-3 rounded-2xl border text-[8.5px] leading-relaxed space-y-3 font-medium overflow-y-auto max-h-[290px] ${
                isDarkMode ? 'bg-slate-900/50 border-slate-900 text-slate-300' : 'bg-slate-50 border-slate-200 text-slate-655'
              }`}>
                
                <div>
                  <h5 className="text-[9px] font-black uppercase tracking-wider text-slate-800 dark:text-slate-100 mb-1">
                    1. On-Demand Platform Model
                  </h5>
                  <p>
                    Haazir acts strictly as an electronic matching framework coordinating vetted local workers (electricians, plumbers, repairmen, and carpenters) based on GPS-map mesh grids. All physical repair tasks are self-governed contracts between customer and technicians.
                  </p>
                </div>

                <div>
                  <h5 className="text-[9px] font-black uppercase tracking-wider text-slate-800 dark:text-slate-100 mb-1">
                    2. Security Handshakes & OTP Gatekeeping
                  </h5>
                  <p>
                    For visual safety enforcement, customers are supplied with an entry OTP code inside the Tracker screen. Customers must explicitly authenticate this code upon technician arrival. Haazir takes no accountability for security breaches resulting from bypassed OTP checks.
                  </p>
                </div>

                <div>
                  <h5 className="text-[9px] font-black uppercase tracking-wider text-slate-800 dark:text-slate-100 mb-1">
                    3. Fee Structure and Materials Policy
                  </h5>
                  <p>
                    Every diagnostic booking incurs a PKR 250 basic check-up fee. Repairs, components, and replacements are extra and must be logged using physical, scanned receipt verification. Tips to local workers are welcomed but completely optional and private.
                  </p>
                </div>

                <div>
                  <h5 className="text-[9px] font-black uppercase tracking-wider text-slate-850 dark:text-slate-100 mb-1">
                    4. Dispatch Fuel Cancellations
                  </h5>
                  <p>
                    If the technician has departed the dispatch warehouse center and completed more than 1 kilometer of travel progress, cancelling the ticket will apply a PKR 150 fuel restoration fine. Re-scheduling is totally free if done 1 hour prior.
                  </p>
                </div>

                <div>
                  <h5 className="text-[9px] font-black uppercase tracking-wider text-slate-800 dark:text-slate-100 mb-1">
                    5. Workmanship & Guarantee
                  </h5>
                  <p>
                    Every completed repair processed and closed directly inside the official Haazir application comes with a complimentary, non-transferable 7-day labor warranty. Disputes should be filed online through the Contact Support tab within the warranty window.
                  </p>
                </div>

                <div className="border-t pt-2 mt-2 dark:border-slate-800/80 text-[7px] text-slate-400 text-center select-none uppercase tracking-widest font-bold">
                  Official Haazir Regulations • All rights reserved
                </div>

              </div>

              {/* Verified Badge */}
              <div className={`p-2.5 rounded-xl border flex gap-2 items-center justify-center select-none ${
                isDarkMode ? 'bg-teal-900/10 border-teal-500/25 text-teal-400' : 'bg-teal-50/50 border-teal-150 text-teal-800'
              }`}>
                <ShieldCheck size={12} className="shrink-0 stroke-[2.5]" />
                <span className="text-[8px] font-black tracking-wide uppercase">
                  Authenticated nadra-compliance legal policy
                </span>
              </div>

            </div>
          )}

        </div>
      </div>
    </div>
  );
};
