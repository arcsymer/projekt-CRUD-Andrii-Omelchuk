document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("reviewForm");
    const submitBtn = document.getElementById("submitBtn");
    const fields = ["restaurant","address","date","dish","rating"];

    fields.forEach(id => document.getElementById(id).addEventListener("input", checkForm));
    document.getElementById("rating").addEventListener("change", checkForm);

    function checkForm() {
        submitBtn.disabled = !fields.every(id => document.getElementById(id).value.trim() !== "");
    }

    form.addEventListener("submit", e => {
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

function loadAll() {
    loadReviews();
    loadRankings();
}

function loadReviews() {
    fetch("read.php")
        .then(res => res.json())
        .then(data => {
            const container = document.getElementById("reviews");
            container.innerHTML = "";
            data.forEach(r => {
                const div = document.createElement("div");
                div.className = "review";
                div.innerHTML = `
                    <div class="info">
                        <h3>${r.dish} — <span class="rating">${"★".repeat(r.rating)}</span></h3>
                        <div class="meta">
                            <strong>Restauracja:</strong> ${r.restaurant}<br>
                            <strong>Adres:</strong> ${r.address}<br>
                            <strong>Data wizyty:</strong> ${r.visit_date}
                        </div>
                        <button onclick="editReview(${r.id})">Edytuj</button>
                        <button onclick="deleteReview(${r.id})">Usuń</button>
                    </div>
                    <div class="comment">${r.comment}</div>
                `;
                container.appendChild(div);
            });
        });
}

function editReview(id) {
    fetch(`read.php?id=${id}`)
        .then(res => res.json())
        .then(data => {
            const r = data[0];
            document.getElementById("reviewId").value = r.id;
            document.getElementById("restaurant").value = r.restaurant;
            document.getElementById("address").value = r.address;
            document.getElementById("date").value = r.visit_date;
            document.getElementById("dish").value = r.dish;
            document.getElementById("rating").value = r.rating;
            document.getElementById("comment").value = r.comment;
            document.getElementById("submitBtn").disabled = false;
        });
}

function deleteReview(id) {
    if (!confirm("Czy na pewno chcesz usunąć tę recenzję?")) return;
    fetch(`delete.php?id=${id}`).then(() => loadAll());
}

function loadRankings() {
    fetch("read.php")
        .then(res => res.json())
        .then(data => {
            const visits = {};
            const ratings = {};

            data.forEach(r => visits[r.restaurant] = (visits[r.restaurant] || 0) + 1);
            data.forEach(r => {
                const key = `${r.dish} — ${r.restaurant}`;
                if (!ratings[key]) ratings[key] = {sum:0, count:0, dish:r.dish, restaurant:r.restaurant};
                ratings[key].sum += parseInt(r.rating);
                ratings[key].count += 1;
            });

            const visitsArr = Object.entries(visits)
                .map(([restaurant,count]) => ({restaurant,count}))
                .sort((a,b) => b.count - a.count)
                .slice(0,3);

            const ratingArr = Object.values(ratings)
                .map(r => ({dish:r.dish, restaurant:r.restaurant, avg:r.sum/r.count}))
                .sort((a,b) => b.avg - a.avg)
                .slice(0,3);

            const topVisitsEl = document.getElementById("topVisits");
            const topRatingsEl = document.getElementById("topRatings");
            topVisitsEl.innerHTML = "";
            topRatingsEl.innerHTML = "";

            visitsArr.forEach(item => {
                const li = document.createElement("li");
                li.textContent = `${item.restaurant} — ${item.count} wizyt`;
                topVisitsEl.appendChild(li);
            });

            ratingArr.forEach(item => {
                const li = document.createElement("li");
                const stars = "★".repeat(Math.round(item.avg));
                li.innerHTML = `${item.dish} — ${item.restaurant} — <span class="rating">${stars}</span>`;
                topRatingsEl.appendChild(li);
            });
        });
}
