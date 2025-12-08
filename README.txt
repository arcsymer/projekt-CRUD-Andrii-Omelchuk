FoodReviews – Recenzje restauracji i potraw

FoodReviews to nowoczesna aplikacja webowa umożliwiająca użytkownikom przeglądanie, dodawanie, edytowanie i usuwanie recenzji dań w restauracjach. Projekt działa w architekturze **frontend + backend** z pełnym systemem CRUD oraz autoryzacją użytkowników.  
Dodatkowo na stronie głównej wyświetlana jest aktualna pogoda w Warszawie dzięki integracji z **OpenWeather API**.

---

Struktura projektu

foodreviews/
├── index.html 			Strona główna (z blokiem FoodReview i pogodą)
├── loginreg.html 		Logowanie i rejestracja użytkowników
├── profile.html 		Profil użytkownika i jego recenzje
├── reviewadd.html 		Dodawanie nowych recenzji
├── reviewedit.html 	Edycja istniejących recenzji
├── reviews.html 		Top listy i wyszukiwanie recenzji
├── style.css 			Stylizacja strony (w tym animacje i pogoda)
├── main.js 			Skrypty JS (logika frontendu, CRUD, pogoda)
├── db.php 				Połączenie z bazą danych MySQL
├── api.php 			Backend API (PHP + MySQL, autoryzacja, recenzje)
└── README.md 			Dokumentacja projektu

---

Technologie

Frontend: HTML5, CSS3, JavaScript  
Backend: PHP 8+  
Baza danych: MySQL  
API zewnętrzne: OpenWeather 

Funkcjonalności

Rejestracja i logowanie użytkowników  
Zarządzanie profilem użytkownika: aktualizacja nazwy użytkownika i hasła  
Dodawanie nowych recenzji z następującymi informacjami:
  nazwa dania  
  nazwa restauracji  
  adres restauracji  
  data wizyty  
  ocena (1–10)  
  rekomendacja  
  komentarz (opcjonalnie)  
Edycja i usuwanie własnych recenzji  
Wyświetlanie recenzji użytkownika w profilu  
Top-listy:
  10 najczęściej odwiedzanych restauracji  
  10 najwyżej ocenianych dań  
Dynamiczne wyświetlanie ocen i rekomendacji  
Animowane tło i efekty przy użyciu CSS i JavaScript  
Responsywny, nowoczesny design  
Blok pogody: aktualna temperatura i opis pogody w Warszawie z kolorami zależnymi od temperatury oraz animacją ładowania

---

Adres strony

[FoodReviews Online](http://foodreview.mywebcommunity.org/index.html)

---

Autor

Andrii Omelchuk  
Numer studenta: 67349