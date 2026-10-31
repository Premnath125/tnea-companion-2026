// AI-Assisted TNEA College & Branch Choice List Engine & PDF Generator

import { TNEA_COLLEGE_CATALOG } from "./data.js";
import { formatCutoff } from "./cutoff.js";

/**
 * Clean community code from full label (e.g. "BC – Backward Class" -> "BC")
 */
export function extractCommunityCode(rawCommunity) {
  if (!rawCommunity) return "OC";
  const first = rawCommunity.trim().split(/[\s–-]/)[0].toUpperCase();
  const valid = ["OC", "BC", "BCM", "MBC", "SC", "SCA", "ST"];
  return valid.includes(first) ? first : "OC";
}

/**
 * Generate AI-assisted recommendations based on candidate's stored data
 */
export function generateChoiceRecommendations({
  cutoff,
  community = "BC",
  studiedGovtSchool = "no",
  selectedBranches = [],
}) {
  const numCutoff = parseFloat(cutoff);
  if (isNaN(numCutoff) || numCutoff <= 0) {
    return [];
  }

  const commCode = extractCommunityCode(community);
  const isGovtQuota = studiedGovtSchool === "yes";

  // Filter by selected branch preference if any selected
  const activeBranches = Array.isArray(selectedBranches) && selectedBranches.length > 0
    ? selectedBranches
    : ["CSE", "IT", "AIML", "DS", "ECE", "EEE", "MECH", "CIVIL", "OTHER"];

  const matched = [];

  for (const col of TNEA_COLLEGE_CATALOG) {
    // Check branch filter
    if (!activeBranches.includes(col.branchCode)) {
      continue;
    }

    // Determine target community cutoff
    let pastCutoff = col.cutoffs?.[commCode] || col.cutoff2025;
    if (isGovtQuota && col.cutoffGovt7_5) {
      pastCutoff = col.cutoffGovt7_5;
    }

    if (typeof pastCutoff !== "number") continue;

    const diff = pastCutoff - numCutoff; // Positive means college cutoff is higher than candidate

    let category = null;
    let priorityScore = 0;

    if (diff > 0 && diff <= 4.5) {
      // Ambitious: slightly higher than candidate cutoff (aspirational target)
      category = "Ambitious";
      priorityScore = 100 - diff;
    } else if (diff <= 0 && diff >= -3.5) {
      // Moderate: within candidate cutoff range (strong competitive chance)
      category = "Moderate";
      priorityScore = 200 + diff;
    } else if (diff < -3.5 && diff >= -28.0) {
      // Safer: comfortably below candidate cutoff (high safety margin)
      category = "Safer";
      priorityScore = 300 + diff;
    }

    if (category) {
      matched.push({
        id: col.id,
        code: col.code,
        name: col.name,
        branch: col.branch,
        branchCode: col.branchCode,
        city: col.city,
        district: col.district,
        type: col.type,
        prevCutoff: pastCutoff,
        category,
        priorityScore,
        diff,
      });
    }
  }

  // Sort choices following optimal TNEA counselling strategy:
  // 1. Ambitious choices (sorted from highest past cutoff down to candidate cutoff)
  // 2. Moderate choices (sorted closest to candidate cutoff)
  // 3. Safer choices (sorted high to low)
  const ambitiousList = matched
    .filter((c) => c.category === "Ambitious")
    .sort((a, b) => b.prevCutoff - a.prevCutoff)
    .slice(0, 5);

  const moderateList = matched
    .filter((c) => c.category === "Moderate")
    .sort((a, b) => b.prevCutoff - a.prevCutoff)
    .slice(0, 7);

  const saferList = matched
    .filter((c) => c.category === "Safer")
    .sort((a, b) => b.prevCutoff - a.prevCutoff)
    .slice(0, 6);

  const combined = [...ambitiousList, ...moderateList, ...saferList];

  // Fallback if score is outside specific ranges: sort all matched by cutoff proximity
  if (combined.length === 0) {
    const allSorted = matched.sort((a, b) => Math.abs(a.diff) - Math.abs(b.diff));
    return allSorted.slice(0, 15).map((item, idx) => ({
      ...item,
      order: idx + 1,
    }));
  }

  return combined.map((item, idx) => ({
    ...item,
    order: idx + 1,
  }));
}

/**
 * Print & Export Choice List as a professional bilingual PDF
 */
