/* ============================================================
   DESKLY · ORGANISATIONS
   Churches, mosques, schools, venues, and other places.
   Matches the same shape as JOBS and BUSINESSES.
   ============================================================ */

window.ORGANISATIONS = [

  {
    id: "org001",
    title: "Church",
    local: "",
    category: "Religious",
    search: ["church", "ministry", "fellowship", "worship centre", "worship center", "assembly"],
    variants: [{
      tagline: "A place of worship and gathering.",
      about: "A church community that meets for worship, teaching and fellowship.",
      services: ["Sunday service", "Midweek service", "Bible study", "Prayer meeting"]
    }]
  },
  {
    id: "org002",
    title: "Mosque",
    local: "Masjid",
    category: "Religious",
    search: ["mosque", "masjid", "islamic centre", "islamic center", "muslim place of worship"],
    variants: [{
      tagline: "A place of Islamic worship and gathering.",
      about: "A mosque community that meets for prayers, teaching and other religious activities.",
      services: ["Daily prayers", "Jumu'ah service", "Qur'an study", "Community gatherings"]
    }]
  },
  {
    id: "org003",
    title: "Fellowship",
    local: "Christian Fellowship",
    category: "Religious",
    search: ["fellowship", "christian fellowship", "campus fellowship", "youth fellowship", "prayer group"],
    variants: [{
      tagline: "A Christian community for worship and study.",
      about: "A fellowship group that meets for worship, Bible study and encouragement.",
      services: ["Weekly meetings", "Bible study", "Prayer", "Outreach"]
    }]
  },
  {
    id: "org004",
    title: "Ministry",
    local: "",
    category: "Religious",
    search: ["ministry", "evangelistic ministry", "prayer ministry", "deliverance ministry", "ministry organisation"],
    variants: [{
      tagline: "A ministry dedicated to service and outreach.",
      about: "A ministry that provides teaching, prayer and outreach to its community.",
      services: ["Teaching", "Prayer", "Outreach", "Counselling"]
    }]
  },
  {
    id: "org005",
    title: "Event Centre",
    local: "Event Hall",
    category: "Events",
    search: ["event centre", "event center", "event hall", "venue", "hall rental", "party venue"],
    variants: [{
      tagline: "A venue for events and gatherings.",
      about: "A hall or venue available for weddings, birthdays, meetings and other events.",
      services: ["Venue hire", "Wedding receptions", "Birthday parties", "Corporate events"]
    }]
  },
  {
    id: "org006",
    title: "School",
    local: "",
    category: "Education",
    search: ["school", "private school", "primary school", "secondary school", "nursery school"],
    variants: [{
      tagline: "A place of learning for children and students.",
      about: "A school providing education for students at one or more levels.",
      services: ["Nursery", "Primary", "Secondary", "After-school care"]
    }]
  },
  {
    id: "org007",
    title: "Training Centre",
    local: "Training Center",
    category: "Education",
    search: ["training centre", "training center", "skill centre", "vocational centre", "training school"],
    variants: [{
      tagline: "A centre for practical training and skills.",
      about: "A training centre that provides practical courses and skill development.",
      services: ["Skill training", "Short courses", "Certification", "Workshops"]
    }]
  },
  {
    id: "org008",
    title: "Community Centre",
    local: "Community Center",
    category: "Community",
    search: ["community centre", "community center", "community hall", "community space"],
    variants: [{
      tagline: "A space for community activities and gatherings.",
      about: "A community space that hosts events, meetings and local activities.",
      services: ["Community meetings", "Events", "Youth programmes", "Local activities"]
    }]
  },
  {
    id: "org009",
    title: "Fitness Centre",
    local: "Gym",
    category: "Health",
    search: ["fitness centre", "fitness center", "gym", "workout centre", "exercise studio"],
    variants: [{
      tagline: "A place for fitness and exercise.",
      about: "A fitness centre or gym offering equipment and guided workouts.",
      services: ["Gym equipment", "Personal training", "Group classes", "Fitness programmes"]
    }]
  },
  {
    id: "org010",
    title: "Clinic",
    local: "",
    category: "Health",
    search: ["clinic", "health clinic", "medical centre", "medical center", "health centre"],
    variants: [{
      tagline: "A clinic providing basic health services.",
      about: "A clinic offering basic medical consultation, treatment and health services.",
      services: ["Consultations", "Basic treatment", "Health checks", "Referrals"]
    }]
  },
  {
    id: "org011",
    title: "Charity",
    local: "Charity Organisation",
    category: "Community",
    search: ["charity", "charity organisation", "charity organization", "charitable organisation"],
    variants: [{
      tagline: "A charity supporting people and communities.",
      about: "A charity that provides support, aid and services to people in need.",
      services: ["Community support", "Aid programmes", "Outreach", "Volunteering"]
    }]
  },
  {
    id: "org012",
    title: "NGO",
    local: "Non-Governmental Organisation",
    category: "Community",
    search: ["ngo", "non governmental organisation", "non governmental organization", "nonprofit"],
    variants: [{
      tagline: "A non-profit working for a cause.",
      about: "A non-governmental organisation working on social, health, education or community causes.",
      services: ["Programmes", "Community work", "Advocacy", "Awareness"]
    }]
  }

];