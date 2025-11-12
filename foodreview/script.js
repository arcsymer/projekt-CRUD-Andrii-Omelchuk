document.addEventListener("DOMContentLoaded", () => {
  const topRestaurantsEl = document.getElementById("topRestaurants");
  const topDishesEl = document.getElementById("topDishes");

  if(topRestaurantsEl && topDishesEl){
    fetch("api.php?action=topRestaurants&limit=10")
      .then(res=>res.json())
      .then(data=>{
        topRestaurantsEl.innerHTML="";
        data.slice(0,5).forEach(r=>{
          const li=document.createElement("li");
          li.textContent=`${r.nazwa_restauracji} (${r.visits})`;
          topRestaurantsEl.appendChild(li);
        });
      });
    fetch("api.php?action=topDishes&limit=10")
      .then(res=>res.json())
      .then(data=>{
        topDishesEl.innerHTML="";
        data.slice(0,5).forEach(d=>{
          const li=document.createElement("li");
          li.textContent=`${d.nazwa_dania} - Śr. ocena: ${d.avg_ocena}`;
          topDishesEl.appendChild(li);
        });
      });
  }

  const loginBtn = document.getElementById("login-btn");
  const regBtn = document.getElementById("reg-btn");

  if(loginBtn){
    loginBtn.addEventListener("click", ()=>{
      const user=document.getElementById("login-username").value;
      const pass=document.getElementById("login-password").value;
      fetch("api.php?action=login",{
        method:"POST",
        headers:{"Content-Type":"application/json"},
        body: JSON.stringify({nazwa_uzytkownika:user,haslo:pass})
      }).then(res=>res.json())
      .then(r=>{
        if(r.success) window.location.href="profile.html";
        else document.getElementById("login-msg").textContent=r.msg||"Błąd logowania";
      });
    });
  }

  if(regBtn){
    regBtn.addEventListener("click", ()=>{
      const user=document.getElementById("reg-username").value;
      const pass=document.getElementById("reg-password").value;
      fetch("api.php?action=register",{
        method:"POST",
        headers:{"Content-Type":"application/json"},
        body: JSON.stringify({nazwa_uzytkownika:user,haslo:pass})
      }).then(res=>res.json())
      .then(r=>{
        document.getElementById("reg-msg").textContent = r.success ? "Zarejestrowano! Możesz się zalogować." : r.msg||"Błąd rejestracji";
      });
    });
  }

  const reviewForm = document.getElementById("reviewForm");
  const reviewMsg = document.getElementById("reviewMsg");
  const latestReviews = document.getElementById("latestReviews");

  if(reviewForm){
    fetch("api.php?action=profile")
      .then(res=>res.json())
      .then(data=>{
        if(data.success===false) window.location.href="loginreg.html";
      });

    function loadLatest(){
      fetch("api.php?action=latestReviews")
        .then(res=>res.json())
        .then(data=>{
          latestReviews.innerHTML="";
          data.forEach(r=>{
            const li=document.createElement("li");
            li.textContent=`${r.nazwa_dania} - ${r.nazwa_restauracji} (${r.ocena}/10) przez ${r.nazwa_uzytkownika}`;
            latestReviews.appendChild(li);
          });
        });
    }
    loadLatest();

    reviewForm.addEventListener("submit", e=>{
      e.preventDefault();
      const formData=Object.fromEntries(new FormData(reviewForm).entries());
      fetch("api.php?action=addReview",{
        method:"POST",
        headers:{"Content-Type":"application/json"},
        body: JSON.stringify(formData)
      }).then(res=>res.json())
      .then(r=>{
        if(r.success){
          reviewMsg.textContent="Recenzja dodana!";
          reviewForm.reset();
          loadLatest();
        } else reviewMsg.textContent=r.msg||"Błąd dodawania recenzji";
      });
    });
  }

  const usernameEl = document.getElementById("username");
  const createdEl = document.getElementById("created_at");
  const countEl = document.getElementById("review_count");
  const avgEl = document.getElementById("avg_rating");
  const profileMsg = document.getElementById("profileMsg");
  const editForm = document.getElementById("editProfileForm");
  const logoutBtn = document.getElementById("logoutBtn");
  const userReviewsEl = document.getElementById("userReviews");

  if(usernameEl){
    function loadProfile(){
      fetch("api.php?action=profile")
        .then(res=>res.json())
        .then(data=>{
          if(data.success===false){window.location.href="loginreg.html"; return;}
          usernameEl.textContent = data.nazwa_uzytkownika;
          createdEl.textContent = data.created_at.split(" ")[0];
          countEl.textContent = data.count || 0;
          avgEl.textContent = data.avg || "0.00";
          editForm.nazwa_uzytkownika.value = data.nazwa_uzytkownika;
        });
    }
    function loadUserReviews(){
      fetch("api.php?action=userReviews")
        .then(res=>res.json())
        .then(data=>{
          userReviewsEl.innerHTML="";
          data.forEach(r=>{
            const li=document.createElement("li");
            li.textContent=`${r.nazwa_dania} - ${r.nazwa_restauracji} (${r.ocena}/10)`;
            userReviewsEl.appendChild(li);
          });
        });
    }
    loadProfile();
    loadUserReviews();

    editForm.addEventListener("submit", e=>{
      e.preventDefault();
      const formData=Object.fromEntries(new FormData(editForm).entries());
      fetch("api.php?action=updateProfile",{
        method:"POST",
        headers:{"Content-Type":"application/json"},
        body: JSON.stringify(formData)
      }).then(res=>res.json())
      .then(r=>{
        if(r.success){ profileMsg.textContent="Profil zaktualizowany!"; loadProfile(); loadUserReviews();}
        else profileMsg.textContent=r.msg||"Błąd aktualizacji";
      });
    });

    logoutBtn.addEventListener("click", ()=>{
      fetch("api.php?action=logout")
        .then(res=>res.json())
        .then(r=>{if(r.success) window.location.href="loginreg.html";});
    });
  }

  const topRestaurantsList = document.getElementById("topRestaurantsList");
  const topDishesList = document.getElementById("topDishesList");
  const searchInput = document.getElementById("searchInput");
  const searchResults = document.getElementById("searchResults");

  if(topRestaurantsList && topDishesList){
    fetch("api.php?action=topRestaurants&limit=10")
      .then(res=>res.json())
      .then(data=>{
        topRestaurantsList.innerHTML="";
        data.slice(0,5).forEach(r=>{
          const li=document.createElement("li");
          li.textContent=`${r.nazwa_restauracji} (${r.visits})`;
          topRestaurantsList.appendChild(li);
        });
      });
    fetch("api.php?action=topDishes&limit=10")
      .then(res=>res.json())
      .then(data=>{
        topDishesList.innerHTML="";
        data.slice(0,5).forEach(d=>{
          const li=document.createElement("li");
          li.textContent=`${d.nazwa_dania} - Śr. ocena: ${d.avg_ocena}`;
          topDishesList.appendChild(li);
        });
      });
    searchInput.addEventListener("input", ()=>{
      const q=searchInput.value.trim();
      if(!q){ searchResults.innerHTML=""; return; }
      fetch(`api.php?action=search&q=${encodeURIComponent(q)}`)
        .then(res=>res.json())
        .then(data=>{
          searchResults.innerHTML="";
          data.forEach(r=>{
            const li=document.createElement("li");
            li.textContent=`${r.nazwa_dania} - ${r.nazwa_restauracji} (${r.ocena}/10)`;
            searchResults.appendChild(li);
          });
        });
    });
  }

  particlesJS("particles-js", {
    "particles": {
      "number": {"value":50,"density":{"enable":true,"value_area":800}},
      "color":{"value":"#a3a3a3"},
      "shape":{"type":"circle"},
      "opacity":{"value":0.3,"random":true},
      "size":{"value":3,"random":true},
      "line_linked":{"enable":true,"distance":150,"color":"#aaa","opacity":0.2,"width":1},
      "move":{"enable":true,"speed":1,"direction":"none","random":true,"straight":false,"out_mode":"out"}
    },
    "interactivity":{"detect_on":"canvas","events":{"onhover":{"enable":true,"mode":"repulse"},"onclick":{"enable":true,"mode":"push"}}},
    "retina_detect":true
  });

});
