import { config } from '../config';

export interface ParsedSearchQuery {
  rawQuery: string;
  city?: string;
  locality?: string;
  maxBudget?: number;
  minBudget?: number;
  bedrooms?: number;
  bathrooms?: number;
  furnishing?: string;
  propertyType?: string;
  amenitiesRequired: string[];
}

export interface MaintenanceClassificationResult {
  category: 'PLUMBING' | 'ELECTRICAL' | 'HVAC' | 'CARPENTRY' | 'APPLIANCE' | 'STRUCTURAL' | 'PEST_CONTROL';
  urgency: 'EMERGENCY' | 'HIGH' | 'MEDIUM' | 'LOW';
  slaHours: number;
  reasoning: string;
  recommendedProvider: {
    name: string;
    trade: string;
    rating: number;
    phone: string;
    estimatedCostRange: string;
  };
}

export interface AgreementAnalysisResult {
  monthlyRent: number;
  securityDeposit: number;
  lockInPeriodMonths: number;
  noticePeriodDays: number;
  escalationPercent: number;
  stateJurisdiction: string;
  summaryEn: string;
  summaryTe: string;
  missingInformationAlerts: string[];
  discrepanciesWithListing: string[];
  riskScore: 'LOW' | 'MEDIUM' | 'HIGH';
}

export class AIService {
  /**
   * MODULE 2: Natural-language property search parser
   */
  public static parsePropertySearch(query: string): ParsedSearchQuery {
    const text = query.toLowerCase();
    const result: ParsedSearchQuery = {
      rawQuery: query,
      amenitiesRequired: [],
    };

    // Location extraction
    const cities = ['hyderabad', 'bengaluru', 'bangalore', 'mumbai', 'pune', 'delhi', 'chennai', 'kolkata'];
    for (const city of cities) {
      if (text.includes(city)) {
        result.city = city === 'bangalore' ? 'Bengaluru' : city.charAt(0).toUpperCase() + city.slice(1);
        break;
      }
    }

    const localities = ['gachibowli', 'banjara hills', 'jubilee hills', 'madhapur', 'kondapur', 'hitec city', 'kukatpally', 'indiranagar', 'koramangala', 'whitefield', 'wakad', 'hinjewadi'];
    for (const loc of localities) {
      if (text.includes(loc)) {
        result.locality = loc.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
        if (!result.city) {
          if (['gachibowli', 'banjara hills', 'jubilee hills', 'madhapur', 'kondapur', 'hitec city', 'kukatpally'].includes(loc)) {
            result.city = 'Hyderabad';
          } else if (['indiranagar', 'koramangala', 'whitefield'].includes(loc)) {
            result.city = 'Bengaluru';
          } else if (['wakad', 'hinjewadi'].includes(loc)) {
            result.city = 'Pune';
          }
        }
        break;
      }
    }

    // Budget extraction (e.g. under 18000, under 18k, below 25000, max 20,000, ₹18,000)
    const budgetUnderMatch = text.match(/(?:under|below|max|less than|within|upto|up to|budget\s*(?:of)?)\s*(?:₹|rs\.?|inr)?\s*(\d+)(?:k|\s*thousand)?/i);
    if (budgetUnderMatch) {
      let val = parseInt(budgetUnderMatch[1], 10);
      if (text.includes(budgetUnderMatch[1] + 'k') || text.includes(budgetUnderMatch[1] + ' k') || val < 100) {
        val *= 1000;
      }
      result.maxBudget = val;
    } else {
      const bareAmount = text.match(/(?:₹|rs\.?)\s*(\d+[\d,]*)/i);
      if (bareAmount) {
        result.maxBudget = parseInt(bareAmount[1].replace(/,/g, ''), 10);
      }
    }

    // Bedroom extraction (e.g. 1bhk, 2 bhk, 3 bedroom, 2 bed)
    const bhkMatch = text.match(/(\d+)\s*(?:bhk|bed|bedroom|rk)/i);
    if (bhkMatch) {
      result.bedrooms = parseInt(bhkMatch[1], 10);
    }

    // Bathroom extraction
    const bathMatch = text.match(/(\d+)\s*(?:bath|bathroom)/i);
    if (bathMatch) {
      result.bathrooms = parseInt(bathMatch[1], 10);
    }

    // Furnishing
    if (text.includes('fully furnished') || text.includes('full furnished') || (text.includes('furnished') && !text.includes('semi') && !text.includes('unfurnished'))) {
      result.furnishing = 'FURNISHED';
    } else if (text.includes('semi furnished') || text.includes('semi-furnished')) {
      result.furnishing = 'SEMI_FURNISHED';
    } else if (text.includes('unfurnished')) {
      result.furnishing = 'UNFURNISHED';
    }

    // Amenities
    const amenityMap: { [key: string]: string } = {
      'parking': 'Parking',
      'car park': 'Parking',
      'gym': 'Gym',
      'power backup': 'Power Backup',
      'generator': 'Power Backup',
      'elevator': 'Elevator',
      'lift': 'Elevator',
      'pet': 'Pet Friendly',
      'security': 'Security',
      'cctv': 'Security',
      'swimming pool': 'Swimming Pool',
      'pool': 'Swimming Pool',
      'clubhouse': 'Clubhouse',
      'balcony': 'Balcony',
    };

    for (const [key, val] of Object.entries(amenityMap)) {
      if (text.includes(key) && !result.amenitiesRequired.includes(val)) {
        result.amenitiesRequired.push(val);
      }
    }

    // Property Type
    if (text.includes('villa')) result.propertyType = 'VILLA';
    else if (text.includes('independent house') || text.includes('individual house')) result.propertyType = 'INDEPENDENT_HOUSE';
    else if (text.includes('studio')) result.propertyType = 'STUDIO';
    else if (text.includes('apartment') || text.includes('flat')) result.propertyType = 'APARTMENT';

    return result;
  }

