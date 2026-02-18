/**
 * Shared fee data — single source of truth for both the Student Payment page
 * and the Parent Fees & Dues page. Edit amounts here and both views update.
 */

export const SHARED_FEES = [
    {
        id: 1,
        type: 'Tuition Fee (Year 1)',
        name: 'Tuition Fee (Year 1)',
        description: 'Academic Year 2024-25',
        amount: 125000,
        paid: 125000,
        status: 'paid',
        date: '15 Aug 2023',
    },
    {
        id: 2,
        type: 'Development Fee',
        name: 'Development Fee',
        description: 'Infrastructure & Labs',
        amount: 15000,
        paid: 15000,
        status: 'paid',
        date: '15 Aug 2023',
    },
    {
        id: 3,
        type: 'Hostel Deposit',
        name: 'Hostel Deposit',
        description: 'Refundable Caution Money',
        amount: 30000,
        paid: 30000,
        status: 'paid',
        date: '16 Feb 2024',
    },
    {
        id: 4,
        type: 'Semester 2 Tuition',
        name: 'Semester 2 Tuition',
        description: 'Sem 2 Academic Fees',
        amount: 45000,
        paid: 0,
        status: 'pending',
        date: 'Due: 15 Mar 2024',
    },
    {
        id: 5,
        type: 'Library Fine',
        name: 'Library Fine',
        description: 'Overdue Book Return',
        amount: 150,
        paid: 0,
        status: 'pending',
        date: 'Due: Immediate',
    },
];

export const TOTAL_PAID = SHARED_FEES.reduce((acc, f) => acc + f.paid, 0);
export const TOTAL_DUE = SHARED_FEES.reduce((acc, f) => acc + (f.amount - f.paid), 0);
export const PENDING_FEES = SHARED_FEES.filter(f => f.status === 'pending');
