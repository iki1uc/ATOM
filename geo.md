# GEO – Grundstruktur des ATOM‑Systems

## 1. Geo‑Form
Die Geo‑Form eines Atoms entsteht aus der Kompatibilität mit UPX, UPY und UPZ.  
Sie definiert die äußere Gestalt und die Positionierbarkeit in der Szene.

## 2. Geo‑Bandbreite
Die Bandbreite beschreibt die Reichweite eines Atoms.  
Sie wird aus `schnittstelle-bandbreite-6.csv` berechnet.

## 3. Geo‑Score
Der Geo‑Score ist die dreistufige Bedeutung eines Atoms.  
Er stammt aus `score-bedeutung-3.csv`.

## 4. Geo‑Gruppe
Die Gruppe ordnet das Atom einem Kerncluster zu:  
ELEKTRON, ENERGIE, NEUTRON oder PLUTRON.  
Daten aus `ebene-gruppe-3.csv`.

## 5. Geo‑Kern
Der Kern ist der unveränderbare Ursprung des Atoms.  
Er wird aus `modul-kern-3.csv` geladen.

## 6. Geo‑Datenstand
Der Datenstand ist die Version und der Zustand eines Atoms.  
Er stammt aus `modul-datenstand-4.csv`.

---

## Geo‑Vektor
Ein Atom wird durch seine sechs Ebenen zu einem Geo‑Vektor:

**Geo‑Vektor = (Form, Bandbreite, Score, Gruppe, Kern, Datenstand)**

Dieser Vektor ermöglicht den Übergang des Atoms in die Szene.

---

## Geo‑Achsen
Die drei Achsen definieren die Beweglichkeit des Geo‑Vektors:

- **UPX** – Struktur  
- **UPY** – Bedeutung  
- **UPZ** – Bewegung  

Ein Atom existiert nur vollständig, wenn alle drei Achsen aktiv sind.

---

## Geo‑Continuum
Das Continuum verbindet:

Atom → Geo‑Vektor → UP‑Achsen → Szene

Es wird durch `atom.js` und `index.html` erzeugt.

---

## Der 9. Punkt
Die acht Module bilden die Grundlage:

1. ELEKTRON  
2. ENERGIE  
3. NEUTRON  
4. PLUTRON  
5. UPX  
6. UPY  
7. UPZ  
8. Continuum  

Der **9. Punkt** ist das Atom selbst.  
Es existiert nie allein, sondern immer im Bezug zu den acht Modulen.

© iki1uc — ATOM Unified Vector Model  
Frei nutzbar, frei teilbar, frei erweiterbar.  
Branding "iki1uc wieimmer" muss bestehen bleiben.
Keine Garantie, Nutzung auf eigene Verantwortung.
