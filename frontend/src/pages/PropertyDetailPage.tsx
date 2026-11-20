import React, { useState } from 'react';
import { Property } from '../types';
import { ShieldCheck, MapPin, IndianRupee, Bed, Bath, Sparkles, Navigation, FileText, Wrench, ArrowLeft, Check, Phone, Video } from 'lucide-react';

interface Props {
  property: Property;
  onBack: () => void;
  onOpenTrustBadge: (propertyId: string) => void;
  onOpenNeighborhood: (propertyId: string) => void;
  onOpenAgreementAnalyzer: (propertyId: string) => void;
  onOpenMaintenanceModal: (propertyId: string) => void;
}

export const PropertyDetailPage: React.FC<Props> = ({
  property,
  onBack,
  onOpenTrustBadge,
  onOpenNeighborhood,
  onOpenAgreementAnalyzer,
  onOpenMaintenanceModal,
}) => {
  const [activePhotoIdx, setActivePhotoIdx] = useState<number>(0);

  let images: string[] = [];
  try {
    images = JSON.parse(property.images);
  } catch {
    images = [property.images];
  }

  let amenitiesList: string[] = [];
  try {
    amenitiesList = JSON.parse(property.amenities);
  } catch {
    amenitiesList = (property.amenities || '').split(',');
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fade-in">
      <button
        onClick={onBack}
        className="flex items-center space-x-1.5 text-xs font-bold text-slate-500 hover:text-slate-900 transition"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Property Listings</span>
      </button>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 Cols: Photos & Information */}
        <div className="lg:col-span-2 space-y-6">
          {/* Main Photo Gallery */}
          <div className="bg-white rounded-3xl overflow-hidden border border-slate-200/80 shadow-md space-y-2">
            <div className="relative h-72 sm:h-96 bg-slate-100">
              <img
                src={images[activePhotoIdx] || images[0]}
                alt={property.title}
                className="w-full h-full object-cover transition duration-300"
              />

              <div className="absolute top-4 left-4">
                <button
                  onClick={() => onOpenTrustBadge(property.id)}
                  className="px-3 py-1.5 rounded-full bg-white/95 backdrop-blur-md text-emerald-800 text-xs font-extrabold shadow-lg border border-emerald-300 flex items-center gap-1.5 hover:bg-emerald-50 transition"
                >
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>Inspect Trust Badges</span>
                </button>
              </div>

              {property.videoUrl && (
                <a
                  href={property.videoUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="absolute bottom-4 left-4 px-3 py-1.5 rounded-xl bg-slate-900/80 backdrop-blur-md text-white text-xs font-bold shadow-md flex items-center gap-1.5 hover:bg-slate-900 transition"
                >
                  <Video className="w-4 h-4 text-rose-400" />
                  <span>Verified Video Tour</span>
                </a>
              )}
            </div>

            {/* Thumbnail Row */}
            {images.length > 1 && (
              <div className="flex p-3 space-x-2 overflow-x-auto">
                {images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActivePhotoIdx(idx)}
                    className={`h-16 w-24 rounded-xl overflow-hidden border-2 flex-shrink-0 transition ${
                      activePhotoIdx === idx ? 'border-blue-600 ring-2 ring-blue-200' : 'border-transparent opacity-70 hover:opacity-100'
                    }`}
                  >
                    <img src={img} alt="thumb" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Description & Amenities */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-6">
            <div className="space-y-2">
              <div className="flex items-center space-x-2 text-xs font-bold text-slate-500">
                <span>{property.bedrooms} BHK</span>
                <span>•</span>
                <span>{property.bathrooms} Baths</span>
                <span>•</span>
                <span>{property.furnishing.replace('_', ' ')}</span>
                <span>•</span>
                <span>{property.squareFeet} Sq Ft</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">{property.title}</h1>
              <p className="text-xs sm:text-sm text-slate-500 flex items-center gap-1">
                <MapPin className="w-4 h-4 text-slate-400" />
                <span>{property.address}, {property.city}, {property.state} (PIN: {property.pincode})</span>
              </p>
            </div>

            <div className="border-t border-slate-100 pt-4 space-y-2">
              <h3 className="font-extrabold text-sm text-slate-900">About this property</h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">{property.description}</p>
            </div>

            {/* Amenities Grid */}
            <div className="border-t border-slate-100 pt-4 space-y-3">
              <h3 className="font-extrabold text-sm text-slate-900">Amenities & Building Features</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                {amenitiesList.map((a, i) => (
                  <div key={i} className="flex items-center space-x-2 p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700">
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    <span className="font-semibold">{a.trim()}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Right Col: Financials & Action Modules */}
        <div className="space-y-6">
          {/* Price Card */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-md space-y-5">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Monthly Rent</span>
              <div className="flex items-baseline space-x-1 mt-0.5">
                <span className="text-3xl font-black text-slate-900">₹{property.monthlyRent.toLocaleString('en-IN')}</span>
                <span className="text-xs text-slate-500">/ month</span>
              </div>
            </div>

            <div className="border-t border-slate-100 pt-4 space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-500">Security Deposit:</span>
                <span className="font-bold text-slate-800">₹{property.securityDeposit.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">DepositGuard Escrow:</span>
                <span className="font-bold text-emerald-700">Supported</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Notice Period:</span>
                <span className="font-bold text-slate-800">30 Days</span>
              </div>
            </div>

            {/* Module Triggers */}
            <div className="space-y-2 pt-2">
              <button
                onClick={() => onOpenNeighborhood(property.id)}
                className="w-full py-3 bg-teal-50 hover:bg-teal-100 text-teal-800 text-xs font-bold rounded-xl border border-teal-200 shadow-xs transition flex items-center justify-center gap-2"
              >
                <Navigation className="w-4 h-4 text-teal-600" />
                <span>Check Nearby Amenities & Commute</span>
              </button>

              <button
                onClick={() => onOpenAgreementAnalyzer(property.id)}
                className="w-full py-3 bg-purple-50 hover:bg-purple-100 text-purple-800 text-xs font-bold rounded-xl border border-purple-200 shadow-xs transition flex items-center justify-center gap-2"
              >
                <FileText className="w-4 h-4 text-purple-600" />
                <span>Analyze Lease in English & Telugu</span>
              </button>

              <button
                onClick={() => onOpenMaintenanceModal(property.id)}
                className="w-full py-3 bg-amber-50 hover:bg-amber-100 text-amber-800 text-xs font-bold rounded-xl border border-amber-200 shadow-xs transition flex items-center justify-center gap-2"
              >
                <Wrench className="w-4 h-4 text-amber-600" />
                <span>Report Maintenance Issue (AI Care)</span>
              </button>
            </div>

            {/* Owner KYC Banner */}
            <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 space-y-1.5 text-xs">
              <span className="text-[10px] font-bold uppercase text-slate-400 block">Listed By Owner</span>
              <div className="font-bold text-slate-900">{property.owner?.name || 'Verified Landlord'}</div>
              <div className="flex items-center text-emerald-700 font-semibold gap-1 text-[11px]">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Identity KYC Verified</span>
              </div>
              {property.owner?.phone && (
                <div className="text-slate-500 text-[11px] flex items-center gap-1">
                  <Phone className="w-3 h-3 text-slate-400" />
                  <span>{property.owner.phone}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
