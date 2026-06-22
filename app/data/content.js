export const serviceCategories = [
  {
    id: 'software',
    title: 'Software Development',
    items: ['Web apps', 'Admin dashboards', 'SaaS systems'],
  },
  {
    id: 'mobile',
    title: 'Mobile Development',
    items: ['Android apps', 'iOS apps', 'Cross-platform (Flutter / React Native)'],
  },
  {
    id: 'iot',
    title: 'IoT & Embedded Systems',
    items: [
      'Smart devices',
      'Sensors integration',
      'Automation systems',
      'Arduino / ESP32 solutions',
    ],
  },
  {
    id: 'digital',
    title: 'Digital Services',
    items: ['SEO optimization', 'Social media management', 'UI/UX design', 'Branding'],
  },
];

export const homeServices = [
  {
    title: 'Software Development',
    description: 'Custom web apps, admin dashboards, and scalable SaaS platforms.',
    icon: '01',
  },
  {
    title: 'Mobile Development',
    description: 'Native and cross-platform apps for Android, iOS, and beyond.',
    icon: '02',
  },
  {
    title: 'IoT & Embedded',
    description: 'Smart devices, sensor networks, and ESP32 automation systems.',
    icon: '03',
  },
  {
    title: 'Digital Services',
    description: 'SEO, social media, UI/UX design, and brand identity.',
    icon: '04',
  },
];

export const projects = [
  {
    id: 'smartlink',
    slug: 'smartlink',
    category: 'web',
    title: 'Smartlink Rwanda',
    problem: 'Smartlink needed a modern digital presence to showcase technology services.',
    description:
      'Corporate website for a Rwanda-based technology company — services, portfolio, and contact flows.',
    technologies: ['React', 'Remix', 'Node.js', 'Responsive Design'],
    liveLink: 'https://smartlink.rw/',
    roles: ['UI/UX Design', 'Web Development', 'SEO'],
    featured: true,
  },
  {
    id: 'finverra',
    slug: 'finverra',
    category: 'web',
    title: 'Finverra',
    problem: 'A fintech brand needed a trustworthy platform to present financial products online.',
    description:
      'Fintech company website with product pages, onboarding flows, and a professional brand experience.',
    technologies: ['React', 'Next.js', 'Tailwind CSS', 'API Integration'],
    liveLink: 'https://finverra.co/',
    roles: ['Web Development', 'UI Design', 'Branding'],
    featured: true,
  },
  {
    id: 'shingiro',
    slug: 'shingiro',
    category: 'web',
    title: 'Shingiro — Finverra',
    problem: 'Finverra required a dedicated product landing page for the Shingiro offering.',
    description:
      'Product microsite with feature highlights, pricing sections, and conversion-focused layout.',
    technologies: ['React', 'Next.js', 'Framer Motion', 'CMS'],
    liveLink: 'https://www.shingiro.finverra.co/',
    roles: ['Landing Page', 'UI/UX', 'Development'],
    featured: true,
  },
  {
    id: 'ngenzi-realestate',
    slug: 'ngenzi-realestate',
    category: 'web',
    title: 'Ngenzi Real Estate',
    problem: 'A real estate agency needed to list properties and capture leads online.',
    description:
      'Property listing website with search, gallery views, and inquiry forms for Rwanda real estate.',
    technologies: ['React', 'Node.js', 'PostgreSQL', 'Cloudinary'],
    liveLink: 'https://ngenzirealestate.rw/',
    roles: ['Web Design', 'Full-stack Development'],
    featured: false,
  },
  {
    id: 'rwanda-quest-tours',
    slug: 'rwanda-quest-tours',
    category: 'web',
    title: 'Rwanda Quest Tours',
    problem: 'A tour operator needed an engaging site to promote safari and travel packages.',
    description:
      'Tourism website with package listings, booking inquiries, and immersive photography.',
    technologies: ['React', 'WordPress', 'SEO', 'Responsive Design'],
    liveLink: 'https://rwandaquesttours.com/',
    roles: ['Web Design', 'Development', 'Content Strategy'],
    featured: false,
  },
  {
    id: 'nova-car-rentals',
    slug: 'nova-car-rentals',
    category: 'web',
    title: 'Nova Car Rentals',
    problem: 'A car rental business needed online visibility and a simple booking experience.',
    description:
      'Car rental platform with fleet showcase, pricing, and reservation request forms.',
    technologies: ['React', 'Node.js', 'MySQL', 'Email Integration'],
    liveLink: 'https://novacarrentals.com/',
    roles: ['UI Design', 'Web Development'],
    featured: false,
  },
  {
    id: 'guze-kustomz',
    slug: 'guze-kustomz',
    category: 'web',
    title: 'Guze Kustomz',
    problem: 'A custom automotive brand needed a bold website to showcase their work.',
    description:
      'Automotive customization portfolio with gallery, services, and brand storytelling.',
    technologies: ['React', 'Vite', 'CSS Modules', 'Image Optimization'],
    liveLink: 'https://guzekustomz.com/',
    roles: ['Branding', 'Web Design', 'Development'],
    featured: false,
  },
];

