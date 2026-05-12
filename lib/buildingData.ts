export type StudySpace = {
  floor: string;
  name: string;
  type: 'individual' | 'group' | 'lounge' | 'classroom';
  noiseLevel: 'silent' | 'quiet' | 'collaborative';
  keycardRequired: boolean;
  outlets: boolean;
  printer: boolean;
  bookingUrl?: string;
  notes: string;
};

export type Building = {
  id: string;
  name: string;
  shortName: string;
  coords: [number, number];
  description: string;
  studySpaces: StudySpace[];
};

export const buildings: Building[] = [
  {
    id: "dana-porter",
    name: "Dana Porter Library",
    shortName: "LIB",
    coords: [43.4698, -80.5430],
    description: "Main humanities and social sciences library. Note: Floor 5 is permanently inaccessible to students.",
    studySpaces: [
      { floor: "Floors 6–9", name: "Individual Study Carrels", type: "individual", noiseLevel: "silent", keycardRequired: false, outlets: true, printer: false, bookingUrl: "https://lib.uwaterloo.ca/web/clickable-floor-plans", notes: "Consult clickable floor plans for exact locations" },
      { floor: "Floor 10", name: "Group Study Tables", type: "group", noiseLevel: "collaborative", keycardRequired: false, outlets: true, printer: false, notes: "Open group tables" },
      { floor: "Throughout", name: "Group Study Rooms", type: "group", noiseLevel: "collaborative", keycardRequired: false, outlets: true, printer: true, bookingUrl: "https://libcal.uwaterloo.ca/seats?lid=2604&gid=5325&c=-1", notes: "Bookable online" },
    ],
  },
  {
    id: "davis-centre",
    name: "Davis Centre Library",
    shortName: "DC",
    coords: [43.4732, -80.5425],
    description: "Engineering and computer science library inside the William G. Davis Computer Research Centre.",
    studySpaces: [
      { floor: "Main & Lower Floors", name: "Individual Study Carrels", type: "individual", noiseLevel: "quiet", keycardRequired: false, outlets: true, printer: false, notes: "" },
      { floor: "Lower Floor", name: "Group Study Tables", type: "group", noiseLevel: "collaborative", keycardRequired: false, outlets: true, printer: false, notes: "" },
      { floor: "Various", name: "Study Rooms F, M & N", type: "group", noiseLevel: "collaborative", keycardRequired: false, outlets: true, printer: false, bookingUrl: "https://libcal.uwaterloo.ca/seats?lid=1736&gid=5324&c=-1", notes: "Bookable online" },
    ],
  },
  {
    id: "musagetes",
    name: "Musagetes Architecture Library",
    shortName: "ARC",
    coords: [43.4684, -80.5402],
    description: "Architecture library with individual and small group study spaces.",
    studySpaces: [
      { floor: "Main Floor", name: "Individual Study Carrels", type: "individual", noiseLevel: "quiet", keycardRequired: false, outlets: true, printer: false, notes: "" },
      { floor: "Main Floor", name: "The Elder Lodge", type: "group", noiseLevel: "collaborative", keycardRequired: false, outlets: true, printer: false, bookingUrl: "https://libcal.uwaterloo.ca/seats?lid=2606", notes: "Up to 4 people. Available Sun, Mon, Wed, Fri only. Check in at front desk on arrival." },
    ],
  },
  {
    id: "conrad-grebel",
    name: "Conrad Grebel University College",
    shortName: "CGR",
    coords: [43.4664, -80.5476],
    description: "Milton Good Library offers quiet individual and group study.",
    studySpaces: [
      { floor: "Library", name: "Individual Study Carrels", type: "individual", noiseLevel: "quiet", keycardRequired: false, outlets: true, printer: false, notes: "" },
      { floor: "Library", name: "Group Study Rooms (×2)", type: "group", noiseLevel: "collaborative", keycardRequired: false, outlets: true, printer: false, bookingUrl: "https://uwaterloo.ca/grebel/milton-good-library/study-rooms", notes: "Two rooms, bookable by reservation" },
    ],
  },
  {
    id: "renison",
    name: "Renison University College",
    shortName: "REN",
    coords: [43.4674, -80.5486],
    description: "Lusi Wong Library with individual carrels and group study rooms.",
    studySpaces: [
      { floor: "Library", name: "Individual Study Carrels", type: "individual", noiseLevel: "quiet", keycardRequired: false, outlets: true, printer: false, notes: "" },
      { floor: "Library", name: "Group Study Rooms (×2)", type: "group", noiseLevel: "collaborative", keycardRequired: false, outlets: true, printer: false, bookingUrl: "https://uwaterloo.ca/renison/book-library-study-room-form", notes: "Two rooms, bookable" },
    ],
  },
  {
    id: "st-jeromes",
    name: "St. Jerome's University Library",
    shortName: "SJU",
    coords: [43.4679, -80.5502],
    description: "University college library with quiet study and group rooms.",
    studySpaces: [
      { floor: "Library", name: "Individual Study Carrels", type: "individual", noiseLevel: "quiet", keycardRequired: false, outlets: true, printer: false, notes: "" },
      { floor: "Library", name: "Group Study Rooms (×3)", type: "group", noiseLevel: "collaborative", keycardRequired: false, outlets: true, printer: false, bookingUrl: "https://www.sju.ca/studyrooms", notes: "Three rooms, bookable online" },
    ],
  },
  {
    id: "pharmacy",
    name: "Pharmacy Building",
    shortName: "PHR",
    coords: [43.4742, -80.5372],
    description: "Pharmacy Library with 24/7 access for all students, staff, and faculty.",
    studySpaces: [
      { floor: "Library", name: "Individual Study Carrels", type: "individual", noiseLevel: "quiet", keycardRequired: false, outlets: true, printer: false, notes: "Available 24/7 to all students" },
      { floor: "Library", name: "Group Study Rooms (×3)", type: "group", noiseLevel: "collaborative", keycardRequired: false, outlets: true, printer: false, notes: "Available 24/7. Book via main lobby reception desk." },
    ],
  },
  {
    id: "needles-hall",
    name: "Needles Hall — The Centre",
    shortName: "NH",
    coords: [43.4713, -80.5454],
    description: "Administrative and student services hub with first-come first-serve study rooms.",
    studySpaces: [
      { floor: "Floor 1", name: "Study Rooms (×6)", type: "individual", noiseLevel: "quiet", keycardRequired: false, outlets: true, printer: false, notes: "First-come, first-served. No booking required." },
    ],
  },
  {
    id: "slc",
    name: "Student Life Centre",
    shortName: "SLC",
    coords: [43.4726, -80.5453],
    description: "Student hub with food, services, and study space. Note: 1 study room currently closed for MC link construction.",
    studySpaces: [
      { floor: "Floor 3", name: "Quiet Study Room", type: "individual", noiseLevel: "quiet", keycardRequired: false, outlets: true, printer: false, notes: "Small portion (~20%) closed due to construction. Mostly open." },
      { floor: "Various", name: "Group Study Rooms (×6 open)", type: "group", noiseLevel: "collaborative", keycardRequired: false, outlets: true, printer: false, notes: "1 room closed for construction. 6 remain open." },
      { floor: "Floor 1", name: "Great Hall (exam season)", type: "group", noiseLevel: "collaborative", keycardRequired: false, outlets: false, printer: false, notes: "Extra tables/chairs added during exam periods" },
    ],
  },
  {
    id: "tatham-centre",
    name: "William M. Tatham Centre",
    shortName: "TC",
    coords: [43.4683, -80.5432],
    description: "CEE (co-op) building. Interview rooms available as study rooms outside interview cycles.",
    studySpaces: [
      { floor: "Main Floor", name: "Interview Rooms as Study Space", type: "individual", noiseLevel: "quiet", keycardRequired: false, outlets: true, printer: false, bookingUrl: "https://uwaterloo.ca/co-operative-education/contact-us/tc-room-use-principles#tc-rooms", notes: "Weekdays 9am–9pm (9am–11pm during exams). During interview cycles, available from 4:30pm. Request at CEE Hub on main floor." },
    ],
  },
  {
    id: "e2",
    name: "Engineering 2",
    shortName: "E2",
    coords: [43.4720, -80.5395],
    description: "Engineering building with accessible classroom space when not in use.",
    studySpaces: [
      { floor: "Floor 3", name: "Room 3353 (Classroom)", type: "classroom", noiseLevel: "quiet", keycardRequired: false, outlets: true, printer: false, notes: "Accessible when not in use for class" },
    ],
  },
  {
    id: "cph",
    name: "Carl A. Pollock Hall",
    shortName: "CPH",
    coords: [43.4706, -80.5408],
    description: "Engineering building with classroom space and POETS lounge.",
    studySpaces: [
      { floor: "Floor 3", name: "Room 3613 (Classroom)", type: "classroom", noiseLevel: "quiet", keycardRequired: false, outlets: true, printer: false, notes: "Accessible when not in use for class" },
      { floor: "Floor 1 Atrium", name: "POETS Lounge", type: "lounge", noiseLevel: "collaborative", keycardRequired: false, outlets: false, printer: false, notes: "Student pub and lounge with comfortable seating, tables, and outdoor patio" },
    ],
  },
  {
    id: "physics",
    name: "Physics Building",
    shortName: "PHY",
    coords: [43.4718, -80.5447],
    description: "Physics building with classroom study space when not in use.",
    studySpaces: [
      { floor: "Floor 1", name: "Room 153 (Classroom)", type: "classroom", noiseLevel: "quiet", keycardRequired: false, outlets: true, printer: false, notes: "Accessible when not in use for class" },
    ],
  },
  {
    id: "modern-languages",
    name: "Modern Languages",
    shortName: "ML",
    coords: [43.4693, -80.5454],
    description: "Arts building with classroom space and a lower-level cafeteria.",
    studySpaces: [
      { floor: "Floor 3", name: "Room 355 (Classroom)", type: "classroom", noiseLevel: "quiet", keycardRequired: false, outlets: true, printer: false, notes: "Accessible when not in use for class" },
      { floor: "Lower Level", name: "Cafeteria & Patio", type: "lounge", noiseLevel: "collaborative", keycardRequired: false, outlets: false, printer: false, notes: "Large cafeteria with patio. Good for small groups up to 4." },
    ],
  },
  {
    id: "hagey-hall",
    name: "Hagey Hall (The Hub)",
    shortName: "HH",
    coords: [43.4690, -80.5448],
    description: "Arts faculty hub with bookable rooms, open mezzanine, and quiet study deck.",
    studySpaces: [
      { floor: "Floor 2", name: "Project Cube (HH 2034)", type: "group", noiseLevel: "collaborative", keycardRequired: true, outlets: true, printer: false, notes: "Glass-walled room. Available for booking by arts students with valid WatCard. Contact Dean of Arts Office: ext. 32400" },
      { floor: "Floor 2", name: "Mezzanine", type: "lounge", noiseLevel: "collaborative", keycardRequired: false, outlets: true, printer: false, notes: "Open space for events, displays, and workspace. Counter seating available." },
      { floor: "Floor 3", name: "Study Deck (HH 3042)", type: "individual", noiseLevel: "quiet", keycardRequired: false, outlets: true, printer: false, notes: "Glass-walled room with comfortable chairs for quiet study" },
    ],
  },
  {
    id: "stc",
    name: "Science Teaching Complex",
    shortName: "STC",
    coords: [43.4734, -80.5453],
    description: "Science faculty building with lounge and individual/double study spaces.",
    studySpaces: [
      { floor: "Various", name: "Lounge & Study Spaces", type: "individual", noiseLevel: "quiet", keycardRequired: false, outlets: true, printer: false, notes: "Single and double study spaces available" },
    ],
  },
  {
    id: "qnc",
    name: "Quantum Nano Centre",
    shortName: "QNC",
    coords: [43.4715, -80.5415],
    description: "Research building with beautiful atrium study spaces. Rarely crowded.",
    studySpaces: [
      { floor: "Various", name: "Single/Double Study Spaces", type: "individual", noiseLevel: "quiet", keycardRequired: false, outlets: true, printer: false, notes: "Quiet and rarely crowded" },
    ],
  },
  {
    id: "e5",
    name: "Engineering 5",
    shortName: "E5",
    coords: [43.4726, -80.5391],
    description: "Engineering building with group tables, a lounge, and computer study spaces.",
    studySpaces: [
      { floor: "Floor 2", name: "Study Spaces with Computers", type: "individual", noiseLevel: "quiet", keycardRequired: false, outlets: true, printer: false, notes: "Access to computers" },
      { floor: "Floor 3", name: "Group Study Tables", type: "group", noiseLevel: "collaborative", keycardRequired: false, outlets: true, printer: false, notes: "" },
      { floor: "Floor 6", name: "Lounge", type: "lounge", noiseLevel: "quiet", keycardRequired: false, outlets: true, printer: false, notes: "" },
    ],
  },
  {
    id: "mc",
    name: "Math & Computer Building",
    shortName: "MC",
    coords: [43.4721, -80.5441],
    description: "Mathematics faculty building with computer labs, Math C&D, and study areas.",
    studySpaces: [
      { floor: "Floor 3", name: "Math Coffee & Donut Shop", type: "lounge", noiseLevel: "collaborative", keycardRequired: false, outlets: false, printer: false, notes: "Campus institution. Good for casual study between classes." },
    ],
  },
  {
    id: "ev1",
    name: "Environment 1",
    shortName: "EV1",
    coords: [43.4676, -80.5476],
    description: "Environment faculty building with a central courtyard.",
    studySpaces: [
      { floor: "Outside", name: "Courtyard", type: "lounge", noiseLevel: "collaborative", keycardRequired: false, outlets: false, printer: false, notes: "Outdoor courtyard seating. Weather-dependent." },
    ],
  },
  {
    id: "ev3",
    name: "Environment 3",
    shortName: "EV3",
    coords: [43.4680, -80.5472],
    description: "Environment faculty building with Williams Fresh Café.",
    studySpaces: [
      { floor: "Main Floor", name: "Williams Fresh Café", type: "lounge", noiseLevel: "collaborative", keycardRequired: false, outlets: false, printer: false, notes: "Café seating. Good for casual study." },
    ],
  },
];
