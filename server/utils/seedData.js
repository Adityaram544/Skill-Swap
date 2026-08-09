const dotenv = require('dotenv');
dotenv.config();
const connectDB = require('../config/db');
const User = require('../models/User');
const Skill = require('../models/Skill');
const SwapRequest = require('../models/SwapRequest');
const Message = require('../models/Message');

const skillsData = [
  { name: 'React.js', category: 'Technology', description: 'Modern UI library for web applications', icon: 'Code' },
  { name: 'Node.js', category: 'Technology', description: 'Backend JavaScript runtime environment', icon: 'Server' },
  { name: 'Python Data Science', category: 'Technology', description: 'Data analysis using Pandas & NumPy', icon: 'BarChart' },
  { name: 'UI/UX Design', category: 'Design', description: 'Figma wireframing & interactive prototyping', icon: 'Layout' },
  { name: 'Spanish', category: 'Languages', description: 'Conversational & business Spanish fluency', icon: 'Globe' },
  { name: 'French', category: 'Languages', description: 'Basic to intermediate conversational French', icon: 'Globe' },
  { name: 'Acoustic Guitar', category: 'Music', description: 'Fingerpicking, chords, and music theory', icon: 'Music' },
  { name: 'Digital Marketing', category: 'Business', description: 'SEO, Google Ads & social media growth', icon: 'TrendingUp' },
  { name: 'Artisan Baking', category: 'Cooking', description: 'Sourdough bread & sourdough pastry crafting', icon: 'Utensils' },
  { name: 'Yoga & Mindfulness', category: 'Fitness', description: 'Vinyasa flow yoga & daily meditation routines', icon: 'Heart' }
];

