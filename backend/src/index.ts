import app from './app';
import { config } from './config';

const server = app.listen(config.port, () => {
  console.log(`====================================================`);
  console.log(`🚀 RentEase Advanced AI Rental Ecosystem Backend`);
  console.log(`📡 Server running on http://localhost:${config.port}`);
  console.log(`🛡️ Modules Active: Trust, AI Match, DepositGuard, AI Care, Agreements, Owner Copilot, Neighborhood, Voice`);
  console.log(`====================================================`);
});

export default server;
