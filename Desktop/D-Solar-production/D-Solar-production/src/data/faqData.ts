export interface FAQ {
  id: string;
  question: string;
  answer: string;
  keywords: string[];
}

export const faqData: FAQ[] = [
  {
    id: 'installment-plans',
    question: 'Do you offer installment plans?',
    answer: '**Yes!** We offer flexible installment plans through our partner financing institutions:\n\n- **SB Finance** (3 Years)\n- **BPI** (5 Years)\n\nOur team will guide you through the application process, including the required documentation.',
    keywords: ['installment', 'payment', 'plan', 'financing', 'loan', 'credit', 'pay', 'monthly']
  },
  {
    id: 'how-to-avail',
    question: 'How to avail your installment plans?',
    answer: 'We\'re more than happy to help and guide you through the process. Here\'s the list of requirements: Valid ID, Proof of Income, and Proof of Billing.',
    keywords: ['avail', 'how', 'process', 'requirements', 'installment', 'apply']
  },
  {
    id: 'quotation',
    question: 'Can I ask for a quotation?',
    answer: 'Yes! You can request a free quotation. Share your latest MERALCO bill, roof type (concrete, metal tin or yero), and exact address, and we\'ll provide you with a customized proposal.',
    keywords: ['quotation', 'quote', 'cost', 'estimate', 'proposal']
  },
  {
    id: 'savings',
    question: 'How much money will I save with Solar?',
    answer: 'Savings vary based on your energy usage, solar system size, and location. Typically, customers save 30-70% on their electricity bills. Over time, this can result in significant savings.',
    keywords: ['save', 'savings', 'money', 'bill', 'cost', 'return', 'roi']
  },
  {
    id: 'zero-bill',
    question: 'Can I get Zero Bill?',
    answer: 'Achieving a "Zero Bill" is possible under specific conditions, such as using an adequately sized solar setup with battery that fully offsets your consumption and participating in net metering.',
    keywords: ['zero', 'bill', 'free', 'nothing', 'no bill', 'eliminate']
  },
  {
    id: 'location',
    question: 'Where are you located?',
    answer: 'We are located at No.30-C Westbend Arcade, Dona Soledad Avenue, Paranaque City. You can call us at (02) 8831-7330 or (0960) 471-6968.',
    keywords: ['location', 'where', 'address', 'office', 'based', 'city', 'contact', 'phone', 'number']
  },
  {
    id: 'system-difference',
    question: 'What\'s the difference between On-Grid and Hybrid System?',
    answer: '**On-Grid Systems:**\n- Uses both your energy supplier (e.g., Meralco) at night and solar power for daytime\n- More affordable initial investment\n- No backup during power outages\n\n**Hybrid Systems:**\n- Uses solar power during daytime and battery during nighttime\n- Provides backup power during outages\n- Higher initial investment but greater energy independence',
    keywords: ['difference', 'on-grid', 'hybrid', 'system', 'compare', 'battery', 'backup']
  },
  {
    id: 'cost',
    question: 'How much does a solar power system cost?',
    answer: 'Our packages start from **₱104,800** for a 2.32kW OnGrid system suitable for bills around ₱2,500, up to **₱901,600** for a 14.5kW Hybrid system with 10.24kWh battery for ₱13,000-₱16,000 bills. Prices may vary based on your specific needs and location.',
    keywords: ['cost', 'price', 'how much', 'kw', 'system', 'pay', 'package', 'packages', 'pricing']
  },
  {
    id: 'night-operation',
    question: 'Will solar panels work at night?',
    answer: 'On-grid systems rely on sunlight and **do not work at night** unless paired with batteries. For 24/7 solar power, we recommend our hybrid systems with battery storage.',
    keywords: ['night', 'dark', 'evening', 'work', 'operate', 'function', 'after sunset']
  },
  {
    id: 'power-outage',
    question: 'What happens during a power outage?',
    answer: '**On-grid systems** automatically shut down during outages for safety reasons.\n\n**Hybrid systems** with batteries can provide backup power during outages, keeping essential appliances running.',
    keywords: ['outage', 'blackout', 'brownout', 'power', 'electricity', 'backup', 'battery']
  },
  {
    id: 'cloudy-days',
    question: 'Will solar panels work during cloudy days or rainy weather?',
    answer: 'Yes but the power produced may be reduced compared to sunny days.',
    keywords: ['cloudy', 'rainy', 'weather', 'work', 'effective', 'sun']
  },
  {
    id: 'maintenance',
    question: 'How much maintenance do solar panels require?',
    answer: 'Solar panels require minimal maintenance at least once a year. Regular cleaning to remove dust and debris is sufficient. Our team offers maintenance services upon installation.',
    keywords: ['maintenance', 'clean', 'upkeep', 'service', 'required']
  },
  {
    id: 'free-maintenance',
    question: 'Do you offer free maintenance service?',
    answer: 'Free 2-year maintenance is included in our packages.',
    keywords: ['free', 'maintenance', 'service', 'include', 'package']
  },
  {
    id: 'lifespan',
    question: 'What is the lifespan of a solar panel?',
    answer: 'Our AE Solar panels (German brand) have a 30-year warranty, which reflects their exceptional lifespan. The efficiency may slightly decrease over time, but they\'re designed for decades of reliable service.',
    keywords: ['lifespan', 'life', 'last', 'long', 'years', 'duration']
  },
  {
    id: 'warranty',
    question: 'How about your warranty?',
    answer: 'We offer comprehensive warranties on all components:\n\n- **30-year warranty** on AE Solar panels (German brand)\n- **5-year warranty** on Solis/Deye inverters\n- **5-year warranty** on LVTOPSUN batteries\n- **2-year warranty** on workmanship',
    keywords: ['warranty', 'guarantee', 'cover', 'protection', 'years', 'guarantee']
  },
  {
    id: 'installation-time',
    question: 'How long does it take to install a solar power system?',
    answer: 'Installation typically takes 1–2 days for residential systems. Larger systems may take longer.',
    keywords: ['install', 'time', 'long', 'take', 'duration', 'days']
  },
  {
    id: 'permits',
    question: 'Are there any permits required for a solar installation?',
    answer: 'For residential installation, permits are not required, but the process varies by location.',
    keywords: ['permit', 'required', 'legal', 'regulation', 'government', 'approval']
  },
  {
    id: 'roof-damage',
    question: 'Will solar panels damage my roof?',
    answer: 'No, properly installed solar panels should not damage your roof. In fact, they can provide additional protection by shielding your roof from direct sunlight and weather elements.',
    keywords: ['damage', 'roof', 'harm', 'installation', 'safety']
  },
  {
    id: 'roof-space',
    question: 'How much roof space do I need for a solar installation?',
    answer: 'For every 3kW system, it requires 8sqm.',
    keywords: ['space', 'roof', 'area', 'size', 'fit', 'square', 'meter']
  },
  {
    id: 'panel-size',
    question: 'How big is a solar panel?',
    answer: 'Sizes of the panels vary on the Wattage, for example, a 600W Solar Panel is around (7.8ft x 3.7ft) 2.4m x 1.1m.',
    keywords: ['size', 'big', 'dimension', 'panel', 'large', 'small']
  },
  {
    id: 'add-panels',
    question: 'Can I add more panels to my system later?',
    answer: 'This depends on the design of the system. It will help if you can tell us about your plans so we can properly recommend a design that is future-proof.',
    keywords: ['add', 'more', 'panels', 'expand', 'upgrade', 'additional']
  },
  {
    id: 'monitoring',
    question: 'Can I monitor my system\'s performance?',
    answer: 'Yes, we provide monitoring solutions that allow you to track your system\'s performance through a mobile app.',
    keywords: ['monitor', 'track', 'performance', 'app', 'data', 'output']
  },
  {
    id: 'component-replacement',
    question: 'What happens if a component of my solar system needs to be replaced?',
    answer: 'If a component under warranty needs replacement, we will handle it in accordance with the warranty terms. If the warranty has expired, we offer discounted pricing on replacement parts and labor.',
    keywords: ['replace', 'component', 'part', 'break', 'damage', 'fix', 'repair']
  },
  {
    id: 'net-metering',
    question: 'What\'s net metering and how does it work?',
    answer: 'Net metering allows you to sell excess energy to your electric company and this will be subtracted on your next bill, effectively reducing your electricity costs.',
    keywords: ['net', 'metering', 'meter', 'sell', 'excess', 'credit', 'bill']
  },
  {
    id: 'payback',
    question: 'What is the payback period?',
    answer: 'The payback period is typically 4-5 years, depending on your energy savings and system cost.',
    keywords: ['payback', 'return', 'roi', 'investment', 'recover', 'cost']
  },
  {
    id: 'battery-need',
    question: 'Do I need a battery for my solar power system?',
    answer: 'Batteries are optional for on-grid systems but essential for hybrid setups, especially if you want backup power during outages or utilize solar energy produced at night.',
    keywords: ['battery', 'need', 'required', 'necessary', 'storage', 'backup']
  },
  {
    id: 'space-requirements',
    question: 'Do I need a lot of space for the set up?',
    answer: 'No, even smaller rooftops can accommodate a system. We can schedule a site visit to assess your available space.',
    keywords: ['space', 'area', 'size', 'small', 'fit', 'enough']
  },
  {
    id: 'service-locations',
    question: 'Do you offer your services in (location)?',
    answer: 'We serve Metro Manila and Central Luzon. Note that prices are for Metro Manila installation only, with additional transport costs for areas outside Metro Manila.',
    keywords: ['service', 'location', 'area', 'serve', 'province', 'city', 'metro manila', 'luzon']
  },
  {
    id: 'brands-used',
    question: 'What brands do you use?',
    answer: 'We use only premium, reliable brands with excellent warranties:\n\n- **Solar Panels**: AE Solar (German brand with 30 years warranty)\n- **Inverters**: Solis or Deye (5 years warranty)\n- **Batteries**: LVTOPSUN (5 years warranty)',
    keywords: ['brand', 'manufacturer', 'make', 'quality', 'panel', 'inverter', 'battery']
  },
  {
    id: 'payment-options',
    question: 'What payment options do you offer?',
    answer: 'We offer multiple payment options to suit your needs:\n\n- **Financing options** (VAT-inclusive)\n- **SRP** (VAT-exclusive)\n- **Cash purchase** (VAT-exclusive) with discounts\n\nOur financing partners include SB Finance and BPI for installment plans.',
    keywords: ['payment', 'options', 'pay', 'cash', 'financing', 'installment', 'discount']
  },
  {
    id: 'smallest-system',
    question: 'What is your smallest system?',
    answer: 'Our smallest system is the **ONG-2K-P1** OnGrid system at 2,320 watts, suitable for monthly bills of ₱2,500 and below. It costs:\n\n- Financing: **₱124,880**\n- SRP: **₱111,500**\n- Cash: **₱104,800**',
    keywords: ['small', 'smallest', 'basic', 'entry', 'starter', 'minimum', 'cheapest']
  },
  {
    id: 'battery-options',
    question: 'What battery options do you offer?',
    answer: 'We offer hybrid systems with either **5.12kWh** or **10.24kWh** LVTOPSUN batteries that come with a 5-year warranty. The battery capacity determines your backup power during outages and nighttime usage capability.',
    keywords: ['battery', 'batteries', 'storage', 'backup', 'capacity', 'power', 'hybrid']
  },
  {
    id: 'system-recommendations',
    question: 'How do I know which system is right for me?',
    answer: 'We recommend systems based on your average monthly bill: ₱2,500-₱4,000 (3.48kW), ₱3,000-₱6,000 (5.8kW), ₱6,000-₱8,000 (8.12kW), ₱8,000-₱10,000 (9.86kW), ₱10,000-₱13,000 (11.6kW), and ₱13,000-₱16,000 (14.5kW).',
    keywords: ['recommend', 'right', 'size', 'choice', 'bill', 'monthly', 'consumption', 'suitable', 'match', 'best']
  },
  {
    id: 'contact-info',
    question: 'How can I contact you?',
    answer: 'You can reach us at our office: 30-C Westbend Arcade, Doña Soledad Ave, Parañaque City. Call us at (02) 8831-7330 or (0960) 471-6968, or visit our website at https://d-tec.asia or email info@d-tec.asia.',
    keywords: ['contact', 'phone', 'number', 'email', 'address', 'website', 'call', 'reach', 'visit']
  },
  {
    id: 'pricing',
    question: 'What are your prices?',
    answer: 'Our prices range from ₱104,800 for a basic 2.32kW OnGrid system to ₱901,600 for a premium 14.5kW Hybrid system with 10.24kWh battery (as of February 2025). Prices depend on system size, type (OnGrid vs Hybrid), and payment method.',
    keywords: ['price', 'cost', 'pricing', 'rates', 'packages', 'fee', 'charge', 'expensive', 'cheap']
  },
  {
    id: 'onGrid-vs-hybrid-cost',
    question: 'What\'s the price difference between OnGrid and Hybrid systems?',
    answer: 'Hybrid systems with batteries cost more than OnGrid systems. For example, a 3.48kW OnGrid system costs ₱143,800 (cash), while the same size Hybrid system with 5.12kWh battery costs ₱260,800 - the premium is for battery and backup power capability.',
    keywords: ['difference', 'price', 'hybrid', 'on-grid', 'cost', 'compare', 'battery', 'compare']
  },
  {
    id: 'packages',
    question: 'What solar packages do you offer?',
    answer: '**OnGrid Systems:**\n\n' +
      '1. **ONG-2K-P1** (2.32kW)\n' +
      '   - For bills around ₱2,500\n' +
      '   - Financing: ₱124,880\n' +
      '   - SRP: ₱111,500\n' +
      '   - Cash: ₱104,800\n\n' +
      '2. **ONG-3K-P1** (3.48kW)\n' +
      '   - For bills ₱2,500-₱4,000\n' +
      '   - Financing: ₱161,280\n' +
      '   - SRP: ₱143,800\n' +
      '   - Cash: ₱135,200\n\n' +
      '3. **ONG-5K-P1** (5.8kW)\n' +
      '   - For bills ₱3,000-₱6,000\n' +
      '   - Financing: ₱268,800\n' +
      '   - SRP: ₱239,800\n' +
      '   - Cash: ₱225,400\n\n' +
      '4. **ONG-8K-P1** (8.12kW)\n' +
      '   - For bills ₱6,000-₱8,000\n' +
      '   - Financing: ₱376,320\n' +
      '   - SRP: ₱335,700\n' +
      '   - Cash: ₱315,500\n\n' +
      '5. **ONG-10K-P1** (9.86kW)\n' +
      '   - For bills ₱8,000-₱10,000\n' +
      '   - Financing: ₱457,120\n' +
      '   - SRP: ₱407,700\n' +
      '   - Cash: ₱383,200\n\n' +
      '6. **ONG-12K-P1** (11.6kW)\n' +
      '   - For bills ₱10,000-₱13,000\n' +
      '   - Financing: ₱537,600\n' +
      '   - SRP: ₱479,800\n' +
      '   - Cash: ₱451,000\n\n' +
      '7. **ONG-15K-P1** (14.5kW)\n' +
      '   - For bills ₱13,000-₱16,000\n' +
      '   - Financing: ₱672,000\n' +
      '   - SRP: ₱599,800\n' +
      '   - Cash: ₱563,800\n\n' +
      '**Hybrid Systems with 5.12kWh Battery:**\n\n' +
      '1. **HYB-3K-P1** (3.48kW)\n' +
      '   - For bills ₱2,500-₱4,000\n' +
      '   - Financing: ₱310,800\n' +
      '   - SRP: ₱277,300\n' +
      '   - Cash: ₱260,800\n\n' +
      '2. **HYB-5K-P1** (5.8kW)\n' +
      '   - For bills ₱3,000-₱6,000\n' +
      '   - Financing: ₱418,320\n' +
      '   - SRP: ₱373,300\n' +
      '   - Cash: ₱351,000\n\n' +
      '3. **HYB-8K-P1** (8.12kW)\n' +
      '   - For bills ₱6,000-₱8,000\n' +
      '   - Financing: ₱525,840\n' +
      '   - SRP: ₱469,300\n' +
      '   - Cash: ₱441,100\n\n' +
      '**Hybrid Systems with 10.24kWh Battery:**\n\n' +
      '1. **HYB-10K-P2** (9.86kW)\n' +
      '   - For bills ₱8,000-₱10,000\n' +
      '   - Financing: ₱756,000\n' +
      '   - SRP: ₱674,800\n' +
      '   - Cash: ₱634,300\n\n' +
      '2. **HYB-12K-P2** (11.6kW)\n' +
      '   - For bills ₱10,000-₱13,000\n' +
      '   - Financing: ₱836,640\n' +
      '   - SRP: ₱746,800\n' +
      '   - Cash: ₱701,900\n\n' +
      '3. **HYB-15K-P2** (14.5kW)\n' +
      '   - For bills ₱13,000-₱16,000\n' +
      '   - Financing: ₱1,073,920\n' +
      '   - SRP: ₱958,700\n' +
      '   - Cash: ₱901,600\n\n' +
      '_Note: Prices are for Metro Manila installation only. Additional transport costs apply for areas outside Metro Manila._\n\n' +
      '**All packages include:**\n' +
      '- ✅ Free site inspection\n' +
      '- ✅ Complete installation\n' +
      '- ✅ 2 years free maintenance\n' +
      '- ✅ Warranties: 30 years for panels, 5 years for inverters/batteries',
    keywords: ['package', 'packages', 'system', 'price', 'cost', 'ongrid', 'hybrid', 'battery', 'solar', 'pricing', 'list', 'all']
  }
]; 