const seedData = async () => {
  try {
    await connectDB();

    await User.deleteMany();
    await Skill.deleteMany();
    await SwapRequest.deleteMany();
    await Message.deleteMany();

    console.log('Cleared existing database records...');

    await Skill.insertMany(skillsData);
    console.log('Inserted default skill catalog.');

    // Sample demo users
    const users = [
      {
        name: 'Alex Rivera',
        email: 'alex@skillswap.com',
        password: 'password123',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=400',
        bio: 'Senior Full Stack Web Developer interested in learning conversational Spanish and acoustic guitar.',
        location: 'San Francisco, CA',
        availability: 'Weekends & Evenings',
        skillsOffered: [
          { name: 'React.js', category: 'Technology', level: 'Expert', description: '5 years creating production React & Next.js web applications' },
          { name: 'Node.js', category: 'Technology', level: 'Expert', description: 'Building RESTful APIs and Express microservices' }
        ],
        skillsWanted: [
          { name: 'Spanish', category: 'Languages', level: 'Beginner', description: 'Want to practice conversational Spanish for upcoming travel' },
          { name: 'Acoustic Guitar', category: 'Music', level: 'Beginner', description: 'Eager to learn basic chords and song structure' }
        ]
      },
      {
        name: 'Sophia Chen',
        email: 'sophia@skillswap.com',
        password: 'password123',
        avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&q=80&w=400',
        bio: 'Native Spanish speaker and professional UX Designer seeking help with React web development.',
        location: 'Austin, TX',
        availability: 'Flexible Schedule',
        skillsOffered: [
          { name: 'Spanish', category: 'Languages', level: 'Expert', description: 'Native speaker with teaching experience' },
          { name: 'UI/UX Design', category: 'Design', level: 'Expert', description: 'Design systems, Figma components & user research' }
        ],
        skillsWanted: [
          { name: 'React.js', category: 'Technology', level: 'Intermediate', description: 'Looking to turn Figma designs into real React code' },
          { name: 'Digital Marketing', category: 'Business', level: 'Beginner', description: 'Interested in growing my freelance design portfolio' }
        ]
      },
      {
        name: 'Marcus Vance',
        email: 'marcus@skillswap.com',
        password: 'password123',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=400',
        bio: 'Guitarist of 10 years & Digital Marketing Strategist. Passionate about learning Artisan Baking and Python.',
        location: 'Chicago, IL',
        availability: 'Weekday Afternoons',
        skillsOffered: [
          { name: 'Acoustic Guitar', category: 'Music', level: 'Expert', description: 'Taught over 50 students rhythm and lead guitar' },
          { name: 'Digital Marketing', category: 'Business', level: 'Expert', description: 'SEO growth strategies & content marketing' }
        ],
        skillsWanted: [
          { name: 'Python Data Science', category: 'Technology', level: 'Beginner', description: 'Want to analyze marketing datasets' },
          { name: 'Artisan Baking', category: 'Cooking', level: 'Beginner', description: 'Always wanted to bake sourdough' }
        ]
      },
      {
        name: 'Elena Rostova',
        email: 'elena@skillswap.com',
        password: 'password123',
        avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=400',
        bio: 'Certified Yoga Instructor & Baker. Excited to learn UI/UX Design and French!',
        location: 'Seattle, WA',
        availability: 'Mondays & Wednesdays',
        skillsOffered: [
          { name: 'Artisan Baking', category: 'Cooking', level: 'Expert', description: 'Mastering sourdough, brioche, and French pastries' },
          { name: 'Yoga & Mindfulness', category: 'Fitness', level: 'Expert', description: 'Breathing exercises, posture alignment, and stress reduction' }
        ],
        skillsWanted: [
          { name: 'UI/UX Design', category: 'Design', level: 'Beginner', description: 'Want to build an app for my bakery' },
          { name: 'French', category: 'Languages', level: 'Beginner', description: 'Love French culinary tradition and language' }
        ]
      }
    ];

    const createdUsers = [];
    for (const u of users) {
      const newUser = await User.create(u);
      createdUsers.push(newUser);
    }
    console.log(`Created ${createdUsers.length} sample exchange profiles.`);

    // Sample reciprocal swap request between Alex and Sophia
    const req1 = await SwapRequest.create({
      senderId: createdUsers[0]._id, // Alex
      receiverId: createdUsers[1]._id, // Sophia
      offeredSkill: createdUsers[0].skillsOffered[0], // React.js
      requestedSkill: createdUsers[1].skillsOffered[0], // Spanish
      message: "Hey Sophia! I saw you teach Spanish and want to learn React. Let's do a skill exchange!",
      status: 'Accepted'
    });

    // Sample pending swap request from Marcus to Alex
    await SwapRequest.create({
      senderId: createdUsers[2]._id, // Marcus
      receiverId: createdUsers[0]._id, // Alex
      offeredSkill: createdUsers[2].skillsOffered[0], // Acoustic Guitar
      requestedSkill: createdUsers[0].skillsOffered[0], // React.js
      message: "Hi Alex! I can teach you acoustic guitar in exchange for React guidance.",
      status: 'Pending'
    });

    // Sample initial message history
    await Message.create([
      {
        senderId: createdUsers[0]._id,
        receiverId: createdUsers[1]._id,
        message: "Hi Sophia! Thanks for accepting my swap request. When are you free for our first session?",
        read: true
      },
      {
        senderId: createdUsers[1]._id,
        receiverId: createdUsers[0]._id,
        message: "Hey Alex! I'm super excited. Saturday morning works great for me! How about 10am PST?",
        read: true
      },
      {
        senderId: createdUsers[0]._id,
        receiverId: createdUsers[1]._id,
        message: "Saturday 10am works perfectly for me. We can do 30 mins Spanish and 30 mins React!",
        read: false
      }
    ]);

    console.log('Seeded swap requests and chat message threads.');
    console.log('==================================================');
    console.log('Demo Login Credentials:');
    console.log('1. Alex Rivera   : alex@skillswap.com   / password123');
    console.log('2. Sophia Chen   : sophia@skillswap.com / password123');
    console.log('3. Marcus Vance  : marcus@skillswap.com / password123');
    console.log('4. Elena Rostova : elena@skillswap.com  / password123');
    console.log('==================================================');

    process.exit(0);
  } catch (err) {
    console.error('Seeding error:', err);
    process.exit(1);
  }
};

seedData();
