
import { Article, Category, Video } from './types.ts';

export const CATEGORIES: Category[] = [
  'For You',
  'Trending',
  'Technology',
  'Politics',
  'Health',
  'Football',
  'Lifestyle',
  'Sports',
  'Food',
  'Business',
  'Science',
  'Education',
  'Entertainment',
  'Videos',
  'Bookmarks'
];

export const MOCK_VIDEOS: Video[] = [
  {
    id: 'v1',
    title: 'Top 5 Tech Gadgets of 2024',
    type: 'youtube',
    url: 'dQw4w9WgXcQ', 
    views: 15400,
    likes: 1200
  },
  {
    id: 'v2',
    title: 'Amazing Drone Footage of Nature',
    type: 'upload',
    url: 'https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4',
    thumbnail: 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?auto=format&fit=crop&w=400&h=700&q=80',
    views: 8900,
    likes: 540
  },
  {
    id: 'v3',
    title: 'Quick Recipe: 5 Minute Pasta',
    type: 'youtube',
    url: 'M7lc1UVf-VE',
    views: 32000,
    likes: 4500
  }
];

export const MOCK_ARTICLES: Article[] = [
  {
    id: 'health-1',
    title: 'The Future of Longevity: 5 Daily Habits for a 100-Year Life',
    subject: 'PREVENTATIVE MEDICINE',
    summary: 'New research suggests that micro-habits in our 30s and 40s significantly determine cognitive health in our later decades.',
    content: `
      <p>Scientists at the Global Health Institute have released a comprehensive study tracking over 50,000 individuals over three decades. Their findings suggest that longevity is less about genetics and more about "metabolic consistency."</p>
      <p>The study highlights five key areas: high-intensity interval movement, consistent circadian sleep cycles, fermented food intake, cognitive cross-training, and deep social connectivity. "We're seeing that even ten minutes of purposeful movement can flip biological switches that suppress inflammation," says Dr. Aris Thorne.</p>
    `,
    category: 'Health',
    author: 'Dr. Sarah Chen',
    imageUrl: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&w=1600&h=900&q=80',
    publishedAt: new Date().toISOString(),
    tags: ['Longevity', 'Wellness', 'Science'],
    views: 12500,
    likes: 840,
    comments: 12,
    userComments: [],
    isBreaking: true,
  },
  {
    id: 'health-2',
    title: 'Mental Health in the Digital Age: The "Deep Focus" Method',
    subject: 'NEUROLOGICAL WELLNESS',
    summary: 'As digital distractions reach an all-time high, psychologists are prescribing "analog hours" to combat rising anxiety levels.',
    content: `
      <p>In a world of constant notifications, our brains are losing the ability to enter "Flow State." New clinical trials show that spending just 60 minutes a day in a purely analog environment—no screens, no digital audio—can reduce cortisol levels by up to 30%.</p>
      <p>The "Deep Focus" method involves physical books, handwritten notes, and silent observation. Psychologists argue this isn't just about productivity; it's a vital health requirement for the modern nervous system.</p>
    `,
    category: 'Health',
    author: 'Julian Vance',
    imageUrl: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&w=1600&h=900&q=80',
    publishedAt: new Date().toISOString(),
    tags: ['Mental Health', 'Focus', 'Brain'],
    views: 9200,
    likes: 420,
    comments: 8,
    userComments: [],
  },
  {
    id: 'football-1',
    title: 'Champions League Drama: Underdogs Secure Historic Quarter-Final Spot',
    subject: 'EUROPEAN FOOTBALL',
    summary: 'In a match that will be remembered for decades, the league minnows overcame a 3-goal deficit to shock the giants.',
    content: `
      <p>Pure football magic was witnessed last night at the Allianz Arena. Against all odds, the visiting underdogs overturned a massive deficit with a hat-trick in the final fifteen minutes of play.</p>
      <p>The manager's tactical switch to a high-pressing 3-4-3 system confused the veteran defenders of the home side. "We believed when nobody else did," the captain remarked during the emotional post-match interview. The streets of the home city are currently flooded with celebrating fans.</p>
    `,
    category: 'Football',
    author: 'Marco Rossi',
    imageUrl: 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?auto=format&fit=crop&w=1600&h=900&q=80',
    publishedAt: new Date().toISOString(),
    tags: ['Champions League', 'Football', 'Shock'],
    views: 45000,
    likes: 3200,
    comments: 156,
    userComments: [],
    isBreaking: true,
  },
  {
    id: 'football-2',
    title: 'Transfer Window Update: The $200M Secret Clause revealed',
    subject: 'MARKET UPDATES',
    summary: 'A leaked document suggests the star striker has a unique performance-based exit clause active this summer.',
    content: `
      <p>The football transfer market is bracing for a seismic shift. Documents obtained by Big News reveal a complex $200M release clause in the contract of the world's most sought-after forward. The clause, previously thought to be dormant, is actually active based on goal-to-game ratios.</p>
      <p>Three major clubs—Real Madrid, Manchester City, and PSG—are reportedly preparing formal bids that meet the valuation. The player's agent declined to comment, but sources close to the deal suggest a move is "imminent."</p>
    `,
    category: 'Football',
    author: 'Elena Moretti',
    imageUrl: 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&w=1600&h=900&q=80',
    publishedAt: new Date().toISOString(),
    tags: ['Transfers', 'Football News', 'Big Deals'],
    views: 67000,
    likes: 5600,
    comments: 245,
    userComments: [],
  },
  {
    id: 'tech-1',
    title: 'Quantum Advantage Achieved by Mova AI Labs',
    subject: 'AI BREAKTHROUGH',
    summary: 'The new neural processor can perform calculations in seconds that take traditional supercomputers years.',
    content: `
      <p>Mova AI Labs has announced a historic breakthrough in quantum computing architecture. Their new "Neuron-Q" chip successfully simulated a complex protein folding sequence with 99.9% accuracy, marking a major milestone in AI development.</p>
      <p>This technology is expected to power the next generation of Big News algorithms, allowing for even more precise content personalization and real-time verification of global events.</p>
    `,
    category: 'Technology',
    author: 'Sarah Jenkins',
    imageUrl: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?auto=format&fit=crop&w=1600&h=900&q=80',
    publishedAt: new Date(Date.now() - 86400000).toISOString(),
    tags: ['AI', 'Quantum', 'Mova AI'],
    views: 12500,
    likes: 840,
    comments: 2,
    userComments: [],
    isBreaking: false,
  }
];
