import {
    collection,
    addDoc,
    onSnapshot
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
    otherText.value = ''; // Clear the input when not shown
  }
};

  check1.addEventListener('change', updateOtherTextDisplay);
  check2.addEventListener('change', updateOtherTextDisplay);
  check3.addEventListener('change', updateOtherTextDisplay);

  // Optional: ensure correct visibility on page load
  updateOtherTextDisplay();
}

    if (sectionButtons.length) {
      sectionButtons.forEach(btn => {
  const section = btn.dataset.section;
  const answeredSections = JSON.parse(localStorage.getItem('answered_sections') || '[]');

  // Disable button if already submitted
  if (answeredSections.includes(section)) {
    btn.disabled = true;
    btn.classList.add('btn-secondary');
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

    if (selectedSection == "Section A") sectionA.style.display = 'block';
    if (selectedSection == "Section B") sectionB.style.display = 'block';
    if (selectedSection == "Section C") sectionC.style.display = 'block';
    if (selectedSection == "Section D") sectionD.style.display = 'block';

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

    // 🧠 Hide email step if already saved
    if (localStorage.getItem('user_email')) {
      step2.style.display = 'none';
      form.requestSubmit(); // triggers form submission directly
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
        visible: true 
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
      btnToDisable.innerText += 'Done';
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



  
if (wall) {
  onSnapshot(notesRef, snapshot => {
    wall.innerHTML = '';
    snapshot.forEach(doc => {
      const data = doc.data();
      console.log("Loaded note:", data); // 👈 Check what's coming in

      // Only show if visible is true
      if (data.visible === true) {
        const note = document.createElement('div');
        note.className = `note ${getSectionClass(data.section)}`;
        note.textContent = data.text;
        note.style.left = `${data.x}%`;
        note.style.top = `${data.y}%`;
        makeDraggable(note);
        wall.appendChild(note);
      }
    });
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
  
      document.addEventListener('mouseup', () => isDragging = false);
  
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
  
      document.addEventListener('touchend', () => isDragging = false);
    }
  }
  