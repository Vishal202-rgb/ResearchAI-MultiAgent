export const DEMOS = [
  {
    id: 'demo-1',
    title: 'Generative AI in Education',
    objective: 'Analyzing the impact of LLMs on personalized learning and academic integrity.',
    domain: 'EdTech',
    date: '2026-08-15',
    findings: [
      'Generative AI has significantly improved personalized tutoring systems by adapting to individual learning speeds.',
      'A major concern remains academic integrity, prompting a surge in AI-detection software development.',
      'Educators are shifting from traditional essay grading to real-time, interactive assessments.'
    ],
    sources: [
      { title: 'AI in the Classroom', url: 'https://www.edutopia.org/article/ai-education-resources/', publisher: 'Edutopia' },
      { title: 'Generative AI and Education', url: 'https://www.unesco.org/en/digital-education/artificial-intelligence', publisher: 'UNESCO' }
    ]
  },
  {
    id: 'demo-2',
    title: 'AI in Healthcare',
    objective: 'Evaluating AI diagnostic tools and predictive modeling in patient care.',
    domain: 'Healthcare',
    date: '2026-08-18',
    findings: [
      'Machine learning models now outperform standard diagnostic metrics in identifying early-stage tumors from radiology scans.',
      'Predictive analytics are actively reducing hospital readmission rates by identifying high-risk patients before discharge.',
      'Data privacy and regulatory compliance (HIPAA) remain the largest barriers to full AI integration in clinics.'
    ],
    sources: [
      { title: 'AI in Medicine', url: 'https://www.nature.com/articles/s41591-023-02444-3', publisher: 'Nature Medicine' },
      { title: 'Healthcare AI Guidelines', url: 'https://www.who.int/publications/i/item/9789240029200', publisher: 'WHO' }
    ]
  },
  {
    id: 'demo-3',
    title: 'Autonomous AI Agents',
    objective: 'Surveying multi-agent systems and autonomous orchestration frameworks.',
    domain: 'Computer Science',
    date: '2026-08-20',
    findings: [
      'Multi-agent systems using framework structures (like AutoGen) demonstrate higher complex problem-solving rates than single zero-shot models.',
      'Autonomous loops are heavily constrained by context window limits and looping hallucinations.',
      'Enterprise adoption relies heavily on human-in-the-loop oversight for critical decision points.'
    ],
    sources: [
      { title: 'AutoGPT and Autonomous Agents', url: 'https://github.com/Significant-Gravitas/AutoGPT', publisher: 'GitHub' },
      { title: 'The Rise of AI Agents', url: 'https://www.forbes.com/sites/bernardmarr/2023/11/03/the-rise-of-ai-agents/', publisher: 'Forbes' }
    ]
  },
  {
    id: 'demo-4',
    title: 'Climate Change & Renewable Energy',
    objective: 'Tracking investments and breakthroughs in clean energy technology.',
    domain: 'Sustainability',
    date: '2026-08-19',
    findings: [
      'Next-generation solid-state batteries are projecting a 40% increase in energy density over standard lithium-ion.',
      'Global investment in solar infrastructure surpassed fossil fuel investments for the first time in Q1 2026.',
      'Grid modernization using AI routing is proving essential to handle fluctuating renewable generation.'
    ],
    sources: [
      { title: 'Renewable Energy Outlook', url: 'https://www.iea.org/reports/renewable-energy-market-update-june-2023', publisher: 'IEA' },
      { title: 'Climate Tech Trends', url: 'https://www.technologyreview.com/topic/climate-change/', publisher: 'MIT Tech Review' }
    ]
  },
  {
    id: 'demo-5',
    title: 'Cybersecurity in 2026',
    objective: 'Assessing zero-trust architectures and AI-driven threat detection.',
    domain: 'Security',
    date: '2026-08-21',
    findings: [
      'Zero-trust network access (ZTNA) is now the foundational standard for 80% of enterprise environments.',
      'AI-driven behavioral threat detection has reduced average intrusion discovery times from days to minutes.',
      'Social engineering attacks powered by deepfakes are the fastest-growing vulnerability vector.'
    ],
    sources: [
      { title: 'AI in Cybersecurity', url: 'https://www.cisa.gov/ai', publisher: 'CISA' },
      { title: 'Zero Trust Security', url: 'https://www.nist.gov/publications/zero-trust-architecture', publisher: 'NIST' }
    ]
  },
  {
    id: 'demo-6',
    title: 'AI-Powered Software Development',
    objective: 'Impact of AI coding assistants on developer productivity and code quality.',
    domain: 'Software Engineering',
    date: '2026-08-10',
    findings: [
      'Code assistants increase boiler-plate generation speed by up to 55% for intermediate developers.',
      'Organizations are noticing a slight increase in technical debt due to unreviewed AI-generated code snippets.',
      'Shift-left security testing is becoming critical as AI models sometimes inadvertently reproduce vulnerable legacy patterns.'
    ],
    sources: [
      { title: 'GitHub Copilot Impact', url: 'https://github.blog/2022-09-07-research-quantifying-github-copilots-impact-on-developer-productivity-and-happiness/', publisher: 'GitHub Blog' },
      { title: 'AI Code Generation', url: 'https://arxiv.org/abs/2107.03374', publisher: 'arXiv' }
    ]
  },
  {
    id: 'demo-7',
    title: 'Quantum Computing & AI',
    objective: 'Exploring the intersection of quantum algorithms and machine learning.',
    domain: 'Quantum Computing',
    date: '2026-08-05',
    findings: [
      'Quantum Support Vector Machines (QSVM) are showing theoretical exponential speedups for specific high-dimensional classification tasks.',
      'Noise (decoherence) remains the primary bottleneck for practical Quantum Machine Learning implementation.',
      'Hybrid classical-quantum algorithms (like QAOA) are the most promising near-term approach for optimization problems.'
    ],
    sources: [
      { title: 'Quantum Machine Learning', url: 'https://www.nature.com/articles/s41586-019-1533-3', publisher: 'Nature' },
      { title: 'IBM Quantum', url: 'https://www.ibm.com/quantum', publisher: 'IBM' }
    ]
  },
  {
    id: 'demo-8',
    title: 'Future of Remote Work',
    objective: 'Analyzing long-term trends in asynchronous work and digital collaboration tools.',
    domain: 'Business & HR',
    date: '2026-08-01',
    findings: [
      'Strict asynchronous communication protocols lead to a 30% reduction in meeting fatigue.',
      'Companies mandating full return-to-office (RTO) are experiencing significantly higher attrition rates among senior talent.',
      'Virtual HQ platforms are seeing rapid adoption to combat remote worker isolation.'
    ],
    sources: [
      { title: 'State of Remote Work', url: 'https://buffer.com/state-of-remote-work', publisher: 'Buffer' },
      { title: 'Future of Work Report', url: 'https://www.mckinsey.com/featured-insights/future-of-work', publisher: 'McKinsey' }
    ]
  },
  {
    id: 'demo-9',
    title: 'Generative AI in Business',
    objective: 'Enterprise adoption, ROI, and risk management of large language models.',
    domain: 'Enterprise IT',
    date: '2026-07-28',
    findings: [
      'Customer service and marketing are the two highest-ROI departments for early Generative AI adoption.',
      'Enterprises are aggressively pivoting to self-hosted or strictly partitioned models to protect proprietary data.',
      'Measuring direct ROI remains challenging due to the qualitative nature of productivity improvements.'
    ],
    sources: [
      { title: 'Enterprise Generative AI', url: 'https://www.gartner.com/en/topics/generative-ai', publisher: 'Gartner' },
      { title: 'AI ROI in Business', url: 'https://hbr.org/2023/11/how-to-measure-the-roi-of-your-ai-initiatives', publisher: 'HBR' }
    ]
  }
];
