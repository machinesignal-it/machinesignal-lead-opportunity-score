# MachineSignal - Domande Per Commercialista E Legale/Privacy

Data: 2026-06-17
Stato: bozza per consulenti, nessuna attivazione commerciale

## Contesto Breve Da Spiegare

MachineSignal e' un progetto API/software pensato per essere usato soprattutto da macchine: CRM, agenti AI, workflow automatici, software e strumenti interni.

Il servizio dovrebbe aiutare questi sistemi a:

- trovare target aziendali coerenti con una richiesta;
- valutare domini o aziende con uno score;
- generare analisi piu' approfondite;
- preparare azioni successive in formato strutturato.

Al momento il progetto e' in fase sandbox/test.

Non vogliamo ancora:

- incassare pagamenti reali;
- emettere fatture;
- raccogliere metodi di pagamento;
- usare dati personali;
- usare liste clienti reali;
- fare campagne email o contatti esterni;
- pubblicare su marketplace/API registry/MCP pubblico.

L'obiettivo della consulenza e' capire cosa serve prima di una eventuale beta a pagamento controllata.

## Domande Per Commercialista / Fisco

### 1. Partenza Senza P.IVA

1. Posso fare una beta gratuita senza P.IVA, se non incasso nulla?
2. Posso fare una beta a pagamento senza P.IVA, anche con pochi clienti e importi bassi?
3. Se la risposta e' no, da quale momento serve aprire P.IVA o altra forma fiscale?
4. Esiste una soglia occasionale o questa attivita' sarebbe considerata continuativa fin da subito?

### 2. Forma Corretta Per Vendere

1. Per vendere API/software online, e' meglio partire come persona fisica, ditta individuale, societa' o altra forma?
2. Se i clienti sono aziende italiane, cosa cambia?
3. Se i clienti sono aziende estere UE o extra UE, cosa cambia?
4. Se il cliente e' una piattaforma/API marketplace che incassa per noi, cosa cambia?

### 3. Fatturazione E Incassi

1. Come dovremmo emettere fattura per pacchetti di crediti, score o abbonamenti API?
2. La vendita di crediti prepagati va fatturata subito o quando vengono consumati?
3. Gli abbonamenti mensili API come vanno contabilizzati?
4. I rimborsi o riaccrediti come vanno gestiti?
5. Se un output non e' valido e restituiamo crediti, ha impatto fiscale?

### 4. IVA E Vendite Digitali

1. Il servizio e' considerato servizio digitale/software/API?
2. Quale aliquota IVA si applica in Italia?
3. Cosa succede se vendiamo a clienti UE con partita IVA?
4. Cosa succede se vendiamo a clienti extra UE?
5. Servono registrazioni particolari per vendite digitali cross-border?

### 5. Costi E Marginalita'

1. I costi di agenti AI, API esterne, Cloudflare, hosting e software sono deducibili?
2. Come vanno registrati i crediti acquistati per servizi AI/API?
3. Se usiamo strumenti esteri, ci sono adempimenti particolari?
4. Quali documenti dobbiamo conservare per dimostrare costi e ricavi?

### 6. Beta A Pagamento

1. Possiamo fare una beta a pagamento limitata con pochi clienti prima del lancio ufficiale?
2. Serve un contratto specifico di beta?
3. Serve indicare che prezzi, funzioni e servizio sono sperimentali?
4. Che documenti fiscali servono prima di ricevere il primo pagamento?

## Domande Per Legale / Privacy

### 1. Termini Di Servizio

1. Che termini servono per una API che fornisce score e analisi di opportunita'?
2. Come specifichiamo che lo score e' supporto decisionale e non garanzia di risultato?
3. Come limitiamo responsabilita' su errori, dati incompleti o decisioni prese dal cliente?
4. Serve un contratto diverso per beta gratuita e beta a pagamento?
5. Serve una clausola che permetta di sospendere o modificare il servizio durante la beta?

### 2. Privacy E Dati

1. Se analizziamo solo domini aziendali pubblici, siamo comunque nel perimetro privacy?
2. Se il cliente carica una lista di aziende, quali obblighi abbiamo?
3. Se nella lista compaiono email, telefoni o nomi personali, cosa dobbiamo fare?
4. Possiamo rifiutare automaticamente dati personali e processare solo dati business non personali?
5. Serve informativa privacy anche se il servizio e' pensato per macchine/API?

### 3. Ruoli Privacy

1. Quando siamo titolari del trattamento?
2. Quando siamo responsabili del trattamento per conto del cliente?
3. Serve una DPA/Data Processing Agreement per clienti business?
4. Che cosa deve contenere la DPA?
5. Se usiamo fornitori come Cloudflare o API esterne, dobbiamo citarli come sub-responsabili?

### 4. Conservazione Dati

1. Quanto possiamo conservare richieste API, risultati, log e report?
2. Possiamo conservare solo dati tecnici e output sintetici?
3. Serve una procedura di cancellazione dati su richiesta?
4. Come gestire backup e log tecnici?
5. Come documentare che non conserviamo payload personali?

### 5. Dati Pubblici E Arricchimento

1. Possiamo usare dati pubblici di aziende e domini per creare score?
2. Possiamo arricchire dati aziendali con informazioni pubbliche?
3. Quali fonti sono sicure o meno rischiose?
4. Ci sono limiti su scraping, directory pubbliche o fonti online?
5. Come evitare rischi se i dati pubblici contengono riferimenti personali?

### 6. Uso Da Parte Di Macchine / Agenti AI

1. I termini devono prevedere che il cliente possa essere un software, agente AI o workflow automatico?
2. Come definiamo la responsabilita' se una macchina cliente compra crediti o richiama API automaticamente?
3. Serve una clausola su limiti, budget cap e autorizzazioni del cliente?
4. Serve indicare che l'utente umano resta responsabile della configurazione del sistema cliente?

### 7. Sicurezza E Incidenti

1. Che obblighi abbiamo se una API key viene esposta?
2. Che obblighi abbiamo se riceviamo per errore dati personali?
3. Serve una procedura di incident response?
4. Serve notificare il cliente o autorita' in caso di problemi?
5. Come formulare le regole su revoca chiavi e sospensione servizio?

### 8. Comunicazione Commerciale

1. Possiamo contattare aziende o persone via email per proporre il servizio?
2. Quali regole anti-spam e marketing B2B si applicano?
3. Se vogliamo evitare outreach umano e puntare su canali machine-readable, quali rischi restano?
4. Pubblicare documentazione API su GitHub/Postman/sito e' considerato comunicazione commerciale?
5. Marketplace/API directory richiedono condizioni legali specifiche?

## Output Che Vogliamo Dai Consulenti

Dal commercialista/fisco:

- se e quando serve P.IVA;
- forma consigliata per partire;
- regole base per fatture, IVA, crediti, abbonamenti e rimborsi;
- cosa serve prima del primo incasso.

Dal legale/privacy:

- termini beta minimi;
- privacy policy minima;
- regole dati consentiti/vietati;
- eventuale DPA;
- limiti responsabilita';
- regole per API key, log, retention e incidenti.

## Decisione Corrente

Preparare materiali: si.

Attivare beta a pagamento: no.

Incassare pagamenti reali: no.

Usare dati reali/personali: no.

Fare outreach: no.
