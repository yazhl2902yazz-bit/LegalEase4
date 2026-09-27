/**
 * LegalEase - AI-Powered Legal Document Generator
 * Client-side Controller & Core Engine
 */

// Global State
const State = {
  currentUser: null,
  activeDocType: null,
  currentDocData: null,
  isEditing: false,
  savedDocs: []
};

// Required Legal Disclaimer constant
const LEGAL_DISCLAIMER_TEXT = "This website is an educational project. Generated documents are for general informational purposes only and are not legal advice.";

/* ==========================================================================
   1. Initialization & Session Controller
   ========================================================================== */
document.addEventListener("DOMContentLoaded", () => {
  initSession();
  initEventListeners();
  loadSavedDocs();
  initAIAssistant();
});

function initSession() {
  const savedUser = localStorage.getItem("legalease_user");
  const loginSection = document.getElementById("loginSection");
  const mainAppSection = document.getElementById("mainAppSection");
  const userDisplayEmail = document.getElementById("userDisplayEmail");

  if (savedUser) {
    State.currentUser = JSON.parse(savedUser);
    loginSection.style.display = "none";
    mainAppSection.style.display = "flex";
    if (userDisplayEmail) {
      userDisplayEmail.textContent = State.currentUser.email;
    }
  } else {
    loginSection.style.display = "flex";
    mainAppSection.style.display = "none";
  }
}

function handleLogin(email, password) {
  const errorElement = document.getElementById("loginErrorMessage");
  errorElement.textContent = "";

  if (!email || !password) {
    errorElement.textContent = "Please provide both email and password.";
    showToast("Please enter email and password", "error");
    return;
  }

  // Basic email syntax validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    errorElement.textContent = "Please enter a valid email address.";
    showToast("Invalid email address format", "error");
    return;
  }

  if (password.length < 4) {
    errorElement.textContent = "Password must be at least 4 characters long.";
    showToast("Password is too short", "error");
    return;
  }

  // Set user state & store in localStorage
  const userObj = {
    email: email,
    loginTime: new Date().toISOString()
  };
  localStorage.setItem("legalease_user", JSON.stringify(userObj));
  State.currentUser = userObj;

  // Transition UI
  document.getElementById("loginSection").style.display = "none";
  document.getElementById("mainAppSection").style.display = "flex";
  document.getElementById("userDisplayEmail").textContent = email;

  showToast("Welcome to LegalEase! You are now logged in.", "success");
}

function handleLogout() {
  localStorage.removeItem("legalease_user");
  State.currentUser = null;
  document.getElementById("loginSection").style.display = "flex";
  document.getElementById("mainAppSection").style.display = "none";
  
  // Clear input fields
  document.getElementById("loginEmail").value = "";
  document.getElementById("loginPassword").value = "";
  document.getElementById("loginErrorMessage").textContent = "";

  showToast("You have been signed out.", "info");
}

function fillDemoLogin() {
  document.getElementById("loginEmail").value = "alex.lawyer@legalease.io";
  document.getElementById("loginPassword").value = "LegalDraft2026!";
  handleLogin("alex.lawyer@legalease.io", "LegalDraft2026!");
}

/* ==========================================================================
   2. Event Listeners & UI Binding
   ========================================================================== */
function initEventListeners() {
  // Login Form Submit
  const loginForm = document.getElementById("loginForm");
  if (loginForm) {
    loginForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const email = document.getElementById("loginEmail").value.trim();
      const password = document.getElementById("loginPassword").value.trim();
      handleLogin(email, password);
    });
  }

  // Logout Buttons (Desktop & Mobile)
  document.querySelectorAll(".btn-logout").forEach(btn => {
    btn.addEventListener("click", handleLogout);
  });

  // Mobile Menu Toggle
  const navToggle = document.getElementById("navToggle");
  const navLinks = document.getElementById("navLinks");
  if (navToggle && navLinks) {
    navToggle.addEventListener("click", () => {
      navLinks.classList.toggle("show-mobile");
    });

    // Close menu when link is clicked
    navLinks.querySelectorAll("a").forEach(link => {
      link.addEventListener("click", () => {
        navLinks.classList.remove("show-mobile");
      });
    });
  }

  // Document Selection Cards
  document.querySelectorAll(".doc-card").forEach(card => {
    card.addEventListener("click", () => {
      const docType = card.getAttribute("data-doctype");
      selectDocumentType(docType);
    });
  });

  // Action Buttons
  document.getElementById("btnCopyDoc")?.addEventListener("click", copyDocument);
  document.getElementById("btnDownloadPdf")?.addEventListener("click", downloadDocumentPdf);
  document.getElementById("btnToggleEdit")?.addEventListener("click", toggleEditMode);
  document.getElementById("btnSaveDoc")?.addEventListener("click", saveCurrentDocument);
  document.getElementById("btnClearAllDocs")?.addEventListener("click", clearAllSavedDocs);
}

/* ==========================================================================
   3. Document Type Selection & Form Generator
   ========================================================================== */
