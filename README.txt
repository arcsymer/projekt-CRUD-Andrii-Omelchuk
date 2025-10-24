Recenzje dań restauracji
  Projekt Recenzje dań restauracji to prosta aplikacja webowa umożliwiająca dodawanie, edytowanie, usuwanie oraz przeglądanie recenzji potraw w restauracjach.
  Aplikacja działa w architekturze frontend + backend z pełnym systemem CRUD.

Struktura projektu
  projekt-recenzje/
  │
  ├── frontend/
  │   ├── index.html
  │   ├── style.css
  │   └── script.js
  │
  └── backend/
      ├── db.php
      └── api.php

Technologie
  Frontend: HTML5, CSS3, JavaScript (czysty JS, dynamiczne ładowanie danych)
  Backend: PHP 8+ (REST API)
  Baza danych: MySQL / MariaDB

Funkcjonalności
  Dodawanie nowych recenzji z:
    nazwą dania
    nazwą restauracji
    adresem restauracji
    datą wizyty
    oceną (1–10)
    komentarzem (opcjonalnym)
  Edycja i usuwanie istniejących recenzji
  Wyświetlanie ostatnich 10 recenzji
  Top-listy:
    3 najczęściej odwiedzane restauracje
    3 najwyżej ocenione dania
  Dynamiczne kolorowanie ocen
  Responsywny, ciemny motyw z nowoczesnym stylem
  Ukryty pasek przewijania w sekcji recenzji

Baza danych
  Nazwa bazy: recenzje_db
  Tabela: recenzje
  CREATE TABLE recenzje (
    id INT AUTO_INCREMENT PRIMARY KEY,
    danie VARCHAR(255) NOT NULL,
    restauracja VARCHAR(255) NOT NULL,
    adres VARCHAR(255) NOT NULL,
    data DATE NOT NULL,
    ocena INT NOT NULL,
    komentarz TEXT
  );

Uruchomienie projektu lokalnie
  Przygotowanie środowiska
    Upewnij się, że masz:
      Zainstalowany XAMPP / Laragon / MAMP
      Uruchomione serwery Apache i MySQL
  Utworzenie bazy danych:
    Otwórz phpMyAdmin
    Stwórz nową bazę recenzje_db
    Uruchom powyższe polecenie SQL, aby utworzyć tabelę recenzje
  Umieszczenie plików
    Skopiuj cały folder projektu do katalogu:
    ...\xampp\htdocs\projekt-recenzje\
  Uruchomienie
    Otwórz przeglądarkę i wejdź na:
    http://localhost/projekt-recenzje/frontend/index.html

Połączenie frontend ↔ backend
  Frontend komunikuje się z API poprzez:
  ../backend/api.php

Endpointy REST API
  Metoda	  Endpoint	               Opis
  GET	      /backend/api.php	       Pobiera wszystkie recenzje + top-listy
  GET	      /backend/api.php/{id}	   Pobiera konkretną recenzję
  POST	      /backend/api.php	        Dodaje nową recenzję
  PUT	      /backend/api.php/{id}    Aktualizuje istniejącą recenzję
  DELETE      /backend/api.php/{id}    Usuwa recenzję

Walidacja
  Formularz nie pozwala wysłać pustych pól.
  Przycisk „Dodaj recenzję” jest aktywny tylko wtedy, gdy wszystkie pola obowiązkowe są wypełnione.

Autor
  Imię i nazwisko: Andrii Omelchuk
  Numer studenta: 67349
