# MachineSignal - Pre-check Target Discovery reale

Data: 2026-06-02

## Oggetto

Pre-check per verificare se il prodotto `Target Discovery Pack` puo' realisticamente produrre 250 target coerenti nella nicchia:

> cliniche odontoiatriche / studi dentistici in Lombardia.

## Decisione

Esito: PASS.

Il mercato sembra abbastanza ampio per produrre 250 target coerenti.

La decisione non significa che la lista da 250 sia gia' pronta. Significa che il pre-check indica che il pacchetto puo' essere attivato, perche' esistono fonti pubbliche sufficienti e molte aziende potenzialmente analizzabili.

## Evidenze principali

| Fonte | Evidenza | Lettura operativa |
|---|---|---|
| PagineGialle - Odontoiatri a Milano | La pagina indica "piu' di 200 risultati" solo su Milano. | Milano da sola puo' generare una quota importante del pacchetto. |
| Imprese.link - categoria Lombardia | La categoria "Dentisti medici chirurghi ed odontoiatri" in Lombardia indica 6994 imprese. | Anche dopo filtri, duplicati e record senza sito, 250 target sono realistici. |
| MioDottore - Dentisti a Milano | Directory verticale con dentisti prenotabili e profili strutturati. | Utile come fonte di controllo e arricchimento, non come unica fonte. |
| PagineBianche / PagineGialle profili singoli | Le schede spesso riportano studio, indirizzo, descrizione, talvolta sito web. | Utile per normalizzazione, deduplica e conferma della categoria. |
| Fonti locali e verticali | Risultati trovati su Monza, Brescia, Bergamo e altri comuni lombardi. | La copertura non e' limitata a Milano. |

## Fonti pubbliche usate nel pre-check

- PagineGialle, Odontoiatri a Milano: https://www.paginegialle.it/lombardia/milano/odontoiatri.html
- Imprese.link, categoria Dentisti in Lombardia: https://imprese.link/dentisti-medici-chirurghi-odontoiatri/lombardia/280/
- MioDottore, Dentisti a Milano: https://www.miodottore.it/dentista/milano
- Esempio PagineBianche, Studio Dentistico Mariani Monza: https://www.paginebianche.it/studiodentisticomariani-monza
- Esempio QSalute, Studio Dentistico Abaco Monza: https://www.qsalute.it/studio-dentistico-abaco-di-monza/
- Esempio Top-Rated Online, dentisti a Monza: https://www.top-rated.online/cities/Monza/place/p/13844366/Studio%2BDentistico%2BDott.%2BDario%2BRusso

## Cosa deve fare la macchina nel pacchetto reale

La macchina non deve semplicemente raccogliere nomi.

Deve produrre target coerenti per un obiettivo commerciale preciso:

> trovare studi dentistici o cliniche odontoiatriche in Lombardia che abbiano un sito o una presenza digitale valutabile e che possano essere analizzati per opportunita' di miglioramento digitale, conversione web o preparazione commerciale automatizzata.

## Criteri minimi per considerare valido un target

Un target deve avere almeno:

1. nome dello studio o della clinica;
2. area geografica lombarda;
3. categoria coerente con dentisti, odontoiatria o clinica odontoiatrica;
4. dominio o pagina web pubblica valutabile;
5. fonte pubblica tracciata;
6. motivo di inclusione;
7. stato deduplica;
8. indicazione se puo' essere mandato allo score.

## Criteri di esclusione

Escludere:

- duplicati;
- portali generici non riferibili a uno studio specifico;
- record senza nessun elemento web valutabile;
- profili troppo personali senza chiara struttura commerciale;
- record non lombardi;
- risultati non odontoiatrici;
- pagine che non consentono una valutazione utile del sito o del dominio.

## Rischi

1. Molte fonti contengono schede senza dominio diretto.
2. Alcuni risultati sono profili di singoli professionisti, non strutture commerciali.
3. Alcuni domini possono appartenere a network, franchising o portali.
4. La deduplica sara' importante: lo stesso studio puo' comparire su piu' directory.
5. La presenza di molti target non garantisce che siano tutti buone opportunita' commerciali.

## Regola commerciale consigliata

Il Target Discovery Pack va considerato vendibile solo se il pre-check produce una stima positiva.

Per questa nicchia, la stima e' positiva:

- disponibilita' mercato: alta;
- rischio duplicati: medio;
- rischio record senza dominio: medio;
- possibilita' di produrre 250 target coerenti: alta;
- consigliato procedere al pacchetto reale: si.

## Output atteso del pacchetto reale

Il pacchetto reale dovrebbe consegnare 250 righe con questi campi:

| Campo | Descrizione |
|---|---|
| target_name | Nome studio/clinica |
| domain | Dominio o sito valutabile |
| city | Comune |
| province | Provincia |
| region | Lombardia |
| category | Studio dentistico / clinica odontoiatrica / centro dentistico |
| source_url | Fonte pubblica principale |
| source_type | Directory, sito ufficiale, motore ricerca, albo/registro, marketplace medico |
| initial_signals | Segnali iniziali: sito presente, local market, settore coerente |
| reason_for_inclusion | Perche' il target entra nel pacchetto |
| dedupe_key | Chiave di deduplica, preferibilmente dominio normalizzato |
| next_machine_action | `send domain to /v1/lead-opportunity-score` oppure `request domain_enrichment` |

## Raccomandazione degli agenti

Procedere con un test reale ridotto prima del pacchetto completo:

1. produrre 50 target reali o semi-reali;
2. deduplicarli;
3. verificare quanti hanno dominio valido;
4. mandare allo score un campione;
5. misurare quanti generano verification, deep analysis e action pack;
6. se il rapporto e' buono, scalare a 250.

## Decisione operativa

Il prossimo step consigliato e':

> Target Discovery Mini Test: 50 target dentisti / cliniche odontoiatriche Lombardia.

Questo riduce consumo, evita lavoro inutile e ci dice se il pacchetto da 250 ha senso non solo come raccolta dati, ma come sorgente di ricavi downstream.