const DOCUMENT_CONFIGS = {
  rental: {
    name: "Rental Agreement",
    icon: "🏠",
    tagline: "Residential Tenancy Lease Deed",
    defaultRent: "18500",
    fields: [
      { id: "landlordName", label: "Landlord / Owner Full Name", type: "text", placeholder: "e.g., Robert Vance", required: true },
      { id: "landlordAddress", label: "Landlord Residential Address", type: "text", placeholder: "e.g., 42 High Street, Suite 3B, New Delhi", required: true },
      { id: "tenantName", label: "Tenant Full Name", type: "text", placeholder: "e.g., Sophia Patel", required: true },
      { id: "tenantContact", label: "Tenant Phone / Email", type: "text", placeholder: "e.g., +91 98765 43210 / sophia@email.com", required: true },
      { id: "propertyAddress", label: "Rented Property Full Address", type: "textarea", placeholder: "e.g., Flat No. 402, Green Valley Apartments, Sector 12", required: true, fullWidth: true },
      { id: "monthlyRent", label: "Monthly Rent Amount (₹ / $)", type: "number", placeholder: "e.g., 18500", required: true },
      { id: "securityDeposit", label: "Refundable Security Deposit", type: "number", placeholder: "e.g., 50000", required: true },
      { id: "agreementDate", label: "Agreement Execution Date", type: "date", required: true },
      { id: "leaseDuration", label: "Lease Duration (Months)", type: "number", placeholder: "e.g., 11", required: true },
      { id: "noticePeriod", label: "Notice Period for Vacation", type: "text", placeholder: "e.g., 30 Days (1 Month)", required: true },
      { id: "maintenanceTerms", label: "Utility & Maintenance Terms", type: "text", placeholder: "e.g., Tenant pays electricity & water; Owner pays society maintenance", required: true }
    ],
    sampleData: {
      landlordName: "Devraj Sengupta",
      landlordAddress: "Flat 102, Palm Grove Enclave, Bangalore - 560034",
      tenantName: "Priyanka Nair",
      tenantContact: "+91 98112 34567 / priyanka.nair@email.com",
      propertyAddress: "Flat No. B-304, Silver Oak Heights, Outer Ring Road, Bellandur, Bangalore - 560103",
      monthlyRent: "28000",
      securityDeposit: "85000",
      agreementDate: new Date().toISOString().split("T")[0],
      leaseDuration: "11",
      noticePeriod: "1 Month (30 Days)",
      maintenanceTerms: "Tenant pays monthly electricity, internet, and municipal water; Owner covers building maintenance charges"
    }
  },
  leave: {
    name: "Formal Leave Letter",
    icon: "📄",
    tagline: "Academic & Employment Leave Application",
    fields: [
      { id: "applicantName", label: "Applicant Full Name", type: "text", placeholder: "e.g., Vaishnavi Krishna", required: true },
      { id: "applicantRole", label: "Designation / Student Roll No.", type: "text", placeholder: "e.g., Final Year B.Tech CSE / Senior Analyst", required: true },
      { id: "recipientAuthority", label: "To (Authority / Manager / Principal)", type: "text", placeholder: "e.g., The Head of Department / HR Director", required: true },
      { id: "institutionName", label: "Institution / Organization Name", type: "text", placeholder: "e.g., National Institute of Technology", required: true },
      { id: "leaveType", label: "Type of Leave", type: "select", options: ["Medical / Sick Leave", "Casual Leave", "Academic / Conference Leave", "Emergency Family Leave", "Maternity / Paternity Leave"], required: true },
      { id: "fromDate", label: "Leave Start Date", type: "date", required: true },
      { id: "toDate", label: "Leave End Date", type: "date", required: true },
      { id: "leaveReason", label: "Detailed Reason for Leave", type: "textarea", placeholder: "Explain the circumstances necessitating your absence...", required: true, fullWidth: true },
      { id: "handoverDetails", label: "Duty Handover / Emergency Contact", type: "text", placeholder: "e.g., Contactable via email; Project tasks delegated to Mr. Sharma", required: true, fullWidth: true }
    ],
    sampleData: {
      applicantName: "Vaishnavi Krishna",
      applicantRole: "Senior Associate Engineer (Emp ID: LE-9842)",
      recipientAuthority: "The Engineering Director & People Operations Lead",
      institutionName: "Apex Software Solutions Pvt Ltd, Cyber City",
      leaveType: "Medical / Sick Leave",
      fromDate: new Date().toISOString().split("T")[0],
      toDate: new Date(Date.now() + 4 * 86400000).toISOString().split("T")[0],
      leaveReason: "I have been advised complete rest and medical supervision by my physician due to acute viral fever and fatigue. Medical fitness certificates are attached.",
      handoverDetails: "All active sprint deliverables have been handed over to teammate Rajesh Kumar. I remain reachable via emergency phone for critical blockers."
    }
  },
  notice: {
    name: "Legal Notice",
    icon: "⚠️",
    tagline: "Formal Demand & Cause of Action Notice",
    fields: [
      { id: "senderName", label: "Sender (Client / Aggrieved Party)", type: "text", placeholder: "e.g., Arthur Sterling", required: true },
      { id: "senderAddress", label: "Sender Full Address", type: "text", placeholder: "e.g., 104 Park Avenue, South District", required: true },
      { id: "recipientName", label: "Recipient (Defaulting Party / Company)", type: "text", placeholder: "e.g., Zenith Global Logistics Ltd.", required: true },
      { id: "recipientAddress", label: "Recipient Registered Address", type: "text", placeholder: "e.g., Plot 48, Industrial Area Phase II", required: true },
      { id: "noticeSubject", label: "Subject / Matter of Notice", type: "text", placeholder: "e.g., Demand Notice for Non-Payment of Outstanding Invoices", required: true, fullWidth: true },
      { id: "factsGrievance", label: "Background Facts & Breach of Obligation", type: "textarea", placeholder: "Detail the contract/incident, the failure to perform, and financial loss caused...", required: true, fullWidth: true },
      { id: "specificDemand", label: "Specific Remedy / Claim Amount", type: "text", placeholder: "e.g., Immediate payment of ₹1,45,000/- plus 18% p.a. interest", required: true },
      { id: "complianceDays", label: "Notice Period for Compliance (Days)", type: "number", placeholder: "e.g., 15", required: true },
      { id: "noticeDate", label: "Date of Notice", type: "date", required: true }
    ],
    sampleData: {
      senderName: "Arthur Sterling (Sole Proprietor, Sterling Tech)",
      senderAddress: "Suite 501, Horizon Business Tower, MG Road, Pune - 411001",
      recipientName: "Zenith Retail Solutions Pvt. Ltd. (Attn: Board of Directors)",
      recipientAddress: "Building 4B, Cyber Park, Sector 28, Gurgaon - 122002",
      noticeSubject: "LEGAL DEMAND NOTICE FOR UNPAID COMMERCIAL DUES AMOUNTING TO ₹2,80,000/- UNDER CONTRACT #ST-2025-88",
      factsGrievance: "Under the Master Services Agreement dated 12th January 2025, my client successfully delivered enterprise software modules as acknowledged via Completion Certificate dated 15th October 2025. Despite submission of Invoice #INV-1049 and numerous email reminders, your organization has wrongfully withheld payment for over 90 days in flagrant violation of agreed contractual terms.",
      specificDemand: "Full remittance of outstanding principal sum of ₹2,80,000/- along with accrued commercial interest @ 18% p.a. and ₹15,000/- towards legal expenses",
      complianceDays: "15",
      noticeDate: new Date().toISOString().split("T")[0]
    }
  },
  affidavit: {
    name: "Simple Affidavit",
    icon: "📝",
    tagline: "General Sworn Statement Under Solemn Oath",
    fields: [
      { id: "deponentName", label: "Deponent (Declarant) Full Name", type: "text", placeholder: "e.g., Manoj Kumar Sharma", required: true },
      { id: "deponentParentSpouse", label: "Son / Daughter / Spouse of", type: "text", placeholder: "e.g., Late Shri Ram Avatar Sharma", required: true },
      { id: "deponentAge", label: "Deponent Age (Years)", type: "number", placeholder: "e.g., 34", required: true },
      { id: "deponentAddress", label: "Residential Address", type: "text", placeholder: "e.g., House No. 22, Model Town, Jaipur", required: true },
      { id: "idProofNumber", label: "Government ID / Passport / Aadhaar No.", type: "text", placeholder: "e.g., Aadhaar No. XXXX-XXXX-4589", required: true },
      { id: "affidavitPurpose", label: "Purpose of Affidavit", type: "text", placeholder: "e.g., Declaration of Name Spelling Correction / Address Proof", required: true, fullWidth: true },
      { id: "declarationPoints", label: "Sworn Statements / Affirmations (One per line)", type: "textarea", placeholder: "1. That I am a bona fide citizen of India...\n2. That my name in my certificate was inadvertently typed as...\n3. That both names belong to one and the same person...", required: true, fullWidth: true },
      { id: "executionPlace", label: "Place of Execution", type: "text", placeholder: "e.g., New Delhi", required: true },
      { id: "affidavitDate", label: "Date of Affirmation", type: "date", required: true }
    ],
    sampleData: {
      deponentName: "Manoj Kumar Sharma",
      deponentParentSpouse: "Late Shri Ram Avatar Sharma",
      deponentAge: "36",
      deponentAddress: "House No. 14/B, Rajendra Nagar, New Delhi - 110060",
      idProofNumber: "Aadhaar Card No. XXXX-XXXX-7821 / PAN: ABCPS1234F",
      affidavitPurpose: "Declaration Regarding Discrepancy in Name Spelling Across Official Documents",
      declarationPoints: "1. That I am a law-abiding citizen of India residing at the above-mentioned address.\n2. That in my Secondary School Leaving Certificate (SSLC), my name is inscribed as 'Manoj Sharma', whereas in my University Degree and Passport it is recorded as 'Manoj Kumar Sharma'.\n3. That 'Manoj Sharma' and 'Manoj Kumar Sharma' refer to one and the same individual, namely myself, the deponent herein.\n4. That I execute this affidavit to solemnly affirm that for all official, legal, and financial purposes, my true identity shall be acknowledged as 'Manoj Kumar Sharma'.\n5. That no fraudulent intent or misrepresentation is associated with this declaration.",
      executionPlace: "New Delhi",
      affidavitDate: new Date().toISOString().split("T")[0]
    }
  },
  complaint: {
    name: "Formal Complaint Letter",
    icon: "📩",
    tagline: "Consumer & Civic Redressal Grievance Letter",
    fields: [
      { id: "complainantName", label: "Complainant Full Name", type: "text", placeholder: "e.g., Ananya Deshmukh", required: true },
      { id: "complainantContact", label: "Contact Phone & Email", type: "text", placeholder: "e.g., +91 99201 23456 / ananya@domain.com", required: true },
      { id: "targetAuthority", label: "Recipient Organization / Grievance Cell", type: "text", placeholder: "e.g., Chief Customer Relations Officer, SwiftPay Technologies", required: true },
      { id: "organizationAddress", label: "Organization Address / Branch", type: "text", placeholder: "e.g., Level 6, Tech Hub, Bandra Kurla Complex, Mumbai", required: true },
      { id: "complaintSubject", label: "Complaint Subject / Account / Order Ref", type: "text", placeholder: "e.g., Defective Electronic Appliance & Denial of Warranty (Order #89321)", required: true, fullWidth: true },
      { id: "incidentDate", label: "Date of Purchase / Incident", type: "date", required: true },
      { id: "complaintDetails", label: "Detailed Description of Defect / Grievance", type: "textarea", placeholder: "Provide timeline, order/ticket numbers, prior attempts to resolve...", required: true, fullWidth: true },
      { id: "remedyDemanded", label: "Redressal / Compensation Demanded", type: "text", placeholder: "e.g., Immediate replacement of defective unit or 100% full refund with compensation", required: true, fullWidth: true },
      { id: "complaintDate", label: "Date of Complaint Letter", type: "date", required: true }
    ],
    sampleData: {
      complainantName: "Ananya Deshmukh",
      complainantContact: "+91 98200 11223 / ananya.deshmukh@mail.com",
      targetAuthority: "The Grievance Redressal Officer & Head of Quality",
      organizationAddress: "ElectroCare Appliances Pvt Ltd, Infinity IT Park, Malad West, Mumbai - 400064",
      complaintSubject: "FORMAL COMPLAINT REGARDING DEFECTIVE SMART REFRIGERATOR (INVOICE #EC-2025-9921) AND DEFICIENCY IN WARRANTY REPAIR",
      incidentDate: "2025-11-14",
      complaintDetails: "On November 14, 2025, I purchased an ElectroCare Frost-Free Smart Refrigerator with a 3-year comprehensive warranty. Within three weeks of installation, the compressor repeatedly malfunctioned, causing spoilage of stored perishable provisions. Despite three documented technician visits (Service Tickets #TC-4401, #TC-4592, and #TC-4811), the defects have persisted and authorized personnel have failed to provide a resolution.",
      remedyDemanded: "Immediate replacement with a defect-free brand new unit or a 100% full refund of ₹44,990/- along with reimbursement of ₹5,000/- for spoiled provisions",
      complaintDate: new Date().toISOString().split("T")[0]
    }
  }
};

