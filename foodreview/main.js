document.addEventListener('DOMContentLoaded', async () => {
    const navDiv = document.getElementById('nav-buttons');

    async function fetchJSON(url, options={}) {
        try { const res = await fetch(url, options); return await res.json(); }
        catch(e){ console.error(e); return {error:'Network error'}; }
    }

    async function checkAuth() {
        const user = await fetchJSON('api.php?action=get_user_info');
        return user.error ? null : user;
    }

    function setupNavigation(user) {
        navDiv.innerHTML = '';
        const buttons = user
            ? [
                {text:'Strona główna', href:'index.html'},
                {text:'Profil', href:'profile.html'},
                {text:'Dodaj recenzję', href:'reviewadd.html'},
                {text:'Top listy', href:'reviews.html'}
            ]
            : [
                {text:'Strona główna', href:'index.html'},
                {text:'Login / Rejestracja', href:'loginreg.html'},
                {text:'Top listy', href:'reviews.html'}
            ];
        buttons.forEach(b=>{
            const btn=document.createElement('button');
            btn.textContent=b.text;
            btn.onclick=()=>location.href=b.href;
            navDiv.appendChild(btn);
        });
    }

    function enableButtonOnFields(button, fields){
        function check(){ button.disabled = !fields.every(f=>f.value.trim()); }
        fields.forEach(f=>f.addEventListener('input', check)); check();
    }

    function createReviewItem(review, editCb, deleteCb) {
        const div=document.createElement('div');
        div.className='review-item';
        div.innerHTML=`
            <strong>${review.dish_name} - ${review.restaurant_name} (${review.rating})</strong><br>
            ${review.restaurant_address} - ${review.visit_date}<br>
            ${review.recommendation} - ${review.with_what || ''}<br>
            ${review.comment || ''}<br>
            <button class="edit-btn">Edytuj</button>
            <button class="delete-btn">Usuń</button>
        `;
        div.querySelector('.edit-btn').addEventListener('click', ()=>editCb(review.id));
        div.querySelector('.delete-btn').addEventListener('click', ()=>deleteCb(review.id));
        div.querySelector('.delete-btn').style.backgroundColor = '#e53935';
        div.querySelector('.delete-btn').style.color = '#fff';
        return div;
    }

    async function logout(){ await fetchJSON('api.php?action=logout'); location.href='loginreg.html'; }

    const user = await checkAuth();
    setupNavigation(user);

    if(document.getElementById('logout-btn')){
        document.getElementById('logout-btn').addEventListener('click', logout);
    }

    const mostVisitedList=document.getElementById('most-visited-list');
    const topDishesList=document.getElementById('top-dishes-list');
    const searchInput=document.getElementById('search-input');
    const searchResults=document.getElementById('search-results');

    if(mostVisitedList && topDishesList){
        const data = await fetchJSON('api.php?action=top_lists');
        if(!data.error){
            mostVisitedList.innerHTML='';
            data.mostVisited.forEach(r=>{
                const li=document.createElement('li');
                li.textContent=`${r.restaurant_name} (${r.visits})`;
                li.style.textAlign='center';
                mostVisitedList.appendChild(li);
            });
            topDishesList.innerHTML='';
            data.topDishes.forEach(r=>{
                const li=document.createElement('li');
                li.textContent=`${r.dish_name} (${r.avg_rating})`;
                li.style.textAlign='center';
                topDishesList.appendChild(li);
            });
        }
    }

    if(searchInput && searchResults){
        searchInput.addEventListener('input', async ()=>{
            const query=searchInput.value.trim();
            if(!query){ searchResults.innerHTML=''; return; }
            const data=await fetchJSON(`api.php?action=search_reviews&query=${encodeURIComponent(query)}`);
            searchResults.innerHTML='';
            data.forEach(r=>{ searchResults.appendChild(createReviewItem(r,()=>{},()=>{})); });
        });
    }

    const loginBtn=document.getElementById('login-btn');
    const loginUsername=document.getElementById('login-username');
    const loginPassword=document.getElementById('login-password');
    const regBtn=document.getElementById('reg-btn');
    const regUsername=document.getElementById('reg-username');
    const regPassword=document.getElementById('reg-password');

    if(loginBtn && loginUsername && loginPassword){
        enableButtonOnFields(loginBtn,[loginUsername,loginPassword]);
        loginBtn.addEventListener('click', async ()=>{
            const data = await fetchJSON(`api.php?action=login&username=${encodeURIComponent(loginUsername.value)}&password=${encodeURIComponent(loginPassword.value)}`);
            if(data.success) location.href='profile.html'; else alert(data.error);
        });
    }

    if(regBtn && regUsername && regPassword){
        enableButtonOnFields(regBtn,[regUsername,regPassword]);
        regBtn.addEventListener('click', async ()=>{
            const data = await fetchJSON(`api.php?action=register&username=${encodeURIComponent(regUsername.value)}&password=${encodeURIComponent(regPassword.value)}`);
            if(data.success) location.href='profile.html'; else alert(data.error);
        });
    }

    const addReviewBtn=document.getElementById('add-review-btn');
    const editReviewBtn=document.getElementById('edit-review-btn');
    const reviewFields=['dish-name','restaurant-name','restaurant-address','visit-date','rating','recommendation','with-what','comment'].map(id=>document.getElementById(id));
    const reviewBtn=addReviewBtn||editReviewBtn;
    if(reviewBtn){
        enableButtonOnFields(reviewBtn, reviewFields.slice(0,6));
        reviewBtn.addEventListener('click', async ()=>{
            const data=Object.fromEntries(reviewFields.map(f=>[f.id,f.value]));
            const id=new URLSearchParams(location.search).get('id');
            const action = id ? `edit_review&id=${id}` : 'add_review';
            const res = await fetchJSON(`api.php?action=${action}&${new URLSearchParams(data)}`);
            if(res.success){ alert('OK'); location.href='profile.html'; }
        });

        if(editReviewBtn){
            const reviewId=new URLSearchParams(location.search).get('id');
            const review=await fetchJSON(`api.php?action=get_review&id=${reviewId}`);
            reviewFields.forEach(f=>f.value=review[f.id]);
        }
    }

    if(document.getElementById('username')){
        const usernameSpan = document.getElementById('username');
        const regDateSpan = document.getElementById('reg-date');
        const reviewsCountSpan = document.getElementById('reviews-count');
        const avgRatingSpan = document.getElementById('avg-rating');
        const userReviewsDiv = document.getElementById('user-reviews');

        if(user){
            usernameSpan.textContent = user.username;
            regDateSpan.textContent = user.registration_date;
            reviewsCountSpan.textContent = user.reviews_count;
            avgRatingSpan.textContent = user.avg_rating;
        }

        if(userReviewsDiv){
            const reviews = await fetchJSON('api.php?action=user_reviews');
            userReviewsDiv.innerHTML = '';
            reviews.forEach(r => {
                userReviewsDiv.appendChild(createReviewItem(r,
                    id => location.href = `reviewedit.html?id=${id}`,
                    async id => {
                        const res = await fetchJSON(`api.php?action=delete_review&id=${id}`);
                        if(res.success){ alert('Deleted'); location.reload(); }
                    }
                ));
            });
        }

        const updateBtn = document.getElementById('update-profile-btn');
        const newUsername = document.getElementById('new-username');
        const newPassword = document.getElementById('new-password');
        if(updateBtn && newUsername && newPassword){
            function checkProfileFields() {
                updateBtn.disabled = !(newUsername.value.trim() || newPassword.value.trim());
            }
            newUsername.addEventListener('input', checkProfileFields);
            newPassword.addEventListener('input', checkProfileFields);
            checkProfileFields();

            updateBtn.addEventListener('click', async () => {
                const params = new URLSearchParams();
                if(newUsername.value.trim()) params.append('username', newUsername.value.trim());
                if(newPassword.value.trim()) params.append('password', newPassword.value.trim());
                const res = await fetchJSON(`api.php?action=update_profile&${params}`);
                if(res.success){
                    alert('Sukces');
                    if(newUsername.value.trim()) usernameSpan.textContent = newUsername.value.trim();
                    newUsername.value = '';
                    newPassword.value = '';
                    checkProfileFields();
                } else {
                    alert(res.error || 'Błąd aktualizacji');
                }
            });
        }
    }

    const weatherDiv = document.getElementById('weather');
    if(weatherDiv){
        const apiKey = 'fd66f06221a276aa0235b98f0e57797d';
        const city = 'Warsaw';
        const units = 'metric';
        const url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&units=${units}&lang=pl&appid=${apiKey}`;
        try {
            const res = await fetch(url);
            if(!res.ok) throw new Error('Błąd sieci');
            const data = await res.json();
            const temp = data.main.temp.toFixed(1);
            const desc = data.weather[0].description;
            const icon = data.weather[0].icon;

            let color = '#333';
            if(temp <= 0) color = '#2196F3';
            else if(temp <= 15) color = '#4CAF50';
            else if(temp <= 25) color = '#FFC107';
            else color = '#F44336';

            weatherDiv.innerHTML = `
                <img src="https://openweathermap.org/img/wn/${icon}.png" alt="${desc}">
                <span style="color:${color}">${temp}°C, ${desc}</span>
            `;
        } catch(err){
            weatherDiv.textContent = 'Nie udało się pobrać pogody.';
            console.error(err);
        }
    }
});
