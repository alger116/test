# Ostumenetluse Dashboard

Modernne ja funktsionaalne ostumenetluse kutse süsteem koos dashboardiga.

## Funktsionaalsused

1. **Kasutajate haldamine**

   - Kolm rolli: admin, moderaator ja kasutaja
   - Turvaline sisselogimine
   - Kasutaja meeldejätmine
   - Kasutajate loomine ja haldamine (admin jaoks)

2. **Dashboard**

   - Statistika ülevaade
   - Viimased ostumenetlused
   - Kasutajate statistika
   - PDF-i loomise statistika

3. **Ostumenetluse kutse loomine**

   - Dünaamiline vorm
   - PDF-i loomine
   - Manuste lisamine
   - Automaatne salvestamine

4. **Tume režiim**
   - Mugav öine töö
   - Automaatne salvestamine eelistustest

## Paigaldus

1. Laadi alla kõik failid
2. Ava `init-admin.js` veebibrauseris, et luua esialgne admin kasutaja
3. Ava `login.html` veebibrauseris
4. Logi sisse kasutades:
   - Kasutajanimi: admin
   - Parool: admin123

## Kasutamine

### Admin

- Saab luua uusi kasutajaid
- Saab määrata kasutajatele rolle
- Näeb kõiki statistikaid
- Saab hallata kõiki ostumenetlusi

### Moderaator

- Saab vaadata statistikaid
- Saab hallata ostumenetlusi
- Ei saa luua uusi kasutajaid

### Kasutaja

- Saab luua ostumenetlusi
- Saab vaadata oma loodud ostumenetlusi
- Ei saa hallata teisi kasutajaid

## Turvalisus

- Paroolid on salvestatud localStorage'is (produktsioonis peaks kasutama turvalist backend'i)
- Kasutajate õigused on kontrollitud
- Sessiooni haldus on turvaline

## Tehnoloogiad

- Alpine.js - Reaktiivne JavaScript raamistik
- TailwindCSS - Stiilide raamistik
- jsPDF - PDF-i loomine
- Font Awesome - Ikoonid
- Inter font - Tüpograafia

## Arendamine

Süsteemi arendamiseks:

1. Klooni repositoorium
2. Installi vajalikud sõltuvused
3. Käivita arendusserver
4. Tee muudatused
5. Testi funktsionaalsust
6. Tee pull request

## Litsents

MIT