  /**
   * Explainable match scoring
   */
  public static calculateMatchScore(property: any, parsed: ParsedSearchQuery): { score: number; explanations: string[] } {
    let score = 50; // base score
    const explanations: string[] = [];

    // Location match
    if (parsed.city) {
      if (property.city.toLowerCase() === parsed.city.toLowerCase()) {
        score += 20;
        explanations.push(`Located in your preferred city (${property.city})`);
      } else {
        score -= 20;
      }
    }

    if (parsed.locality && property.address.toLowerCase().includes(parsed.locality.toLowerCase())) {
      score += 15;
      explanations.push(`Exact locality match in ${parsed.locality}`);
    }

    // Budget match
    if (parsed.maxBudget) {
      if (property.monthlyRent <= parsed.maxBudget) {
        score += 20;
        const diff = parsed.maxBudget - property.monthlyRent;
        explanations.push(`Rent of ₹${property.monthlyRent.toLocaleString('en-IN')} fits comfortably under your max budget of ₹${parsed.maxBudget.toLocaleString('en-IN')} (saves ₹${diff.toLocaleString('en-IN')}/mo)`);
      } else if (property.monthlyRent <= parsed.maxBudget * 1.1) {
        score += 5;
        explanations.push(`Rent ₹${property.monthlyRent.toLocaleString('en-IN')} is slightly above budget by ${Math.round(((property.monthlyRent - parsed.maxBudget) / parsed.maxBudget) * 100)}%`);
      } else {
        score -= 25;
      }
    }

    // Bedroom match
    if (parsed.bedrooms) {
      if (property.bedrooms === parsed.bedrooms) {
        score += 20;
        explanations.push(`Exact ${property.bedrooms} BHK configuration requested`);
      } else {
        score -= 15;
      }
    }

    // Furnishing match
    if (parsed.furnishing) {
      if (property.furnishing === parsed.furnishing) {
        score += 15;
        explanations.push(`${property.furnishing.replace('_', ' ')} as desired`);
      } else {
        score -= 5;
      }
    }

    // Amenities match
    let propertyAmenities: string[] = [];
    try {
      propertyAmenities = JSON.parse(property.amenities);
    } catch {
      propertyAmenities = (property.amenities || '').split(',').map((s: string) => s.trim());
    }

    if (parsed.amenitiesRequired.length > 0) {
      const matchedAmenities = parsed.amenitiesRequired.filter(a =>
        propertyAmenities.some(pa => pa.toLowerCase().includes(a.toLowerCase()))
      );
      if (matchedAmenities.length > 0) {
        score += matchedAmenities.length * 5;
        explanations.push(`Includes required amenities: ${matchedAmenities.join(', ')}`);
      }
    }

    // Trust badge bonus
    if (property.badgeOwnershipDocsReviewed && property.badgeIdentityVerified) {
      score += 10;
      explanations.push('Verified High-Trust Listing (Identity & Documents vetted)');
    }

    const finalScore = Math.min(Math.max(score, 10), 99);
    return { score: finalScore, explanations };
  }

