
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const syncKey = searchParams.get('syncKey');

  if (!syncKey) return NextResponse.json({ error: 'Sync key required' }, { status: 400 });

  try {
    const [expenses, budgets, obligations, obligationPayments, debts, openingSavings] = await Promise.all([
      prisma.transaction.findMany({ where: { syncKey } }),
      prisma.budget.findMany({ where: { syncKey } }),
      prisma.obligation.findMany({ where: { syncKey } }),
      prisma.obligationPayment.findMany({ where: { syncKey } }),
      prisma.debt.findMany({ where: { syncKey } }),
      prisma.openingSavings.findUnique({ where: { syncKey } }),
    ]);

    // Format incomes and expenses from transactions
    const expList = expenses.filter(t => t.type === 'expense');
    const incList = expenses.filter(t => t.type === 'income');

    // Reconstruct budget map
    const budgetMap: any = {};
    budgets.forEach(b => {
      budgetMap[b.monthKey] = {
        limit: b.limit,
        categoryLimits: b.categoryLimits || {},
        alertThresholds: { warning: 75, critical: 90 }
      };
    });

    return NextResponse.json({
      state: {
        expenses: expList,
        incomes: incList,
        budgets: budgetMap,
        obligations,
        obligationPayments,
        debts,
        openingSavings,
      }
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const { syncKey, action, payload } = await req.json();

  try {
    if (action === 'sync_transaction') {
      const { id, type, amount, category, description, date } = payload;
      await prisma.transaction.upsert({
        where: { id },
        update: { type, amount, category, description, date },
        create: { id, type, amount, category, description, date, syncKey },
      });
    }

    if (action === 'delete_transaction') {
      await prisma.transaction.delete({ where: { id: payload.id } });
    }

    if (action === 'sync_budget') {
      const { monthKey, limit, categoryLimits } = payload;
      await prisma.budget.upsert({
        where: { monthKey_syncKey: { monthKey, syncKey } },
        update: { limit, categoryLimits },
        create: { monthKey, limit, categoryLimits, syncKey },
      });
    }
    
    // Add other actions for obligations, debts etc. as needed

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