function selectDocumentType(docType) {
  if (!DOCUMENT_CONFIGS[docType]) return;

  State.activeDocType = docType;

  // Highlight active doc card
  document.querySelectorAll(".doc-card").forEach(c => {
    c.classList.toggle("active", c.getAttribute("data-doctype") === docType);
  });

  // Render Form
  renderForm(docType);

  // Smooth scroll to form section
  const formSection = document.getElementById("formSection");
  formSection.style.display = "block";
  formSection.scrollIntoView({ behavior: "smooth", block: "start" });
}

function renderForm(docType) {
  const config = DOCUMENT_CONFIGS[docType];
  const formContainer = document.getElementById("dynamicFormContainer");
  const formTitle = document.getElementById("formActiveTitle");
  const formTagline = document.getElementById("formActiveTagline");

  formTitle.innerHTML = `<span>${config.icon}</span> ${config.name}`;
  formTagline.textContent = config.tagline;

  let fieldsHtml = '<div class="form-grid">';
  
  config.fields.forEach(field => {
    const fullClass = field.fullWidth ? ' full-width' : '';
    fieldsHtml += `
      <div class="form-group${fullClass}" id="group_${field.id}">
        <label for="${field.id}">
          ${field.label} ${field.required ? '<span style="color:var(--danger)">*</span>' : ''}
        </label>
    `;

    if (field.type === "textarea") {
      fieldsHtml += `<textarea id="${field.id}" rows="4" placeholder="${field.placeholder || ''}" ${field.required ? 'data-required="true"' : ''}></textarea>`;
    } else if (field.type === "select") {
      fieldsHtml += `
        <select id="${field.id}" ${field.required ? 'data-required="true"' : ''}>
          ${field.options.map(opt => `<option value="${opt}">${opt}</option>`).join('')}
        </select>
      `;
    } else {
      fieldsHtml += `<input type="${field.type}" id="${field.id}" placeholder="${field.placeholder || ''}" ${field.required ? 'data-required="true"' : ''}>`;
    }

    fieldsHtml += `<div class="error-text" id="err_${field.id}" style="display:none;"></div></div>`;
  });

  fieldsHtml += '</div>';

  formContainer.innerHTML = fieldsHtml;

  // Set default dates if empty
  const today = new Date().toISOString().split("T")[0];
  document.querySelectorAll('#formSection input[type="date"]').forEach(dateInput => {
    if (!dateInput.value) dateInput.value = today;
  });

  // Clear any existing validation errors
  hideValidationAlert();

  // Attach live validation clear on user input
  config.fields.forEach(f => {
    const el = document.getElementById(f.id);
    if (el) {
      el.addEventListener("input", () => clearFieldError(f.id));
      el.addEventListener("change", () => clearFieldError(f.id));
    }
  });
}

function fillSampleData() {
  if (!State.activeDocType || !DOCUMENT_CONFIGS[State.activeDocType]) return;
  const sample = DOCUMENT_CONFIGS[State.activeDocType].sampleData;

  for (const [key, value] of Object.entries(sample)) {
    const el = document.getElementById(key);
    if (el) {
      el.value = value;
      clearFieldError(key);
    }
  }

  hideValidationAlert();
  showToast("Sample data loaded successfully!", "info");
}

function clearActiveForm() {
  if (!State.activeDocType) return;
  renderForm(State.activeDocType);
  showToast("Form cleared.", "info");
}

function hideFormSection() {
  document.getElementById("formSection").style.display = "none";
  document.querySelectorAll(".doc-card").forEach(c => c.classList.remove("active"));
  State.activeDocType = null;
  document.getElementById("documentOptions").scrollIntoView({ behavior: "smooth" });
}

/* ==========================================================================
   4. Missing-Detail Validation Engine
   ========================================================================== */
function validateActiveForm() {
  if (!State.activeDocType) return false;
  const config = DOCUMENT_CONFIGS[State.activeDocType];
  const missingFields = [];
  let firstInvalidEl = null;

  config.fields.forEach(field => {
    if (field.required) {
      const el = document.getElementById(field.id);
      if (!el || !el.value.trim()) {
        missingFields.push(field.label.replace(/\*$/, "").trim());
        setFieldError(field.id, "This field is required.");
        if (!firstInvalidEl) firstInvalidEl = el;
      } else {
        clearFieldError(field.id);
      }
    }
  });

  if (missingFields.length > 0) {
    showValidationAlert(missingFields);
    if (firstInvalidEl) {
      firstInvalidEl.focus();
      firstInvalidEl.scrollIntoView({ behavior: "smooth", block: "center" });
    }
    showToast(`Please fill in ${missingFields.length} required field(s)`, "error");
    return false;
  }

  hideValidationAlert();
  return true;
}

function setFieldError(fieldId, message) {
  const el = document.getElementById(fieldId);
  const errEl = document.getElementById(`err_${fieldId}`);
  if (el) el.classList.add("input-error");
  if (errEl) {
    errEl.textContent = `⚠️ ${message}`;
    errEl.style.display = "flex";
  }
}

function clearFieldError(fieldId) {
  const el = document.getElementById(fieldId);
  const errEl = document.getElementById(`err_${fieldId}`);
  if (el) el.classList.remove("input-error");
  if (errEl) {
    errEl.textContent = "";
    errEl.style.display = "none";
  }
}

function showValidationAlert(missingList) {
  const alertEl = document.getElementById("validationAlert");
  const alertMsg = document.getElementById("validationAlertMessage");
  alertMsg.innerHTML = `<strong>Missing Details:</strong> Please complete the required field(s): <em>${missingList.slice(0, 4).join(", ")}${missingList.length > 4 ? ` and ${missingList.length - 4} more` : ""}</em> before generating.`;
  alertEl.style.display = "flex";
}

function hideValidationAlert() {
  const alertEl = document.getElementById("validationAlert");
  if (alertEl) alertEl.style.display = "none";
}

/* ==========================================================================
   5. Formatted Document Generation & Plain-English Explanations
   ========================================================================== */
