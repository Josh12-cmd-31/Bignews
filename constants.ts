
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
    id: 'founder-story',
    title: 'Meet the Visionary Developer Behind Big News',
    subject: 'INNOVATION & LEADERSHIP',
    summary: 'The founder of Big News and CEO of Mova AI is redefining how the world consumes information.',
    content: `
      <p><strong>Exclusive Interview</strong> — In a world saturated with information, one developer dared to reimagine how we consume news. Meet the founder of Big News, a visionary tech leader who turned a simple idea into a global platform.</p>
      <p>"Our goal was never just to aggregate headlines," says the founder, pictured in his high-rise office overlooking the city skyline. "It was to create an ecosystem where technology helps users cut through the noise to find the stories that truly matter."</p>
      <p>With a background in advanced machine learning and a passion for journalism, he built Big News from the ground up. The platform now serves millions of users, offering personalized feeds and real-time updates powered by cutting-edge algorithms.</p>
      <p>Also serving as the CEO of <strong>Mova AI</strong>, his dual expertise in artificial intelligence and media technology places Big News at the forefront of the industry's evolution. "We are just getting started," he adds, hinting at new features coming later this year.</p>
    `,
    category: 'Technology',
    author: 'Big News Staff',
    imageUrl: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=1600&h=900&q=80',
    publishedAt: new Date().toISOString(),
    tags: ['Founder', 'Technology', 'Innovation', 'Leadership', 'Mova AI'],
    views: 250000,
    likes: 15400,
    comments: 230,
    userComments: [],
    isBreaking: true,
  },
  {
    id: 'police-peace-news',
    title: 'New Directive Focuses on Community Peace',
    subject: 'Police officers are required to create peace and support to the people',
    summary: 'A new administrative order outlines a paradigm shift in community policing and public support systems.',
    content: `
      <p>Authorities have announced a comprehensive new framework for law enforcement aimed at fostering deeper trust and cooperation with local communities. The directive, titled "Peace and Support Initiative," emphasizes that the primary role of law enforcement is the protection and service of the citizenry through non-adversarial engagement.</p>
      <p>"The objective is clear," said the Commissioner during a press conference. "Police officers are required to create peace and support to the people at every interaction. We are shifting from a purely reactive model to a proactive, service-oriented approach."</p>
      <p>The program includes extensive training in conflict de-escalation, mental health crisis response, and community resource networking.</p>
    `,
    category: 'Politics',
    author: 'Daniel Craig',
    imageUrl: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&w=1600&h=900&q=80',
    publishedAt: new Date().toISOString(),
    tags: ['Safety', 'Public Policy', 'Community', 'Peace'],
    views: 12400,
    likes: 540,
    comments: 12,
    userComments: [],
    isBreaking: true,
  },
  {
    id: '1',
    title: 'The Future of Quantum Computing',
    subject: 'SCIENTIFIC BREAKTHROUGH',
    summary: 'Scientists make a breakthrough in stable qubits, paving the way for faster processing.',
    content: `
      <p>In a groundbreaking development, researchers have successfully demonstrated a new method for stabilizing qubits at room temperature. This achievement could significantly accelerate the timeline for commercially viable quantum computers.</p>
      <p>"This is the holy grail we've been searching for," said Dr. Elena Rostova, lead physicist on the project. The team used a novel diamond lattice structure to shield the qubits from environmental noise.</p>
      <p>Tech giants are already racing to license the technology, with experts predicting prototype consumer devices within the decade.</p>
    `,
    category: 'Technology',
    author: 'Sarah Jenkins',
    imageUrl: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?auto=format&fit=crop&w=1600&h=900&q=80',
    publishedAt: new Date(Date.now() - 86400000).toISOString(),
    tags: ['Quantum Physics', 'Innovation', 'Future Tech'],
    views: 12500,
    likes: 840,
    comments: 2,
    userComments: [],
    isBreaking: false,
    linkedVideoId: 'v1'
  }
];