export function printChoiceListPdf({
  candidate,
  cutoff,
  choices,
  lang = "en",
  t,
}) {
  const isTa = lang === "ta";
  const title = isTa
    ? "TNEA 2026 – கல்லூரி விருப்பப் பட்டியல்"
    : "TNEA 2026 – College Preference List";

  const commCode = extractCommunityCode(candidate?.community);
  const cutoffStr = formatCutoff(cutoff);
  const formattedDate = new Date().toLocaleDateString(isTa ? "ta-IN" : "en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  const categoryLabel = (cat) => {
    if (isTa) {
      if (cat === "Ambitious") return "உயர்ந்த விருப்பம் (Ambitious)";
      if (cat === "Moderate") return "பொருத்தமானது (Moderate)";
      if (cat === "Safer") return "பாதுகாப்பானது (Safer)";
      return cat;
    }
    return cat;
  };

  const rowsHtml = choices
    .map(
      (c, i) => `
    <tr>
      <td style="text-align: center; font-weight: bold; width: 45px;">${i + 1}</td>
      <td style="font-family: monospace; font-weight: bold; text-align: center; width: 70px;">${c.code}</td>
      <td style="font-weight: 600;">${c.name}</td>
      <td>${c.branch}</td>
      <td style="text-align: center; font-weight: bold; width: 90px;">${typeof c.prevCutoff === "number" ? c.prevCutoff.toFixed(2) : c.cutoff2025 || "—"}</td>
      <td style="text-align: center; width: 140px;">
        <span class="badge badge-${(c.category || "moderate").toLowerCase()}">${categoryLabel(c.category)}</span>
      </td>
    </tr>
  `
    )
    .join("");

  const printWindow = window.open("", "_blank");
  if (!printWindow) {
    alert(isTa ? "அச்சு சாளரத்தைத் திறக்க பாப்-அப் அனுமதிக்கவும்." : "Please allow pop-ups to open and download the PDF.");
    return;
  }

  const printContent = `
<!DOCTYPE html>
<html lang="${lang}">
<head>
  <meta charset="utf-8" />
  <title>${title}</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Noto+Sans+Tamil:wght@400;600;700&display=swap');
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: ${isTa ? "'Noto Sans Tamil', " : ""}'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      color: #0f172a;
      background: #ffffff;
      padding: 30px;
      line-height: 1.45;
      font-size: 13px;
    }
    .header-box {
      border-bottom: 2px solid #1d4ed8;
      padding-bottom: 16px;
      margin-bottom: 20px;
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
    }
    .main-title {
      font-size: 22px;
      font-weight: 700;
      color: #1d4ed8;
      margin-bottom: 4px;
    }
    .sub-title {
      font-size: 13px;
      color: #475569;
    }
    .print-date {
      font-size: 11px;
      color: #64748b;
      text-align: right;
    }
    .candidate-card {
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      padding: 14px 18px;
      margin-bottom: 20px;
    }
    .card-heading {
      font-size: 13px;
      font-weight: 700;
      color: #1e293b;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      margin-bottom: 10px;
      border-bottom: 1px dashed #cbd5e1;
      padding-bottom: 4px;
    }
    .info-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 12px 16px;
    }
    .info-item .label {
      font-size: 11px;
      color: #64748b;
      display: block;
      margin-bottom: 2px;
    }
    .info-item .val {
      font-size: 13px;
      font-weight: 600;
      color: #0f172a;
    }
    .cutoff-highlight {
      color: #1d4ed8;
      font-size: 15px;
      font-weight: 700;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 20px;
      font-size: 12px;
    }
    th, td {
      border: 1px solid #cbd5e1;
      padding: 8px 10px;
      vertical-align: middle;
    }
    th {
      background: #f1f5f9;
      font-weight: 700;
      color: #1e293b;
      text-align: left;
    }
    tr:nth-child(even) {
      background: #f8fafc;
    }
    .badge {
      display: inline-block;
      padding: 3px 8px;
      border-radius: 12px;
      font-size: 10.5px;
      font-weight: 600;
      text-transform: uppercase;
    }
    .badge-ambitious {
      background: #fef3c7;
      color: #b45309;
      border: 1px solid #fde68a;
    }
    .badge-moderate {
      background: #dbeafe;
      color: #1d4ed8;
      border: 1px solid #bfdbfe;
    }
    .badge-safer {
      background: #dcfce7;
      color: #15803d;
      border: 1px solid #bbf7d0;
    }
    .disclaimer-box {
      border: 1px solid #fed7aa;
      background: #fffbeb;
      border-radius: 6px;
      padding: 10px 14px;
      margin-top: 15px;
      font-size: 11px;
      color: #9a3412;
      line-height: 1.4;
    }
    .footer-note {
      margin-top: 25px;
      padding-top: 10px;
      border-top: 1px solid #e2e8f0;
      text-align: center;
      font-size: 11px;
      color: #64748b;
    }
    @media print {
      body { padding: 15px; }
      @page { margin: 1.2cm; size: A4 portrait; }
    }
  </style>
</head>
<body>
  <div class="header-box">
    <div>
      <h1 class="main-title">${title}</h1>
      <p class="sub-title">${isTa ? "தமிழ்நாடு பொறியியல் சேர்க்கை கலந்தாய்வு வழிகாட்டி 2026" : "Tamil Nadu Engineering Admissions Counselling Guide 2026"}</p>
    </div>
    <div class="print-date">
      <div><b>${isTa ? "தயாரிக்கப்பட்ட தேதி:" : "Generated on:"}</b></div>
      <div>${formattedDate}</div>
    </div>
  </div>

  <div class="candidate-card">
    <div class="card-heading">${isTa ? "விண்ணப்பதாரர் & தகுதி விவரங்கள்" : "Candidate Profile & Cutoff Summary"}</div>
    <div class="info-grid">
      <div class="info-item">
        <span class="label">${isTa ? "மாணவர் பெயர்" : "Candidate Name"}</span>
        <span class="val">${candidate?.fullName || (isTa ? "குறிப்பிடப்படவில்லை" : "Not Provided")}</span>
      </div>
      <div class="info-item">
        <span class="label">${isTa ? "மின்னஞ்சல்" : "Email Address"}</span>
        <span class="val">${candidate?.email || "—"}</span>
      </div>
      <div class="info-item">
        <span class="label">${isTa ? "சமூகப் பிரிவு" : "Community"}</span>
        <span class="val">${commCode} (${candidate?.community?.split("–")[1]?.trim() || commCode})</span>
      </div>
      <div class="info-item">
        <span class="label">${isTa ? "கணக்கிடப்பட்ட கட்-ஆஃப்" : "Calculated Cutoff"}</span>
        <span class="val cutoff-highlight">${cutoffStr} / 200</span>
      </div>
      <div class="info-item">
        <span class="label">${isTa ? "7.5% அரசுப் பள்ளி இடஒதுக்கீடு" : "7.5% Govt School Quota"}</span>
        <span class="val">${candidate?.studiedGovtSchool === "yes" ? (isTa ? "ஆம் (தகுதியுடையவர்)" : "Yes (Eligible)") : (isTa ? "இல்லை" : "No")}</span>
      </div>
      <div class="info-item">
        <span class="label">${isTa ? "முதல் பட்டதாரி" : "First Graduate"}</span>
        <span class="val">${candidate?.firstGraduate === "yes" ? (isTa ? "ஆம்" : "Yes") : (isTa ? "இல்லை" : "No")}</span>
      </div>
      <div class="info-item">
        <span class="label">${isTa ? "12-ஆம் வகுப்பு வாரியம்" : "12th Board"}</span>
        <span class="val">${candidate?.board || "Tamil Nadu State Board"}</span>
      </div>
      <div class="info-item">
        <span class="label">${isTa ? "விருப்பங்களின் எண்ணிக்கை" : "Total Preferred Choices"}</span>
        <span class="val">${choices.length} ${isTa ? "கல்லூரிகள்" : "Colleges"}</span>
      </div>
    </div>
  </div>

  <table>
    <thead>
      <tr>
        <th style="text-align: center;">#</th>
        <th style="text-align: center;">${isTa ? "குறியீடு" : "Code"}</th>
        <th>${isTa ? "கல்லூரியின் பெயர்" : "College Name"}</th>
        <th>${isTa ? "துறை / பாடப்பிரிவு" : "Branch / Course"}</th>
        <th style="text-align: center;">${isTa ? "முந்தைய கட்-ஆஃப்" : "Past Cutoff"}</th>
        <th style="text-align: center;">${isTa ? "பரிந்துரை வகை" : "Category"}</th>
      </tr>
    </thead>
    <tbody>
      ${rowsHtml || `<tr><td colspan="6" style="text-align: center; padding: 20px;">${isTa ? "விருப்பங்கள் எதுவும் சேர்க்கப்படவில்லை" : "No choices added"}</td></tr>`}
    </tbody>
  </table>

  <div class="disclaimer-box">
    <b>${isTa ? "முக்கிய அறிவிப்பு & வழிகாட்டுதல்:" : "Important Note & Indicative Disclaimer:"}</b><br />
    ${
      isTa
        ? "மேலே கொடுக்கப்பட்டுள்ள முந்தைய ஆண்டு கட்-ஆஃப் மதிப்பெண்கள் வழிகாட்டுதலுக்காக மட்டுமே வழங்கப்பட்டுள்ளன. இது கல்லூரியில் சேர்க்கையை உறுதிப்படுத்தாது. ஒவ்வொரு ஆண்டும் விண்ணப்பதாரர்களின் எண்ணிக்கை, கட்-ஆஃப் மாறுபாடுகள், இடஒதுக்கீடு மற்றும் அரசின் அதிகாரப்பூர்வ கலந்தாய்வு முடிவுகளின் அடிப்படையிலேயே கல்லூரி இட ஒதுக்கீடு செய்யப்படும்."
        : "Previous-year cutoff data is purely indicative and based on officially published past TNEA counselling rounds. It does not guarantee admission or college seat allotment. Final allotment strictly depends on current year applicant cutoff distribution, candidate rank, reservation rules, seat matrix, and official TNEA seat allotment algorithms."
    }
  </div>

  <div class="footer-note">
    TNEA Companion 2026 · ${isTa ? "அதிகாரப்பூர்வ TNEA கலந்தாய்வு இணையதளம்: tneaonline.org" : "Official TNEA Counselling Portal: tneaonline.org"} · ${isTa ? "பக்கம் 1 / 1" : "Page 1 of 1"}
  </div>

  <script>
    window.onload = function() {
      setTimeout(function() {
        window.print();
      }, 400);
    };
  </script>
</body>
</html>
  `;

  printWindow.document.open();
  printWindow.document.write(printContent);
  printWindow.document.close();
}
