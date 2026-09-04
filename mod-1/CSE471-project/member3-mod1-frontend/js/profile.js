// ExploreBD authenticated guide profile management

const API_BASE = '/api';
const AUTH_STORAGE_KEY = 'explorebdAuth';

let specialtiesList = [];
let currentAvatarUrl = '';
let isPublic = true;
let authState = readAuthState();

if (!authState?.token || authState?.user?.role !== 'GUIDE') {
  localStorage.removeItem(AUTH_STORAGE_KEY);
  window.location.replace('login.html');
}

function readAuthState() {
  try {
    return JSON.parse(localStorage.getItem(AUTH_STORAGE_KEY));
  } catch {
    return null;
  }
}

function authHeaders(includeJson = false) {
  return {
    ...(includeJson ? { 'Content-Type': 'application/json' } : {}),
    Authorization: `Bearer ${authState?.token || ''}`
  };
}

document.addEventListener('DOMContentLoaded', async () => {
  if (!authState?.token || authState?.user?.role !== 'GUIDE') return;

  const input = document.getElementById('newSpecialtyInput');
  input?.addEventListener('keydown', event => {
    if (event.key === 'Enter') {
      event.preventDefault();
      addSpecialty();
    }
  });

  await loadProfile();
});

async function loadProfile() {
  try {
    const response = await fetch(`${API_BASE}/guide/profile`, { headers: authHeaders() });
    const data = await response.json();

    if (response.status === 401 || response.status === 403) {
      localStorage.removeItem(AUTH_STORAGE_KEY);
      window.location.replace('login.html');
      return;
    }
    if (!response.ok) throw new Error(data.error || 'Could not load your profile');

    populateProfile(data);
  } catch (error) {
    showToast('Profile could not be loaded', error.message === 'Failed to fetch'
      ? 'ExploreBD backend is not running. Start it with npm run dev.'
      : error.message, true);
  } finally {
    document.documentElement.classList.remove('auth-check-pending');
  }
}

function populateProfile(profile) {
  setValue('guideName', profile.name || authState.user.name || '');
  setValue('guideLocation', profile.location || '');
  setValue('guideLanguages', Array.isArray(profile.languages) ? profile.languages.join(', ') : (profile.languages || ''));
  setValue('guideBio', profile.bio || '');
  setValue('hourlyRateInput', Number(profile.hourlyRate) || 0);

  specialtiesList = Array.isArray(profile.specialties) ? profile.specialties : [];
  currentAvatarUrl = profile.avatarUrl || '';
  isPublic = profile.isPublic !== false;

  document.getElementById('toursDoneText').textContent = Number(profile.toursDone) || 0;
  document.getElementById('avgRatingText').textContent = (Number(profile.avgRating) || 0).toFixed(1);
  document.getElementById('repeatClientText').textContent = `${Number(profile.repeatClientRate) || 0}%`;
  document.getElementById('verifiedGuideBadge').style.display = profile.isVerifiedGuide ? 'inline-flex' : 'none';
  document.getElementById('topRatedBadge').style.display = profile.isTopRated ? 'inline-flex' : 'none';

  document.querySelectorAll('.day-pill').forEach(button => {
    setDayPillState(button, (profile.availableDays || []).includes(button.dataset.day));
  });

  setSelectValue('startTimeSelect', profile.startTime || '10:00 A.M');
  setSelectValue('endTimeSelect', profile.endTime || '06:00 P.M');
  updateVisibilityButton();
  updateAvatarImage(currentAvatarUrl, profile.name || authState.user.name);
  renderSpecialties();
  calculateFee();
}

function setValue(id, value) {
  const element = document.getElementById(id);
  if (element) element.value = value;
}

function setSelectValue(id, value) {
  const select = document.getElementById(id);
  if (!select) return;
  if (![...select.options].some(option => option.value === value)) {
    select.add(new Option(value, value));
  }
  select.value = value;
}

function calculateFee() {
  const rateInput = document.getElementById('hourlyRateInput');
  const netEarningsText = document.getElementById('netEarningsText');
  if (!rateInput || !netEarningsText) return;

  const rate = Math.max(0, parseFloat(rateInput.value) || 0);
  const net = rate - ((rate * 12) / 100);
  netEarningsText.innerText = `৳${Number.isInteger(net) ? net : net.toFixed(2)}`;
}

function renderSpecialties() {
  const container = document.getElementById('specialtiesContainer');
  if (!container) return;
  container.replaceChildren();

  specialtiesList.forEach((tag, index) => {
    const chip = document.createElement('span');
    chip.style.cssText = 'display:inline-flex;align-items:center;gap:4px;padding:4px 12px;background:#ecfdf5;color:#065f46;font-size:11px;font-weight:600;border-radius:9999px;border:1px solid #a7f3d0;';

    const text = document.createElement('span');
    text.textContent = tag;
    const removeButton = document.createElement('button');
    removeButton.type = 'button';
    removeButton.setAttribute('aria-label', `Remove ${tag}`);
    removeButton.textContent = '×';
    removeButton.style.cssText = 'color:#059669;font-weight:bold;cursor:pointer;background:none;border:none;font-size:14px;line-height:1;margin-left:2px;';
    removeButton.addEventListener('click', () => removeSpecialty(index));

    chip.append(text, removeButton);
    container.appendChild(chip);
  });
}