function generateDocument() {
  if (!validateActiveForm()) return;

  const docType = State.activeDocType;
  let formattedHtml = "";
  let plainExplanation = {};
  let documentTitle = "";

  if (docType === "rental") {
    const data = {
      landlord: document.getElementById("landlordName").value.trim(),
      landlordAddress: document.getElementById("landlordAddress").value.trim(),
      tenant: document.getElementById("tenantName").value.trim(),
      tenantContact: document.getElementById("tenantContact").value.trim(),
      propertyAddress: document.getElementById("propertyAddress").value.trim(),
      rent: document.getElementById("monthlyRent").value.trim(),
      deposit: document.getElementById("securityDeposit").value.trim(),
      date: formatDate(document.getElementById("agreementDate").value),
      duration: document.getElementById("leaseDuration").value.trim(),
      notice: document.getElementById("noticePeriod").value.trim(),
      maintenance: document.getElementById("maintenanceTerms").value.trim()
    };
    documentTitle = `Rental Agreement - ${data.tenant}`;
    formattedHtml = buildRentalAgreementHtml(data);
    plainExplanation = buildRentalExplanation(data);

  } else if (docType === "leave") {
    const data = {
      name: document.getElementById("applicantName").value.trim(),
      role: document.getElementById("applicantRole").value.trim(),
      authority: document.getElementById("recipientAuthority").value.trim(),
      institution: document.getElementById("institutionName").value.trim(),
      type: document.getElementById("leaveType").value.trim(),
      fromDate: formatDate(document.getElementById("fromDate").value),
      toDate: formatDate(document.getElementById("toDate").value),
      days: calculateDaysBetween(document.getElementById("fromDate").value, document.getElementById("toDate").value),
      reason: document.getElementById("leaveReason").value.trim(),
      handover: document.getElementById("handoverDetails").value.trim(),
      date: formatDate(new Date().toISOString().split("T")[0])
    };
    documentTitle = `Leave Letter - ${data.name}`;
    formattedHtml = buildLeaveLetterHtml(data);
    plainExplanation = buildLeaveExplanation(data);

  } else if (docType === "notice") {
    const data = {
      sender: document.getElementById("senderName").value.trim(),
      senderAddress: document.getElementById("senderAddress").value.trim(),
      recipient: document.getElementById("recipientName").value.trim(),
      recipientAddress: document.getElementById("recipientAddress").value.trim(),
      subject: document.getElementById("noticeSubject").value.trim(),
      facts: document.getElementById("factsGrievance").value.trim(),
      demand: document.getElementById("specificDemand").value.trim(),
      days: document.getElementById("complianceDays").value.trim(),
      date: formatDate(document.getElementById("noticeDate").value)
    };
    documentTitle = `Legal Notice to ${data.recipient}`;
    formattedHtml = buildNoticeHtml(data);
    plainExplanation = buildNoticeExplanation(data);

  } else if (docType === "affidavit") {
    const data = {
      name: document.getElementById("deponentName").value.trim(),
      parentSpouse: document.getElementById("deponentParentSpouse").value.trim(),
      age: document.getElementById("deponentAge").value.trim(),
      address: document.getElementById("deponentAddress").value.trim(),
      idProof: document.getElementById("idProofNumber").value.trim(),
      purpose: document.getElementById("affidavitPurpose").value.trim(),
      points: document.getElementById("declarationPoints").value.trim().split("\n").filter(p => p.trim() !== ""),
      place: document.getElementById("executionPlace").value.trim(),
      date: formatDate(document.getElementById("affidavitDate").value)
    };
    documentTitle = `Affidavit - ${data.name}`;
    formattedHtml = buildAffidavitHtml(data);
    plainExplanation = buildAffidavitExplanation(data);

  } else if (docType === "complaint") {
    const data = {
      name: document.getElementById("complainantName").value.trim(),
      contact: document.getElementById("complainantContact").value.trim(),
      authority: document.getElementById("targetAuthority").value.trim(),
      orgAddress: document.getElementById("organizationAddress").value.trim(),
      subject: document.getElementById("complaintSubject").value.trim(),
      incidentDate: formatDate(document.getElementById("incidentDate").value),
      details: document.getElementById("complaintDetails").value.trim(),
      remedy: document.getElementById("remedyDemanded").value.trim(),
      date: formatDate(document.getElementById("complaintDate").value)
    };
    documentTitle = `Complaint Letter - ${data.name}`;
    formattedHtml = buildComplaintHtml(data);
    plainExplanation = buildComplaintExplanation(data);
  }

  // Save in State
  State.currentDocData = {
    id: "doc_" + Date.now(),
    type: docType,
    title: documentTitle,
    html: formattedHtml,
    plainExplanation: plainExplanation,
    createdAt: new Date().toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" }),
    user: State.currentUser ? State.currentUser.email : "guest"
  };

  // Render to Output Studio
  renderOutputStudio(State.currentDocData);

  // Auto-save to My Documents
  saveToLocalStorage(State.currentDocData);

  // Scroll to output
  const outputSection = document.getElementById("outputSection");
  outputSection.style.display = "block";
  outputSection.scrollIntoView({ behavior: "smooth", block: "start" });

  showToast("Document successfully generated!", "success");
}

/* --------------------------------------------------------------------------
   Document Templates (Formal Legal Drafting)
   -------------------------------------------------------------------------- */
function buildRentalAgreementHtml(d) {
  return `
    <div class="legal-header-stamp">
      <h2>Residential Rental Agreement</h2>
      <div class="stamp-sub">Standard Tenancy Lease Agreement</div>
    </div>

    <p class="legal-clause-body">
      <strong>THIS DEED OF RENTAL AGREEMENT</strong> is made and executed on this <strong>${d.date}</strong> at the premises described hereunder by and between:
    </p>

    <div class="legal-parties-box">
      <p><strong>LESSOR / LANDLORD:</strong> <strong>${d.landlord}</strong>, residing at ${d.landlordAddress} (hereinafter referred to as the <em>"LESSOR"</em>, which expression shall include their legal heirs, executors, and assigns) of the ONE PART;</p>
      <div style="margin: 8px 0; text-align: center; font-weight: bold; color: var(--accent-gold);">- AND -</div>
      <p><strong>LESSEE / TENANT:</strong> <strong>${d.tenant}</strong>, Contact: ${d.tenantContact} (hereinafter referred to as the <em>"LESSEE"</em>, which expression shall include their permitted assigns) of the OTHER PART.</p>
    </div>

    <p class="legal-clause-body">
      <strong>WHEREAS</strong> the Lessor is the absolute lawful owner of the scheduled premises situated at <strong>${d.propertyAddress}</strong>, and has agreed to let out, and the Lessee has agreed to take on tenancy the said premises on the following mutual terms and conditions:
    </p>

    <div class="legal-clause-title">1. Term & Duration of Lease</div>
    <p class="legal-clause-body">
      The tenancy shall commence with effect from <strong>${d.date}</strong> and shall remain in force for an initial agreed period of <strong>${d.duration} months</strong>, renewable thereafter subject to mutual consent and revised rental terms agreed in writing.
    </p>

    <div class="legal-clause-title">2. Rent & Escalation</div>
    <p class="legal-clause-body">
      The Lessee covenants to pay to the Lessor a monthly rental fee of <strong>₹${Number(d.rent).toLocaleString()}</strong> (or local equivalent currency) payable in advance on or before the 5th calendar day of each subsequent English calendar month.
    </p>

    <div class="legal-clause-title">3. Security Deposit</div>
    <p class="legal-clause-body">
      The Lessee has paid a sum of <strong>₹${Number(d.deposit).toLocaleString()}</strong> as an interest-free refundable security deposit to the Lessor, receipt of which is hereby acknowledged. This deposit shall be refunded upon vacant physical possession after adjusting unpaid bills or repair damages, if any.
    </p>

    <div class="legal-clause-title">4. Permitted Use & Maintenance</div>
    <p class="legal-clause-body">
      The demised premises shall be utilized exclusively for private residential accommodation. ${d.maintenance}. The Lessee shall maintain the interior fixtures in neat and tenantable condition.
    </p>

    <div class="legal-clause-title">5. Notice & Vacation</div>
    <p class="legal-clause-body">
      Either party may terminate this agreement prior to lease expiry by serving a written notice of not less than <strong>${d.notice}</strong> or rental equivalent in lieu thereof.
    </p>

    <div class="legal-clause-title">6. Educational Disclaimer</div>
    <p class="legal-clause-body" style="font-size:0.85rem; color:#4b5563;">
      <em>${LEGAL_DISCLAIMER_TEXT}</em>
    </p>

    <div class="legal-signatures">
      <div class="signature-block">
        <div>Signed by Lessor / Landlord:</div>
        <div class="signature-line">(${d.landlord})</div>
        <div style="font-size: 0.75rem; color:#666;">Date: ${d.date}</div>
      </div>
      <div class="signature-block">
        <div>Signed by Lessee / Tenant:</div>
        <div class="signature-line">(${d.tenant})</div>
        <div style="font-size: 0.75rem; color:#666;">Date: ${d.date}</div>
      </div>
    </div>

    <div class="document-watermark">
      Generated via LegalEase AI • Draft for Educational Reference Only
    </div>
  `;
}