  /**
   * MODULE 4: AI Care - Maintenance Classification, Urgency & SLA
   */
  public static classifyMaintenanceComplaint(complaintText: string): MaintenanceClassificationResult {
    const text = complaintText.toLowerCase();

    let category: MaintenanceClassificationResult['category'] = 'PLUMBING';
    let urgency: MaintenanceClassificationResult['urgency'] = 'MEDIUM';
    let reasoning = 'Routine repair required.';

    // Emergency check
    if (
      text.includes('burst pipe') ||
      text.includes('water flooding') ||
      text.includes('sparking') ||
      text.includes('smoke') ||
      text.includes('gas leak') ||
      text.includes('fire') ||
      text.includes('short circuit') ||
      text.includes('sewage overflow')
    ) {
      urgency = 'EMERGENCY';
      reasoning = 'Severe hazard detected: immediate risk to occupant safety or catastrophic property damage.';
    } else if (
      text.includes('no water') ||
      text.includes('blackout') ||
      text.includes('no power') ||
      text.includes('ac not cooling') ||
      text.includes('ac dead') ||
      text.includes('broken lock') ||
      text.includes('main door lock') ||
      text.includes('commode broken')
    ) {
      urgency = 'HIGH';
      reasoning = 'Critical utility failure impacting essential daily habitability.';
    } else if (
      text.includes('paint') ||
      text.includes('cosmetic') ||
      text.includes('squeak') ||
      text.includes('loose knob') ||
      text.includes('curtain rod') ||
      text.includes('minor scratch')
    ) {
      urgency = 'LOW';
      reasoning = 'Cosmetic or minor convenience issue.';
    } else {
      urgency = 'MEDIUM';
      reasoning = 'Standard functional maintenance issue requiring scheduled repair.';
    }

    // Category detection
    if (text.includes('leak') || text.includes('water') || text.includes('pipe') || text.includes('tap') || text.includes('faucet') || text.includes('drain') || text.includes('sink') || text.includes('flush') || text.includes('toilet') || text.includes('plumb')) {
      category = 'PLUMBING';
    } else if (text.includes('electric') || text.includes('switch') || text.includes('socket') || text.includes('wiring') || text.includes('light') || text.includes('fan') || text.includes('circuit') || text.includes('power') || text.includes('mcb')) {
      category = 'ELECTRICAL';
    } else if (text.includes('ac') || text.includes('air conditioner') || text.includes('hvac') || text.includes('cooling') || text.includes('heating')) {
      category = 'HVAC';
    } else if (text.includes('door') || text.includes('window') || text.includes('hinge') || text.includes('handle') || text.includes('wardrobe') || text.includes('cupboard') || text.includes('wood') || text.includes('carpenter')) {
      category = 'CARPENTRY';
    } else if (text.includes('geyser') || text.includes('refrigerator') || text.includes('washing machine') || text.includes('microwave') || text.includes('chimney') || text.includes('appliance')) {
      category = 'APPLIANCE';
    } else if (text.includes('cockroach') || text.includes('termite') || text.includes('pest') || text.includes('bedbug') || text.includes('rat') || text.includes('mosquito')) {
      category = 'PEST_CONTROL';
    } else if (text.includes('wall crack') || text.includes('ceiling seepage') || text.includes('dampness') || text.includes('tile broken') || text.includes('structural')) {
      category = 'STRUCTURAL';
    }

    const slaHours = config.slaHours[urgency];

    // Find recommended provider
    const matchedVendor = config.verifiedVendors.find(v => v.trade === category) || config.verifiedVendors[0];

    return {
      category,
      urgency,
      slaHours,
      reasoning,
      recommendedProvider: matchedVendor,
    };
  }