function addSpecialty() {
  const input = document.getElementById('newSpecialtyInput');
  if (!input) return;

  const tag = input.value.trim();
  if (tag && !specialtiesList.some(item => item.toLowerCase() === tag.toLowerCase())) {
    specialtiesList.push(tag);
    renderSpecialties();
    input.value = '';
    input.focus();
  }
}

function removeSpecialty(index) {
  specialtiesList.splice(index, 1);
  renderSpecialties();
}

function handleDpChange(event) {
  const file = event.target.files?.[0];
  if (!file) return;
  if (!file.type.startsWith('image/')) {
    showToast('Invalid profile photo', 'Please choose an image file.', true);
    return;
  }
  if (file.size > 1_500_000) {
    showToast('Profile photo is too large', 'Please choose an image smaller than 1.5 MB.', true);
    return;
  }

  const reader = new FileReader();
  reader.onload = event => updateAvatarImage(event.target.result, document.getElementById('guideName').value);
  reader.readAsDataURL(file);
}

function updateAvatarImage(src, name = '') {
  currentAvatarUrl = src || '';
  const initials = String(name || 'Guide')
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map(part => part[0].toUpperCase())
    .join('') || 'G';

  document.querySelectorAll('.guide-dp-img').forEach(element => {
    if (currentAvatarUrl) {
      element.replaceChildren();
      element.style.backgroundImage = `url("${currentAvatarUrl.replaceAll('"', '%22')}")`;
      element.style.backgroundSize = 'cover';
      element.style.backgroundPosition = 'center';
    } else {
      element.style.backgroundImage = '';
      const span = document.createElement('span');
      span.textContent = initials;
      element.replaceChildren(span);
    }
  });
}

function setDayPillState(button, selected) {
  button.style.backgroundColor = selected ? '#ecfdf5' : '#f8fafc';
  button.style.color = selected ? '#065f46' : '#94a3b8';
  button.style.border = selected ? '1px solid #34d399' : '1px solid #e2e8f0';
  button.classList.toggle('bg-emerald-50', selected);
  button.classList.toggle('text-emerald-800', selected);
  button.classList.toggle('border-emerald-400', selected);
  button.classList.toggle('ring-1', selected);
  button.classList.toggle('ring-emerald-300', selected);
}

function toggleDayPill(button) {
  setDayPillState(button, !button.classList.contains('bg-emerald-50'));
}

function toggleVisibility() {
  isPublic = !isPublic;
  updateVisibilityButton();
}

function updateVisibilityButton() {
  const button = document.getElementById('visibilityToggle');
  if (!button) return;
  button.className = isPublic
    ? 'px-3 py-1.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-300'
    : 'px-3 py-1.5 rounded-full text-xs font-bold bg-slate-100 text-slate-500 border border-slate-300';
  button.innerText = isPublic ? '● Public' : '○ Hidden';
}

async function saveProfile() {
  const payload = {
    name: document.getElementById('guideName').value.trim(),
    location: document.getElementById('guideLocation').value.trim(),
    languages: document.getElementById('guideLanguages').value.split(',').map(value => value.trim()).filter(Boolean),
    bio: document.getElementById('guideBio').value.trim(),
    hourlyRate: Number(document.getElementById('hourlyRateInput').value),
    specialties: specialtiesList,
    avatarUrl: currentAvatarUrl,
    isPublic,
    availableDays: [...document.querySelectorAll('.day-pill.bg-emerald-50')].map(button => button.dataset.day),
    startTime: document.getElementById('startTimeSelect').value,
    endTime: document.getElementById('endTimeSelect').value
  };

  try {
    const response = await fetch(`${API_BASE}/guide/profile`, {
      method: 'PUT',
      headers: authHeaders(true),
      body: JSON.stringify(payload)
    });
    const data = await response.json();

    if (response.status === 401 || response.status === 403) {
      localStorage.removeItem(AUTH_STORAGE_KEY);
      window.location.replace('login.html');
      return;
    }
    if (!response.ok) throw new Error(data.error || 'Could not save your profile');

    authState.user.name = data.profile.name;
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(authState));
    populateProfile(data.profile);
    showToast('Profile updated successfully!', 'Changes saved to ExploreBD.');
  } catch (error) {
    showToast('Profile was not saved', error.message === 'Failed to fetch'
      ? 'ExploreBD backend is not running. Start it with npm run dev.'
      : error.message, true);
  }
}

function showToast(title, message, isError = false) {
  const toast = document.getElementById('toastAlert');
  if (!toast) return;
  document.getElementById('toastTitle').textContent = title;
  document.getElementById('toastMessage').textContent = message;
  toast.className = isError
    ? 'mb-6 p-4 bg-red-50 border-2 border-red-400 rounded-2xl text-red-900 flex items-center space-x-3 shadow-md'
    : 'mb-6 p-4 bg-emerald-50 border-2 border-emerald-500 rounded-2xl text-emerald-900 flex items-center space-x-3 shadow-md';
  window.clearTimeout(showToast.timeoutId);
  showToast.timeoutId = window.setTimeout(() => toast.classList.add('hidden'), 4000);
}

function logout() {
  localStorage.removeItem(AUTH_STORAGE_KEY);
  window.location.replace('login.html');
}
