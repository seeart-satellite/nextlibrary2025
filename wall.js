import {
    collection,
    addDoc,
    onSnapshot,
    updateDoc, 
    doc 
  } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-firestore.js";
  
  export function initSurveyApp(db) {
    const form = document.getElementById('surveyForm');
    const input = document.getElementById('answerInput');
    const email = document.getElementById('emailInput');
    const wall = document.getElementById('wall');
    const sectionButtons = document.querySelectorAll('.sections button');
  
    const step1 = document.getElementById('step1');
    const step2 = document.getElementById('step2');
    const nextBtn = document.getElementById('nextBtn');
    const backBtn = document.getElementById('backBtn');
  
    const sections = document.getElementById('sections');
    const header1 = document.getElementById('header1');
  
    const sectionA = document.getElementById('sectionA');
    const sectionB = document.getElementById('sectionB');
    const sectionC = document.getElementById('sectionC');
    const sectionD = document.getElementById('sectionD');
  
    const textWarning = document.getElementById('textWarning');
    const emailWarning = document.getElementById('emailWarning');
    const check1 = document.getElementById('check1');
    const check2 = document.getElementById('check2');
    const check3 = document.getElementById('check3');
    const otherText = document.getElementById('otherText');

    const gdprCheckbox = document.getElementById('checkDefault');
    const successMessage = document.getElementById('successMessage');
  
    let selectedSection = null;
    let zIndexCounter = 1;
  
    const notesRef = collection(db, 'messages');

    if (check1 && check2 && check3 && otherText) {
    const updateOtherTextDisplay = () => {
    if (check3.checked) {
    otherText.style.display = 'block';
  } else {
    otherText.style.display = 'none';
    otherText.value = '';
  }
};

  check1.addEventListener('change', updateOtherTextDisplay);
  check2.addEventListener('change', updateOtherTextDisplay);
  check3.addEventListener('change', updateOtherTextDisplay);

  updateOtherTextDisplay();
}

    if (sectionButtons.length) {
      sectionButtons.forEach(btn => {
  const section = btn.dataset.section;
  const answeredSections = JSON.parse(localStorage.getItem('answered_sections') || '[]');

  // Disable button if already submitted
  if (answeredSections.includes(section)) {
    btn.disabled = true;
    btn.classList.add('btn-light');
    btn.innerText += 'Done';
    return;
  }

  btn.addEventListener('click', () => {
    selectedSection = section;
    form.style.display = 'flex';
    header1.style.display = 'none';
    sections.style.display = 'none';

    sectionA.style.display = 'none';
    sectionB.style.display = 'none';
    sectionC.style.display = 'none';
    sectionD.style.display = 'none';

  let targetSection;
  if (selectedSection == "Section A") targetSection = sectionA;
  if (selectedSection == "Section B") targetSection = sectionB;
  if (selectedSection == "Section C") targetSection = sectionC;
  if (selectedSection == "Section D") targetSection = sectionD;

  if (targetSection) {
    targetSection.style.display = 'block';

    // Animate .section_h elements inside
    const elements = targetSection.querySelectorAll('.section_h');
    elements.forEach((el, index) => {
      el.classList.remove('animate-in'); // Reset if reused
      setTimeout(() => {
        el.classList.add('animate-in');
      }, index * 150);
    });

    // Focus the h1 inside
    const h1 = targetSection.querySelector('h1');
    if (h1) {
      // Scroll into view first
      h1.scrollIntoView({ behavior: 'smooth', block: 'center' });

      // Wait a little before focusing
      setTimeout(() => {
        h1.focus(); // Add tabindex="-1" to your h1 for this to work
      }, elements.length * 150 + 100); // After animation finishes
    }
  }

  });
});

    }

        if (nextBtn) {
  nextBtn.addEventListener('click', () => {
    const answer = input.value.trim();
    if (answer === '') {
      if (textWarning) textWarning.style.display = 'block';
      return;
    }
    if (textWarning) textWarning.style.display = 'none';
    step1.style.display = 'none';
    step2.style.display = 'flex';

    backBtn.addEventListener('click', () => {
        step1.style.display = 'flex';
        step2.style.display = 'none';
      });

    // Hide email step if already saved
    if (localStorage.getItem('user_email')) {
      step2.style.display = 'none';
      form.requestSubmit(); // triggers form submission directly
    }

    // Animate .section_h elements inside
    const elements = step2.querySelectorAll('.section_h');
    elements.forEach((el, index) => {
      el.classList.remove('animate-in'); // Reset if reused
      setTimeout(() => {
        el.classList.add('animate-in');
      }, index * 150);
    });

    // Focus the h1 inside
    const h1 = step2.querySelector('h1');
    if (h1) {
      // Scroll into view first
      h1.scrollIntoView({ behavior: 'smooth', block: 'center' });

      // Wait a little before focusing
      setTimeout(() => {
        h1.focus(); // Add tabindex="-1" to your h1 for this to work
      }, elements.length * 150 + 100); // After animation finishes
    }
  });
}

  
    if (form) {
  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const message = input.value.trim();
    const emailValue = email.value.trim() || localStorage.getItem('user_email');
    const isValidEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailValue);
    

    if (!localStorage.getItem('user_email')) {
      if (!isValidEmail) {
        if (emailWarning) emailWarning.style.display = 'block';
        return;
      } else {
        if (emailWarning) emailWarning.style.display = 'none';
        localStorage.setItem('user_email', emailValue);
      }
    }

    if (message && emailValue && selectedSection) {
      await addDoc(notesRef, {
        text: message,
        section: selectedSection,
        x: Math.random() * 80,
        y: Math.random() * 80,
        visible: true,
        timestamp: new Date() 
      });

      // Save email in separate collection
      const emailRef = collection(db, 'emails');
      await addDoc(emailRef, {
      email: emailValue,
      section: selectedSection,
      wantsUpdates: gdprCheckbox.checked,
      isNextLibrary: check1.checked,
      isDokk1Visitor: check2.checked,
      isOther: check3.checked,
      otherText: check3.checked ? otherText.value.trim() : '',
      timestamp: new Date()
      });

      // Clear input
      input.value = '';
      if (email) email.value = '';
      successMessage.style.display = 'block';

      // Mark this section as answered
      const answeredSections = JSON.parse(localStorage.getItem('answered_sections') || '[]');
      answeredSections.push(selectedSection);
      localStorage.setItem('answered_sections', JSON.stringify(answeredSections));

      const btnToDisable = Array.from(sectionButtons).find(btn => btn.dataset.section === selectedSection);
      if (btnToDisable) {
      btnToDisable.disabled = true;
      btnToDisable.classList.add('btn-light');
      btnToDisable.innerHTML = 'Done'; // Clears icon and sets plain text
      }


      // Hide form, show post-submission screen
      form.style.display = 'none';
      document.getElementById('postSubmit').style.display = 'flex';
    }
  });
}

