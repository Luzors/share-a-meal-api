# Projecttitel: Maaltijd-API

## Studentgegevens
Naam: Jorn  
Studentnummer: 2182902

## Beschrijving
Dit is een API ontwikkeld voor een applicatie die zich richt op maaltijden. Deze API stelt gebruikers in staat om te werken met de maaltijddatabase: maaltijden toevoegen, wijzigen, verwijderen en opvragen.

## Functies
De belangrijkste functies van deze API zijn:

1. **Gebruikersregistratie en -authenticatie** - Gebruikers kunnen zich registreren en aanmelden. Beveiliging is geïmplementeerd door middel van JSON Web Tokens (JWT).
2. **Maaltijden** - Gebruikers kunnen maaltijden aan de database toevoegen, bestaande maaltijden wijzigen of verwijderen, en maaltijden opvragen uit de database.

## Installatie
Clone dit project naar uw lokale machine met behulp van `git clone`.

Vervolgens kunt u de nodige modules installeren met behulp van `npm install`.

Om de server te starten, gebruikt u `node .\index.js`.

## API routes
Hier zijn de belangrijkste routes van de API:

- `POST /api/login`: Route om in te loggen.
- `POST /api/users`: Route om een nieuwe gebruiker te registreren.
- `GET /api/user?field1=:value1&field2=:value`: Route om een overzicht van alle gebruikers op te vragen met eventuele filters.
- `GET /api/users/profile`: Route om het profiel van de huidige gebruiker op te vragen.
- `GET /api/users/:userId`: Route om de gegevens van een specifieke gebruiker op te vragen op basis van het ID.
- `PUT /api/users/:userId`: Route om de gegevens van een specifieke gebruiker te wijzigen op basis van het ID.
- `DELETE /api/users/:userId`: Route om een specifieke gebruiker te verwijderen op basis van het ID.
- `POST /api/meals`: Route om een nieuwe maaltijd toe te voegen.
- `PUT /api/meals/:mealId`: Route om een specifieke maaltijd te wijzigen op basis van het ID.
- `GET /api/meals`: Route om alle maaltijden op te vragen.
- `GET /api/meals/:mealId`: Route om een specifieke maaltijd op te vragen op basis van het ID.
- `DELETE /api/meals/:mealId`: Route om een specifieke maaltijd te verwijderen op basis van het ID.

## Foutafhandeling
De API heeft uitgebreide foutafhandeling. Fouten worden gelogd voor debuggen en relevante statuscodes worden teruggestuurd naar de client.

