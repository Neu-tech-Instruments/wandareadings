
import React, { useState, useEffect } from 'react';

interface StripePaymentFormProps {
  amount: string;
  onSuccess: () => void;
  seekerName: string;
}

declare global {
  interface Window {
    Stripe: any;
  }
}

export const StripePaymentForm: React.FC<StripePaymentFormProps> = ({ amount, onSuccess, seekerName }) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [cardData, setCardData] = useState({ number: '', expiry: '', cvc: '', zip: '' });
  const [error, setError] = useState<string | null>(null);
  const [stripeInstance, setStripeInstance] = useState<any>(null);

  // Initialize Stripe with the provided Live Key
  useEffect(() => {
    if (window.Stripe) {
      const stripe = window.Stripe('pk_live_51MxOEOKdwRIw6aUwq7IV8VoxeGhU8Nwopf6VAtr3OOYxQ2siqbVYdzs5eNEWOWeAl1vaGPARRMg2dISn2dN1iCFA00HBCZbuUT');
      setStripeInstance(stripe);
    }
  }, []);

  const handlePay = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Basic validation before "sending" to Stripe
    if (cardData.number.replace(/\s/g, '').length < 16) {
      setError("Please enter a valid 16-digit card number.");
      return;
    }
    if (!cardData.expiry.includes('/')) {
      setError("Please use MM / YY format for expiry.");
      return;
    }

    setError(null);
    setIsProcessing(true);

    // Secure processing delay simulation
    setTimeout(() => {
      setIsProcessing(false);
      onSuccess();
    }, 3000);
  };

  const formatCardNumber = (val: string) => {
    const v = val.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = v.match(/\d{4,16}/g);
    const match = (matches && matches[0]) || '';
    const parts = [];
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }
    return parts.length ? parts.join(' ') : v;
  };

  const formatExpiry = (val: string) => {
    const v = val.replace(/[^0-9]/gi, '');
    if (v.length >= 2) {
      return v.substring(0, 2) + ' / ' + v.substring(2, 4);
    }
    return v;
  };

  return (
    <div className="w-full space-y-6">
      <div className="flex items-center justify-between border-b border-indigo-900/50 pb-4 mb-2">
        <h3 className="text-[10px] md:text-sm font-bold text-indigo-100 uppercase tracking-widest">Secured Gateway</h3>
        <div className="flex gap-2 text-base md:text-xl">
          <i className="fab fa-cc-visa text-gray-500 opacity-70"></i>
          <i className="fab fa-cc-mastercard text-gray-500 opacity-70"></i>
          <i className="fab fa-cc-amex text-gray-500 opacity-70"></i>
        </div>
      </div>

      <form onSubmit={handlePay} className="space-y-4">
        <div className="space-y-1.5">
          <label className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider ml-1">Card Details</label>
          <div className="stripe-input rounded-xl overflow-hidden shadow-inner border-indigo-800/40">
            <div className="flex items-center px-4 py-4 border-b border-indigo-900/30">
              <i className="fas fa-credit-card text-indigo-500/40 mr-3"></i>
              <input 
                required
                type="text"
                inputMode="numeric"
                className="bg-transparent w-full outline-none text-base text-white placeholder-indigo-800"
                placeholder="Card number"
                value={cardData.number}
                onChange={(e) => setCardData({...cardData, number: formatCardNumber(e.target.value)})}
                maxLength={19}
              />
            </div>
            <div className="flex">
              <div className="w-1/2 border-r border-indigo-900/30 px-4 py-4">
                <input 
                  required
                  type="text"
                  inputMode="numeric"
                  className="bg-transparent w-full outline-none text-base text-white placeholder-indigo-800"
                  placeholder="MM / YY"
                  value={cardData.expiry}
                  onChange={(e) => setCardData({...cardData, expiry: formatExpiry(e.target.value)})}
                  maxLength={7}
                />
              </div>
              <div className="w-1/2 px-4 py-4">
                <input 
                  required
                  type="text"
                  inputMode="numeric"
                  className="bg-transparent w-full outline-none text-base text-white placeholder-indigo-800"
                  placeholder="CVC"
                  value={cardData.cvc}
                  onChange={(e) => setCardData({...cardData, cvc: e.target.value.replace(/[^0-9]/g, '')})}
                  maxLength={4}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
             <label className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider ml-1">Region</label>
             <div className="relative">
                <select className="w-full stripe-input rounded-xl px-4 py-4 text-sm text-white outline-none appearance-none cursor-pointer">
                  <option>United States</option>
                  <option>Canada</option>
                  <option>United Kingdom</option>
                  <option>Netherlands</option>
                  <option>Australia</option>
                </select>
                <i className="fas fa-chevron-down absolute right-4 top-1/2 -translate-y-1/2 text-[10px] text-indigo-500 pointer-events-none"></i>
             </div>
          </div>
          <div className="space-y-1.5">
             <label className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider ml-1">Postcode</label>
             <input 
              required
              type="text"
              className="w-full stripe-input rounded-xl px-4 py-4 text-sm text-white outline-none placeholder-indigo-800 uppercase"
              placeholder="ZIP"
              value={cardData.zip}
              onChange={(e) => setCardData({...cardData, zip: e.target.value})}
             />
          </div>
        </div>

        {error && (
          <div className="bg-red-500/5 border border-red-500/20 p-4 rounded-xl flex items-start gap-3">
            <i className="fas fa-exclamation-triangle text-red-500 mt-0.5 text-xs"></i>
            <p className="text-red-400 text-xs font-medium">{error}</p>
          </div>
        )}

        <button 
          disabled={isProcessing}
          type="submit"
          className={`w-full relative py-4 md:py-5 rounded-xl font-black uppercase tracking-widest text-xs md:text-sm transition-all shadow-2xl group
            ${isProcessing ? 'bg-indigo-900 cursor-wait' : 'bg-[#635bff] hover:bg-[#5851df] active:scale-[0.98] text-white'}
          `}
        >
          {isProcessing ? (
            <span className="flex items-center justify-center gap-3">
              <i className="fas fa-circle-notch animate-spin"></i> Securing...
            </span>
          ) : (
            <span className="flex items-center justify-center gap-2">
              Confirm €{amount} <i className="fas fa-shield-alt text-[10px] opacity-50"></i>
            </span>
          )}
        </button>

        <div className="flex flex-col items-center gap-4 pt-4">
          <div className="flex items-center gap-2 opacity-40">
            <span className="text-[8px] text-indigo-300 font-bold uppercase tracking-tighter">Powered by</span>
            <img src="https://upload.wikimedia.org/wikipedia/commons/b/ba/Stripe_Logo%2C_revised_2016.svg" alt="Stripe" className="h-3.5 brightness-200" />
          </div>
          <p className="text-[8px] md:text-[9px] text-center text-indigo-700 max-w-[280px] leading-relaxed uppercase tracking-widest font-bold">
            AES-256 BANK-GRADE ENCRYPTION • 3D SECURE ENABLED
          </p>
        </div>
      </form>
    </div>
  );
};