  /**
   * MODULE 5: Agreement Intelligence - Clause Analysis & Telugu/English Explanations
   */
  public static analyzeRentalAgreement(agreementText: string, listingData?: any): AgreementAnalysisResult {
    const text = agreementText.toLowerCase();

    // Rent extraction
    let monthlyRent = 18000;
    const rentMatch = text.match(/(?:rent|monthly sum|payment of)\s*(?:of|is|rs\.?|₹|inr)?\s*(\d+[\d,]*)/i);
    if (rentMatch) {
      monthlyRent = parseFloat(rentMatch[1].replace(/,/g, ''));
    }

    // Deposit extraction
    let securityDeposit = 50000;
    const depMatch = text.match(/(?:deposit|caution deposit|security amount)\s*(?:of|is|rs\.?|₹|inr)?\s*(\d+[\d,]*)/i);
    if (depMatch) {
      securityDeposit = parseFloat(depMatch[1].replace(/,/g, ''));
    }

    // Lock-in period
    let lockInPeriodMonths = 6;
    const lockMatch = text.match(/(\d+)\s*(?:months?|mths?)\s*(?:lock-in|lock in|minimum stay)/i);
    if (lockMatch) {
      lockInPeriodMonths = parseInt(lockMatch[1], 10);
    }

    // Notice period
    let noticePeriodDays = 30;
    const noticeMatch = text.match(/(\d+)\s*(?:days?|months?)\s*(?:notice|prior notice)/i);
    if (noticeMatch) {
      const num = parseInt(noticeMatch[1], 10);
      noticePeriodDays = text.includes('month') ? num * 30 : num;
    }

    // Escalation
    let escalationPercent = 5.0;
    const escMatch = text.match(/(\d+(?:\.\d+)?)\s*%\s*(?:increase|escalation|enhancement|hike)/i);
    if (escMatch) {
      escalationPercent = parseFloat(escMatch[1]);
    }

    // Missing information & risk checks
    const missingInformationAlerts: string[] = [];
    if (!text.includes('notice')) {
      missingInformationAlerts.push('Notice Period clause is missing or ambiguous. Recommend explicit 30 or 60 days notice.');
    }
    if (!text.includes('deposit') || !text.includes('refund')) {
      missingInformationAlerts.push('Security deposit refund timeline is not specified. Should state refund within 15-30 days of vacation.');
    }
    if (!text.includes('maintenance') && !text.includes('repair')) {
      missingInformationAlerts.push('Maintenance responsibility division is omitted. Specify landlord structural vs tenant day-to-day repairs.');
    }
    if (escalationPercent > 10) {
      missingInformationAlerts.push(`High annual rent escalation of ${escalationPercent}%. Typical standard benchmark is 5% to 7%.`);
    }

    // Listing discrepancy check
    const discrepanciesWithListing: string[] = [];
    if (listingData) {
      if (listingData.monthlyRent && Math.abs(listingData.monthlyRent - monthlyRent) > 100) {
        discrepanciesWithListing.push(`Rent mismatch: Agreement specifies ₹${monthlyRent.toLocaleString('en-IN')}, but verified listing specifies ₹${listingData.monthlyRent.toLocaleString('en-IN')}.`);
      }
      if (listingData.securityDeposit && Math.abs(listingData.securityDeposit - securityDeposit) > 500) {
        discrepanciesWithListing.push(`Deposit mismatch: Agreement specifies ₹${securityDeposit.toLocaleString('en-IN')}, while listing indicates ₹${listingData.securityDeposit.toLocaleString('en-IN')}.`);
      }
    }

    const summaryEn = `Rental agreement specifies monthly rent of ₹${monthlyRent.toLocaleString('en-IN')} with ₹${securityDeposit.toLocaleString('en-IN')} security deposit. Minimum lock-in duration is ${lockInPeriodMonths} months, requiring ${noticePeriodDays} days notice prior to lease termination. Annual escalation is agreed at ${escalationPercent}%.`;

    const summaryTe = `ఈ అద్దె ఒప్పందం ప్రకారం నెలకు అద్దె ₹${monthlyRent.toLocaleString('en-IN')} మరియు సెక్యూరిటీ డిపాజిట్ ₹${securityDeposit.toLocaleString('en-IN')} గా నిర్ణయించబడింది. లాక్-ఇన్ కాలపరిమితి ${lockInPeriodMonths} నెలలు. ఇల్లు ఖాళీ చేయడానికి ${noticePeriodDays} రోజుల ముందస్తు నోటీస్ ఇవ్వాలి. వార్షిక అద్దె పెరుగుదల ${escalationPercent}% గా ఉంటుంది.`;

    const riskScore = missingInformationAlerts.length >= 2 || discrepanciesWithListing.length > 0 ? 'HIGH' : missingInformationAlerts.length === 1 ? 'MEDIUM' : 'LOW';

    return {
      monthlyRent,
      securityDeposit,
      lockInPeriodMonths,
      noticePeriodDays,
      escalationPercent,
      stateJurisdiction: 'Telangana & Andhra Pradesh Tenancy Norms',
      summaryEn,
      summaryTe,
      missingInformationAlerts,
      discrepanciesWithListing,
      riskScore,
    };
  }

