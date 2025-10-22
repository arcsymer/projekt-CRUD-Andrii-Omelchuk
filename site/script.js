const form = document.getElementById('reviewForm');
const reviewsContainer = document.getElementById('reviews');

form.addEventListener('submit', function(e) {
    e.preventDefault();

    const restaurant = document.getElementById('restaurant').value;
    const address = document.getElementById('address').value;
    const date = document.getElementById('date').value;
    const dish = document.getElementById('dish').value;
    const rating = document.getElementById('rating').value;
    const comment = document.getElementById('comment').value;

    const reviewDiv = document.createElement('div');
    reviewDiv.classList.add('review');
    reviewDiv.innerHTML = `
        <h3>${dish} — <span class="rating">${'★'.repeat(rating)}</span></h3>
        <div class="meta">
            <strong>Restauracja:</strong> ${restaurant}<br>
            <strong>Adres:</strong> ${address}<br>
            <strong>Data wizyty:</strong> ${date}
        </div>
        <p>${comment}</p>
    `;

    reviewsContainer.prepend(reviewDiv);

    form.reset();
});
