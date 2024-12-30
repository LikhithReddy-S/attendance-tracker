// Subject data with initial state
const subjects = {
    "Math": { totalClasses: 21, classesHappened: 10, updatedToday: false },
    "PFL": { totalClasses: 18, classesHappened: 8, updatedToday: false },
    "OS": { totalClasses: 21, classesHappened: 10, updatedToday: false },
    "ADM": { totalClasses: 4, classesHappened: 10, updatedToday: false },
    "CIR": { totalClasses: 12, classesHappened: 10, updatedToday: false },
    "COA": { totalClasses: 17, classesHappened: 10, updatedToday: false }
  };
  
  // Timetable for each day of the week
  const timetables = {
    "Monday": {
      "Math": { start: "9:00", end: "10:00" },
      "PFL": { start: "10:05", end: "10:10" },
      "OS": { start: "12:20", end: "13:20" }
    },
    "Tuesday": {
      "ADM": { start: "09:00", end: "10:00" },
      "CIR": { start: "10:10", end: "11:10" },
      "COA": { start: "11:20", end: "12:20" }
    }
  };
  
  // Get the current day's timetable
  function getCurrentDayTimetable() {
    const now = new Date();
    const day = now.toLocaleString('en-US', { weekday: 'long' });
    return timetables[day] || {};
  }
  
  // Update classes happened based on the current timetable
  function updateClassesHappened() {
    const now = new Date();
    const currentTime = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;
    const currentDayTimetable = getCurrentDayTimetable();
  
    Object.keys(currentDayTimetable).forEach(subject => {
      const { start, end } = currentDayTimetable[subject];
      if (currentTime > end && !subjects[subject].updatedToday) {
        subjects[subject].classesHappened += 1;
        subjects[subject].updatedToday = true;
      }
    });
  
    localStorage.setItem("subjects", JSON.stringify(subjects));
    updateUI();
  }
  
  // Reset daily updates at midnight
  function resetDailyUpdates() {
    Object.keys(subjects).forEach(subject => {
      subjects[subject].updatedToday = false;
    });
    localStorage.setItem("subjects", JSON.stringify(subjects));
  }
  
  // Schedule the daily reset at midnight
  const now = new Date();
  const timeToMidnight = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 0, 0, 0) - now;
  setTimeout(() => {
    resetDailyUpdates();
    setInterval(resetDailyUpdates, 24 * 60 * 60 * 1000);
  }, timeToMidnight);
  
  // Update the UI dynamically
  function updateUI() {
    const tableBody = document.getElementById("subject-table");
    tableBody.innerHTML = "";
  
    Object.keys(subjects).forEach(subject => {
      const totalClasses = subjects[subject].totalClasses;
      const classesHappened = subjects[subject].classesHappened;
      const classesNeededFor75 = Math.ceil(0.75 * totalClasses);
  
      const row = `<tr>
                    <td>${subject}</td>
                    <td>${totalClasses}</td>
                    <td>${classesHappened}</td>
                    <td>${classesNeededFor75}</td>
                  </tr>`;
      tableBody.innerHTML += row;
    });
  
    const subjectDropdown = document.getElementById("subject");
    subjectDropdown.innerHTML = "";
    Object.keys(subjects).forEach(subject => {
      const option = `<option value="${subject}">${subject}</option>`;
      subjectDropdown.innerHTML += option;
    });
  }
  
  // Update selected subject for the calculator
  function updateSelectedSubject() {
    const selectedSubject = document.getElementById("subject").value;
    document.getElementById("totalClasses").value = subjects[selectedSubject].classesHappened;
  }
  
  // Attendance Calculator
  function calculateAttendance() {
    const selectedSubject = document.getElementById("subject").value;
    const attendancePercentage = parseInt(document.getElementById("attendancePercentage").value);
    const totalClassesHappened = parseInt(document.getElementById("totalClasses").value);
  
    if (
      isNaN(attendancePercentage) || attendancePercentage < 0 || attendancePercentage > 100 || 
      isNaN(totalClassesHappened) || totalClassesHappened <= 0 || totalClassesHappened > subjects[selectedSubject].totalClasses
    ) {
      document.getElementById("result").textContent = "Please enter valid values.";
      return;
    }
  
    const attendedClasses = Math.ceil((attendancePercentage / 100) * totalClassesHappened);
    const remainingClasses = subjects[selectedSubject].totalClasses - totalClassesHappened;
    const minimumClassesNeeded = Math.ceil(0.75 * subjects[selectedSubject].totalClasses) - attendedClasses;
  
    let resultText = `
      Total Classes Happened: ${totalClassesHappened}
      <br>Classes Attended: ${attendedClasses}
      <br>Attendance Percentage: ${attendancePercentage}%
      <br>Remaining Classes: ${remainingClasses}
    `;
  
    if (attendancePercentage >= 75) {
      resultText += `<br>Maintain attendance by attending at least ${Math.max(0, minimumClassesNeeded)} more classes.`;
    } else if (minimumClassesNeeded > remainingClasses) {
      resultText += `<br>You cannot reach 75%. Only ${remainingClasses} classes are left.`;
    } else {
      resultText += `<br>Attend at least ${minimumClassesNeeded} more classes to reach 75%.`;
    }
  
    document.getElementById("result").innerHTML = resultText;
  }
  
  window.onload = function() {
    const savedSubjects = localStorage.getItem("subjects");
    if (savedSubjects) {
      Object.assign(subjects, JSON.parse(savedSubjects));
    }
    updateUI();
    updateClassesHappened();
  };
  
  setInterval(updateClassesHappened, 60000);
  