function buildLeaveLetterHtml(d) {
  return `
    <div class="legal-header-stamp">
      <h2>Formal Application for Leave</h2>
      <div class="stamp-sub">${d.type}</div>
    </div>

    <div style="font-family: var(--font-sans); margin-bottom: 20px;">
      <p><strong>Date:</strong> ${d.date}</p>
      <br>
      <p><strong>To,</strong></p>
      <p><strong>${d.authority}</strong></p>
      <p>${d.institution}</p>
    </div>

    <div style="font-family: var(--font-sans); margin-bottom: 20px;">
      <p><strong>Subject: Application for ${d.type} from ${d.fromDate} to ${d.toDate} (${d.days} Day${d.days > 1 ? 's' : ''})</strong></p>
    </div>

    <div class="legal-clause-body" style="font-family: 'Georgia', serif;">
      <p>Respected Sir/Madam,</p>
      <br>
      <p>
        I, <strong>${d.name}</strong>, serving / enrolled as <strong>${d.role}</strong> at <strong>${d.institution}</strong>, respectfully submit this formal application to request an authorized leave of absence commencing on <strong>${d.fromDate}</strong> and concluding on <strong>${d.toDate}</strong> (inclusive), representing a total absence of <strong>${d.days} day${d.days > 1 ? 's' : ''}</strong>.
      </p>
      <br>
      <p>
        <strong>Reason for Leave:</strong><br>
        ${d.reason}
      </p>
      <br>
      <p>
        <strong>Continuity & Duty Handover:</strong><br>
        ${d.handover}
      </p>
      <br>
      <p>
        I will resume my regular schedule immediately upon expiry of the sanctioned leave on the next working day. In the event of unforeseen exigencies, I may be contacted through my registered credentials.
      </p>
      <br>
      <p>Kindly grant approval for the leave period requested. Thank you for your kind consideration.</p>
    </div>

    <div class="legal-signatures" style="margin-top: 36px;">
      <div class="signature-block">
        <div>Respectfully submitted by:</div>
        <div class="signature-line">${d.name}</div>
        <div>${d.role}</div>
      </div>
      <div class="signature-block">
        <div>Sanctioned & Approved by:</div>
        <div class="signature-line">Authorized Signatory / Seal</div>
        <div>${d.authority}</div>
      </div>
    </div>

    <div class="document-watermark">
      Generated via LegalEase AI • Draft for Educational Reference Only
    </div>
  `;
}

function buildNoticeHtml(d) {
  return `
    <div class="legal-header-stamp">
      <h2>Formal Legal Notice</h2>
      <div class="stamp-sub">Demand & Statutory Cause of Action Notice</div>
    </div>

    <div style="font-family: var(--font-sans); margin-bottom: 18px; line-height: 1.6;">
      <p><strong>BY REGISTERED POST / SPEED POST / COURIER & EMAIL</strong></p>
      <p><strong>Date of Notice:</strong> ${d.date}</p>
      <br>
      <p><strong>TO,</strong></p>
      <p><strong>${d.recipient}</strong></p>
      <p>${d.recipientAddress}</p>
      <br>
      <p><strong>FROM (SENDER / INSTRUCTOR):</strong></p>
      <p><strong>${d.sender}</strong></p>
      <p>${d.senderAddress}</p>
    </div>

    <div style="background:#f3f4f6; padding:12px; margin: 16px 0; border-left: 3px solid #111827; font-weight: bold; font-family: var(--font-sans);">
      SUBJECT: ${d.subject.toUpperCase()}
    </div>

    <p class="legal-clause-body">
      <strong>SIR / MADAM,</strong>
    </p>

    <p class="legal-clause-body">
      Under instructions from and on behalf of my client / the sender above-named, I hereby serve upon you this formal <strong>LEGAL DEMAND NOTICE</strong> setting forth the following facts and demands:
    </p>

    <div class="legal-clause-title">1. Factual Recitals & Breach</div>
    <p class="legal-clause-body">
      ${d.facts}
    </p>

    <div class="legal-clause-title">2. Loss & Liability Incurred</div>
    <p class="legal-clause-body">
      By virtue of your unprovoked breach, neglect, and default of settled obligations, my client has been subjected to severe mental distress, commercial damages, and unjustified financial loss for which you are held exclusively liable.
    </p>

    <div class="legal-clause-title">3. Peremptory Legal Demand</div>
    <p class="legal-clause-body">
      You are hereby called upon to comply with: <strong>${d.demand}</strong> within a period of <strong>${d.days} days</strong> from the receipt of this notice, failing which my client shall be constrained to initiate appropriate civil actions, criminal proceedings, and consumer/commercial litigation before competent courts of jurisdiction at your sole peril and costs.
    </p>

    <div class="legal-clause-title">4. Educational Disclaimer</div>
    <p class="legal-clause-body" style="font-size:0.85rem; color:#4b5563;">
      <em>${LEGAL_DISCLAIMER_TEXT}</em>
    </p>

    <div class="legal-signatures">
      <div class="signature-block">
        <div>Issued for and on behalf of Sender:</div>
        <div class="signature-line">${d.sender}</div>
        <div>Aggrieved Party / Complainant</div>
      </div>
      <div class="signature-block">
        <div>Acknowledgment of Service:</div>
        <div class="signature-line">Recipient Signature / Stamp</div>
        <div>Date: ____ / ____ / 2026</div>
      </div>
    </div>

    <div class="document-watermark">
      Generated via LegalEase AI • Draft for Educational Reference Only
    </div>
  `;
}

function buildAffidavitHtml(d) {
  const pointsHtml = d.points.map((pt, idx) => `
    <div style="margin-bottom: 12px; text-align: justify;">
      <strong>${idx + 1}.</strong> ${pt.replace(/^\d+[\.\)]\s*/, "")}
    </div>
  `).join("");

  return `
    <div class="legal-header-stamp">
      <h2>Affidavit</h2>
      <div class="stamp-sub">Before the Competent Authority / Notary Public</div>
    </div>

    <p class="legal-clause-body">
      I, <strong>${d.name}</strong>, ${d.parentSpouse ? `Son/Daughter/Spouse of <strong>${d.parentSpouse}</strong>,` : ''} aged about <strong>${d.age} years</strong>, residing at <strong>${d.address}</strong>, holding official Identity proof: <strong>${d.idProof}</strong>, do hereby solemnly affirm and state on oath as follows:
    </p>

    <div style="text-align: center; margin: 16px 0; font-weight: bold; font-family: var(--font-sans); text-decoration: underline;">
      SUB: ${d.purpose.toUpperCase()}
    </div>

    <div style="font-family: 'Georgia', serif; font-size: 0.96rem; line-height: 1.8; margin: 18px 0;">
      ${pointsHtml}
    </div>

    <div class="legal-clause-title">Verification & Jurat</div>
    <p class="legal-clause-body">
      I, the deponent abovenamed, do hereby verify and declare that the contents of paragraphs 1 to ${d.points.length} are true and correct to the best of my personal knowledge, belief, and records. Nothing material has been concealed or falsely stated herein.
    </p>
    <p class="legal-clause-body" style="font-size:0.85rem; color:#4b5563;">
      <em>${LEGAL_DISCLAIMER_TEXT}</em>
    </p>

    <p style="font-family: var(--font-sans); margin-top: 24px;">
      Solemnly affirmed and signed at <strong>${d.place}</strong> on this <strong>${d.date}</strong>.
    </p>

    <div class="legal-signatures">
      <div class="signature-block">
        <div>DEPONENT:</div>
        <div class="signature-line">Signature of Deponent (${d.name})</div>
        <div>Identified by me: ________________</div>
      </div>
      <div class="signature-block">
        <div>BEFORE ME:</div>
        <div class="signature-line">Notary Public / Oath Commissioner</div>
        <div>Seal & Registration No: ____________</div>
      </div>
    </div>

    <div class="document-watermark">
      Generated via LegalEase AI • Draft for Educational Reference Only
    </div>
  `;
}

