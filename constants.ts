
import { Article, Category, Video } from './types';

export const CATEGORIES: Category[] = [
  'For You',
  'Technology',
  'Politics',
  'Health',
  'Lifestyle',
  'Sports',
  'Food',
  'Business',
  'Science',
  'Entertainment',
  'Videos'
];

export const MOCK_VIDEOS: Video[] = [
  {
    id: 'v1',
    title: 'Top 5 Tech Gadgets of 2024',
    type: 'youtube',
    url: 'dQw4w9WgXcQ', // Placeholder ID
    views: 15400,
    likes: 1200
  },
  {
    id: 'v2',
    title: 'Amazing Drone Footage of Nature',
    type: 'upload',
    url: 'https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4',
    thumbnail: 'https://picsum.photos/400/700?random=20',
    views: 8900,
    likes: 540
  },
  {
    id: 'v3',
    title: 'Quick Recipe: 5 Minute Pasta',
    type: 'youtube',
    url: 'M7lc1UVf-VE', // Placeholder ID
    views: 32000,
    likes: 4500
  }
];

export const MOCK_ARTICLES: Article[] = [
  {
    id: 'founder-story',
    title: 'Meet the Visionary Developer Behind Big News',
    summary: 'The founder of Big News and CEO of Mova AI is redefining how the world consumes information.',
    content: `
      <p><strong>Exclusive Interview</strong> — In a world saturated with information, one developer dared to reimagine how we consume news. Meet the founder of Big News, a visionary tech leader who turned a simple idea into a global platform.</p>
      <p>"Our goal was never just to aggregate headlines," says the founder, pictured in his high-rise office overlooking the city skyline. "It was to create an ecosystem where technology helps users cut through the noise to find the stories that truly matter."</p>
      <p>With a background in advanced machine learning and a passion for journalism, he built Big News from the ground up. The platform now serves millions of users, offering personalized feeds and real-time updates powered by cutting-edge algorithms.</p>
      <p>Also serving as the CEO of <strong>Mova AI</strong>, his dual expertise in artificial intelligence and media technology places Big News at the forefront of the industry's evolution. "We are just getting started," he adds, hinting at new features coming later this year.</p>
    `,
    category: 'Technology',
    author: 'Big News Staff',
    // Using a professional placeholder that matches the description (Man in suit, office, skyline)
    imageUrl: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?ixlib=rb-4.0.3&auto=format&fit=crop&w=1600&q=80',
    publishedAt: new Date().toISOString(),
    tags: ['Founder', 'Technology', 'Innovation', 'Leadership', 'Mova AI'],
    views: 250000,
    likes: 15400,
    comments: 230,
    userComments: [],
    isBreaking: true, // This ensures it appears in the sliding banner
  },
  {
    id: '1',
    title: 'The Future of Quantum Computing',
    summary: 'Scientists make a breakthrough in stable qubits, paving the way for faster processing.',
    content: `
      <p>In a groundbreaking development, researchers have successfully demonstrated a new method for stabilizing qubits at room temperature. This achievement could significantly accelerate the timeline for commercially viable quantum computers.</p>
      <p>"This is the holy grail we've been searching for," said Dr. Elena Rostova, lead physicist on the project. The team used a novel diamond lattice structure to shield the qubits from environmental noise.</p>
      <p>Tech giants are already racing to license the technology, with experts predicting prototype consumer devices within the decade.</p>
    `,
    category: 'Technology',
    author: 'Sarah Jenkins',
    imageUrl: 'https://picsum.photos/800/600?random=1',
    publishedAt: new Date(Date.now() - 86400000).toISOString(),
    tags: ['Quantum Physics', 'Innovation', 'Future Tech'],
    views: 12500,
    likes: 840,
    comments: 2,
    userComments: [
      { 
        id: 'c1', 
        userId: 'user1',
        user: 'TechEnthusiast', 
        text: 'This is incredible news for the industry!', 
        date: new Date(Date.now() - 80000000).toISOString() 
      },
      { 
        id: 'c2', 
        userId: 'user2',
        user: 'DevOps_Dan', 
        text: 'I wonder how this handles error correction rates?', 
        date: new Date(Date.now() - 70000000).toISOString() 
      }
    ],
    isBreaking: false,
    linkedVideoId: 'v1'
  },
  {
    id: '2',
    title: 'Top 10 Street Foods to Try in Tokyo',
    summary: 'A culinary journey through the bustling streets of Japan\'s capital.',
    content: `
      <p>Tokyo is a paradise for food lovers, and its street food scene is no exception. From sizzling Yakitori to fluffy Taiyaki, the options are endless.</p>
      <p>Our top pick is the classic Takoyaki – battered octopus balls topped with bonito flakes and savory sauce. Best enjoyed piping hot from a street vendor in Osaka or Tokyo.</p>
      <p>Don't forget to try the Matcha soft serve for dessert!</p>
    `,
    category: 'Food',
    author: 'Kenji Tanaka',
    imageUrl: 'https://picsum.photos/800/600?random=2',
    publishedAt: new Date(Date.now() - 172800000).toISOString(),
    tags: ['Japan', 'Travel', 'Street Food', 'Culinary'],
    views: 8900,
    likes: 1205,
    comments: 1,
    userComments: [
       { 
         id: 'c3', 
         userId: 'user3',
         user: 'TravelBug', 
         text: 'Takoyaki is my absolute favorite!', 
         date: new Date(Date.now() - 100000000).toISOString() 
       }
    ],
    isBreaking: false,
  },
  {
    id: '3',
    title: 'Championship Finals: A Historic Comeback',
    summary: 'The underdogs secured a victory in the final minutes of the game.',
    content: `
      <p>It was a match for the history books. Down by two goals at halftime, the City United team rallied together to pull off a stunning 3-2 victory.</p>
      <p>Striker Marcus Dean scored the winning goal in the 89th minute, sending the crowd into a frenzy. "We never stopped believing," Dean said in the post-match interview.</p>
    `,
    category: 'Sports',
    author: 'Mike Ross',
    imageUrl: 'https://picsum.photos/800/600?random=3',
    publishedAt: new Date(Date.now() - 43200000).toISOString(),
    tags: ['Football', 'Championship', 'Victory', 'Sports'],
    views: 45000,
    likes: 3200,
    comments: 0,
    userComments: [],
    isBreaking: false, // Changed from true to false so the founder story takes precedence in single-item banners
  },
  {
    id: '4',
    title: 'Mars Colonization: Are We Ready?',
    summary: 'Space agencies discuss the psychological and physical challenges of long-term space travel.',
    content: '<p>As the race to Mars heats up, experts warn that the biggest hurdle might not be the rocket technology, but the human mind. Isolation, radiation, and gravity shifts pose serious risks.</p>',
    category: 'Science',
    author: 'Dr. Alan Grant',
    imageUrl: 'https://picsum.photos/800/600?random=4',
    publishedAt: new Date(Date.now() - 200000000).toISOString(),
    tags: ['Space', 'Mars', 'Future'],
    views: 15000,
    likes: 900,
    comments: 0,
    userComments: [],
    isBreaking: false,
  },
  {
    id: '5',
    title: 'Global Markets Rally on Tech Earnings',
    summary: 'Major indices hit all-time highs as tech giants report record quarterly profits.',
    content: '<p>Wall Street saw green across the board today as the "Big Five" tech companies smashed earnings expectations. Investors are optimistic about the continued growth of AI-driven services.</p>',
    category: 'Business',
    author: 'Amanda Sterling',
    imageUrl: 'https://picsum.photos/800/600?random=5',
    publishedAt: new Date(Date.now() - 10000000).toISOString(),
    tags: ['Finance', 'Stock Market', 'Economy'],
    views: 8000,
    likes: 450,
    comments: 0,
    userComments: [],
    isBreaking: false,
  },
  {
    id: '6',
    title: 'Review: The Latest Superhero Blockbuster',
    summary: 'Does the new cinematic universe installment live up to the hype? Our critic weighs in.',
    content: '<p>Visually stunning but narratively thin, the latest superhero flick offers plenty of explosions but lacks the emotional depth of its predecessors.</p>',
    category: 'Entertainment',
    author: 'Roger Ebert Jr.',
    imageUrl: 'https://picsum.photos/800/600?random=6',
    publishedAt: new Date(Date.now() - 50000000).toISOString(),
    tags: ['Movies', 'Hollywood', 'Review'],
    views: 22000,
    likes: 1500,
    comments: 0,
    userComments: [],
    isBreaking: false,
  },
  {
    id: '7',
    title: 'The Perfect Sourdough: A Beginner Guide',
    summary: 'Master the art of fermentation with this simple step-by-step guide.',
    content: '<p>Flour, water, salt, and time. That is all you need to create bakery-quality bread at home. We break down the hydration percentages for you.</p>',
    category: 'Food',
    author: 'Julia Childs',
    imageUrl: 'https://picsum.photos/800/600?random=7',
    publishedAt: new Date(Date.now() - 300000000).toISOString(),
    tags: ['Baking', 'Recipes', 'Sourdough'],
    views: 5600,
    likes: 300,
    comments: 0,
    userComments: [],
    isBreaking: false,
  },
  {
    id: '8',
    title: 'New EV Battery Technology Unveiled',
    summary: 'Range anxiety might become a thing of the past with this new solid-state battery.',
    content: '<p>Automakers are buzzing about a new solid-state battery prototype that promises 1000km of range on a single charge and charges in under 10 minutes.</p>',
    category: 'Technology',
    author: 'Elon T.',
    imageUrl: 'https://picsum.photos/800/600?random=8',
    publishedAt: new Date(Date.now() - 90000000).toISOString(),
    tags: ['EV', 'Cars', 'Green Energy'],
    views: 34000,
    likes: 2100,
    comments: 0,
    userComments: [],
    isBreaking: false,
  },
  {
    id: '9',
    title: 'Local Team Wins Charity Tournament',
    summary: 'Community spirit shines as local athletes raise millions for charity.',
    content: '<p>It was more than just a game. The annual charity match raised over $2 million for local hospitals, with the home team securing a friendly victory.</p>',
    category: 'Sports',
    author: 'Dan Patrick',
    imageUrl: 'https://picsum.photos/800/600?random=9',
    publishedAt: new Date(Date.now() - 60000000).toISOString(),
    tags: ['Charity', 'Community', 'Sports'],
    views: 4200,
    likes: 800,
    comments: 0,
    userComments: [],
    isBreaking: false,
  },
  {
    id: '10',
    title: 'Meditation Apps: Do They Work?',
    summary: 'A scientific look at the benefits of digital mindfulness tools.',
    content: '<p>With stress levels at an all-time high, many are turning to apps for relief. Studies show that even 10 minutes a day can lower cortisol levels.</p>',
    category: 'Science',
    author: 'Dr. Phil',
    imageUrl: 'https://picsum.photos/800/600?random=10',
    publishedAt: new Date(Date.now() - 400000000).toISOString(),
    tags: ['Health', 'Mental Health', 'Tech'],
    views: 11000,
    likes: 670,
    comments: 0,
    userComments: [],
    isBreaking: false,
  },
  {
    id: '11',
    title: 'Startup Unicorns of 2025',
    summary: 'Which companies are poised to hit the billion-dollar valuation mark this year?',
    content: '<p>Fintech and Biotech dominate the list of potential unicorns this year, showing where venture capital is flowing in a post-pandemic economy.</p>',
    category: 'Business',
    author: 'Mark Cuban',
    imageUrl: 'https://picsum.photos/800/600?random=11',
    publishedAt: new Date(Date.now() - 120000000).toISOString(),
    tags: ['Startups', 'Investing', 'Money'],
    views: 19500,
    likes: 890,
    comments: 0,
    userComments: [],
    isBreaking: false,
  },
  {
    id: '12',
    title: 'Hidden Gems of Italy',
    summary: 'Beyond Rome and Venice: Exploring the quiet countryside.',
    content: '<p>Tuscany is beautiful, but have you visited Umbria? We explore the hilltop towns that tourists often miss.</p>',
    category: 'For You', 
    author: 'Rick Steves',
    imageUrl: 'https://picsum.photos/800/600?random=12',
    publishedAt: new Date(Date.now() - 600000000).toISOString(),
    tags: ['Travel', 'Italy', 'Europe'],
    views: 7800,
    likes: 540,
    comments: 0,
    userComments: [],
    isBreaking: false,
  },
  {
    id: '13',
    title: 'New Policy Shifts for Clean Energy',
    summary: 'Legislators propose ambitious new targets for renewable energy adoption by 2030.',
    content: '<p>In a late-night session, the committee outlined a bold framework to subsidize solar and wind projects, aiming to reduce carbon emissions by 40%.</p>',
    category: 'Politics',
    author: 'Sarah Connor',
    imageUrl: 'https://picsum.photos/800/600?random=13',
    publishedAt: new Date(Date.now() - 12000000).toISOString(),
    tags: ['Politics', 'Energy', 'Policy'],
    views: 14200,
    likes: 630,
    comments: 12,
    userComments: [],
    isBreaking: false,
  },
  {
    id: '14',
    title: '5 Habits for a Better Morning Routine',
    summary: 'Transform your day by starting it right with these simple lifestyle tweaks.',
    content: '<p>Ditching the phone for the first 30 minutes and drinking a glass of water can significantly improve your focus and energy levels throughout the day.</p>',
    category: 'Lifestyle',
    author: 'Jenny Wellness',
    imageUrl: 'https://picsum.photos/800/600?random=14',
    publishedAt: new Date(Date.now() - 25000000).toISOString(),
    tags: ['Lifestyle', 'Wellness', 'Health'],
    views: 9800,
    likes: 1100,
    comments: 5,
    userComments: [],
    isBreaking: false,
  },
  {
    id: '15',
    title: 'The Benefits of Mediterranean Diet',
    summary: 'New study confirms that this diet significantly improves heart health.',
    content: '<p>Researchers have found that adhering to a Mediterranean diet rich in olive oil, nuts, and vegetables can lower the risk of cardiovascular disease by 30%.</p>',
    category: 'Health',
    author: 'Dr. Cardio',
    imageUrl: 'https://picsum.photos/800/600?random=15',
    publishedAt: new Date(Date.now() - 15000000).toISOString(),
    tags: ['Health', 'Diet', 'Heart'],
    views: 5200,
    likes: 410,
    comments: 8,
    userComments: [],
    isBreaking: false,
  }
];
