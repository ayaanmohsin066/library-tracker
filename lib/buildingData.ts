export interface StudySpace {
  floor: string;
  name: string;
  seats: number;
  noiseLevel: "silent" | "quiet" | "collaborative";
  keycardRequired: boolean;
  outlets: boolean;
  printer: boolean;
  notes: string;
}

export interface Building {
  id: string;
  name: string;
  shortName: string;
  coords: [number, number];
  description: string;
  studySpaces: StudySpace[];
}

export const buildings: Building[] = [
  {
    id: "dana-porter",
    name: "Dana Porter Library",
    shortName: "DP",
    coords: [43.4698, -80.5426],
    description: "Main humanities and social sciences library",
    studySpaces: [
      { floor: "Floor 2", name: "Silent Study Zone",     seats: 80, noiseLevel: "silent",        keycardRequired: false, outlets: true,  printer: true,  notes: "Strictly silent. No food." },
      { floor: "Floor 3", name: "Quiet Study Area",      seats: 60, noiseLevel: "quiet",         keycardRequired: false, outlets: true,  printer: false, notes: "" },
      { floor: "Floor 4", name: "Quiet Study Area",      seats: 60, noiseLevel: "quiet",         keycardRequired: false, outlets: true,  printer: false, notes: "" },
      { floor: "Floor 5", name: "Group Study Rooms",     seats: 30, noiseLevel: "collaborative", keycardRequired: false, outlets: true,  printer: false, notes: "Bookable rooms for groups" },
      { floor: "Floor 6", name: "Graduate Reading Room", seats: 40, noiseLevel: "silent",        keycardRequired: true,  outlets: true,  printer: false, notes: "Graduate students only" },
    ],
  },
  {
    id: "davis-centre",
    name: "Davis Centre Library",
    shortName: "DC",
    coords: [43.4730, -80.5421],
    description: "Engineering and computer science library",
    studySpaces: [
      { floor: "Floor 1", name: "Open Study Area",      seats: 50, noiseLevel: "quiet",         keycardRequired: false, outlets: true,  printer: true,  notes: "" },
      { floor: "Floor 2", name: "Silent Reading Room",  seats: 40, noiseLevel: "silent",        keycardRequired: false, outlets: true,  printer: false, notes: "" },
      { floor: "Floor 3", name: "Group Study Rooms",    seats: 24, noiseLevel: "collaborative", keycardRequired: false, outlets: true,  printer: false, notes: "Bookable via library website" },
    ],
  },
  {
    id: "slc",
    name: "Student Life Centre",
    shortName: "SLC",
    coords: [43.4714, -80.5467],
    description: "Student hub with food, services, and study space",
    studySpaces: [
      { floor: "Floor 1", name: "Great Hall",    seats: 100, noiseLevel: "collaborative", keycardRequired: false, outlets: false, printer: false, notes: "Open concept, can be loud during peak hours" },
      { floor: "Floor 2", name: "Study Lounge",  seats: 40,  noiseLevel: "quiet",         keycardRequired: false, outlets: true,  printer: false, notes: "" },
    ],
  },
  {
    id: "mc",
    name: "Math & Computer Building",
    shortName: "MC",
    coords: [43.4723, -80.5437],
    description: "Mathematics faculty building with computer labs and study areas",
    studySpaces: [
      { floor: "Floor 3", name: "Math Tutorial Centre", seats: 30, noiseLevel: "collaborative", keycardRequired: false, outlets: true, printer: false, notes: "TA help available during posted hours" },
      { floor: "Floor 4", name: "Quiet Study Lounge",   seats: 20, noiseLevel: "quiet",         keycardRequired: false, outlets: true, printer: false, notes: "" },
    ],
  },
  {
    id: "e7",
    name: "Engineering 7",
    shortName: "E7",
    coords: [43.4735, -80.5398],
    description: "Modern engineering building with collaborative spaces",
    studySpaces: [
      { floor: "Floor 1", name: "Engineering Outreach Lounge", seats: 30, noiseLevel: "collaborative", keycardRequired: false, outlets: true, printer: false, notes: "Open to all students" },
      { floor: "Floor 2", name: "Study Nooks",                 seats: 20, noiseLevel: "quiet",         keycardRequired: false, outlets: true, printer: false, notes: "" },
    ],
  },
  {
    id: "qnc",
    name: "Quantum Nano Centre",
    shortName: "QNC",
    coords: [43.4710, -80.5415],
    description: "Research building with public study atrium",
    studySpaces: [
      { floor: "Floor 1", name: "Atrium", seats: 25, noiseLevel: "quiet", keycardRequired: false, outlets: true, printer: false, notes: "Beautiful space, rarely crowded" },
    ],
  },
  {
    id: "hh",
    name: "Hagey Hall",
    shortName: "HH",
    coords: [43.4689, -80.5444],
    description: "Arts and humanities building",
    studySpaces: [
      { floor: "Floor 1", name: "Study Commons", seats: 30, noiseLevel: "quiet", keycardRequired: false, outlets: true, printer: false, notes: "" },
    ],
  },
];