function buildComplaintHtml(d) {
  return `
    <div class="legal-header-stamp">
      <h2>Formal Grievance Complaint Letter</h2>
      <div class="stamp-sub">Consumer Protection & Redressal Application</div>
    </div>

    <div style="font-family: var(--font-sans); margin-bottom: 20px; line-height: 1.6;">
      <p><strong>Date:</strong> ${d.date}</p>
      <br>
      <p><strong>TO,</strong></p>
      <p><strong>${d.authority}</strong></p>
      <p>${d.orgAddress}</p>
      <br>
      <p><strong>FROM (COMPLAINANT):</strong></p>
      <p><strong>${d.name}</strong></p>
      <p>Contact Details: ${d.contact}</p>
    </div>

    <div style="background:#f3f4f6; padding:12px; margin: 16px 0; border-left: 3px solid #111827; font-weight: bold; font-family: var(--font-sans);">
      SUBJECT: ${d.subject.toUpperCase()}
    </div>

    <div class="legal-clause-body" style="font-family: 'Georgia', serif;">
      <p>Dear Sir/Madam,</p>
      <br>
      <p>
        I am writing this formal letter of complaint to formally register my serious grievance against the deficiency of service / product defect encountered in relation to the transaction executed on <strong>${d.incidentDate}</strong>.
      </p>
      <br>
      <p>
        <strong>Statement of Grievance & Facts:</strong><br>
        ${d.details}
      </p>
      <br>
      <p>
        <strong>Redressal & Relief Demanded:</strong><br>
        In consideration of the substantial inconvenience, monetary loss, and deficiency experienced, I hereby demand: <strong>${d.remedy}</strong>.
      </p>
      <br>
      <p>
        Please acknowledge receipt of this complaint and provide a formal written resolution within 7 working days, failing which I shall be compelled to escalate this matter to the relevant Consumer Forum and statutory regulatory ombudsman.
      </p>
    </div>

    <div class="legal-clause-title" style="margin-top: 24px;">Educational Disclaimer</div>
    <p class="legal-clause-body" style="font-size:0.85rem; color:#4b5563;">
      <em>${LEGAL_DISCLAIMER_TEXT}</em>
    </p>

    <div class="legal-signatures" style="margin-top: 36px;">
      <div class="signature-block">
        <div>Yours sincerely,</div>
        <div class="signature-line">${d.name}</div>
        <div>Complainant</div>
      </div>
      <div class="signature-block">
        <div>Received by Authority:</div>
        <div class="signature-line">Grievance Desk Officer</div>
        <div>Date & Complaint Token No: _______</div>
      </div>
    </div>

    <div class="document-watermark">
      Generated via LegalEase AI • Draft for Educational Reference Only
    </div>
  `;
}

/* --------------------------------------------------------------------------
   Plain-English AI Explanations
   -------------------------------------------------------------------------- */
function buildRentalExplanation(d) {
  return {
    summary: "This agreement is a legally styled residential lease deed protecting both the property owner and the tenant.",
    points: [
      { label: "Financial Terms", text: `The tenant pays ₹${Number(d.rent).toLocaleString()} per month by the 5th of each month. A security deposit of ₹${Number(d.deposit).toLocaleString()} is held safely by the landlord and returned when moving out.` },
      { label: "Timeframe & Stay", text: `Valid for ${d.duration} months starting ${d.date}. Either party can end the lease early by giving ${d.notice} advance written notice.` },
      { label: "Responsibilities", text: `${d.maintenance} The property must only be used for residential living, not commercial businesses.` },
      { label: "Next Steps", text: "Both landlord and tenant should sign on all pages, attach identity proofs, and keep signed original copies." }
    ],
    clauses: [
      { name: "Lock-in & Notice", desc: `Specifies that ${d.notice} notice must be given before leaving to prevent sudden eviction or unexpected vacancies.` },
      { name: "Security Deposit Return", desc: "Guarantees return of the deposit within 15-30 days after handing over keys, minus legitimate deductions for physical damage." }
    ]
  };
}

function buildLeaveExplanation(d) {
  return {
    summary: "This is a formal academic/workplace leave application documenting authorized absence and duty delegation.",
    points: [
      { label: "Absence Duration", text: `Covers ${d.days} day(s) from ${d.fromDate} to ${d.toDate}.` },
      { label: "Stated Reason", text: `Categorized under '${d.type}'. Detailed as: ${d.reason.substring(0, 100)}...` },
      { label: "Handover Assurance", text: `${d.handover} This assures management that critical ongoing obligations will not be abandoned.` },
      { label: "Approval Advice", text: "Submit this letter to your reporting officer or college office and retain the signed or stamped copy." }
    ],
    clauses: [
      { name: "Duty Handover", desc: "Crucial for workplace or university records to establish accountability while you are away." }
    ]
  };
}

function buildNoticeExplanation(d) {
  return {
    summary: "A legal notice is a formal ultimatum warning the other party before initiating litigation in a court of law.",
    points: [
      { label: "Core Demand", text: `Demands ${d.demand} to settle the matter amicably.` },
      { label: "Deadline", text: `Gives the recipient strictly ${d.days} days to comply from the date they receive it.` },
      { label: "Legal Weight", text: "Proves in court that you gave the defaulting party fair warning and an opportunity to rectify the breach before suing." },
      { label: "Recommended Delivery", text: "Send via Registered Post with Acknowledgment Due (RPAD) or Speed Post to maintain official postal proof." }
    ],
    clauses: [
      { name: "Cause of Action", desc: "Documents the exact timeline and contractual violations justifying your claim." }
    ]
  };
}

function buildAffidavitExplanation(d) {
  return {
    summary: "An affidavit is a formal sworn statement given under oath, carrying penalties of perjury if knowingly false.",
    points: [
      { label: "Declarant Identity", text: `Deponent: ${d.name}, aged ${d.age}, verified by ${d.idProof}.` },
      { label: "Subject Purpose", text: `${d.purpose}.` },
      { label: "Legal Strength", text: "Once notarized with an official stamp, this document is admissible before government offices, banks, and courts." },
      { label: "Execution Requirement", text: `Must be signed in person before an authorized Notary Public or Oath Commissioner at ${d.place}.` }
    ],
    clauses: [
      { name: "Verification Clause", desc: "Confirms under oath that everything stated is true and nothing has been hidden." }
    ]
  };
}

function buildComplaintExplanation(d) {
  return {
    summary: "A structured grievance letter demanding consumer compensation or official resolution for defective goods or services.",
    points: [
      { label: "Grievance Trigger", text: `Incident/purchase dated ${d.incidentDate}. Matter: ${d.subject}.` },
      { label: "Remedy Claimed", text: `Explicitly demands ${d.remedy}.` },
      { label: "Paper Trail", text: "Creates a formal consumer record that can be submitted to National Consumer Helplines or District Consumer Forums if unresolved." },
      { label: "Timeframe", text: "Demands a written response within 7 working days." }
    ],
    clauses: [
      { name: "Redressal Demand", desc: "Clearly stipulates your desired outcome (refund, replacement, or compensation) so the authority cannot stall." }
    ]
  };
}

/* ==========================================================================
   6. Render Output Studio & Action Toolbar
   ========================================================================== */
