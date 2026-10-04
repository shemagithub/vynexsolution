  export const seedData = {
    projects: [
      {
        slug: 'smartlink',
        category: 'web',
        title: 'Smartlink Rwanda',
        problem: 'Smartlink needed a modern digital presence to showcase technology services.',
        description:
          'Corporate website for a Rwanda-based technology company — services, portfolio, and contact flows.',
        technologies: ['React', 'Remix', 'Node.js', 'Responsive Design'],
        live_link: 'https://smartlink.rw/',
        roles: ['UI/UX Design', 'Web Development', 'SEO'],
        featured: true,
        sort_order: 1,
      },
      {
        slug: 'finverra',
        category: 'web',
        title: 'Finverra',
        problem: 'A fintech brand needed a trustworthy platform to present financial products online.',
        description:
          'Fintech company website with product pages, onboarding flows, and a professional brand experience.',
        technologies: ['React', 'Next.js', 'Tailwind CSS', 'API Integration'],
        live_link: 'https://finverra.co/',
        roles: ['Web Development', 'UI Design', 'Branding'],
        featured: true,
        sort_order: 2,
      },
      {
        slug: 'shingiro',
        category: 'web',
        title: 'Shingiro — Finverra',
        problem: 'Finverra required a dedicated product landing page for the Shingiro offering.',
        description:
          'Product microsite with feature highlights, pricing sections, and conversion-focused layout.',
        technologies: ['React', 'Next.js', 'Framer Motion', 'CMS'],
        live_link: 'https://www.shingiro.finverra.co/',
        roles: ['Landing Page', 'UI/UX', 'Development'],
        featured: true,
        sort_order: 3,
      },
      {
        slug: 'ngenzi-realestate',
        category: 'web',
        title: 'Ngenzi Real Estate',
        problem: 'A real estate agency needed to list properties and capture leads online.',
        description:
          'Property listing website with search, gallery views, and inquiry forms for Rwanda real estate.',
        technologies: ['React', 'Node.js', 'PostgreSQL', 'Cloudinary'],
        live_link: 'https://ngenzirealestate.rw/',
        roles: ['Web Design', 'Full-stack Development'],
        featured: false,
        sort_order: 4,
      },
      {
        slug: 'rwanda-quest-tours',
        category: 'web',
        title: 'Rwanda Quest Tours',
        problem: 'A tour operator needed an engaging site to promote safari and travel packages.',
        description:
          'Tourism website with package listings, booking inquiries, and immersive photography.',
        technologies: ['React', 'WordPress', 'SEO', 'Responsive Design'],
        live_link: 'https://rwandaquesttours.com/',
        roles: ['Web Design', 'Development', 'Content Strategy'],
        featured: false,
        sort_order: 5,
      },
      {
        slug: 'nova-car-rentals',
        category: 'web',
        title: 'Nova Car Rentals',
        problem: 'A car rental business needed online visibility and a simple booking experience.',
        description:
          'Car rental platform with fleet showcase, pricing, and reservation request forms.',
        technologies: ['React', 'Node.js', 'MySQL', 'Email Integration'],
        live_link: 'https://novacarrentals.com/',
        roles: ['UI Design', 'Web Development'],
        featured: false,
        sort_order: 6,
      },
      {
        slug: 'guze-kustomz',
        category: 'web',
        title: 'Guze Kustomz',
        problem: 'A custom automotive brand needed a bold website to showcase their work.',
        description:
          'Automotive customization portfolio with gallery, services, and brand storytelling.',
        technologies: ['React', 'Vite', 'CSS Modules', 'Image Optimization'],
        live_link: 'https://guzekustomz.com/',
        roles: ['Branding', 'Web Design', 'Development'],
        featured: false,
        sort_order: 7,
      },
    ],
    serviceCategories: [
      {
        slug: 'software',
        title: 'Website & Software Development',
        items: [
          'Website development',
          'Custom web applications',
          'Systems design & SaaS platforms',
          'Admin dashboards',
        ],
        sort_order: 1,
      },
      {
        slug: 'mobile',
        title: 'Mobile App Development',
        items: ['Android apps', 'iOS apps', 'Cross-platform (Flutter / React Native)'],
        sort_order: 2,
      },
      {
        slug: 'iot',
        title: 'IoT, Embedded & Smart Systems',
        items: [
          'Smart devices',
          'Sensors integration',
          'Automation systems',
          'Arduino / ESP32 solutions',
        ],
        sort_order: 3,
      },
      {
        slug: 'digital',
        title: 'Digital Services & SEO',
        items: ['SEO optimization', 'Social media management', 'UI/UX design', 'Branding'],
        sort_order: 4,
      },
    ],
    homeServices: [
      {
        title: 'Website & Web Development',
        description:
          'Custom websites, web apps, and systems design for businesses that need a modern digital presence.',
        icon: '01',
        sort_order: 1,
      },
      {
        title: 'Mobile App Development',
        description: 'Native and cross-platform apps for Android, iOS, and beyond.',
        icon: '02',
        sort_order: 2,
      },
      {
        title: 'IoT & Smart Systems',
        description: 'Connected devices, sensor networks, automation, and embedded solutions.',
        icon: '03',
        sort_order: 3,
      },
      {
        title: 'SEO & Digital Services',
        description: 'Search visibility, social media, UI/UX design, and brand identity.',
        icon: '04',
        sort_order: 4,
      },
    ],
    articles: [
      {
        slug: 'building-reliable-iot-systems',
        title: 'Building reliable IoT systems in Rwanda',
        abstract:
          'How we design sensor networks, connectivity, and dashboards that stay online in real-world conditions.',
        content:
          'At Vynex Solutions, IoT projects succeed when hardware, connectivity, and software are designed together.\n\nWe start with the physical constraints — power, range, and environment — then map them to ESP32 or Arduino devices, MQTT messaging, and a cloud dashboard your team can trust.\n\nThe result is monitoring and automation that works on site, not only in the lab.',
        published: true,
        featured: true,
        created_at: '2026-03-12T10:00:00.000Z',
      },
      {
        slug: 'from-idea-to-launch-web-apps',
        title: 'From idea to launch: shipping web apps faster',
        abstract:
          'A practical delivery approach for startups and growing businesses that need a polished product, not just a prototype.',
        content:
          'Speed matters, but so does clarity. Our process moves from discovery to design, then into iterative development with weekly demos.\n\nWe prioritize the flows that drive revenue or operations first — auth, dashboards, payments, or lead capture — and keep the rest modular so you can grow without rewriting everything.\n\nThat is how we ship websites and SaaS products that feel finished on day one.',
        published: true,
        featured: false,
        created_at: '2026-02-04T10:00:00.000Z',
      },
    ],
    testimonials: [
      { name: 'Jean-Pierre N.', role: 'CEO, AgriTech Rwanda', rating: 5, quote: 'Vynex Solutions delivered our IoT monitoring system on time and on budget. Their technical expertise and communication were outstanding.', sort_order: 1 },
      { name: 'Sarah M.', role: 'Founder, EduStart', rating: 5, quote: 'The team built a beautiful, scalable SaaS platform that our users love. Professional from start to finish.', sort_order: 2 },
      { name: 'David K.', role: 'Operations Manager, Kigali Logistics', rating: 5, quote: 'Our admin dashboard transformed how we manage operations. Vynex Solutions understood our needs and delivered beyond expectations.', sort_order: 3 },
    ],
    pricingPackages: [
      { name: 'Basic Website', price: 'From $500', description: 'Perfect for startups and small businesses getting online.', features: ['Up to 5 pages', 'Responsive design', 'Contact form', 'Basic SEO setup'], sort_order: 1 },
      { name: 'Business Website', price: 'From $1,500', description: 'A professional web presence with advanced features.', features: ['Up to 15 pages', 'CMS integration', 'Analytics setup', 'Social media integration', '3 months support'], sort_order: 2 },
      { name: 'Advanced System', price: 'From $5,000', description: 'Custom web or mobile applications built to scale.', features: ['Custom development', 'Admin dashboard', 'API integration', 'User authentication', '6 months support'], sort_order: 3 },
      { name: 'IoT Smart System', price: 'Custom quote', description: 'End-to-end IoT solutions from sensors to cloud dashboards.', features: ['Hardware integration', 'Cloud dashboard', 'Real-time monitoring', 'Automation rules', 'Ongoing maintenance'], sort_order: 4 },
    ],
    teamMembers: [
      { name: 'Founder & Lead Engineer', role: 'Full-stack, IoT & System Architecture', bio: 'Passionate about building smart systems that solve real-world problems across Rwanda and beyond.', sort_order: 1 },
    ],
    technologies: ['React', 'Node.js', 'Flutter', 'React Native', 'Python', 'ESP32', 'Arduino', 'AWS', 'Docker', 'PostgreSQL', 'MQTT', 'Three.js'],
    values: [
      { title: 'Innovation', description: 'We push boundaries with modern tech and creative solutions.', sort_order: 1 },
      { title: 'Quality', description: 'Every line of code and every design detail meets high standards.', sort_order: 2 },
      { title: 'Reliability', description: 'We deliver on time, communicate clearly, and stand behind our work.', sort_order: 3 },
    ],
    projectTypes: ['Web Application', 'Mobile Application', 'IoT / Embedded System', 'Admin Dashboard', 'SaaS Platform', 'UI/UX Design', 'Other'],
    budgetRanges: ['Under $1,000', '$1,000 – $5,000', '$5,000 – $15,000', '$15,000+', 'Not sure yet'],
    aboutPage: {
      headerTitle: 'About Vynex Solutions',
      headerDescription:
        'We exist to help businesses in Rwanda and beyond leverage technology — from web and mobile apps to IoT and smart automation systems.',
      story:
        'Vynex Solutions was founded with a simple belief: every business deserves access to world-class technology. Based in Kigali, Rwanda, we started as a small team passionate about software and connected systems. Today, we deliver complete digital solutions — from responsive websites to IoT-powered smart systems.',
      mission:
        'Empower businesses with innovative, reliable technology solutions that drive growth and efficiency.',
      vision: "Become East Africa's leading tech agency for web, mobile, and IoT solutions.",
      home: {
        title: 'About Vynex Solutions',
        tagLabel: 'Who we are',
        paragraph1:
          'Vynex Solutions is a tech agency based in Kigali, Rwanda. We build web applications, mobile apps, IoT systems, and smart automation solutions for businesses that want to innovate and grow. From startups to established companies, we turn ideas into reliable, scalable products.',
        paragraph2:
          'Our team combines software engineering, embedded systems expertise, and digital strategy to deliver end-to-end solutions.',
        image: '',
        imageLarge: '',
        imageAlt: 'Vynex Solutions team working on a project',
      },
    },
    siteSettings: {
      name: 'Vynex Solutions',
      role: 'We build',
      disciplines: ['Web', 'Mobile', 'IoT', 'Smart Systems'],
      url: 'https://vynexsoultions.com',
      email: 'info@vynexsoultions.com',
      phone: '+250788000000',
      whatsapp: '+250788000000',
      location: 'Kigali, Rwanda',
      github: 'vynexsolutions',
      linkedin: 'vynex-solutions',
      instagram: 'vynexsolutions',
      logoLight: '/logo-mark.png',
      logoDark: '/logo-mark.png',
    },
  };