const restartBtn = document.getElementById('restartBtn');
if (restartBtn) {
  restartBtn.addEventListener('click', () => {
    // Reset UI to allow choosing a new section
    document.getElementById('postSubmit').style.display = 'none';
    header1.style.display = 'block';
    document.querySelector('.sections').style.display = 'block';

    form.style.display = 'none';      // Hide form until a section is selected again
    step1.style.display = '';    // Reset form steps
    step2.style.display = 'none';
    input.value = '';                // Clear input fields
    email.value = '';
    otherText.value = '';
    otherText.style.display = 'none';

    selectedSection = null;          // Reset selected section
    successMessage.style.display = 'none';
    textWarning.style.display = 'none';
    emailWarning.style.display = 'none';

    // Re-show any section content divs just in case
    sectionA.style.display = 'none';
    sectionB.style.display = 'none';
    sectionC.style.display = 'none';
    sectionD.style.display = 'none';
  });
}


  
const existingNoteIds = new Set();
let hasLoadedInitially = false;
const noteMap = new Map(); // To track DOM elements by doc.id

if (wall) {
  onSnapshot(notesRef, snapshot => {
    const newNotes = [];
    const currentIds = new Set();

    snapshot.forEach((doc, index) => {
      const data = doc.data();
      const id = doc.id;
      currentIds.add(id);

      let note = noteMap.get(id);

      if (data.visible === true) {
        const isNew = !existingNoteIds.has(id);
        existingNoteIds.add(id);

        // Create new note element if not exists
        if (!note) {
          note = document.createElement('div');
          note.className = `note ${getSectionClass(data.section)}`;
          note.textContent = data.text;
          note.style.left = `${data.x}%`;
          note.style.top = `${data.y}%`;
          note.dataset.id = id;
          makeDraggable(note);
          wall.appendChild(note);
          noteMap.set(id, note);
        }

        // Apply animations
        if (!hasLoadedInitially) {
          newNotes.push(note); // for staggered animation later
        } else if (isNew) {
          note.classList.add('note-new');
          requestAnimationFrame(() => {
            setTimeout(() => {
      note.classList.add('show');
    }, 20); 
          });
        } else {
          // Make sure note stays visible
          note.classList.add('show');
        }
      } else {
        // Fade out then remove
        if (note) {
          note.classList.remove('show');
          note.classList.add('fade-out');
          setTimeout(() => {
            if (note.parentNode === wall) wall.removeChild(note);
            noteMap.delete(id);
            existingNoteIds.delete(id);
          }, 600); // match fade-out duration
        }
      }
    });

    // Staggered fade-in after first full load
    if (!hasLoadedInitially) {
      newNotes.forEach((note, i) => {
        setTimeout(() => {
          note.classList.add('note-new', 'show');
        }, i * 120);
      });
      hasLoadedInitially = true;
    }

    // Optional cleanup of deleted notes (not just visibility = false)
    for (let id of [...noteMap.keys()]) {
      if (!currentIds.has(id)) {
        const oldNote = noteMap.get(id);
        if (oldNote.parentNode === wall) wall.removeChild(oldNote);
        noteMap.delete(id);
        existingNoteIds.delete(id);
      }
    }
  });
}




  
    function getSectionClass(section) {
      switch (section) {
        case 'Section A': return 'A';
        case 'Section B': return 'B';
        case 'Section C': return 'C';
        case 'Section D': return 'D';
        default: return '';
      }
    }
  
    function makeDraggable(el) {
  let offsetX, offsetY, isDragging = false;

  const savePosition = () => {
    const id = el.dataset.id;
    if (!id) return;

    const x = parseFloat(el.style.left); // In %
    const y = parseFloat(el.style.top);

    updateDoc(doc(notesRef, id), { x, y })
      .then(() => console.log(`🧷 Saved position for ${id}: ${x}%, ${y}%`))
      .catch(err => console.error("Failed to update position:", err));
  };

  el.addEventListener('mousedown', (e) => {
    isDragging = true;
    offsetX = e.clientX - el.offsetLeft;
    offsetY = e.clientY - el.offsetTop;
    el.style.zIndex = ++zIndexCounter;
  });

  document.addEventListener('mousemove', (e) => {
    if (!isDragging) return;
    const newX = e.clientX - offsetX;
    const newY = e.clientY - offsetY;
    el.style.left = `${(newX / wall.clientWidth) * 100}%`;
    el.style.top = `${(newY / wall.clientHeight) * 100}%`;
  });

  document.addEventListener('mouseup', () => {
    if (isDragging) savePosition();
    isDragging = false;
  });

  // Touch events
  el.addEventListener('touchstart', (e) => {
    isDragging = true;
    const touch = e.touches[0];
    offsetX = touch.clientX - el.offsetLeft;
    offsetY = touch.clientY - el.offsetTop;
    el.style.zIndex = ++zIndexCounter;
  });

  document.addEventListener('touchmove', (e) => {
    if (!isDragging) return;
    const touch = e.touches[0];
    const newX = touch.clientX - offsetX;
    const newY = touch.clientY - offsetY;
    el.style.left = `${(newX / wall.clientWidth) * 100}%`;
    el.style.top = `${(newY / wall.clientHeight) * 100}%`;
  }, { passive: false });

  document.addEventListener('touchend', () => {
    if (isDragging) savePosition();
    isDragging = false;
  });
}

  }
  