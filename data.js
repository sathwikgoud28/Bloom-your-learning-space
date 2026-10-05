export const courses = [
  {
    id: "design-thinking",
    title: "Design thinking, made practical",
    category: "Design",
    level: "Beginner",
    duration: "2h 15m",
    lessons: 8,
    instructor: "Maya Chen",
    initials: "MC",
    accent: "lavender",
    icon: "✳",
    description: "A hands-on introduction to solving the right problems, understanding people, and turning early ideas into things worth testing.",
    summary: "Good design starts with curiosity, not a perfect idea. In this course, you’ll learn a repeatable process for discovering what people actually need, reframing problems, and building quick experiments that move an idea forward.",
    modules: [
      ["01", "Start with people", "12 min", "Learn to notice the unmet needs hiding in everyday moments."],
      ["02", "Ask better questions", "18 min", "Use thoughtful interviews to get past surface-level answers."],
      ["03", "Find the real problem", "16 min", "Turn observations into a clear, human-centered challenge."],
      ["04", "Make room for ideas", "20 min", "Explore a wider range of possible solutions together."],
      ["05", "Build to learn", "22 min", "Create quick prototypes that make an idea tangible."],
      ["06", "Test and iterate", "17 min", "Use real feedback to make your next version better."],
      ["07", "Bring it all together", "15 min", "Connect the process from first observation to final test."],
      ["08", "Your next small step", "15 min", "Make a simple plan to bring design thinking to your work."]
    ],
    quiz: [
      { question: "What is the best place to begin a design thinking process?", options: ["With the most exciting solution", "With understanding the people affected", "With a detailed project plan", "With a list of available tools"], answer: 1 },
      { question: "Why do designers build quick prototypes?", options: ["To make a project look finished", "To avoid talking with users", "To learn about an idea by making it tangible", "To lock in the first idea"], answer: 2 },
      { question: "Which question is most likely to reveal a useful insight?", options: ["Did you like that?", "Would you use this app?", "Can you walk me through the last time this happened?", "Do you think this is a good solution?"], answer: 2 },
      { question: "What should happen after testing a prototype?", options: ["Use what you learned to improve or rethink it", "Keep it unchanged to protect the idea", "Stop involving users", "Write a longer specification"], answer: 0 },
      { question: "A good design challenge should focus on…", options: ["A specific technology", "A human need and an opportunity", "The first solution proposed", "A fixed visual style"], answer: 1 }
    ]
  },
  {
    id: "creative-writing",
    title: "Find your writing rhythm",
    category: "Creativity",
    level: "All levels",
    duration: "1h 40m",
    lessons: 6,
    instructor: "Jordan Lee",
    initials: "JL",
    accent: "peach",
    icon: "✎",
    description: "Make space for a creative habit, quiet your inner editor, and find the words for the stories only you can tell.",
    summary: "You don’t need a perfect routine or the perfect opening line. Explore friendly, practical writing exercises that help you start, keep going, and shape a first draft into something that feels like you.",
    modules: [
      ["01", "Begin before you’re ready", "14 min", "Try a few low-pressure ways to get words onto the page."],
      ["02", "Follow your curiosity", "16 min", "Find a small, specific idea worth spending time with."],
      ["03", "Write without the brakes", "18 min", "Make room for messy first drafts and surprising turns."],
      ["04", "Make a habit that fits", "17 min", "Build a writing rhythm around the life you already have."],
      ["05", "Shape the raw material", "20 min", "Edit with purpose without losing your original voice."],
      ["06", "Keep the momentum", "15 min", "Find your next story and keep your practice alive."]
    ],
    quiz: [
      { question: "What is the main goal of a first draft?", options: ["To get your ideas onto the page", "To be ready for publication", "To use perfect grammar", "To impress every reader"], answer: 0 },
      { question: "When is a helpful time to edit a freewriting exercise?", options: ["Every few words", "After you have written without stopping", "Before writing anything", "Only after someone else rewrites it"], answer: 1 },
      { question: "A writing habit is most likely to stick when it…", options: ["Requires a totally free day", "Starts with an ambitious word count", "Fits into your existing life", "Happens only when inspiration strikes"], answer: 2 },
      { question: "When revising, what should you protect?", options: ["Every sentence in the first draft", "The writer’s voice and intention", "The longest possible length", "The first idea that came to mind"], answer: 1 },
      { question: "If you feel stuck, one useful next step is to…", options: ["Wait until you feel completely ready", "Choose one small detail that makes you curious", "Delete everything", "Set a larger daily goal"], answer: 1 }
    ]
  },
  {
    id: "mindful-mornings",
    title: "A softer start to your day",
    category: "Wellbeing",
    level: "Beginner",
    duration: "55 min",
    lessons: 5,
    instructor: "Amara Okafor",
    initials: "AO",
    accent: "sage",
    icon: "☼",
    description: "Build a little breathing room into your mornings with simple, grounded practices that meet you where you are.",
    summary: "A mindful morning isn’t about getting up earlier or following a strict routine. It’s about making a little space to notice how you feel, settle into the present, and choose how you want to meet the day.",
    modules: [
      ["01", "Let the morning be yours", "10 min", "Rethink what a gentle start can look like for you."],
      ["02", "One minute of noticing", "12 min", "Try an approachable grounding practice without overthinking it."],
      ["03", "Breathe, just as you are", "11 min", "Explore a calm breath practice at your own pace."],
      ["04", "Set a small intention", "12 min", "Choose a kind, realistic direction for the day ahead."],
      ["05", "Make it your own", "10 min", "Create a flexible ritual that still works on busy mornings."]
    ],
    quiz: [
      { question: "What makes a mindful morning practice more sustainable?", options: ["Waking up much earlier every day", "Keeping it flexible and personal", "Following a perfect routine", "Doing several things at once"], answer: 1 },
      { question: "During a grounding exercise, where can you place your attention?", options: ["Only on future plans", "On a small detail in the present moment", "On whether you are doing it perfectly", "On someone else’s routine"], answer: 1 },
      { question: "If your morning is unusually busy, what is a reasonable approach?", options: ["Skip self-kindness until tomorrow", "Try a brief version that fits the moment", "Force the full routine", "Start over the next week"], answer: 1 },
      { question: "What is an intention best used for?", options: ["A kind direction for how you want to meet the day", "A strict checklist of outcomes", "A way to control every event", "A replacement for rest"], answer: 0 },
      { question: "In a breathing practice, you should…", options: ["Force each breath to be as deep as possible", "Notice your breath at a comfortable pace", "Hold your breath as long as you can", "Compare your breath with others"], answer: 1 }
    ]
  },
  {
    id: "everyday-photography",
    title: "Notice more, photograph better",
    category: "Photography",
    level: "All levels",
    duration: "1h 25m",
    lessons: 7,
    instructor: "Theo Martins",
    initials: "TM",
    accent: "blue",
    icon: "◉",
    description: "Learn to see beautiful light, compose with intention, and capture everyday moments with whatever camera you have.",
    summary: "Great photos begin with paying attention. Learn a few flexible composition techniques, see how light changes a scene, and practice capturing the little moments that make an ordinary day feel worth remembering.",
    modules: [
      ["01", "Start by looking", "11 min", "Build a habit of noticing the stories around you."],
      ["02", "See the light", "13 min", "Find soft, interesting light in familiar places."],
      ["03", "Make a frame", "12 min", "Use simple composition choices to guide someone’s eye."],
      ["04", "Find your point of view", "14 min", "Explore how a small shift in perspective changes a photo."],
      ["05", "Catch the in-between", "11 min", "Practice photographing natural, unposed moments."],
      ["06", "Edit with a light touch", "12 min", "Make a few thoughtful edits without overworking a shot."],
      ["07", "Tell a small story", "12 min", "Bring a set of images together into a simple visual story."]
    ],
    quiz: [
      { question: "What is one of the most useful things to notice before taking a photo?", options: ["The brand of every nearby camera", "Where the light is coming from", "How expensive the scene looks", "How many filters are available"], answer: 1 },
      { question: "How can moving your camera change a composition?", options: ["It can change relationships between elements in the frame", "It automatically improves sharpness", "It removes the need to notice light", "It makes every subject look the same"], answer: 0 },
      { question: "An effective edit often means…", options: ["Using every adjustment at full strength", "Making a few considered changes", "Changing the subject of the photo", "Adding a filter to every image"], answer: 1 },
      { question: "To capture a natural moment, it can help to…", options: ["Demand a pose before each photo", "Observe and be ready", "Avoid looking around", "Take only one photo ever"], answer: 1 },
      { question: "A visual story can be created by…", options: ["Connecting images around a small idea", "Using the same filter on unrelated photos", "Photographing only famous places", "Including as many images as possible"], answer: 0 }
    ]
  }
];

export const categories = ["All", ...new Set(courses.map((course) => course.category))];
