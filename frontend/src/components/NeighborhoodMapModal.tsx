import React, { useEffect, useState } from 'react';
import { MapPin, Navigation, Car, Bus, Footprints, Star, Hospital, GraduationCap, ShoppingBag, Utensils, X, Shield } from 'lucide-react';
import { api } from '../services/api';
import { NeighborhoodOverview, NearbyPlace } from '../types';

interface Props {
  propertyId: string;
  onClose: () => void;
}

export const NeighborhoodMapModal: React.FC<Props> = ({ propertyId, onClose }) => {
  const [data, setData] = useState<{ property: any; neighborhood: NeighborhoodOverview } | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [activeCategory, setActiveCategory] = useState<string>('ALL');

  useEffect(() => {
    async function fetchInfo() {
      try {
        const res = await api.getNeighborhood(propertyId);
        if (res.success) {
          setData(res);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchInfo();
  }, [propertyId]);

  const getCategoryIcon = (cat: string) => {
    switch (cat) {
      case 'HOSPITAL':
        return <Hospital className="w-4 h-4 text-rose-500" />;
      case 'SCHOOL':
      case 'COLLEGE':
        return <GraduationCap className="w-4 h-4 text-blue-500" />;
      case 'TRANSIT':
        return <Bus className="w-4 h-4 text-emerald-500" />;
      case 'SHOPPING':
        return <ShoppingBag className="w-4 h-4 text-purple-500" />;
      case 'RESTAURANT':
        return <Utensils className="w-4 h-4 text-amber-500" />;
      default:
        return <MapPin className="w-4 h-4 text-slate-500" />;
    }
  };

  const filteredAmenities = data?.neighborhood.amenities.filter((a) => {
    if (activeCategory === 'ALL') return true;
    return a.category === activeCategory;
  }) || [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl overflow-hidden border border-slate-100 flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-700 via-teal-700 to-cyan-800 p-5 text-white flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-white/10 rounded-xl backdrop-blur-md">
              <Navigation className="w-6 h-6 text-emerald-200" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-lg font-bold">Neighborhood Intelligence</h3>
                <span className="text-xs px-2 py-0.5 rounded-full bg-white/20 text-white font-medium">
                  Module 7
                </span>
              </div>
              <p className="text-xs text-teal-100">Verified nearby amenities & travel time calculation</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {loading ? (
            <div className="flex justify-center py-12">
              <div className="w-8 h-8 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : data ? (
            <>
              {/* Livability Radar Scorecards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 text-center">
                  <span className="text-[11px] font-bold text-emerald-700 uppercase">Livability Index</span>
                  <div className="text-2xl font-black text-emerald-900 mt-0.5">{data.neighborhood.overallLivability}/100</div>
                  <span className="text-[10px] text-emerald-600 font-medium">Prime Residential</span>
                </div>
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 text-center">
                  <span className="text-[11px] font-bold text-blue-700 uppercase">Transit Score</span>
                  <div className="text-2xl font-black text-blue-900 mt-0.5">{data.neighborhood.transitScore}/100</div>
                  <span className="text-[10px] text-blue-600 font-medium">Near Metro/Bus</span>
                </div>
                <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-3 text-center">
                  <span className="text-[11px] font-bold text-indigo-700 uppercase">Family Score</span>
                  <div className="text-2xl font-black text-indigo-900 mt-0.5">{data.neighborhood.familyScore}/100</div>
                  <span className="text-[10px] text-indigo-600 font-medium">Schools & Clinics</span>
                </div>
                <div className="bg-purple-50 border border-purple-200 rounded-xl p-3 text-center">
                  <span className="text-[11px] font-bold text-purple-700 uppercase">Convenience</span>
                  <div className="text-2xl font-black text-purple-900 mt-0.5">{data.neighborhood.dailyConvenienceScore}/100</div>
                  <span className="text-[10px] text-purple-600 font-medium">Malls & Dining</span>
                </div>
              </div>

              {/* Category Filter Chips */}
              <div className="flex flex-wrap gap-1.5 border-b border-slate-200 pb-3">
                {['ALL', 'TRANSIT', 'HOSPITAL', 'SCHOOL', 'COLLEGE', 'SHOPPING', 'RESTAURANT'].map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setActiveCategory(cat)}
                    className={`px-3 py-1 rounded-full text-xs font-semibold transition ${
                      activeCategory === cat
                        ? 'bg-slate-900 text-white shadow-sm'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              {/* Amenity List */}
              <div className="space-y-2.5">
                {filteredAmenities.map((item: NearbyPlace) => (
                  <div
                    key={item.id}
                    className="p-3 bg-slate-50 hover:bg-slate-100/80 rounded-xl border border-slate-200/80 transition flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  >
                    <div className="flex items-start space-x-3">
                      <div className="p-2 bg-white rounded-lg shadow-sm border border-slate-200 mt-0.5">
                        {getCategoryIcon(item.category)}
                      </div>
                      <div>
                        <div className="flex items-center space-x-2">
                          <h5 className="text-sm font-bold text-slate-800">{item.name}</h5>
                          <span className="flex items-center text-xs font-semibold text-amber-600">
                            <Star className="w-3 h-3 fill-amber-400 text-amber-400 mr-0.5" />
                            {item.rating}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 mt-0.5">{item.address}</p>
                      </div>
                    </div>

                    {/* Distance & Commute times */}
                    <div className="flex items-center space-x-3 text-xs font-medium text-slate-600 bg-white px-3 py-1.5 rounded-lg border border-slate-200/70 self-end sm:self-center">
                      <span className="font-bold text-slate-900">{item.distanceKm} km</span>
                      <span className="text-slate-300">|</span>
                      <span className="flex items-center gap-1 text-blue-600">
                        <Car className="w-3.5 h-3.5" /> {item.driveTimeMins}m
                      </span>
                      <span className="flex items-center gap-1 text-emerald-600">
                        <Bus className="w-3.5 h-3.5" /> {item.transitTimeMins}m
                      </span>
                      <span className="flex items-center gap-1 text-slate-600">
                        <Footprints className="w-3.5 h-3.5" /> {item.walkTimeMins}m
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <p className="text-center text-slate-500 py-6">Could not load neighborhood data.</p>
          )}
        </div>

        <div className="p-4 bg-slate-50 border-t border-slate-200 text-right">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-slate-800 hover:bg-slate-900 text-white text-sm font-medium rounded-xl transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
