// Reference data & lookups for TNEA Engineering Admissions 2026

export const COMMUNITY = [
  "OC – Open Competition",
  "BC – Backward Class",
  "BCM – Backward Class Muslim",
  "MBC & DNC – Most Backward Class & Denotified Communities",
  "SC – Scheduled Caste",
  "SCA – Scheduled Caste (Arunthathiyar)",
  "ST – Scheduled Tribe",
];

export const SPECIAL = [
  "7.5% Government School Quota (Studied 6th to 12th in Tamil Nadu Govt Schools)",
  "Sports Person (Eminent Sports Persons quota)",
  "Ex-Servicemen (Children of Ex-Servicemen)",
  "Differently Abled (PwD) (Benchmark Disability 40% and above)",
];

export const BOARDS = [
  "Tamil Nadu State Board",
  "CBSE (Central Board of Secondary Education)",
  "ICSE / ISC (Council for the Indian School Certificate Examinations)",
  "Matriculation / Anglo-Indian Equivalent",
  "Other State Boards",
  "Other / International (IB / Cambridge)",
];

export const PASSING_YEARS = ["2026", "2025", "2024", "2023", "2022"];

export const GENDERS = [
  { value: "Male", labelEn: "Male", labelTa: "ஆண்" },
  { value: "Female", labelEn: "Female", labelTa: "பெண்" },
  { value: "Transgender", labelEn: "Transgender", labelTa: "மூன்றாம் பாலினம்" },
];

export const STATES = [
  "Tamil Nadu",
  "Kerala",
  "Karnataka",
  "Andhra Pradesh",
  "Telangana",
  "Maharashtra",
  "Puducherry",
  "Other State / UT",
];

export const TN_DISTRICTS = [
  "Chennai",
  "Coimbatore",
  "Madurai",
  "Tiruchirappalli",
  "Salem",
  "Tirunelveli",
  "Erode",
  "Vellore",
  "Thanjavur",
  "Kanchipuram",
  "Chengalpattu",
  "Tiruvallur",
  "Dindigul",
  "Cuddalore",
  "Villupuram",
  "Tiruppur",
  "Kanyakumari",
  "Namakkal",
  "Sivaganga",
  "Virudhunagar",
  "Karur",
  "Theni",
  "Krishnagiri",
  "Dharmapuri",
  "Nagapattinam",
  "Pudukkottai",
  "Ramanathapuram",
  "Nilgiris",
  "Ariyalur",
  "Perambalur",
  "Tenkasi",
  "Ranipet",
  "Tirupathur",
  "Kallakurichi",
  "Mayiladuthurai",
];

export const SAMPLE_COLLEGES = [
  {
    id: 1,
    code: "0001",
    name: "College of Engineering, Guindy (CEG), Anna University",
    city: "Chennai",
    district: "Chennai",
    branch: "Computer Science & Engineering",
    cutoff2025: 199.5,
    nirfRank: 8,
    type: "University Department (Govt)",
  },
  {
    id: 2,
    code: "0004",
    name: "Madras Institute of Technology (MIT), Chromepet",
    city: "Chennai",
    district: "Chengalpattu",
    branch: "Aeronautical Engineering",
    cutoff2025: 198.0,
    nirfRank: 14,
    type: "University Department (Govt)",
  },
  {
    id: 3,
    code: "2006",
    name: "PSG College of Technology",
    city: "Coimbatore",
    district: "Coimbatore",
    branch: "Information Technology",
    cutoff2025: 197.5,
    nirfRank: 63,
    type: "Govt Aided Autonomous",
  },
  {
    id: 4,
    code: "2007",
    name: "Coimbatore Institute of Technology (CIT)",
    city: "Coimbatore",
    district: "Coimbatore",
    branch: "Mechanical Engineering",
    cutoff2025: 194.0,
    nirfRank: 102,
    type: "Govt Aided Autonomous",
  },
  {
    id: 5,
    code: "5008",
    name: "Thiagarajar College of Engineering (TCE)",
    city: "Madurai",
    district: "Madurai",
    branch: "Electronics & Communication Engg",
    cutoff2025: 196.0,
    nirfRank: 85,
    type: "Govt Aided Autonomous",
  },
  {
    id: 6,
    code: "2005",
    name: "Government College of Technology (GCT)",
    city: "Coimbatore",
    district: "Coimbatore",
    branch: "Electrical & Electronics Engg",
    cutoff2025: 193.5,
    nirfRank: 120,
    type: "Government Engineering College",
  },
  {
    id: 7,
    code: "1315",
    name: "Sri Sivasubramaniya Nadar (SSN) College of Engineering",
    city: "Kalavakkam",
    district: "Chengalpattu",
    branch: "Computer Science & Engineering",
    cutoff2025: 197.0,
    nirfRank: 45,
    type: "Self Financing Autonomous",
  },
];

export const INITIAL_CHECKLIST = [
  { id: "c1", titleEn: "Complete Online Registration & Account Creation", titleTa: "ஆன்லைன் பதிவு மற்றும் கணக்கு உருவாக்குதல்", completed: true },
  { id: "c2", titleEn: "Fill Personal & Nativity Details", titleTa: "தனிநபர் & பூர்வீக விவரங்களை நிரப்புதல்", completed: true },
  { id: "c3", titleEn: "Enter Class 12 Marks & Calculate Cutoff", titleTa: "12-ஆம் வகுப்பு மதிப்பெண்கள் & கட்-ஆஃப் கணக்கிடுதல்", completed: true },
  { id: "c4", titleEn: "Upload Certificates for Online Verification", titleTa: "சான்றிதழ்களை இணையவழியில் பதிவேற்றம் செய்தல்", completed: false },
  { id: "c5", titleEn: "Download Random Number & Rank Card", titleTa: "ரேண்டம் எண் மற்றும் தரவரிசை அட்டை பதிவிறக்கம்", completed: false },
  { id: "c6", titleEn: "Participate in Online Choice Filling (Rounds 1-4)", titleTa: "இணையவழி விருப்பக் கல்லூரி பதிவு (சுற்றுகள் 1-4)", completed: false },
  { id: "c7", titleEn: "Confirm Provisional Seat Allotment", titleTa: "தற்காலிக கல்லூரி ஒதுக்கீட்டை உறுதிசெய்தல்", completed: false },
];