export function getProjectBySlug(slug) {
  return projects.find(project => project.slug === slug);
}

export const testimonials = [
  {
    name: 'Jean-Pierre N.',
    role: 'CEO, AgriTech Rwanda',
    rating: 5,
    quote:
      'EMBEDIXe delivered our IoT monitoring system on time and on budget. Their technical expertise and communication were outstanding.',
  },
  {
    name: 'Sarah M.',
    role: 'Founder, EduStart',
    rating: 5,
    quote:
      'The team built a beautiful, scalable SaaS platform that our users love. Professional from start to finish.',
  },
  {
    name: 'David K.',
    role: 'Operations Manager, Kigali Logistics',
    rating: 5,
    quote:
      'Our admin dashboard transformed how we manage operations. EMBEDIXe understood our needs and delivered beyond expectations.',
  },
];

export const team = [
  {
    name: 'Founder & Lead Engineer',
    role: 'Full-stack, IoT & System Architecture',
    bio: 'Passionate about building smart systems that solve real-world problems across Rwanda and beyond.',
  },
];

export const technologies = [
  'React',
  'Node.js',
  'Flutter',
  'React Native',
  'Python',
  'ESP32',
  'Arduino',
  'AWS',
  'Docker',
  'PostgreSQL',
  'MQTT',
  'Three.js',
];

export const values = [
  { title: 'Innovation', description: 'We push boundaries with modern tech and creative solutions.' },
  { title: 'Quality', description: 'Every line of code and every design detail meets high standards.' },
  {
    title: 'Reliability',
    description: 'We deliver on time, communicate clearly, and stand behind our work.',
  },
];

export const pricingPackages = [
  {
    name: 'Basic Website',
    price: 'From $500',
    description: 'Perfect for startups and small businesses getting online.',
    features: ['Up to 5 pages', 'Responsive design', 'Contact form', 'Basic SEO setup'],
  },
  {
    name: 'Business Website',
    price: 'From $1,500',
    description: 'A professional web presence with advanced features.',
    features: [
      'Up to 15 pages',
      'CMS integration',
      'Analytics setup',
      'Social media integration',
      '3 months support',
    ],
  },
  {
    name: 'Advanced System',
    price: 'From $5,000',
    description: 'Custom web or mobile applications built to scale.',
    features: [
      'Custom development',
      'Admin dashboard',
      'API integration',
      'User authentication',
      '6 months support',
    ],
  },
  {
    name: 'IoT Smart System',
    price: 'Custom quote',
    description: 'End-to-end IoT solutions from sensors to cloud dashboards.',
    features: [
      'Hardware integration',
      'Cloud dashboard',
      'Real-time monitoring',
      'Automation rules',
      'Ongoing maintenance',
    ],
  },
];

export const projectTypes = [
  'Web Application',
  'Mobile Application',
  'IoT / Embedded System',
  'Admin Dashboard',
  'SaaS Platform',
  'UI/UX Design',
  'Other',
];

export const budgetRanges = [
  'Under $1,000',
  '$1,000 – $5,000',
  '$5,000 – $15,000',
  '$15,000+',
  'Not sure yet',
];

export const filterCategories = [
  { label: 'All', value: 'all' },
  { label: 'Web', value: 'web' },
  { label: 'Mobile', value: 'mobile' },
  { label: 'IoT', value: 'iot' },
];
