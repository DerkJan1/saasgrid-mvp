# SaaSGrid MVP

A SaaS metrics tracking dashboard for VC firms to monitor portfolio company performance.

## Features

- 📊 **SaaS Metrics Calculation**: Automatic calculation of MRR, ARR, GRR, NRR, and churn rates
- 📈 **Interactive Dashboard**: Real-time visualization of key performance indicators
- 📤 **File Upload**: Support for Excel (.xlsx, .xls) and CSV file uploads
- 🔐 **Magic Link Authentication**: Secure passwordless login via Supabase
- 📱 **Responsive Design**: Modern UI built with Tailwind CSS and shadcn/ui
- ⚡ **Fast Performance**: Built with Next.js 14 and App Router

## Tech Stack

- **Framework**: Next.js 14 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui
- **Authentication**: Supabase Auth
- **Database**: Supabase (PostgreSQL)
- **Charts**: Recharts
- **File Processing**: xlsx, papaparse
- **Deployment**: Vercel

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Supabase account

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd saasgrid-mvp
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   ```
   
   Fill in your Supabase credentials in `.env.local`:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
   NEXT_PUBLIC_APP_URL=http://localhost:3000
   ```

4. **Set up Supabase Database**
   
   Run the following SQL in your Supabase SQL editor:
   
   ```sql
   -- Enable UUID extension
   CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

   -- Organizations table
   CREATE TABLE organizations (
     id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
     name VARCHAR(255) NOT NULL,
     slug VARCHAR(100) UNIQUE NOT NULL,
     created_by UUID REFERENCES auth.users(id),
     created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
     updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
   );

   -- Uploads table
   CREATE TABLE uploads (
     id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
     organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
     file_name VARCHAR(255) NOT NULL,
     file_size INTEGER,
     uploaded_by UUID REFERENCES auth.users(id),
     processed_at TIMESTAMP WITH TIME ZONE,
     status VARCHAR(50) DEFAULT 'pending',
     error_message TEXT,
     created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
   );

   -- Customers table
   CREATE TABLE customers (
     id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
     organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
     customer_name VARCHAR(255) NOT NULL,
     customer_id VARCHAR(255),
     created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
     UNIQUE(organization_id, customer_id)
   );

   -- MRR snapshots table
   CREATE TABLE mrr_snapshots (
     id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
     organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
     customer_id UUID REFERENCES customers(id) ON DELETE CASCADE,
     month DATE NOT NULL,
     mrr DECIMAL(12,2) NOT NULL,
     created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
     UNIQUE(organization_id, customer_id, month)
   );

   -- Metrics summary table
   CREATE TABLE metrics_summary (
     id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
     organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
     month DATE NOT NULL,
     total_mrr DECIMAL(12,2),
     arr DECIMAL(12,2),
     customer_count INTEGER,
     new_mrr DECIMAL(12,2),
     expansion_mrr DECIMAL(12,2),
     contraction_mrr DECIMAL(12,2),
     churned_mrr DECIMAL(12,2),
     gross_revenue_retention DECIMAL(5,4),
     net_revenue_retention DECIMAL(5,4),
     logo_churn_rate DECIMAL(5,4),
     created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
     UNIQUE(organization_id, month)
   );

   -- Create indexes for performance
   CREATE INDEX idx_mrr_snapshots_org_month ON mrr_snapshots(organization_id, month);
   CREATE INDEX idx_metrics_summary_org_month ON metrics_summary(organization_id, month);

   -- Enable Row Level Security
   ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
   ALTER TABLE uploads ENABLE ROW LEVEL SECURITY;
   ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
   ALTER TABLE mrr_snapshots ENABLE ROW LEVEL SECURITY;
   ALTER TABLE metrics_summary ENABLE ROW LEVEL SECURITY;

   -- Create policies (users can only see their own data)
   CREATE POLICY "Users can view own organizations" ON organizations
     FOR ALL USING (auth.uid() = created_by);

   CREATE POLICY "Users can view own uploads" ON uploads
     FOR ALL USING (auth.uid() = uploaded_by);
   ```

5. **Run the development server**
   ```bash
   npm run dev
   ```

6. **Open your browser**
   
   Navigate to [http://localhost:3000](http://localhost:3000)

## Usage

### File Upload Format

Your data file should have the following columns:

- **customerId**: Unique identifier for each customer
- **customerName**: Display name for the customer  
- **month**: Month in YYYY-MM format (e.g., "2024-01")
- **mrr**: Monthly recurring revenue amount (numeric only)

### Supported File Formats

- Excel: `.xlsx`, `.xls`
- CSV: `.csv`
- Maximum file size: 10MB

### Example Data Format

| customerId | customerName | month   | mrr    |
|-----------|--------------|---------|--------|
| cust_001  | Acme Corp    | 2024-01 | 5000   |
| cust_002  | Beta Inc     | 2024-01 | 2500   |
| cust_001  | Acme Corp    | 2024-02 | 5500   |

## Metrics Calculated

- **MRR (Monthly Recurring Revenue)**: Total recurring revenue per month
- **ARR (Annual Recurring Revenue)**: MRR × 12
- **New MRR**: Revenue from new customers
- **Expansion MRR**: Additional revenue from existing customers
- **Contraction MRR**: Lost revenue from existing customers (downgrades)
- **Churned MRR**: Lost revenue from churned customers
- **GRR (Gross Revenue Retention)**: (Starting MRR - Churned MRR - Contraction MRR) / Starting MRR
- **NRR (Net Revenue Retention)**: (Starting MRR - Churned MRR - Contraction MRR + Expansion MRR) / Starting MRR
- **Logo Churn Rate**: Number of churned customers / Starting customer count

## Project Structure

```
src/
├── app/                     # Next.js App Router
│   ├── (auth)/             # Authentication routes
│   ├── (dashboard)/        # Protected dashboard routes
│   └── api/                # API routes
├── components/             # React components
│   ├── ui/                 # shadcn/ui components
│   ├── auth/               # Authentication components
│   ├── dashboard/          # Dashboard components
│   ├── charts/             # Chart components
│   └── upload/             # File upload components
├── lib/                    # Utility libraries
│   ├── supabase/           # Supabase client setup
│   ├── calculations/       # SaaS metrics calculations
│   ├── utils.ts            # Utility functions
│   └── constants.ts        # App constants
├── types/                  # TypeScript definitions
├── hooks/                  # Custom React hooks
└── store/                  # State management
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License.