/*
  HARKAAM demo marketplace data
  -----------------------------
  All categories, services, providers, prices, ratings and reviews are SAMPLE
  data for a frontend prototype. There is no backend and no real provider
  contact, verification or payment processing.

  Six categories for demonstration:
  1. Home Tutor
  2. Electrician
  3. Plumber
  4. AC Technician
  5. Carpenter
  6. Graphic Designer
*/

const HARKAAM_DATA = (function () {
  const CATEGORIES = [
    {
      id: "home-tutor",
      name: "Home Tutor",
      icon: "📚",
      blurb: "Qualified tutors for school, college and university subjects — at home or online.",
      subcategories: [
        {
          id: "math-tutor", name: "Mathematics Tutor", icon: "➗",
          description: "Matric, FSc, O-Level and A-Level mathematics coaching at home or online.",
          services: [
            { name: "Mathematics (Matric & FSc)", price: 1800, duration: "90 min / session" },
            { name: "O-Level & A-Level Mathematics", price: 2500, duration: "90 min / session" }
          ]
        },
        {
          id: "physics-tutor", name: "Physics Tutor", icon: "🔭",
          description: "Concept-focused physics coaching for FSc, A-Level and university entrance tests.",
          services: [
            { name: "Physics (FSc & A-Level)", price: 2200, duration: "90 min / session" },
            { name: "Conceptual Physics Coaching", price: 1800, duration: "60 min / session" }
          ]
        },
        {
          id: "chemistry-tutor", name: "Chemistry Tutor", icon: "⚗️",
          description: "Chemistry tuition for Matric, FSc and pre-medical students.",
          services: [
            { name: "Chemistry (Matric & FSc)", price: 2000, duration: "90 min / session" },
            { name: "Organic Chemistry Coaching", price: 2500, duration: "90 min / session" }
          ]
        },
        {
          id: "english-tutor", name: "English Tutor", icon: "🗣️",
          description: "Spoken English, grammar, academic writing and IELTS preparation.",
          services: [
            { name: "Spoken English & Grammar", price: 2000, duration: "60 min / session" },
            { name: "IELTS Preparation", price: 3500, duration: "90 min / session" }
          ]
        },
        {
          id: "cs-tutor", name: "Computer Science Tutor", icon: "💻",
          description: "Computer science fundamentals, programming and exam preparation.",
          services: [
            { name: "Computer Science (Matric & FSc)", price: 2500, duration: "90 min / session" },
            { name: "Python & Programming Basics", price: 3000, duration: "90 min / session" }
          ]
        }
      ]
    },
    {
      id: "electrician",
      name: "Electrician",
      icon: "⚡",
      blurb: "Licensed electricians for wiring, repairs, installations and fault finding.",
      subcategories: [
        {
          id: "residential-wiring", name: "Residential Wiring", icon: "🏠",
          description: "Complete house wiring, DB board installation and circuit setup.",
          services: [
            { name: "Complete House Wiring", price: 15000, duration: "2–3 days" },
            { name: "DB Board Installation & Setup", price: 5000, duration: "3–4 hours" }
          ]
        },
        {
          id: "fan-light-install", name: "Fan & Light Installation", icon: "💡",
          description: "Ceiling fan, light fixture, chandelier and appliance installation.",
          services: [
            { name: "Fan Installation", price: 800, duration: "30–45 min" },
            { name: "Light Fixture & Chandelier Installation", price: 1200, duration: "45–60 min" }
          ]
        },
        {
          id: "fault-finding", name: "Fault Finding & Repair", icon: "🔍",
          description: "Electrical fault diagnostics, short circuit detection and repair.",
          services: [
            { name: "Fault Diagnosis & Repair", price: 1800, duration: "1–2 hours" },
            { name: "Short Circuit Detection & Fix", price: 2500, duration: "1–3 hours" }
          ]
        },
        {
          id: "commercial-electrical", name: "Commercial Electrical", icon: "🏢",
          description: "Office wiring, generator changeover and commercial electrical work.",
          services: [
            { name: "Office Wiring & Setup", price: 25000, duration: "3–5 days" },
            { name: "Generator Changeover Installation", price: 8000, duration: "4–6 hours" }
          ]
        },
        {
          id: "ups-inverter", name: "UPS & Inverter Setup", icon: "🔋",
          description: "UPS installation, inverter wiring and battery backup systems.",
          services: [
            { name: "UPS Installation & Wiring", price: 3500, duration: "2–3 hours" },
            { name: "Inverter & Battery Setup", price: 5000, duration: "3–4 hours" }
          ]
        }
      ]
    },
    {
      id: "plumber",
      name: "Plumber",
      icon: "🚰",
      blurb: "Reliable plumbing services — leak repairs, pipe fitting, fittings and drainage.",
      subcategories: [
        {
          id: "leak-repair", name: "Leak Detection & Repair", icon: "💧",
          description: "Water leak detection, pipe repair and sealing services.",
          services: [
            { name: "Leak Detection & Pipe Repair", price: 1500, duration: "45–90 min" },
            { name: "Sealing & Waterproofing", price: 2000, duration: "1–2 hours" }
          ]
        },
        {
          id: "pipe-fitting", name: "Pipe Fitting", icon: "🔧",
          description: "New pipe installation, pipe replacement and repiping services.",
          services: [
            { name: "Pipe Installation & Fitting", price: 3000, duration: "2–4 hours" },
            { name: "Full House Repiping", price: 12000, duration: "1–2 days" }
          ]
        },
        {
          id: "bathroom-fittings", name: "Bathroom Fittings", icon: "🚿",
          description: "Shower, faucet, commode and bathroom fixture installation.",
          services: [
            { name: "Shower & Faucet Installation", price: 1500, duration: "45–60 min" },
            { name: "Commode & Bathroom Fittings", price: 2500, duration: "2 hours" }
          ]
        },
        {
          id: "drain-cleaning", name: "Drain Cleaning", icon: "🧹",
          description: "Blocked drain clearing, sewer cleaning and drainage solutions.",
          services: [
            { name: "Drain Unclogging", price: 1200, duration: "45–90 min" },
            { name: "Sewer Line Cleaning", price: 3000, duration: "2–3 hours" }
          ]
        },
        {
          id: "water-tank", name: "Water Tank Installation", icon: "🛢️",
          description: "Water tank installation, pump setup and motor fitting.",
          services: [
            { name: "Water Tank Installation", price: 4000, duration: "2–3 hours" },
            { name: "Water Pump & Motor Fitting", price: 3500, duration: "1–2 hours" }
          ]
        }
      ]
    },
    {
      id: "ac-technician",
      name: "AC Technician",
      icon: "❄️",
      blurb: "AC repair, installation, gas refilling and maintenance at your doorstep.",
      subcategories: [
        {
          id: "ac-repair", name: "AC Repair & Service", icon: "🔧",
          description: "Diagnostics, servicing, cooling fault repair and general AC maintenance.",
          services: [
            { name: "AC Repair & Service", price: 2500, duration: "60–90 min" },
            { name: "AC Deep Cleaning & Service", price: 3500, duration: "90–120 min" }
          ]
        },
        {
          id: "ac-installation", name: "AC Installation", icon: "🧰",
          description: "Split and window AC installation, uninstallation and relocation.",
          services: [
            { name: "Split AC Installation", price: 6000, duration: "2–3 hours" },
            { name: "Window AC Installation", price: 3500, duration: "1–2 hours" }
          ]
        },
        {
          id: "ac-gas-refilling", name: "AC Gas Refilling", icon: "💨",
          description: "Refrigerant gas refilling for split and inverter ACs.",
          services: [
            { name: "R-410 Gas Refilling", price: 4500, duration: "90 min" },
            { name: "R-22 Gas Refilling", price: 3500, duration: "60–90 min" }
          ]
        },
        {
          id: "ac-maintenance", name: "AC Maintenance", icon: "🛠️",
          description: "Scheduled maintenance, coil cleaning and filter replacement.",
          services: [
            { name: "Annual Maintenance Contract", price: 8000, duration: "Quarterly visits" },
            { name: "Coil Cleaning & Filter Replacement", price: 2000, duration: "60 min" }
          ]
        },
        {
          id: "inverter-ac", name: "Inverter AC Service", icon: "⚡",
          description: "Inverter AC diagnostics, PCB repair and specialised service.",
          services: [
            { name: "Inverter AC Diagnostics", price: 3000, duration: "60–90 min" },
            { name: "Inverter PCB Repair", price: 6000, duration: "2–4 hours" }
          ]
        }
      ]
    },
    {
      id: "carpenter",
      name: "Carpenter",
      icon: "🪚",
      blurb: "Custom furniture, door repairs, cabinet fitting and professional woodwork.",
      subcategories: [
        {
          id: "custom-furniture", name: "Custom Furniture", icon: "🪑",
          description: "Bespoke furniture design, construction and installation.",
          services: [
            { name: "Custom Furniture Making", price: 8000, duration: "3–7 days" },
            { name: "Furniture Repair & Restoration", price: 2500, duration: "1–3 days" }
          ]
        },
        {
          id: "door-repair", name: "Door Repair", icon: "🚪",
          description: "Door installation, hinge replacement, lock fitting and door alignment.",
          services: [
            { name: "Door Installation & Fitting", price: 3000, duration: "2–3 hours" },
            { name: "Door Repair & Hinge Replacement", price: 1500, duration: "60–90 min" }
          ]
        },
        {
          id: "cabinet-fitting", name: "Cabinet Fitting", icon: "🗄️",
          description: "Kitchen cabinets, wardrobe fitting and storage solutions.",
          services: [
            { name: "Kitchen Cabinet Fitting", price: 15000, duration: "2–4 days" },
            { name: "Wardrobe & Storage Fitting", price: 8000, duration: "1–3 days" }
          ]
        },
        {
          id: "wood-polishing", name: "Wood Polishing", icon: "✨",
          description: "Furniture polishing, varnishing and surface refinishing.",
          services: [
            { name: "Furniture Polishing & Varnishing", price: 3000, duration: "1–2 days" },
            { name: "Door & Window Frame Polishing", price: 4000, duration: "1–2 days" }
          ]
        },
        {
          id: "furniture-assembly", name: "Furniture Assembly", icon: "🧰",
          description: "Assembly of flat-pack furniture, beds, tables and shelves.",
          services: [
            { name: "Bed & Wardrobe Assembly", price: 2000, duration: "2–3 hours" },
            { name: "Table & Shelf Assembly", price: 1500, duration: "1–2 hours" }
          ]
        }
      ]
    },
    {
      id: "graphic-designer",
      name: "Graphic Designer",
      icon: "🎨",
      blurb: "Logos, branding, social media creatives, video editing and print design.",
      subcategories: [
        {
          id: "logo-design", name: "Logo Design", icon: "✒️",
          description: "Distinctive logos and brand identities with source files.",
          services: [
            { name: "Logo Design (3 concepts)", price: 5000, duration: "3–5 days" },
            { name: "Complete Brand Identity Kit", price: 15000, duration: "1–2 weeks" }
          ]
        },
        {
          id: "social-media-design", name: "Social Media Design", icon: "📣",
          description: "Scroll-stopping social posts, reels covers and monthly content packs.",
          services: [
            { name: "Social Media Post Pack (10 posts)", price: 4000, duration: "3–4 days" },
            { name: "Monthly Content Design", price: 12000, duration: "Monthly" }
          ]
        },
        {
          id: "video-editing", name: "Video Editing", icon: "🎬",
          description: "Reels, YouTube edits, subtitles and colour grading.",
          services: [
            { name: "Video Editing (per video)", price: 3000, duration: "2–3 days" },
            { name: "YouTube Channel Package (8 videos)", price: 15000, duration: "Monthly" }
          ]
        },
        {
          id: "print-design", name: "Print Design", icon: "🖨️",
          description: "Wedding cards, business cards, flyers and print-ready artwork.",
          services: [
            { name: "Business Cards & Flyers", price: 1800, duration: "2–3 days" },
            { name: "Wedding Cards & Invitation Design", price: 5000, duration: "3–5 days" }
          ]
        },
        {
          id: "brand-identity", name: "Brand Identity", icon: "🏷️",
          description: "Complete brand guidelines, color palettes and visual systems.",
          services: [
            { name: "Brand Guidelines Document", price: 20000, duration: "1–2 weeks" },
            { name: "Marketing Collateral Design", price: 8000, duration: "1 week" }
          ]
        }
      ]
    }
  ];

  const CITIES = [
    "Karachi", "Lahore", "Islamabad", "Rawalpindi", "Hyderabad",
    "Faisalabad", "Multan", "Peshawar", "Quetta"
  ];

  const PROVIDERS = [
    // ---------------- Home Tutor ----------------
    {
      id: 1, name: "Ayesha Khan", skill: "Mathematics Tutor", cat: "home-tutor", sub: "math-tutor",
      city: "Karachi", area: "DHA Phase 6", exp: 5, rating: 4.9, reviews: 127, price: 1800,
      icon: "👩‍🏫", verified: true,
      desc: "Mathematics tutor for Matric, FSc and O-Level students. My sessions focus on building concepts first, then timed practice with past papers and weekly progress feedback.",
      skills: ["Matric mathematics", "O-Level maths", "FSc algebra", "Exam preparation"],
      hours: "3:00 PM – 9:00 PM", availability: "Available today", languages: ["Urdu", "English"]
    },
    {
      id: 2, name: "Abdul Rehman", skill: "Physics Tutor", cat: "home-tutor", sub: "physics-tutor",
      city: "Islamabad", area: "F-10", exp: 4, rating: 4.7, reviews: 58, price: 2200,
      icon: "🔭", verified: true,
      desc: "Physics tutor for FSc and A-Level students, with a focus on conceptual clarity and numerical problem solving. I also help with MDCAT and ECAT physics preparation.",
      skills: ["FSc physics", "A-Level physics", "MDCAT preparation", "Numericals"],
      hours: "4:00 PM – 9:00 PM", availability: "Available tomorrow", languages: ["Urdu", "English"]
    },
    {
      id: 3, name: "Maryam Javed", skill: "Chemistry Tutor", cat: "home-tutor", sub: "chemistry-tutor",
      city: "Lahore", area: "Model Town", exp: 6, rating: 4.8, reviews: 74, price: 2000,
      icon: "⚗️", verified: true,
      desc: "Chemistry tuition for Matric, FSc and pre-medical students. Organic chemistry is my specialty, and I provide concise notes and chapter-wise tests.",
      skills: ["Organic chemistry", "FSc chemistry", "Pre-medical prep", "Chapter tests"],
      hours: "3:00 PM – 8:00 PM", availability: "Available this week", languages: ["Urdu", "English"]
    },
    {
      id: 4, name: "Sana Tariq", skill: "English Language Tutor", cat: "home-tutor", sub: "english-tutor",
      city: "Lahore", area: "Gulberg III", exp: 6, rating: 4.8, reviews: 96, price: 2000,
      icon: "🗣️", verified: true,
      desc: "Spoken English and IELTS tutor with a friendly, conversation-first approach. Sessions include pronunciation practice, writing feedback and mock speaking tests.",
      skills: ["Spoken English", "IELTS preparation", "Academic writing", "Interview practice"],
      hours: "10:00 AM – 8:00 PM", availability: "Available today", languages: ["Urdu", "English"]
    },
    {
      id: 5, name: "Zain Abbas", skill: "Computer Science Tutor", cat: "home-tutor", sub: "cs-tutor",
      city: "Peshawar", area: "Hayatabad", exp: 3, rating: 4.6, reviews: 34, price: 2500,
      icon: "👨‍💻", verified: false,
      desc: "Computer science tutor for school and college students, plus beginner programming lessons in Python. I use small practical projects so students can see concepts working.",
      skills: ["Computer science", "Python", "Programming basics", "Exam preparation"],
      hours: "4:00 PM – 9:00 PM", availability: "Available this week", languages: ["Urdu", "English", "Pashto"]
    },
    {
      id: 6, name: "Fatima Noor", skill: "Mathematics & Physics Tutor", cat: "home-tutor", sub: "math-tutor",
      city: "Hyderabad", area: "Latifabad", exp: 8, rating: 4.9, reviews: 143, price: 2500,
      icon: "📖", verified: true,
      desc: "Experienced tutor covering both mathematics and physics for Matric and FSc students. I provide structured lesson plans, weekly tests and detailed progress reports.",
      skills: ["Matric maths", "FSc physics", "Test preparation", "Progress tracking"],
      hours: "2:00 PM – 8:00 PM", availability: "Available today", languages: ["Urdu", "English", "Sindhi"]
    },

    // ---------------- Electrician ----------------
    {
      id: 7, name: "Hamza Siddiqui", skill: "Licensed Electrician", cat: "electrician", sub: "residential-wiring",
      city: "Islamabad", area: "G-11", exp: 7, rating: 4.7, reviews: 93, price: 15000,
      icon: "⚡", verified: true,
      desc: "Residential electrical repairs, DB board work, fan and light installation across Islamabad. I prioritise safe wiring and always test the circuit before handing over.",
      skills: ["House wiring", "DB board repair", "Fan installation", "Fault finding"],
      hours: "9:00 AM – 7:00 PM", availability: "Available this week", languages: ["Urdu", "English", "Punjabi"]
    },
    {
      id: 8, name: "Imran Qureshi", skill: "Electrical Fault Specialist", cat: "electrician", sub: "fault-finding",
      city: "Karachi", area: "North Nazimabad", exp: 10, rating: 4.8, reviews: 112, price: 2500,
      icon: "🔍", verified: true,
      desc: "Specialist in electrical fault diagnosis and short circuit detection. I carry professional testing equipment and can identify hidden wiring faults quickly and safely.",
      skills: ["Fault diagnosis", "Short circuit detection", "Circuit testing", "Wiring repair"],
      hours: "8:00 AM – 9:00 PM", availability: "Available today", languages: ["Urdu", "English"]
    },
    {
      id: 9, name: "Bilal Ahmed", skill: "Fan & Light Installation Expert", cat: "electrician", sub: "fan-light-install",
      city: "Lahore", area: "Johar Town", exp: 5, rating: 4.6, reviews: 67, price: 1200,
      icon: "💡", verified: true,
      desc: "Quick and clean installation of ceiling fans, light fixtures, chandeliers and electrical appliances. I bring all necessary tools and ensure everything is properly secured.",
      skills: ["Fan installation", "Light fixtures", "Chandelier fitting", "Appliance setup"],
      hours: "9:00 AM – 8:00 PM", availability: "Available tomorrow", languages: ["Urdu", "Punjabi"]
    },
    {
      id: 10, name: "Naveed Anwar", skill: "Commercial Electrician", cat: "electrician", sub: "commercial-electrical",
      city: "Faisalabad", area: "Peoples Colony", exp: 12, rating: 4.7, reviews: 61, price: 25000,
      icon: "🏢", verified: true,
      desc: "Commercial electrical specialist with 12 years of experience in office wiring, generator changeovers and industrial electrical installations. Fully equipped team available.",
      skills: ["Office wiring", "Generator changeover", "Industrial electrical", "Three-phase work"],
      hours: "8:00 AM – 6:00 PM", availability: "Available this week", languages: ["Urdu", "English", "Punjabi"]
    },
    {
      id: 11, name: "Kamran Sheikh", skill: "UPS & Inverter Specialist", cat: "electrician", sub: "ups-inverter",
      city: "Rawalpindi", area: "Saddar", exp: 6, rating: 4.5, reviews: 47, price: 5000,
      icon: "🔋", verified: false,
      desc: "UPS installation, inverter wiring and battery backup system setup for homes and small offices. I help you choose the right capacity and configure it properly.",
      skills: ["UPS installation", "Inverter wiring", "Battery setup", "Load management"],
      hours: "10:00 AM – 8:00 PM", availability: "Available tomorrow", languages: ["Urdu", "Punjabi"]
    },
    {
      id: 12, name: "Usman Tariq", skill: "Residential Wiring Expert", cat: "electrician", sub: "residential-wiring",
      city: "Multan", area: "Bosan Road", exp: 8, rating: 4.6, reviews: 52, price: 15000,
      icon: "⚡", verified: true,
      desc: "Complete house wiring and DB board installation with proper conduit piping and safe circuit separation. I follow standard electrical codes and provide a warranty on workmanship.",
      skills: ["House wiring", "Conduit piping", "DB board setup", "Circuit design"],
      hours: "8:00 AM – 7:00 PM", availability: "Available this week", languages: ["Urdu", "English", "Saraiki"]
    },

    // ---------------- Plumber ----------------
    {
      id: 13, name: "Bilal Raza", skill: "Plumbing Specialist", cat: "plumber", sub: "leak-repair",
      city: "Karachi", area: "Gulshan-e-Iqbal", exp: 9, rating: 4.8, reviews: 156, price: 1500,
      icon: "🚰", verified: true,
      desc: "Leak detection, pipeline repair, bathroom fittings and drainage work for homes and small offices. Known for neat work and transparent estimates before starting.",
      skills: ["Leak detection", "Pipe fitting", "Bathroom fittings", "Drain cleaning"],
      hours: "8:00 AM – 9:00 PM", availability: "Available today", languages: ["Urdu", "English"]
    },
    {
      id: 14, name: "Rashid Ali", skill: "Pipe Fitting Expert", cat: "plumber", sub: "pipe-fitting",
      city: "Lahore", area: "Cantt", exp: 11, rating: 4.7, reviews: 89, price: 3000,
      icon: "🔧", verified: true,
      desc: "New pipe installation, full house repiping and pipe replacement services. I use quality PVC and PPRC pipes and ensure all joints are properly sealed and pressure-tested.",
      skills: ["Pipe installation", "Re-piping", "PPRC fitting", "Pressure testing"],
      hours: "8:00 AM – 8:00 PM", availability: "Available tomorrow", languages: ["Urdu", "Punjabi"]
    },
    {
      id: 15, name: "Asif Mehmood", skill: "Bathroom Fittings Specialist", cat: "plumber", sub: "bathroom-fittings",
      city: "Islamabad", area: "I-8", exp: 7, rating: 4.6, reviews: 64, price: 2500,
      icon: "🚿", verified: true,
      desc: "Shower, faucet, commode and complete bathroom fixture installation. I can also help with bathroom renovation plumbing and fixture upgrades.",
      skills: ["Shower installation", "Faucet fitting", "Commode fitting", "Bathroom renovation"],
      hours: "9:00 AM – 7:00 PM", availability: "Available today", languages: ["Urdu", "English"]
    },
    {
      id: 16, name: "Nadeem Iqbal", skill: "Drain Cleaning Expert", cat: "plumber", sub: "drain-cleaning",
      city: "Hyderabad", area: "Qasimabad", exp: 6, rating: 4.5, reviews: 43, price: 1200,
      icon: "🧹", verified: false,
      desc: "Blocked drain clearing, sewer line cleaning and drainage problem solutions. I use professional drain cleaning rods and high-pressure jetting equipment.",
      skills: ["Drain unclogging", "Sewer cleaning", "Jetting", "Drainage repair"],
      hours: "7:00 AM – 9:00 PM", availability: "Available today", languages: ["Urdu", "Sindhi"]
    },
    {
      id: 17, name: "Faisal Khan", skill: "Water Tank & Pump Specialist", cat: "plumber", sub: "water-tank",
      city: "Peshawar", area: "University Town", exp: 8, rating: 4.7, reviews: 71, price: 4000,
      icon: "🛢️", verified: true,
      desc: "Water tank installation, pump fitting and motor installation for residential buildings. I also handle overhead and underground tank plumbing with proper float valve setup.",
      skills: ["Water tank installation", "Pump fitting", "Motor installation", "Float valve setup"],
      hours: "8:00 AM – 6:00 PM", availability: "Available this week", languages: ["Urdu", "English", "Pashto"]
    },
    {
      id: 18, name: "Shahid Munir", skill: "Plumbing & Sanitary Expert", cat: "plumber", sub: "leak-repair",
      city: "Faisalabad", area: "D Ground", exp: 14, rating: 4.9, reviews: 108, price: 2000,
      icon: "🚰", verified: true,
      desc: "Comprehensive plumbing and sanitary services with 14 years of experience. From small leaks to full bathroom plumbing installations, I deliver clean and reliable work.",
      skills: ["Leak repair", "Bathroom plumbing", "Sanitary fittings", "Pipeline maintenance"],
      hours: "8:00 AM – 8:00 PM", availability: "Available tomorrow", languages: ["Urdu", "Punjabi", "English"]
    },

    // ---------------- AC Technician ----------------
    {
      id: 19, name: "Usman Ali", skill: "AC Repair Technician", cat: "ac-technician", sub: "ac-repair",
      city: "Karachi", area: "Gulshan-e-Iqbal", exp: 8, rating: 4.9, reviews: 127, price: 2500,
      icon: "🧑‍🔧", verified: true,
      desc: "Split AC and inverter specialist covering Gulshan, Gulberg and nearby Karachi areas. I diagnose cooling faults, deep-clean units and refill gas with a 15-day workmanship check.",
      skills: ["Split AC repair", "Inverter AC diagnostics", "Gas refilling", "Deep coil cleaning"],
      hours: "9:00 AM – 8:00 PM", availability: "Available today", languages: ["Urdu", "English"]
    },
    {
      id: 20, name: "Imran Bhatti", skill: "AC Installation Expert", cat: "ac-technician", sub: "ac-installation",
      city: "Lahore", area: "Johar Town", exp: 6, rating: 4.8, reviews: 84, price: 6000,
      icon: "❄️", verified: true,
      desc: "Professional split and window AC installation, relocation and uninstallation. I bring proper brackets, insulation and vacuum tools for a clean, leak-free installation.",
      skills: ["Split AC installation", "AC relocation", "Bracket fitting", "Copper piping"],
      hours: "8:00 AM – 9:00 PM", availability: "Available tomorrow", languages: ["Urdu", "Punjabi"]
    },
    {
      id: 21, name: "Aamir Yousaf", skill: "AC Gas Refilling Specialist", cat: "ac-technician", sub: "ac-gas-refilling",
      city: "Islamabad", area: "Bahria Town", exp: 5, rating: 4.6, reviews: 56, price: 4500,
      icon: "💨", verified: true,
      desc: "Specialist in R-410 and R-22 refrigerant gas refilling. I pressure-test the system before and after refilling, and check for leaks to ensure long-lasting cooling performance.",
      skills: ["R-410 gas refilling", "R-22 gas refilling", "Leak detection", "Pressure testing"],
      hours: "9:00 AM – 7:00 PM", availability: "Available today", languages: ["Urdu", "English"]
    },
    {
      id: 22, name: "Zeeshan Akram", skill: "AC Maintenance Technician", cat: "ac-technician", sub: "ac-maintenance",
      city: "Rawalpindi", area: "Satellite Town", exp: 7, rating: 4.7, reviews: 68, price: 2000,
      icon: "🛠️", verified: true,
      desc: "Scheduled AC maintenance, coil cleaning and filter replacement services. I offer annual maintenance contracts for homes and offices with quarterly visits.",
      skills: ["AC maintenance", "Coil cleaning", "Filter replacement", "AMC contracts"],
      hours: "9:00 AM – 6:00 PM", availability: "Available this week", languages: ["Urdu", "Punjabi"]
    },
    {
      id: 23, name: "Haris Nadeem", skill: "Inverter AC Specialist", cat: "ac-technician", sub: "inverter-ac",
      city: "Lahore", area: "Model Town", exp: 9, rating: 4.8, reviews: 79, price: 6000,
      icon: "⚡", verified: true,
      desc: "Inverter AC diagnostics, PCB repair and specialised servicing. I carry diagnostic tools for major brands including Haier, Gree, Dawlance and Orient inverter models.",
      skills: ["Inverter diagnostics", "PCB repair", "Brand-specific service", "Compressor testing"],
      hours: "10:00 AM – 8:00 PM", availability: "Available tomorrow", languages: ["Urdu", "English", "Punjabi"]
    },
    {
      id: 24, name: "Adnan Malik", skill: "AC Service & Repair", cat: "ac-technician", sub: "ac-repair",
      city: "Multan", area: "Gulgasht", exp: 4, rating: 4.5, reviews: 38, price: 2500,
      icon: "🔧", verified: false,
      desc: "AC repair, servicing and cooling fault diagnostics for split and window ACs. I provide same-day service for most common AC problems in the Multan area.",
      skills: ["AC repair", "Cooling diagnostics", "Service & cleaning", "Filter replacement"],
      hours: "9:00 AM – 9:00 PM", availability: "Available today", languages: ["Urdu", "Saraiki"]
    },

    // ---------------- Carpenter ----------------
    {
      id: 25, name: "Naveed Anwar", skill: "Carpenter & Furniture Maker", cat: "carpenter", sub: "custom-furniture",
      city: "Faisalabad", area: "Peoples Colony", exp: 12, rating: 4.6, reviews: 61, price: 8000,
      icon: "🪚", verified: true,
      desc: "Custom furniture, door repairs and cabinet fitting with 12 years of workshop experience. I can visit to measure, quote and complete small repairs on the same visit.",
      skills: ["Custom furniture", "Door repair", "Cabinet fitting", "Wood polishing"],
      hours: "10:00 AM – 7:00 PM", availability: "Available tomorrow", languages: ["Urdu", "Punjabi"]
    },
    {
      id: 26, name: "Mehboob Elahi", skill: "Door Repair Specialist", cat: "carpenter", sub: "door-repair",
      city: "Karachi", area: "Malir", exp: 8, rating: 4.5, reviews: 54, price: 1500,
      icon: "🚪", verified: true,
      desc: "Door installation, hinge replacement, lock fitting and door alignment services. I handle wooden, MDF and flush doors with precise fitting and smooth operation.",
      skills: ["Door installation", "Hinge fitting", "Lock fitting", "Door alignment"],
      hours: "9:00 AM – 7:00 PM", availability: "Available today", languages: ["Urdu", "Punjabi"]
    },
    {
      id: 27, name: "Tariq Mahmood", skill: "Cabinet Fitting Expert", cat: "carpenter", sub: "cabinet-fitting",
      city: "Lahore", area: "DHA Phase 5", exp: 10, rating: 4.8, reviews: 87, price: 15000,
      icon: "🗄️", verified: true,
      desc: "Kitchen cabinet design, fabrication and fitting. I also handle wardrobe and storage cabinet installations with soft-close hinges and quality hardware.",
      skills: ["Kitchen cabinets", "Wardrobe fitting", "Storage solutions", "Hardware installation"],
      hours: "9:00 AM – 6:00 PM", availability: "Available this week", languages: ["Urdu", "Punjabi", "English"]
    },
    {
      id: 28, name: "Rizwan Ali", skill: "Wood Polishing Specialist", cat: "carpenter", sub: "wood-polishing",
      city: "Islamabad", area: "G-9", exp: 9, rating: 4.7, reviews: 63, price: 3000,
      icon: "✨", verified: true,
      desc: "Furniture polishing, varnishing and surface refinishing for all types of wooden furniture and fixtures. I use quality polish materials for a long-lasting, smooth finish.",
      skills: ["Furniture polishing", "Varnishing", "Surface refinishing", "Wood treatment"],
      hours: "10:00 AM – 6:00 PM", availability: "Available tomorrow", languages: ["Urdu", "Punjabi"]
    },
    {
      id: 29, name: "Imran Khalil", skill: "Furniture Assembly Expert", cat: "carpenter", sub: "furniture-assembly",
      city: "Hyderabad", area: "Latifabad", exp: 5, rating: 4.4, reviews: 31, price: 2000,
      icon: "🧰", verified: false,
      desc: "Assembly of flat-pack furniture, beds, tables, shelves and office furniture. I bring my own tools and can assemble most items within 1–3 hours.",
      skills: ["Furniture assembly", "Bed assembly", "Shelf fitting", "Office furniture setup"],
      hours: "9:00 AM – 8:00 PM", availability: "Available today", languages: ["Urdu", "Sindhi"]
    },
    {
      id: 30, name: "Gulzar Ahmed", skill: "Master Carpenter", cat: "carpenter", sub: "custom-furniture",
      city: "Peshawar", area: "Hayatabad", exp: 15, rating: 4.9, reviews: 95, price: 8000,
      icon: "🪑", verified: true,
      desc: "Master carpenter with 15 years of experience in custom furniture making, antique restoration and bespoke woodwork. I create pieces that combine traditional craftsmanship with modern design.",
      skills: ["Custom furniture", "Antique restoration", "Bespoke woodwork", "Detailed carving"],
      hours: "8:00 AM – 6:00 PM", availability: "Available this week", languages: ["Urdu", "English", "Pashto"]
    },

    // ---------------- Graphic Designer ----------------
    {
      id: 31, name: "Sara Ahmed", skill: "Logo & Brand Designer", cat: "graphic-designer", sub: "logo-design",
      city: "Karachi", area: "Clifton", exp: 6, rating: 4.9, reviews: 112, price: 5000,
      icon: "🎨", verified: true,
      desc: "Logo designer and brand identity specialist. I create distinctive, memorable logos with multiple concepts, unlimited revisions and all source files delivered.",
      skills: ["Logo design", "Brand identity", "Typography", "Vector graphics"],
      hours: "11:00 AM – 9:00 PM", availability: "Available today", languages: ["Urdu", "English"]
    },
    {
      id: 32, name: "Hassan Raza", skill: "Social Media Designer", cat: "graphic-designer", sub: "social-media-design",
      city: "Lahore", area: "Gulberg", exp: 4, rating: 4.7, reviews: 78, price: 4000,
      icon: "📣", verified: true,
      desc: "Social media designer specialising in eye-catching post designs, story templates and monthly content packs for Instagram, Facebook and LinkedIn.",
      skills: ["Social media posts", "Story templates", "Content calendars", "Brand consistency"],
      hours: "10:00 AM – 8:00 PM", availability: "Available tomorrow", languages: ["Urdu", "English"]
    },
    {
      id: 33, name: "Ayesha Malik", skill: "Video Editor & Motion Designer", cat: "graphic-designer", sub: "video-editing",
      city: "Islamabad", area: "F-7", exp: 5, rating: 4.8, reviews: 91, price: 3000,
      icon: "🎬", verified: true,
      desc: "Video editor and motion graphics designer for reels, YouTube content and promotional videos. I handle colour grading, subtitles, transitions and audio sync.",
      skills: ["Video editing", "Motion graphics", "Colour grading", "Subtitles & captions"],
      hours: "12:00 PM – 10:00 PM", availability: "Available today", languages: ["Urdu", "English"]
    },
    {
      id: 34, name: "Bilal Khan", skill: "Print & Design Specialist", cat: "graphic-designer", sub: "print-design",
      city: "Rawalpindi", area: "Saddar", exp: 7, rating: 4.6, reviews: 65, price: 1800,
      icon: "🖨️", verified: true,
      desc: "Print design specialist for business cards, flyers, brochures and wedding invitations. I deliver print-ready files with proper bleed and CMYK colour setup.",
      skills: ["Business cards", "Flyer design", "Wedding cards", "Print production"],
      hours: "10:00 AM – 7:00 PM", availability: "Available this week", languages: ["Urdu", "English"]
    },
    {
      id: 35, name: "Zainab Tariq", skill: "Brand Identity Designer", cat: "graphic-designer", sub: "brand-identity",
      city: "Lahore", area: "DHA Phase 6", exp: 8, rating: 4.9, reviews: 104, price: 20000,
      icon: "🏷️", verified: true,
      desc: "Brand identity designer creating complete visual systems for businesses. I deliver brand guidelines, color palettes, typography and marketing collateral design.",
      skills: ["Brand guidelines", "Visual systems", "Color theory", "Marketing collateral"],
      hours: "11:00 AM – 8:00 PM", availability: "Available tomorrow", languages: ["Urdu", "English"]
    },
    {
      id: 36, name: "Ayaan Sheikh", skill: "Logo Designer & Illustrator", cat: "graphic-designer", sub: "logo-design",
      city: "Karachi", area: "DHA Phase 2", exp: 3, rating: 4.5, reviews: 42, price: 5000,
      icon: "✒️", verified: false,
      desc: "Logo designer and digital illustrator with a modern, minimalist approach. I specialise in mascot logos, emblems and creative illustrations for brands and startups.",
      skills: ["Logo design", "Digital illustration", "Mascot design", "Minimalist branding"],
      hours: "1:00 PM – 10:00 PM", availability: "Available this week", languages: ["Urdu", "English"]
    }
  ];

  const REVIEWER_NAMES = [
    "Ahmed R.", "Sana M.", "Bilal K.", "Fatima A.", "Usman S.",
    "Hira N.", "Zain T.", "Ayesha B.", "Imran J.", "Maria F.",
    "Hassan Q.", "Nida R.", "Omar L.", "Sadia P.", "Asad W.",
    "Rabia D.", "Faisal H.", "Nadia C.", "Waseem Z.", "Saba G.",
    "Tariq M.", "Amna K.", "Junaid E.", "Rida S."
  ];

  const REVIEW_TEXTS = [
    "Excellent service and very professional. Arrived on time and completed the work neatly. Highly recommended!",
    "Very happy with the work. Explained everything clearly and gave good advice. Will hire again.",
    "Great experience overall. Punctual, polite and skilled. The quality of work exceeded my expectations.",
    "Good service but took a bit longer than expected. The final result was satisfactory though.",
    "Highly professional and knowledgeable. Fixed the issue quickly and charged a fair price.",
    "Very satisfied with the work. Clean and tidy, and cleaned up after finishing. Recommended!",
    "Outstanding service. Very detail-oriented and made sure I was happy with everything before leaving.",
    "Friendly and skilled. Explained the problem and the solution clearly. Fair pricing too.",
    "Reliable and trustworthy. Did a thorough job and I felt comfortable having them in my home.",
    "Great communication from start to finish. The work was completed to a high standard. Will use again."
  ];

  const SAMPLE_REQUESTS = [
    {
      bookingId: "HKM-DEMO-2026-000101",
      providerId: 7,
      providerName: "Hamza Siddiqui",
      providerSkill: "Licensed Electrician",
      service: "Residential Wiring",
      servicePrice: 15000,
      customer: "Zubair Hassan",
      phone: "0300 5554321",
      city: "Islamabad",
      address: "Street 14, Sector F-11/2",
      date: new Date(Date.now() + 86400000).toISOString().slice(0, 10),
      time: "10:00",
      details: "Main distribution board tripping frequently and need inspection of ground wiring.",
      instructions: "Please call on arrival. Meter room is on the ground floor.",
      status: "Pending",
      paymentStatus: "Pending confirmation",
      createdAt: new Date(Date.now() - 7200000).toISOString(),
      demo: true,
      invoice: {
        invoiceNumber: "INV-2026-000101",
        requestId: "HKM-DEMO-2026-000101",
        basePrice: 15000,
        platformFee: 1500,
        platformFeeRate: 0.10,
        tax: 750,
        taxRate: 0.05,
        totalAmount: 17250,
        status: "Estimated Receipt",
        generatedAt: new Date(Date.now() - 7200000).toISOString()
      }
    },
    {
      bookingId: "HKM-DEMO-2026-000102",
      providerId: 7,
      providerName: "Hamza Siddiqui",
      providerSkill: "Licensed Electrician",
      service: "Fan & Light Installation",
      servicePrice: 1200,
      customer: "Mariam Tariq",
      phone: "0321 8887766",
      city: "Islamabad",
      address: "House 42, Street 7, F-10/3",
      date: new Date().toISOString().slice(0, 10),
      time: "14:00",
      details: "Installation of 3 imported ceiling fans and chandelier wiring.",
      instructions: "High ceiling requires an extension ladder.",
      status: "Counteroffer Received",
      paymentStatus: "Pending customer response",
      createdAt: new Date(Date.now() - 14400000).toISOString(),
      demo: true,
      counteroffer: {
        newPrice: 2500,
        explanation: "3 ceiling fans plus heavy chandelier require ceiling reinforcement and additional wiring conduit.",
        terms: "Includes supply of heavy-duty rawl bolts and safety wiring hooks.",
        date: new Date(Date.now() - 3600000).toISOString()
      },
      invoice: {
        invoiceNumber: "INV-2026-000102",
        requestId: "HKM-DEMO-2026-000102",
        basePrice: 1200,
        platformFee: 120,
        platformFeeRate: 0.10,
        tax: 60,
        taxRate: 0.05,
        totalAmount: 1380,
        status: "Estimated Receipt",
        generatedAt: new Date(Date.now() - 14400000).toISOString()
      }
    },
    {
      bookingId: "HKM-DEMO-2026-000103",
      providerId: 19,
      providerName: "Usman Ali",
      providerSkill: "AC Repair Technician",
      service: "AC Repair & Service",
      servicePrice: 2500,
      customer: "Salman Farooq",
      phone: "0333 4443322",
      city: "Karachi",
      address: "Block 4, Gulshan-e-Iqbal",
      date: new Date().toISOString().slice(0, 10),
      time: "11:30",
      details: "1.5 ton Inverter AC cooling is weak and indoor unit leaking water.",
      instructions: "Security guard will guide you to Apartment 302.",
      status: "Awaiting Payment",
      paymentStatus: "Awaiting payment",
      createdAt: new Date(Date.now() - 21600000).toISOString(),
      demo: true,
      invoice: {
        invoiceNumber: "INV-2026-000103",
        requestId: "HKM-DEMO-2026-000103",
        basePrice: 2500,
        platformFee: 250,
        platformFeeRate: 0.10,
        tax: 125,
        taxRate: 0.05,
        totalAmount: 2875,
        status: "Confirmed Invoice",
        generatedAt: new Date(Date.now() - 21600000).toISOString()
      }
    },
    {
      bookingId: "HKM-DEMO-2026-000104",
      providerId: 19,
      providerName: "Usman Ali",
      providerSkill: "AC Repair Technician",
      service: "AC Deep Cleaning & Service",
      servicePrice: 3500,
      customer: "Amina Bilal",
      phone: "0312 9998877",
      city: "Karachi",
      address: "Fl-2, Block 13-D, Gulshan",
      date: new Date(Date.now() - 86400000).toISOString().slice(0, 10),
      time: "16:00",
      details: "Master deep cleaning for two split units before summer season.",
      instructions: "Water point is available in the balcony.",
      status: "Paid (Demo)",
      paymentStatus: "Paid (demo)",
      payment: {
        method: "Easypaisa",
        account: "0312 9998877",
        transactionId: "TXN-DEMO-2026-948123",
        amount: 4025,
        paidAt: new Date(Date.now() - 7200000).toISOString()
      },
      createdAt: new Date(Date.now() - 86400000).toISOString(),
      demo: true,
      invoice: {
        invoiceNumber: "INV-2026-000104",
        requestId: "HKM-DEMO-2026-000104",
        basePrice: 3500,
        platformFee: 350,
        platformFeeRate: 0.10,
        tax: 175,
        taxRate: 0.05,
        totalAmount: 4025,
        status: "Paid Invoice (Demo)",
        generatedAt: new Date(Date.now() - 86400000).toISOString()
      }
    },
    {
      bookingId: "HKM-DEMO-2026-000105",
      providerId: 1,
      providerName: "Ayesha Khan",
      providerSkill: "Mathematics Tutor",
      service: "Mathematics (Matric & FSc)",
      servicePrice: 1800,
      customer: "Farhan Qureshi",
      phone: "0345 1112233",
      city: "Karachi",
      address: "Phase 5, DHA",
      date: new Date(Date.now() - 172800000).toISOString().slice(0, 10),
      time: "17:00",
      details: "Coaching for FSc Part 1 Trigonometry and Calculus fundamentals.",
      instructions: "Online Zoom session link requested.",
      status: "Completed",
      paymentStatus: "Paid (demo)",
      payment: {
        method: "JazzCash",
        account: "0345 1112233",
        transactionId: "TXN-DEMO-2026-881290",
        amount: 2070,
        paidAt: new Date(Date.now() - 172800000).toISOString()
      },
      createdAt: new Date(Date.now() - 172800000).toISOString(),
      demo: true,
      invoice: {
        invoiceNumber: "INV-2026-000105",
        requestId: "HKM-DEMO-2026-000105",
        basePrice: 1800,
        platformFee: 180,
        platformFeeRate: 0.10,
        tax: 90,
        taxRate: 0.05,
        totalAmount: 2070,
        status: "Completed Invoice (Demo)",
        generatedAt: new Date(Date.now() - 172800000).toISOString()
      }
    }
  ];

  return { CATEGORIES, CITIES, PROVIDERS, REVIEWER_NAMES, REVIEW_TEXTS, SAMPLE_REQUESTS };
})();

window.HARKAAM_DATA = HARKAAM_DATA;
