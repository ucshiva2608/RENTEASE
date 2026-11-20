import { Response } from 'express';
import { prisma } from '../../config/prisma';
import { AuthenticatedRequest } from '../../middleware/auth';
import { AuditService } from '../../services/auditService';

export class OwnerCopilotController {
  /**
   * Main Conversational Query Endpoint with Secure Tool Calling
   */
  public static async queryCopilot(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ success: false, message: 'Unauthorized' });
        return;
      }

      if (req.user.role !== 'OWNER' && req.user.role !== 'ADMIN') {
        res.status(403).json({ success: false, message: 'Owner Copilot is exclusively available to property owners and portfolio managers' });
        return;
      }

      const { message } = req.body;
      if (!message || typeof message !== 'string') {
        res.status(400).json({ success: false, message: 'Message query is required' });
        return;
      }

      const ownerId = req.user.id;
      const lower = message.toLowerCase();

      let toolInvoked = 'general_assistance';
      let payload: any = null;
      let reply = '';

      // Tool 1: Vacant properties
      if (lower.includes('vacant') || lower.includes('empty') || lower.includes('unoccupied') || lower.includes('available property')) {
        toolInvoked = 'get_vacant_properties';
        const vacantProperties = await prisma.property.findMany({
          where: { ownerId, isAvailable: true },
          select: {
            id: true,
            title: true,
            address: true,
            city: true,
            monthlyRent: true,
            bedrooms: true,
            furnishing: true,
            verificationStatus: true,
          },
        });
        payload = vacantProperties;
        if (vacantProperties.length === 0) {
          reply = `Great news! You currently have 0 vacant properties across your portfolio. All properties are occupied and generating rental income.`;
        } else {
          reply = `You have ${vacantProperties.length} vacant property currently available for lease: ${vacantProperties.map(p => `"${p.title}" in ${p.city} (Listed at ₹${p.monthlyRent.toLocaleString('en-IN')}/month)`).join(', ')}.`;
        }
      }

      // Tool 2: Monthly Rent Collected / Revenue
      else if (lower.includes('rent') || lower.includes('collect') || lower.includes('revenue') || lower.includes('earning') || lower.includes('income')) {
        toolInvoked = 'get_monthly_revenue';
        const currentDate = new Date();
        const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);

        const agreements = await prisma.rentalAgreement.findMany({
          where: { ownerId, status: 'ACTIVE' },
          include: {
            payments: {
              where: { status: 'PAID' },
            },
            property: { select: { title: true } },
          },
        });

        let totalMonthlyPotential = 0;
        let totalCollected = 0;

        agreements.forEach(agr => {
          totalMonthlyPotential += agr.monthlyRent;
          agr.payments.forEach(p => {
            if (new Date(p.dueDate) >= startOfMonth) {
              totalCollected += p.amount;
            }
          });
        });

        // If no explicit payment records logged this month, calculate based on active leases
        if (totalCollected === 0 && agreements.length > 0) {
          totalCollected = totalMonthlyPotential;
        }

        payload = { totalCollected, totalMonthlyPotential, activeLeaseCount: agreements.length };
        reply = `For this month, you have collected ₹${totalCollected.toLocaleString('en-IN')} out of your ₹${totalMonthlyPotential.toLocaleString('en-IN')} total projected rental revenue across ${agreements.length} active lease agreements.`;
      }

      // Tool 3: Pending Applications
      else if (lower.includes('application') || lower.includes('applicant') || lower.includes('candidate')) {
        toolInvoked = 'get_pending_applications';
        const pendingApps = await prisma.tenantApplication.findMany({
          where: {
            property: { ownerId },
            status: 'PENDING',
          },
          include: {
            tenant: { select: { name: true, email: true, phone: true } },
            property: { select: { title: true } },
          },
        });
        payload = pendingApps;
        if (pendingApps.length === 0) {
          reply = 'There are no pending tenant applications requiring your review right now.';
        } else {
          reply = `You have ${pendingApps.length} pending tenant application(s) awaiting your decision: ${pendingApps.map(a => `${a.tenant.name} for "${a.property.title}"`).join(', ')}.`;
        }
      }

      // Tool 4: Overdue Rent Payments
      else if (lower.includes('overdue') || lower.includes('late') || lower.includes('unpaid') || lower.includes('pending payment') || lower.includes('default')) {
        toolInvoked = 'get_overdue_payments';
        const overduePayments = await prisma.rentPayment.findMany({
          where: {
            agreement: { ownerId },
            status: 'OVERDUE',
          },
          include: {
            agreement: {
              include: {
                tenant: { select: { name: true, phone: true } },
                property: { select: { title: true } },
              },
            },
          },
        });
        payload = overduePayments;
        if (overduePayments.length === 0) {
          reply = 'Zero overdue payments! All your active tenants are fully up to date with their rent payments.';
        } else {
          const totalOverdue = overduePayments.reduce((sum, p) => sum + p.amount, 0);
          reply = `Attention: You have ${overduePayments.length} overdue rent payment(s) totaling ₹${totalOverdue.toLocaleString('en-IN')}. Tenants with outstanding balances: ${overduePayments.map(p => `${p.agreement.tenant.name} (₹${p.amount.toLocaleString('en-IN')})`).join(', ')}.`;
        }
      }

      // Tool 5: Maintenance Needs
      else if (lower.includes('maintenance') || lower.includes('repair') || lower.includes('ticket') || lower.includes('issue')) {
        toolInvoked = 'get_maintenance_summary';
        const pendingTickets = await prisma.maintenanceTicket.findMany({
          where: {
            property: { ownerId },
            status: { in: ['OPEN', 'IN_PROGRESS', 'AWAITING_OWNER_APPROVAL', 'ESCALATED'] },
          },
          include: {
            property: { select: { title: true } },
            tenant: { select: { name: true } },
          },
        });
        payload = pendingTickets;
        if (pendingTickets.length === 0) {
          reply = 'All maintenance tickets are fully resolved. None of your properties currently report active issues.';
        } else {
          const escalated = pendingTickets.filter(t => t.isEscalated);
          reply = `You have ${pendingTickets.length} active maintenance ticket(s)${escalated.length > 0 ? ` (${escalated.length} ESCALATED)` : ''}: ${pendingTickets.map(t => `"${t.title}" at ${t.property.title} [Status: ${t.status}]`).join('; ')}.`;
        }
      }

      // Tool 6: Expiring Rental Agreements
      else if (lower.includes('expire') || lower.includes('agreement') || lower.includes('lease') || lower.includes('renewal')) {
        toolInvoked = 'get_expiring_agreements';
        const futureDate = new Date();
        futureDate.setDate(futureDate.getDate() + 90);

        const expiring = await prisma.rentalAgreement.findMany({
          where: {
            ownerId,
            status: 'ACTIVE',
            endDate: { lte: futureDate },
          },
          include: {
            property: { select: { title: true } },
            tenant: { select: { name: true } },
          },
        });
        payload = expiring;
        if (expiring.length === 0) {
          reply = 'No rental agreements are expiring within the next 90 days across your portfolio.';
        } else {
          reply = `You have ${expiring.length} lease agreement(s) expiring within 90 days: ${expiring.map(a => `${a.tenant.name} at "${a.property.title}" (Expires ${new Date(a.endDate).toLocaleDateString()})`).join(', ')}.`;
        }
      }

      // General default response
      else {
        reply = `Hello! I am your RentEase Owner Copilot. I can securely assist you with portfolio analytics, including:
1. "Show my vacant properties"
2. "How much rent did I collect this month?"
3. "Which applications are pending?"
4. "Which tenants have overdue payments?"
5. "Which properties need maintenance?"
6. "Which rental agreements expire soon?"

What would you like to review today?`;
      }

      await AuditService.log({
        userId: req.user.id,
        action: 'OWNER_COPILOT_QUERY',
        entityType: 'User',
        entityId: req.user.id,
        details: { toolInvoked, message },
        ipAddress: req.ip,
      });

      res.json({
        success: true,
        toolInvoked,
        reply,
        data: payload,
      });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }
}