function renderOutputStudio(docData) {
  const paper = document.getElementById("legalPaper");
  const explanationContainer = document.getElementById("explanationContainer");
  const docTitleSpan = document.getElementById("outputDocTitle");

  docTitleSpan.textContent = docData.title;
  paper.innerHTML = docData.html;
  paper.contentEditable = "false";
  State.isEditing = false;
  updateEditButtonUI();

  // Render Plain-English AI Explanation
  const exp = docData.plainExplanation;
  let expHtml = `
    <div class="explanation-card">
      <h4><span>🤖</span> Plain-English AI Breakdown <span class="ai-badge">Instant Insight</span></h4>
      <p style="color:var(--text-muted); font-size:0.9rem; margin-bottom:16px;">${exp.summary}</p>
      
      <ul class="plain-breakdown-list">
  `;

  exp.points.forEach(pt => {
    expHtml += `
      <li class="plain-breakdown-item">
        <span class="item-bullet">✦</span>
        <div class="item-content">
          <strong>${pt.label}:</strong> ${pt.text}
        </div>
      </li>
    `;
  });

  expHtml += `</ul>`;

  if (exp.clauses && exp.clauses.length > 0) {
    expHtml += `<div class="clauses-accordion">`;
    exp.clauses.forEach(cl => {
      expHtml += `
        <div class="clause-item">
          <div class="clause-item-title">⚖️ ${cl.name}</div>
          <div class="clause-item-desc">${cl.desc}</div>
        </div>
      `;
    });
    expHtml += `</div>`;
  }

  expHtml += `
      <div style="margin-top: 18px; padding-top: 12px; border-top: 1px solid var(--border-color); font-size: 0.78rem; color: var(--text-muted);">
        💡 <em>LegalEase Tip: Review all dates, amounts, and names carefully before printing or signing.</em>
      </div>
    </div>
  `;

  explanationContainer.innerHTML = expHtml;
}

/* --------------------------------------------------------------------------
   Action Toolbar: Edit, Copy, PDF Download, Save
   -------------------------------------------------------------------------- */
function toggleEditMode() {
  const paper = document.getElementById("legalPaper");
  const editIndicator = document.getElementById("editModeIndicator");
  State.isEditing = !State.isEditing;

  if (State.isEditing) {
    paper.contentEditable = "true";
    paper.focus();
    editIndicator.style.display = "flex";
    showToast("Edit mode active! You can click anywhere to modify the text.", "info");
  } else {
    paper.contentEditable = "false";
    editIndicator.style.display = "none";
    if (State.currentDocData) {
      State.currentDocData.html = paper.innerHTML;
      saveToLocalStorage(State.currentDocData);
    }
    showToast("Changes saved to document.", "success");
  }

  updateEditButtonUI();
}

function updateEditButtonUI() {
  const btn = document.getElementById("btnToggleEdit");
  if (!btn) return;
  if (State.isEditing) {
    btn.innerHTML = `<span>💾</span> Save Edits`;
    btn.classList.add("btn-gold");
  } else {
    btn.innerHTML = `<span>✏️</span> Edit Document`;
    btn.classList.remove("btn-gold");
  }
}

function copyDocument() {
  const paper = document.getElementById("legalPaper");
  if (!paper || !paper.innerText.trim()) {
    showToast("No document content to copy.", "error");
    return;
  }

  const textToCopy = paper.innerText;
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(textToCopy).then(() => {
      showToast("Document copied to clipboard!", "success");
    }).catch(() => {
      fallbackCopy(textToCopy);
    });
  } else {
    fallbackCopy(textToCopy);
  }
}

function fallbackCopy(text) {
  const textArea = document.createElement("textarea");
  textArea.value = text;
  document.body.appendChild(textArea);
  textArea.select();
  try {
    document.execCommand("copy");
    showToast("Document copied to clipboard!", "success");
  } catch (err) {
    showToast("Failed to copy document.", "error");
  }
  document.body.removeChild(textArea);
}

function downloadDocumentPdf() {
  const element = document.getElementById("legalPaper");
  if (!element || !element.innerText.trim()) {
    showToast("Please generate a document first.", "error");
    return;
  }

  showToast("Preparing your PDF download...", "info");

  const docTitle = State.currentDocData ? State.currentDocData.title.replace(/[^a-zA-Z0-9_-]/g, "_") : "LegalEase_Document";
  const filename = `${docTitle}.pdf`;

  // Options for html2pdf.js
  const opt = {
    margin: [15, 15, 15, 15],
    filename: filename,
    image: { type: "jpeg", quality: 0.98 },
    html2canvas: { scale: 2, useCORS: true, letterRendering: true },
    jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
    pagebreak: { mode: ['avoid-all', 'css', 'legacy'] }
  };

  if (typeof html2pdf !== "undefined") {
    html2pdf().set(opt).from(element).save().then(() => {
      showToast("PDF downloaded successfully!", "success");
    }).catch(err => {
      console.warn("html2pdf failed, falling back to print:", err);
      window.print();
    });
  } else {
    window.print();
  }
}

function saveCurrentDocument() {
  if (!State.currentDocData) {
    showToast("No document available to save.", "error");
    return;
  }
  const paper = document.getElementById("legalPaper");
  State.currentDocData.html = paper.innerHTML;
  saveToLocalStorage(State.currentDocData);
  showToast("Document saved to 'My Documents'!", "success");
}

/* ==========================================================================
   7. My Documents Management (LocalStorage Engine)
   ========================================================================== */
function loadSavedDocs() {
  try {
    const raw = localStorage.getItem("legalease_saved_docs");
    State.savedDocs = raw ? JSON.parse(raw) : [];
  } catch (e) {
    State.savedDocs = [];
  }
  renderSavedDocsList();
}

function saveToLocalStorage(docObj) {
  // Check if exists and update, or prepend new
  const idx = State.savedDocs.findIndex(d => d.id === docObj.id);
  if (idx >= 0) {
    State.savedDocs[idx] = docObj;
  } else {
    State.savedDocs.unshift(docObj);
  }

  // Keep maximum 30 recent documents
  if (State.savedDocs.length > 30) {
    State.savedDocs = State.savedDocs.slice(0, 30);
  }

  localStorage.setItem("legalease_saved_docs", JSON.stringify(State.savedDocs));
  renderSavedDocsList();
}

function renderSavedDocsList() {
  const container = document.getElementById("savedDocsContainer");
  const countBadge = document.getElementById("savedDocsCount");
  if (!container) return;

  countBadge.textContent = `${State.savedDocs.length} saved`;

  if (State.savedDocs.length === 0) {
    container.innerHTML = `
      <div class="docs-empty-state">
        <div class="docs-empty-icon">📁</div>
        <h4>No Documents Saved Yet</h4>
        <p>Draft your first document above and it will be stored safely here in your browser.</p>
        <button class="btn-primary" style="width: auto; margin: 0 auto;" onclick="document.getElementById('documentOptions').scrollIntoView({behavior:'smooth'})">
          Create Document Now
        </button>
      </div>
    `;
    return;
  }

  let html = '<div class="saved-docs-grid">';
  State.savedDocs.forEach(doc => {
    const typeLabel = DOCUMENT_CONFIGS[doc.type] ? DOCUMENT_CONFIGS[doc.type].name : "Legal Document";
    html += `
      <div class="saved-doc-card">
        <div>
          <span class="saved-doc-type-badge">${typeLabel}</span>
          <div class="saved-doc-title">${escapeHtml(doc.title)}</div>
          <div class="saved-doc-date">Created on ${doc.createdAt}</div>
        </div>
        <div class="saved-doc-actions">
          <button class="btn-card-action" onclick="viewSavedDocument('${doc.id}')">
            <span>👁️</span> View
          </button>
          <button class="btn-card-action" onclick="downloadSpecificPdf('${doc.id}')">
            <span>⬇️</span> PDF
          </button>
          <button class="btn-card-delete" onclick="deleteSavedDocument('${doc.id}')" title="Delete">
            🗑️
          </button>
        </div>
      </div>
    `;
  });
  html += '</div>';

  container.innerHTML = html;
}

function viewSavedDocument(docId) {
  const doc = State.savedDocs.find(d => d.id === docId);
  if (!doc) return;

  State.currentDocData = doc;
  State.activeDocType = doc.type;
  renderOutputStudio(doc);

  const outputSection = document.getElementById("outputSection");
  outputSection.style.display = "block";
  outputSection.scrollIntoView({ behavior: "smooth" });

  showToast(`Loaded "${doc.title}"`, "info");
}

function downloadSpecificPdf(docId) {
  const doc = State.savedDocs.find(d => d.id === docId);
  if (!doc) return;
  viewSavedDocument(docId);
  setTimeout(() => {
    downloadDocumentPdf();
  }, 400);
}

