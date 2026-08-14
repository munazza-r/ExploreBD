// ExploreBD Guide Profile Management JS

let specialtiesList = [
  'Sundarbans',
  'Bagerhat',
  "Cox's Bazar",
  'Bandarban',
  'Rangamati',
  'Sreemangal',
  'Old Dhaka',
  'River Cruises'
];

let currentAvatarUrl = '';
let isPublic = true;

// Initialize profile on page load
document.addEventListener('DOMContentLoaded', () => {
  renderSpecialties();
  calculateFee();
});

// 1. Fee Calculator (12% Fee)
function calculateFee() {
  const rateInput = document.getElementById('hourlyRateInput');
  const netEarningsText = document.getElementById('netEarningsText');
  if (!rateInput || !netEarningsText) return;

  const rate = parseFloat(rateInput.value) || 0;
  const fee = Math.round((rate * 12) / 100);
  const net = rate - fee;
  netEarningsText.innerText = '৳' + net;
}

// 2. Render Specialties Tag Chips
function renderSpecialties() {
  const container = document.getElementById('specialtiesContainer');
  if (!container) return;

  container.innerHTML = specialtiesList.map((tag, idx) => `
    <span style="display:inline-flex; align-items:center; gap:4px; padding:4px 12px; background:#ecfdf5; color:#065f46; font-size:11px; font-weight:600; border-radius:9999px; border:1px solid #a7f3d0;">
      <span>${tag}</span>
      <button type="button" onclick="removeSpecialty(${idx})" style="color:#059669; font-weight:bold; cursor:pointer; background:none; border:none; font-size:14px; line-height:1; margin-left:2px;" onmouseover="this.style.color='#dc2626'" onmouseout="this.style.color='#059669'">
        &times;
      </button>
    </span>
  `).join('');
}

// Add new specialty tag
function addSpecialty() {
  const input = document.getElementById('newSpecialtyInput');
  if (!input) return;

  const tag = input.value.trim();
  if (tag && !specialtiesList.includes(tag)) {
    specialtiesList.push(tag);
    renderSpecialties();
    input.value = '';
    input.focus();
  }
}

// Allow Enter key to add specialty
document.addEventListener('DOMContentLoaded', () => {
  const input = document.getElementById('newSpecialtyInput');
  if (input) {
    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') { e.preventDefault(); addSpecialty(); }
    });
  }
});

// Remove specialty tag
function removeSpecialty(index) {
  specialtiesList.splice(index, 1);
  renderSpecialties();
}

// 3. DP / Profile Picture Upload — click on circle, shows image inside same circle
function handleDpChange(event) {
  const file = event.target.files ? event.target.files[0] : null;
  if (!file) return;

  const reader = new FileReader();
  reader.onload = function(e) {
    updateAvatarImage(e.target.result);
  };
  reader.readAsDataURL(file);
}

function updateAvatarImage(src) {
  currentAvatarUrl = src;

  // Update ALL elements with class guide-dp-img (both navbar avatar and profile circle)
  const avatarElements = document.querySelectorAll('.guide-dp-img');
  avatarElements.forEach(el => {
    // Clear existing content (removes the "MR" text)
    el.innerHTML = '';
    // Set background image on the circle div itself so it stays perfectly round
    el.style.backgroundImage = `url('${src}')`;
    el.style.backgroundSize = 'cover';
    el.style.backgroundPosition = 'center';
  });
}

// 4. Day Pill Selector (Friday - Thursday)
function toggleDayPill(btn) {
  const isSelected = btn.classList.contains('bg-emerald-50');
  if (isSelected) {
    // Deselect
    btn.style.backgroundColor = '#f8fafc';
    btn.style.color = '#94a3b8';
    btn.style.border = '1px solid #e2e8f0';
    btn.classList.remove('bg-emerald-50', 'text-emerald-800', 'border-emerald-400');
  } else {
    // Select
    btn.style.backgroundColor = '#ecfdf5';
    btn.style.color = '#065f46';
    btn.style.border = '1px solid #34d399';
    btn.classList.add('bg-emerald-50', 'text-emerald-800', 'border-emerald-400');
  }
}

// 5. Profile Visibility Toggle (Public / Hidden)
function toggleVisibility() {
  isPublic = !isPublic;
  const btn = document.getElementById('visibilityToggle');
  if (!btn) return;

  if (isPublic) {
    btn.className = 'px-3 py-1.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-300';
    btn.innerText = '● Public';
  } else {
    btn.className = 'px-3 py-1.5 rounded-full text-xs font-bold bg-slate-100 text-slate-500 border border-slate-300';
    btn.innerText = '○ Hidden';
  }
}

// 6. Save Profile API Function
async function saveProfile() {
  const toast = document.getElementById('toastAlert');
  if (toast) {
    toast.classList.remove('hidden');
    toast.style.display = 'flex';
  }

  try {
    const payload = {
      name: document.getElementById('guideName')?.value || 'Md. Muntasir Rahman',
      location: document.getElementById('guideLocation')?.value || 'Dhaka, Bangladesh',
      languages: document.getElementById('guideLanguages')?.value || 'Bengali, English, Hindi',
      bio: document.getElementById('guideBio')?.value || '',
      hourlyRate: parseFloat(document.getElementById('hourlyRateInput')?.value || 650),
      specialties: specialtiesList,
      avatarUrl: currentAvatarUrl,
      isPublic: isPublic
    };

    await fetch('http://localhost:5000/api/guide/profile', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
  } catch (err) {
    console.log('Saved profile state locally (no DB connection)');
  }

  setTimeout(() => {
    if (toast) {
      toast.classList.add('hidden');
      toast.style.display = 'none';
    }
  }, 3000);
}
