document.addEventListener('DOMContentLoaded', () => {
    const formularz = document.getElementById('formularz-recenzji');
    const przycisk = document.getElementById('przycisk-dodaj');
    const ostatnieEl = document.getElementById('ostatnie-recenzje');
    const topRestauracjeEl = document.getElementById('top-restauracje');
    const topDaniaEl = document.getElementById('top-dania');
    const polaObowiazkowe = [formularz.danie, formularz.restauracja, formularz.adres, formularz.data, formularz.ocena];

    function sprawdzPola() {
        przycisk.disabled = !polaObowiazkowe.every(p => p.value.trim() !== '');
    }

    polaObowiazkowe.forEach(p => p.addEventListener('input', sprawdzPola));
    formularz.ocena.addEventListener('change', sprawdzPola);

    async function wyslijDane(url, dane) {
        try {
            const res = await fetch(url, {
                method: 'POST',
                headers: {'Content-Type':'application/json'},
                body: JSON.stringify(dane)
            });
            const json = await res.json();
            if(json.status !== 'ok') throw new Error('Błąd serwera');
        } catch(err) {
            alert('Błąd: '+err.message);
        }
    }

    formularz.addEventListener('submit', async e => {
        e.preventDefault();
        const dane = {
            danie: formularz.danie.value,
            restauracja: formularz.restauracja.value,
            adres: formularz.adres.value,
            data: formularz.data.value,
            ocena: formularz.ocena.value,
            komentarz: formularz.komentarz.value
        };
        if(przycisk.dataset.editingId){
            dane.id = przycisk.dataset.editingId;
            await wyslijDane('update.php', dane);
            przycisk.dataset.editingId = '';
            przycisk.textContent = 'Dodaj recenzję';
        } else {
            await wyslijDane('create.php', dane);
        }
        formularz.reset();
        przycisk.disabled = true;
        zaladujDane();
    });

    function ocenaColor(val){
        const start=[231,76,60], end=[46,204,113];
        const t=(parseInt(val)-1)/9;
        const r=Math.round(start[0]+(end[0]-start[0])*t);
        const g=Math.round(start[1]+(end[1]-start[1])*t);
        const b=Math.round(start[2]+(end[2]-start[2])*t);
        return `rgb(${r},${g},${b})`;
    }

    window.edytujRecenzje = r => {
        formularz.danie.value = r.danie;
        formularz.restauracja.value = r.restauracja;
        formularz.adres.value = r.adres;
        formularz.data.value = r.data;
        formularz.ocena.value = r.ocena;
        formularz.komentarz.value = r.komentarz;
        przycisk.textContent = 'Aktualizuj recenzję';
        przycisk.dataset.editingId = r.id;
        sprawdzPola();
    }

    window.usunRecenzje = async id => {
        if(confirm('Czy na pewno chcesz usunąć tę recenzję?')){
            await wyslijDane('delete.php',{id});
            zaladujDane();
        }
    }

    function pokazTopListy(topRestauracje, topDania){
        topRestauracjeEl.innerHTML = '';
        if(topRestauracje && typeof topRestauracje === 'object'){
            for(const [name,count] of Object.entries(topRestauracje)){
                const li = document.createElement('li');
                li.textContent = `${name} (${count})`;
                topRestauracjeEl.appendChild(li);
                requestAnimationFrame(()=>li.classList.add('show'));
            }
        }

        topDaniaEl.innerHTML = '';
        if(Array.isArray(topDania)){
            topDania.forEach(d=>{
                const li = document.createElement('li');
                li.textContent = `${d.danie} - ${d.restauracja} (${d.ocena.toFixed(1)})`;
                li.style.color = ocenaColor(d.ocena);
                topDaniaEl.appendChild(li);
                requestAnimationFrame(()=>li.classList.add('show'));
            });
        }
    }

    async function zaladujDane(){
        try{
            const res = await fetch('read.php');
            const data = await res.json();
            const recenzje = Array.isArray(data.ostatnie) ? data.ostatnie : [];
            ostatnieEl.innerHTML = '';

            recenzje.forEach(r=>{
                const li = document.createElement('li');
                const strong = document.createElement('strong');
                strong.textContent = `${r.danie} - ${r.restauracja}`;
                li.appendChild(strong);
                li.appendChild(document.createElement('br'));

                const info = document.createElement('span');
                info.textContent = `${r.adres} | ${r.data} | Ocena: ${r.ocena}`;
                info.style.color = ocenaColor(r.ocena);
                li.appendChild(info);
                li.appendChild(document.createElement('br'));

                if(r.komentarz){
                    const komentarz = document.createElement('span');
                    komentarz.textContent = r.komentarz;
                    li.appendChild(komentarz);
                    li.appendChild(document.createElement('br'));
                }

                const akcjeDiv = document.createElement('div');
                akcjeDiv.classList.add('akcje');
                const editBtn = document.createElement('button');
                editBtn.textContent='Edytuj';
                editBtn.addEventListener('click',()=>edytujRecenzje(r));
                akcjeDiv.appendChild(editBtn);
                const deleteBtn = document.createElement('button');
                deleteBtn.textContent='Usuń';
                deleteBtn.addEventListener('click',()=>usunRecenzje(r.id));
                akcjeDiv.appendChild(deleteBtn);
                li.appendChild(akcjeDiv);

                ostatnieEl.appendChild(li);
                requestAnimationFrame(()=>li.classList.add('show'));
            });

            pokazTopListy(data.topRestauracje, data.topDania);

        } catch(err){
            console.error('Błąd ładowania danych:', err);
        }
    }

    sprawdzPola();
    zaladujDane();
});