function deleteSavedDocument(docId) {
  if (!confirm("Are you sure you want to delete this document from My Documents?")) return;
  State.savedDocs = State.savedDocs.filter(d => d.id !== docId);
  localStorage.setItem("legalease_saved_docs", JSON.stringify(State.savedDocs));
  renderSavedDocsList();
  showToast("Document removed.", "info");
}

function clearAllSavedDocs() {
  if (State.savedDocs.length === 0) return;
  if (!confirm("Are you sure you want to delete all saved documents? This action cannot be undone.")) return;
  State.savedDocs = [];
  localStorage.removeItem("legalease_saved_docs");
  renderSavedDocsList();
  showToast("All saved documents deleted.", "info");
}

/* ==========================================================================
   8. AI Legal Assistant
   ========================================================================== */
const AI_KNOWLEDGE_BASE = [
  {
    triggers: ["rental", "lease", "rent", "tenant", "landlord", "deposit"],
    response: `<strong>🏠 Rental Agreement Guidance:</strong><br>
    • <strong>Essential Details:</strong> Full legal names, verified addresses, exact property description, monthly rent amount, due date, and refundable security deposit.<br>
    • <strong>Standard Terms:</strong> Typically 11 months in India (to avoid mandatory lease registration requirements) or 1-2 years.<br>
    • <strong>Crucial Clauses:</strong> 30-day notice period for vacation, maintenance terms, and permitted residential use.<br>
    • <em>Tip: Always attach electricity bill copies and government ID proofs.</em>`
  },
  {
    triggers: ["leave", "absence", "sick", "vacation", "college", "school", "office", "work"],
    response: `<strong>📄 Leave Letter Guidance:</strong><br>
    • <strong>Key Information:</strong> Specific start and end dates, total number of days, and precise reason.<br>
    • <strong>Handover & Accountability:</strong> Clearly state who is covering your tasks or that you are accessible via emergency phone/email.<br>
    • <strong>Medical Certificates:</strong> If requesting sick leave over 3 days, always state that medical certificates are attached.`
  },
  {
    triggers: ["notice", "legal notice", "sue", "court", "breach", "demand", "unpaid", "money"],
    response: `<strong>⚠️ Legal Notice Guidance:</strong><br>
    • <strong>Purpose:</strong> Formal written warning alerting the defaulting party before initiating litigation.<br>
    • <strong>Mandatory Timeline:</strong> Give a clear compliance deadline (commonly 15 or 30 days) to rectify the breach.<br>
    • <strong>Delivery Mode:</strong> Best dispatched via Registered Post with Acknowledgment Due (RPAD) or Speed Post to preserve official delivery tracking evidence.`
  },
  {
    triggers: ["affidavit", "oath", "notary", "swear", "deponent", "correction", "name"],
    response: `<strong>📝 Simple Affidavit Guidance:</strong><br>
    • <strong>Nature:</strong> A voluntary declaration of facts made under solemn oath before an authorized official.<br>
    • <strong>Structure:</strong> Numbered statements starting with "That I am...", concluding with a verification statement confirming no facts were concealed.<br>
    • <strong>Validity:</strong> Must be signed in person before a Notary Public or Oath Commissioner on appropriate non-judicial stamp paper.`
  },
  {
    triggers: ["complaint", "defective", "consumer", "refund", "grievance", "fraud", "scam"],
    response: `<strong>📩 Complaint Letter Guidance:</strong><br>
    • <strong>Factual Chronology:</strong> State date of purchase, invoice numbers, warranty terms, and dates of previous communication.<br>
    • <strong>Concrete Redressal:</strong> State whether you require a full refund, immediate replacement, or repair.<br>
    • <strong>Escalation Warning:</strong> Mention that failure to respond within 7 days will lead to a complaint before the Consumer Disputes Redressal Commission.`
  },
  {
    triggers: ["binding", "valid", "lawyer", "legal advice", "court", "educational"],
    response: `<strong>⚖️ Legal Validity & Educational Notice:</strong><br>
    ${LEGAL_DISCLAIMER_TEXT}<br><br>
    • While these drafts follow standard legal formatting, formal binding agreements may require custom statutory covenants, stamp duty payment, and notarization tailored to your local state laws.`
  }
];

function initAIAssistant() {
  const sendBtn = document.getElementById("btnAiSend");
  const inputEl = document.getElementById("aiInputQuery");
  const chipContainer = document.getElementById("aiPromptChips");

  if (sendBtn && inputEl) {
    sendBtn.addEventListener("click", () => {
      const q = inputEl.value.trim();
      if (q) {
        handleUserAiQuestion(q);
        inputEl.value = "";
      }
    });

    inputEl.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        const q = inputEl.value.trim();
        if (q) {
          handleUserAiQuestion(q);
          inputEl.value = "";
        }
      }
    });
  }

  // Bind Preset Chips
  if (chipContainer) {
    chipContainer.querySelectorAll(".prompt-chip").forEach(chip => {
      chip.addEventListener("click", () => {
        const question = chip.getAttribute("data-prompt");
        handleUserAiQuestion(question);
      });
    });
  }
}

function handleUserAiQuestion(questionText) {
  const messagesList = document.getElementById("aiMessagesList");
  if (!messagesList) return;

  // Append User Bubble
  const userBubble = document.createElement("div");
  userBubble.className = "message-bubble message-user";
  userBubble.textContent = questionText;
  messagesList.appendChild(userBubble);
  messagesList.scrollTop = messagesList.scrollHeight;

  // Add Typing Indicator
  const typingIndicator = document.createElement("div");
  typingIndicator.className = "message-bubble message-bot";
  typingIndicator.innerHTML = `<em>Legal Assistant is reviewing requirements...</em>`;
  messagesList.appendChild(typingIndicator);
  messagesList.scrollTop = messagesList.scrollHeight;

  setTimeout(() => {
    // Generate Answer
    const answer = getAiAnswer(questionText);
    typingIndicator.innerHTML = answer;
    messagesList.scrollTop = messagesList.scrollHeight;
  }, 450);
}

function getAiAnswer(query) {
  const q = query.toLowerCase();

  for (const entry of AI_KNOWLEDGE_BASE) {
    if (entry.triggers.some(t => q.includes(t))) {
      return entry.response;
    }
  }

  // Fallback answer
  return `<strong>🤖 Legal Assistant Guidance:</strong><br>
  I can guide you on requirements, clauses, and drafting best practices for:
  • <strong>Rental Agreements</strong> (terms, rent, security deposits)<br>
  • <strong>Leave Letters</strong> (academic or employment absence)<br>
  • <strong>Legal Notices</strong> (demands, breach of contract)<br>
  • <strong>Affidavits</strong> (declarations under oath, name corrections)<br>
  • <strong>Complaint Letters</strong> (consumer disputes, warranty issues)<br><br>
  <em>Try clicking any suggestion on the left or asking: "What details do I need for a Rental Agreement?"</em>`;
}

/* ==========================================================================
   9. Helper Utilities
   ========================================================================== */
function formatDate(dateStr) {
  if (!dateStr) return "N/A";
  const parts = dateStr.split("-");
  if (parts.length === 3) {
    const d = new Date(parts[0], parts[1] - 1, parts[2]);
    return d.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
  }
  return dateStr;
}

function calculateDaysBetween(startStr, endStr) {
  if (!startStr || !endStr) return 1;
  const start = new Date(startStr);
  const end = new Date(endStr);
  const diffTime = end - start;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
  return diffDays > 0 ? diffDays : 1;
}

function escapeHtml(text) {
  const map = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' };
  return String(text).replace(/[&<>"']/g, m => map[m]);
}

function showToast(message, type = "info") {
  const container = document.getElementById("toastContainer");
  if (!container) return;

  const toast = document.createElement("div");
  toast.className = `toast toast-${type}`;
  
  let icon = "ℹ️";
  if (type === "success") icon = "✅";
  if (type === "error") icon = "⚠️";

  toast.innerHTML = `<span>${icon}</span> <div>${message}</div>`;
  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = "0";
    toast.style.transform = "translateX(100%)";
    toast.style.transition = "all 0.3s ease";
    setTimeout(() => toast.remove(), 300);
  }, 3500);
}
