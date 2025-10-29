document.addEventListener('DOMContentLoaded', () => {
    const API_URL = '../backend/api.php';

    const formularz = document.getElementById('formularz-recenzji');
    const przycisk = document.getElementById('przycisk-dodaj');
    const ostatnieEl = document.getElementById('ostatnie-recenzje');
    const topRestauracjeEl = document.getElementById('top-restauracje');
    const topDaniaEl = document.getElementById('top-dania');
    const statusEl = document.getElementById('status');
    const selectOcena = document.getElementById('ocena');

    // Заполняем select 1-10
    for(let i=1;i<=10;i++){
        const opt = document.createElement('option');
        opt.value = i;
        opt.textContent = i;
        selectOcena.appendChild(opt);
    }

    const polaObowiazkowe = [formularz.danie, formularz.restauracja, formularz.adres, formularz.data, formularz.ocena];

    function sprawdzPola() {
        przycisk.disabled = !polaObowiazkowe.every(p => p.value.trim() !== '');
    }

    polaObowiazkowe.forEach(p => p.addEventListener('input', sprawdzPola));
    formularz.ocena.addEventListener('change', sprawdzPola);

    async function wyslijDane(metoda, id = '', dane = null) {
        try {
            statusEl.textContent = 'Ładowanie...';
            const url = id ? `${API_URL}/${id}` : API_URL;
            const res = await fetch(url, {
                method: metoda,
                headers: { 'Content-Type': 'application/json' },
                body: dane ? JSON.stringify(dane) : null
            });
            const json = await res.json();
            if (!res.ok) throw new Error(json.error || 'Błąd serwera');
            statusEl.textContent = '';
            return json;
        } catch (err) {
            statusEl.textContent = 'Błąd: ' + err.message;
            console.error(err);
        }
    }

    formularz.addEventListener('submit', async e => {
        e.preventDefault();
        const dane = {
            danie: formularz.danie.value.trim(),
            restauracja: formularz.restauracja.value.trim(),
            adres: formularz.adres.value.trim(),
            data: formularz.data.value,
            ocena: parseInt(formularz.ocena.value, 10),
            komentarz: formularz.komentarz.value.trim() || null
        };

        if (przycisk.dataset.edytujId) {
            await wyslijDane('PUT', przycisk.dataset.edytujId, dane);
            przycisk.dataset.edytujId = '';
            przycisk.textContent = 'Dodaj recenzję';
        } else {
            await wyslijDane('POST', '', dane);
        }

        formularz.reset();
        przycisk.disabled = true;
        zaladujDane();
    });

    function kolorOceny(val) {
        const start = [231, 76, 60], end = [46, 204, 113];
        const t = (val-1)/9;
        return `rgb(${Math.round(start[0]+(end[0]-start[0])*t)},${Math.round(start[1]+(end[1]-start[1])*t)},${Math.round(start[2]+(end[2]-start[2])*t)})`;
    }

    window.edytujRecenzje = r => {
        formularz.danie.value = r.danie;
        formularz.restauracja.value = r.restauracja;
        formularz.adres.value = r.adres;
        formularz.data.value = r.data;
        formularz.ocena.value = r.ocena;
        formularz.komentarz.value = r.komentarz || '';
        przycisk.textContent = 'Aktualizuj recenzję';
        przycisk.dataset.edytujId = r.id;
        sprawdzPola();
    };

    window.usunRecenzje = async id => {
        if (confirm('Czy na pewno chcesz usunąć tę recenzję?')) {
            await wyslijDane('DELETE', id);
            zaladujDane();
        }
    };

    function pokazTopListy(topRestauracje, topDania) {
        topRestauracjeEl.innerHTML = '';
        if (topRestauracje) {
            for (const [name, count] of Object.entries(topRestauracje)) {
                const li = document.createElement('li');
                li.textContent = `${name} (${count})`;
                topRestauracjeEl.appendChild(li);
                requestAnimationFrame(() => li.classList.add('show'));
            }
        }

        topDaniaEl.innerHTML = '';
        if (topDania) {
            topDania.forEach(d => {
                const li = document.createElement('li');
                li.textContent = `${d.danie} - ${d.restauracja} (${d.ocena.toFixed(1)})`;
                li.style.color = kolorOceny(d.ocena);
                topDaniaEl.appendChild(li);
                requestAnimationFrame(() => li.classList.add('show'));
            });
        }
    }

    async function zaladujDane() {
        try {
            const data = await wyslijDane('GET');
            if (!data) return;

            ostatnieEl.innerHTML = '';
            data.ostatnie.forEach(r => {
                const li = document.createElement('li');
                const strong = document.createElement('strong');
                strong.textContent = `${r.danie} - ${r.restauracja}`;
                li.appendChild(strong);
                li.appendChild(document.createElement('br'));

                const info = document.createElement('span');
                info.textContent = `${r.adres} | ${r.data} | Ocena: ${r.ocena}`;
                info.style.color = kolorOceny(r.ocena);
                li.appendChild(info);
                li.appendChild(document.createElement('br'));

                if (r.komentarz) {
                    const kom = document.createElement('span');
                    kom.textContent = r.komentarz;
                    li.appendChild(kom);
                    li.appendChild(document.createElement('br'));
                }

                const akcje = document.createElement('div');
                akcje.classList.add('akcje');

                const editBtn = document.createElement('button');
                editBtn.textContent = 'Edytuj';
                editBtn.addEventListener('click', () => edytujRecenzje(r));
                akcje.appendChild(editBtn);

                const delBtn = document.createElement('button');
                delBtn.textContent = 'Usuń';
                delBtn.addEventListener('click', () => usunRecenzje(r.id));
                akcje.appendChild(delBtn);

                li.appendChild(akcje);

                ostatnieEl.appendChild(li);
                requestAnimationFrame(() => li.classList.add('show'));
            });

            pokazTopListy(data.topRestauracje, data.topDania);

        } catch (err) {
            statusEl.textContent = 'Błąd ładowania danych';
            console.error(err);
        }
    }

    sprawdzPola();
    zaladujDane();
});
