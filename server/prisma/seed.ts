import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const existingUser = await prisma.user.findUnique({
    where: { email: 'demo@example.com' },
  });

  if (existingUser) {
    console.log('Seed data already exists, skipping...');
    return;
  }

  const hashedPassword = await bcrypt.hash('password123', 10);

  const user = await prisma.user.create({
    data: {
      email: 'demo@example.com',
      password: hashedPassword,
      name: 'Demo User',
    },
  });

  const investments = await Promise.all([
    prisma.investment.create({
      data: {
        userId: user.id,
        type: 'STOCK',
        symbol: 'AAPL',
        name: 'Apple Inc.',
        quantity: 50,
        purchasePrice: 150.0,
        currentPrice: 178.5,
      },
    }),
    prisma.investment.create({
      data: {
        userId: user.id,
        type: 'STOCK',
        symbol: 'GOOGL',
        name: 'Alphabet Inc.',
        quantity: 20,
        purchasePrice: 2800.0,
        currentPrice: 2950.0,
      },
    }),
    prisma.investment.create({
      data: {
        userId: user.id,
        type: 'STOCK',
        symbol: 'MSFT',
        name: 'Microsoft Corporation',
        quantity: 35,
        purchasePrice: 310.0,
        currentPrice: 378.0,
      },
    }),
    prisma.investment.create({
      data: {
        userId: user.id,
        type: 'BOND',
        symbol: 'BND',
        name: 'Vanguard Total Bond Market ETF',
        quantity: 100,
        purchasePrice: 82.0,
        currentPrice: 79.5,
      },
    }),
    prisma.investment.create({
      data: {
        userId: user.id,
        type: 'BOND',
        symbol: 'TLT',
        name: 'iShares 20+ Year Treasury Bond ETF',
        quantity: 40,
        purchasePrice: 110.0,
        currentPrice: 98.0,
      },
    }),
    prisma.investment.create({
      data: {
        userId: user.id,
        type: 'MUTUAL_FUND',
        symbol: 'VFIAX',
        name: 'Vanguard 500 Index Fund',
        quantity: 25,
        purchasePrice: 420.0,
        currentPrice: 465.0,
      },
    }),
    prisma.investment.create({
      data: {
        userId: user.id,
        type: 'MUTUAL_FUND',
        symbol: 'FXAIX',
        name: 'Fidelity 500 Index Fund',
        quantity: 30,
        purchasePrice: 175.0,
        currentPrice: 192.0,
      },
    }),
  ]);

  const transactions = [];

  for (const inv of investments) {
    transactions.push(
      prisma.transaction.create({
        data: {
          userId: user.id,
          investmentId: inv.id,
          type: 'BUY',
          quantity: inv.quantity,
          price: inv.purchasePrice,
        },
      })
    );
  }

  transactions.push(
    prisma.transaction.create({
      data: {
        userId: user.id,
        investmentId: investments[0].id,
        type: 'BUY',
        quantity: 10,
        price: 155.0,
      },
    })
  );

  transactions.push(
    prisma.transaction.create({
      data: {
        userId: user.id,
        investmentId: investments[0].id,
        type: 'SELL',
        quantity: 5,
        price: 170.0,
      },
    })
  );

  transactions.push(
    prisma.transaction.create({
      data: {
        userId: user.id,
        investmentId: investments[2].id,
        type: 'BUY',
        quantity: 5,
        price: 350.0,
      },
    })
  );

  await Promise.all(transactions);

  console.log('Seed data created successfully');
  console.log('Demo account: demo@example.com / password123');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
