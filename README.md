# RiskSignal - Security Intelligence API

**RiskSignal** is a comprehensive security intelligence API that answers two critical questions:
- **Is this IP/domain malicious?** 
- **How anonymous is the actor behind it?**

RiskSignal aggregates and correlates data from multiple sources to deliver actionable intelligence for risk assessment and anonymity detection, enabling better security decisions.

## 🎯 What is RiskSignal?

RiskSignal is a **Security Intelligence API** designed to provide:
- **Risk Intelligence**: IP and domain reputation analysis with abuse history and threat classification
- **Anonymity Detection**: VPN/Proxy/TOR detection, residential vs datacenter classification
- **Explainable Scoring**: Transparent, human-readable intelligence backed by raw data

Built with modern technology stack and optimized for serverless environments.

## ✨ Key Features

### Risk Intelligence
- 🛡️ IP and domain reputation analysis
- 📊 Abuse history & confidence scoring
- 🎯 Threat category classification

### Anonymity Intelligence
- 👁️ Anonymity Percentage (0–100%)
- 🌐 VPN / Proxy / TOR detection
- 🖥️ Residential vs Datacenter classification
- 👥 ASN & hosting provider intelligence
- 📍 Geo & ASN mismatch detection

### Explainable Scoring
- 📈 Raw third-party data insights
- 🔍 Transparent flags & breakdown
- 💡 Human-readable summaries

## 📊 Performance Metrics

- **99.9%** Uptime SLA
- **<50ms** Average Response Time
- **5+** Integrated Data Sources
- **JSON-first** API Design
- **Serverless Ready** - Optimized for Vercel & serverless platforms

## 🚀 Quick Start

### Prerequisites
- Node.js & npm (install with [nvm](https://github.com/nvm-sh/nvm#installing-and-updating))
- Supabase account (optional, for backend services)

### Installation

```bash
# Clone the repository
git clone https://github.com/00xf5/signal-guard.git

# Navigate to the project directory
cd signal-guard

# Install dependencies
npm install

# Start the development server
npm run dev
```

The application will be available at `http://localhost:5173`

### Build for Production

```bash
# Build the project
npm run build

# Preview the build locally
npm preview
```

## 📖 API Usage Example

```bash
# Check IP reputation and anonymity
curl https://api.risksignal.io/check-ip?ip=8.8.8.8
```

Response includes:
- Risk score and threat classification
- Anonymity percentage
- VPN/Proxy/TOR detection
- Geo and ASN information
- Detailed breakdown with raw data

## 🏗️ Tech Stack

- **Frontend Framework**: React 18
- **Build Tool**: Vite
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: shadcn-ui (Radix UI)
- **State Management**: TanStack React Query
- **Routing**: React Router v6
- **Backend**: Supabase
- **Icons**: Lucide React
- **Forms**: React Hook Form + Zod validation
- **Notifications**: Sonner + Radix Toast
- **Charts**: Recharts

## 📁 Project Structure

```
src/
├── components/       # Reusable React components
│   ├── ui/          # shadcn-ui components
│   ├── Hero.tsx     # Hero section
│   ├── Features.tsx # Features showcase
│   ├── Pricing.tsx  # Pricing plans
│   ├── Scoring.tsx  # Scoring methodology
│   └── ...
├── pages/           # Page components
│   ├── Index.tsx    # Home page
│   └── NotFound.tsx # 404 page
├── hooks/           # Custom React hooks
├── lib/             # Utility functions
├── integrations/    # External service integrations
├── App.tsx          # Main app component
└── main.tsx         # Entry point
```

## 🔧 Available Scripts

```bash
# Development
npm run dev          # Start dev server with hot reload

# Production
npm run build        # Build for production
npm run build:dev    # Build in development mode

# Code Quality
npm run lint         # Run ESLint checks

# Preview
npm preview          # Preview production build locally
```

## 🌐 Deployment

### On Lovable
Simply visit your Lovable project dashboard and click **Share → Publish** to deploy.

### On Vercel
This project is optimized for Vercel deployment:

1. Push your code to GitHub
2. Import the repository on Vercel
3. Vercel will auto-detect the Vite setup
4. Deploy with a single click

### Custom Domain
To connect a custom domain:
1. Navigate to **Project Settings → Domains**
2. Click **Connect Domain**
3. Follow the DNS configuration steps

Learn more: [Custom Domain Setup](https://docs.lovable.dev/features/custom-domain#custom-domain)

## 📚 API Documentation

- **Endpoint**: `https://api.risksignal.io/`
- **Response Format**: JSON
- **Rate Limits**: Enterprise tier support
- **Authentication**: API Key based

For detailed API documentation, visit the docs section on the website.

## 🤝 Data Sources

RiskSignal integrates with 5+ premium data providers:
- IP reputation databases
- Abuse history databases
- VPN/Proxy detection services
- ASN and geolocation data
- Threat intelligence feeds

## 🔒 Security & Privacy

- Zero database required for core functionality
- Serverless architecture
- Data aggregation and correlation
- GDPR compliant
- Enterprise SLA support

## 📄 Philosophy

We believe in **intelligence, not guesswork**. RiskSignal doesn't make vague assessments—it provides:
- Transparent scoring methodology
- Raw data breakdown
- Actionable insights
- Clear reasoning for every decision

## 🐛 Issues & Support

Found a bug or have a feature request? 
- [Open an issue](https://github.com/00xf5/signal-guard/issues)
- Check existing issues first

## 📝 License

This project is created with Lovable. See LICENSE for details.

## 🙏 Credits

Built with:
- [Lovable](https://lovable.dev) - AI-powered development platform
- [React](https://react.dev) - UI library
- [Vite](https://vitejs.dev) - Build tool
- [Tailwind CSS](https://tailwindcss.com) - Styling
- [shadcn/ui](https://ui.shadcn.com) - Component library

---

**Need help?** Visit the [documentation](https://docs.risksignal.io) or contact support.