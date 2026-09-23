function loadStudentLogin() {
    // home section hide
    document.getElementById("home-section").style.display = "none";
  
    // fetch করে student_login.html load করব
    fetch("student_login.html")
      .then(response => response.text())
      .then(data => {
        document.getElementById("student-login").innerHTML = data;
      })
      .catch(error => console.error("Error loading student login:", error));
  }
  
  function backToHome() {
    document.getElementById("student-login").innerHTML = "";
    document.getElementById("home-section").style.display = "block";
  }
  