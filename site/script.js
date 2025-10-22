document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("reviewForm");
    const submitBtn = document.getElementById("submitBtn");

    const fields = ["restaurant","address","date","dish","rating"];
    fields.forEach(id => {
        document.getElementById(id).addEventListener("input", checkForm);
    });
    document.getElementById("rating").addEventListener("change", checkForm);

    function checkForm(){
        const allFilled = fields.every(id => {
            const el = document.getElementById(id);
            return el.value.trim() !== "";
        });
        submitBtn.disabled = !allFilled;
    }

    form.addEventListener("submit", function (e) {
        e.preventDefault();

        const review = {
            id: document.getElementById("reviewId").value,
            restaurant: document.getElementById("restaurant").value.trim(),
            address: document.getElementById("address").value.trim(),
            visit_date: document.getElementById("date").value,
            dish: document.getElementById("dish").value.trim(),
            rating: document.getElementById("rating").value,
            comment: document.getElementById("comment").value.trim()
        };

        const url = review.id ? "update.php" : "create.php";

        fetch(url, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(review)
        }).then(() => {
            form.reset();
            document.getElementById("reviewId").value = "";
            submitBtn.disabled = true;
            loadAll();
        });
    });

    loadAll();
});

function loadAll(){
    loadReviews();
    loadRankings();
}

function loadReviews() {
    fetch("read.php")
        .then(res => res.json())
        .then(data => {
            const container = document.getElementById("reviews");
            container.innerHTML = "";
            data.forEach(review => {
                const div = document.createElement("div");
                div.className = "review";
                div.innerHTML = `
                    <h3>${review.dish} — <span class="rating">${"★".repeat(review.rating)}</span></h3>
                    <div class="meta">
                        <strong>Restauracja:</strong> ${review.restaurant}<br>
                        <strong>Adres:</strong> ${review.address}<br>
                        <strong>Data wizyty:</strong> ${review.visit_date}
                    </div>
                    <p>${review.comment}</p>
                    <button onclick="editReview(${review.id})">Edytuj</button>
                    <button onclick="deleteReview(${review.id})">Usuń</button>
                `;
                container.appendChild(div);
            });
        });
}

function editReview(id) {
    fetch(`read.php?id=${id}`)
        .then(res => res.json())
        .then(data => {
            const review = data[0];
            document.getElementById("reviewId").value = review.id;
            document.getElementById("restaurant").value = review.restaurant;
            document.getElementById("address").value = review.address;
            document.getElementById("date").value = review.visit_date;
            document.getElementById("dish").value = review.dish;
            document.getElementById("rating").value = review.rating;
            document.getElementById("comment").value = review.comment;
            window.scrollTo(0,0);
            document.getElementById("submitBtn").disabled = false;
        });
}

function deleteReview(id) {
    if (!confirm("Czy na pewno chcesz usunąć tę recenzję?")) return;
    fetch(`delete.php?id=${id}`)
        .then(() => loadAll());
}

function loadRankings(){
    fetch("read.php")
        .then(res => res.json())
        .then(data => {
            // Подсчёт посещаемости и средней оценки по ресторанам
            const visits = {};
            const ratings = {};

            data.forEach(r => {
                const key = r.restaurant;
                visits[key] = (visits[key] || 0) + 1;
                ratings[key] = ratings[key] || { sum:0, count:0 };
                ratings[key].sum += parseInt(r.rating);
                ratings[key].count += 1;
            });

            const visitsArr = Object.entries(visits).map(([restaurant, count]) => ({ restaurant, count }));
            visitsArr.sort((a,b) => b.count - a.count);

            const ratingArr = Object.entries(ratings).map(([restaurant, obj]) => ({
                restaurant,
                avg: obj.sum / obj.count
            }));
            ratingArr.sort((a,b) => b.avg - a.avg);

            const topVisitsEl = document.getElementById("topVisits");
            const topRatingsEl = document.getElementById("topRatings");
            topVisitsEl.innerHTML = "";
            topRatingsEl.innerHTML = "";

            visitsArr.slice(0,3).forEach(item => {
                const li = document.createElement("li");
                li.textContent = `${item.restaurant} — ${item.count} wizyt`;
                topVisitsEl.appendChild(li);
            });

            ratingArr.slice(0,3).forEach(item => {
                const li = document.createElement("li");
                li.textContent = `${item.restaurant} — średnia ocena: ${item.avg.toFixed(2)}`;
                topRatingsEl.appendChild(li);
            });
        });
}