  /**
   * MODULE 8: Multilingual Voice Assistant NLU & TTS script generator
   */
  public static processVoiceIntent(transcript: string, language: 'en' | 'te' | 'hi' = 'en'): {
    intent: string;
    action: string;
    parsedParams: any;
    spokenResponse: string;
  } {
    const raw = transcript.toLowerCase();

    // Check for Telugu intent
    if (language === 'te' || raw.includes('కావాలి') || raw.includes('ఇల్లు') || raw.includes('అద్దె') || raw.includes('చూపించు')) {
      const bhkMatch = raw.match(/(\d+)\s*bhk/i) || raw.match(/(\d+)\s*గదుల/);
      const bedrooms = bhkMatch ? parseInt(bhkMatch[1], 10) : 2;
      return {
        intent: 'SEARCH_PROPERTIES',
        action: 'NAVIGATE_TO_SEARCH',
        parsedParams: { bedrooms, city: 'Hyderabad' },
        spokenResponse: `హైదరాబాద్‌లో మీ బడ్జెట్‌కు సరిపోయే ${bedrooms} BHK ఇళ్ల వివరాలను మీకు చూపిస్తున్నాను.`,
      };
    }

    // Check for Hindi intent
    if (language === 'hi' || raw.includes('चाहिए') || raw.includes('किराया') || raw.includes('दिखाओ') || raw.includes('फ्लैट')) {
      const bhkMatch = raw.match(/(\d+)\s*bhk/i) || raw.match(/(\d+)\s*कमरे/);
      const bedrooms = bhkMatch ? parseInt(bhkMatch[1], 10) : 2;
      return {
        intent: 'SEARCH_PROPERTIES',
        action: 'NAVIGATE_TO_SEARCH',
        parsedParams: { bedrooms, city: 'Hyderabad' },
        spokenResponse: `हैदराबाद में आपके बजट के अनुसार ${bedrooms} BHK फ्लैट्स की सूची तैयार की गई है।`,
      };
    }

    // English intent processing
    if (raw.includes('vacant') || raw.includes('empty property') || raw.includes('unoccupied')) {
      return {
        intent: 'OWNER_VACANT_PROPERTIES',
        action: 'OPEN_OWNER_COPILOT',
        parsedParams: { tool: 'get_vacant_properties' },
        spokenResponse: 'Fetching your currently vacant properties across Hyderabad and Bengaluru.',
      };
    }

    if (raw.includes('rent collected') || raw.includes('revenue') || raw.includes('income')) {
      return {
        intent: 'OWNER_REVENUE',
        action: 'OPEN_OWNER_COPILOT',
        parsedParams: { tool: 'get_monthly_revenue' },
        spokenResponse: 'Here is your total rental collection summary for this calendar month.',
      };
    }

    if (raw.includes('deposit') || raw.includes('inspection') || raw.includes('deduction')) {
      return {
        intent: 'NAVIGATE_DEPOSITGUARD',
        action: 'NAVIGATE_DEPOSITGUARD',
        parsedParams: {},
        spokenResponse: 'Opening RentEase DepositGuard ledger and inspection report audit trail.',
      };
    }

    if (raw.includes('maintenance') || raw.includes('repair') || raw.includes('complaint')) {
      return {
        intent: 'NAVIGATE_MAINTENANCE',
        action: 'NAVIGATE_MAINTENANCE',
        parsedParams: {},
        spokenResponse: 'Opening RentEase AI Care maintenance portal and ticket dashboard.',
      };
    }

    // Default to search
    const parsedSearch = this.parsePropertySearch(transcript);
    return {
      intent: 'SEARCH_PROPERTIES',
      action: 'NAVIGATE_TO_SEARCH',
      parsedParams: parsedSearch,
      spokenResponse: `Found top matched verified properties fitting "${transcript}". Displaying results now.`,
    };
  }
}
