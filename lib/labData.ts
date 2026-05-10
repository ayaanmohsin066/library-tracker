export interface Lab {
  room: string;
  name: string;
  building: "MC" | "DC";
  seats: number;
  type: string;
  hours: string;
  access: string;
  laptopFriendly: boolean;
  notes?: string;
}

export const labs: Lab[] = [
  {
    room: "MC 3005",
    name: "Math Faculty Computing Facility",
    building: "MC",
    seats: 60,
    type: "General use",
    hours: "Mon–Fri 8am–10pm, Sat–Sun 10am–6pm",
    access: "UW students",
    laptopFriendly: true,
    notes: "Printing available. Both Windows and Linux workstations.",
  },
  {
    room: "MC 3027",
    name: "CS Teaching Lab",
    building: "MC",
    seats: 40,
    type: "Instructional / open when no class",
    hours: "Mon–Fri 8am–10pm",
    access: "CS students (WatIAM login)",
    laptopFriendly: false,
    notes: "Linux only. Reserved for scheduled CS courses — open outside class hours.",
  },
  {
    room: "MC 3003",
    name: "MFCF Overflow Lab",
    building: "MC",
    seats: 30,
    type: "General use",
    hours: "Mon–Fri 8am–8pm",
    access: "UW students",
    laptopFriendly: true,
  },
  {
    room: "MC 2061",
    name: "Tutorial Centre Lab A",
    building: "MC",
    seats: 24,
    type: "Instructional / open when no class",
    hours: "Mon–Fri 9am–5pm",
    access: "UW students",
    laptopFriendly: false,
  },
  {
    room: "MC 2062",
    name: "Tutorial Centre Lab B",
    building: "MC",
    seats: 24,
    type: "Instructional / open when no class",
    hours: "Mon–Fri 9am–5pm",
    access: "UW students",
    laptopFriendly: false,
  },
  {
    room: "MC 2063",
    name: "Tutorial Centre Lab C",
    building: "MC",
    seats: 24,
    type: "Instructional / open when no class",
    hours: "Mon–Fri 9am–5pm",
    access: "UW students",
    laptopFriendly: false,
  },
  {
    room: "DC 2577",
    name: "ECE / CS Graduate Lab",
    building: "DC",
    seats: 35,
    type: "Graduate research",
    hours: "24/7 (keycard access)",
    access: "ECE & CS grad students",
    laptopFriendly: true,
    notes: "Keycard required after 6pm.",
  },
  {
    room: "DC 3335",
    name: "Davis Centre Teaching Lab",
    building: "DC",
    seats: 50,
    type: "Instructional / open when no class",
    hours: "Mon–Fri 8am–10pm, Sat 10am–6pm",
    access: "UW students",
    laptopFriendly: true,
    notes: "Windows and Mac workstations available.",
  },
];
