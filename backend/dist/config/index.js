"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.config = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
exports.config = {
    port: process.env.PORT ? parseInt(process.env.PORT, 10) : 5000,
    nodeEnv: process.env.NODE_ENV || 'development',
    jwtSecret: process.env.JWT_SECRET || 'rentease_super_secure_jwt_secret_key_2026',
    jwtExpiresIn: '7d',
    aiRateLimitDefault: parseInt(process.env.AI_RATE_LIMIT || '150', 10),
    verificationValidityDays: 365,
    slaHours: {
        EMERGENCY: 4,
        HIGH: 12,
        MEDIUM: 48,
        LOW: 120,
    },
    // Verified emergency & trade contractors for maintenance recommendation
    verifiedVendors: [
        {
            name: 'HydraFlow Plumbing Services',
            trade: 'PLUMBING',
            rating: 4.8,
            phone: '+91 98490 12345',
            city: 'Hyderabad',
            estimatedCostRange: '₹500 - ₹2,500',
        },
        {
            name: 'BrightVolt Electrical Solutions',
            trade: 'ELECTRICAL',
            rating: 4.9,
            phone: '+91 98490 23456',
            city: 'Hyderabad',
            estimatedCostRange: '₹400 - ₹3,000',
        },
        {
            name: 'CoolBreeze Air-Conditioning & HVAC',
            trade: 'HVAC',
            rating: 4.7,
            phone: '+91 98490 34567',
            city: 'Hyderabad',
            estimatedCostRange: '₹1,200 - ₹5,500',
        },
        {
            name: 'UrbanWood Carpentry & Repairs',
            trade: 'CARPENTRY',
            rating: 4.6,
            phone: '+91 98490 45678',
            city: 'Hyderabad',
            estimatedCostRange: '₹600 - ₹4,000',
        },
        {
            name: 'Apex Appliance Repair Care',
            trade: 'APPLIANCE',
            rating: 4.8,
            phone: '+91 98490 56789',
            city: 'Hyderabad',
            estimatedCostRange: '₹800 - ₹3,500',
        },
        {
            name: 'SafeHome Pest Defense',
            trade: 'PEST_CONTROL',
            rating: 4.9,
            phone: '+91 98490 67890',
            city: 'Hyderabad',
            estimatedCostRange: '₹1,500 - ₹4,500',
        },
        {
            name: 'SolidBrick Civil & Structural Contractors',
            trade: 'STRUCTURAL',
            rating: 4.7,
            phone: '+91 98490 78901',
            city: 'Hyderabad',
            estimatedCostRange: '₹3,000 - ₹15,000',
        },
    ],
};
