"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const app_1 = __importDefault(require("./app"));
const config_1 = require("./config");
const server = app_1.default.listen(config_1.config.port, () => {
    console.log(`====================================================`);
    console.log(`🚀 RentEase Advanced AI Rental Ecosystem Backend`);
    console.log(`📡 Server running on http://localhost:${config_1.config.port}`);
    console.log(`🛡️ Modules Active: Trust, AI Match, DepositGuard, AI Care, Agreements, Owner Copilot, Neighborhood, Voice`);
    console.log(`====================================================`);
});
exports.default = server;
