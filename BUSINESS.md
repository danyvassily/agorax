# AgoraX — Modèle Économique & Stratégie Business

> **Statut du document** : Référentiel Stratégie & Monétisation  
> **Dernière mise à jour** : Septembre 2026  
> **Principe Cardinal** : Le produit ne doit jamais devenir un simple support publicitaire. Toute monétisation doit respecter la Règle d'Or : *« Simple à comprendre, jouable en 30 secondes »*.

---

## 1. Cadre de Décision & Méthodologie

Chaque initiative économique est classée selon sa maturité :
- `[FAIT]` : Donnée constatée et mesurée en production.
- `[HYPOTHÈSE]` : Proposition théorique soumise à expérimentation et mesure préalable.
- `[ESTIMATION]` : Projection chiffrée basée sur des métriques de marché comparables.
- `[VERIFIED]` : Hypothèse confirmée par un test A/B ou une cohorte réelle.

---

## 2. Modélisation des Revenus Publicitaires (Scénarios)

### Hypothèse Principale (Expérimentation Publicitaire)
- `[HYPOTHÈSE]` : **Afficher 1 publicité interstitielle / récompense environ toutes les 2 parties terminées.**
- **Règles absolues d'intégrité UX** :
  1. Zéro interruption en cours de manche, question, débat ou finale.
  2. Emplacements exclusifs : écran de fin de partie, retour au salon ou transition vers un rematch.
  3. Temps de chargement nul ou pré-chargé : jamais d'écran noir ou d'attente bloquante.
  4. Option de désactivation instantanée via AgoraX Premium.

### Comparatif des Variantes Publicitaires

| Variante | Fréquence & Format | Impact UX estimé | Rétention D1/D7 estimée | Potentiel de Revenu |
| :--- | :--- | :--- | :--- | :--- |
| **A** | 1 pub après *chaque* partie | Élevé (friction répétée) | Risque fort de churn précoce | Élevé à court terme, toxique |
| **B (Prioritaire)** | **1 pub toutes les 2 parties** | **Modéré (rythme naturel de session)** | **Cohorte témoin à mesurer** | **Équilibré (Recommandé en test)** |
| **C** | 1 pub toutes les 3 parties | Faible (très fluide) | Excellente préservation du funnel | Plus faible (-33% vs B) |
| **D** | Pub uniquement en fin de session | Minimal | Idéale | Nécessite détection d'inactivité |
| **E** | Pub récompensée opt-in (cosmétique) | Nul (choix joueur) | Positive | Dépendant de l'attrait cosmétique |
| **F** | Sans pub (utilisateurs Premium) | Zéro pub | Rétention maximale | Conversion abonnement |

---

## 3. Projections Financières & Simulations d'Audience

> `[ESTIMATION]` Basée sur les benchmarks casual mobile web / PWA 2026 :
> - Nombre moyen de parties par session active : 3,2 parties.
> - Taux d'impression publicitaire (variante B : ~1 pub / 2 parties) : 1,6 impression / session.
> - eCPM estimé (format interstitiel vidéo court / display interactif) : 4,50 € (mixte FR/EU).
> - Fill rate estimé : 85 %.

| Métrique | 1 000 DAU | 10 000 DAU | 50 000 DAU | 100 000 DAU |
| :--- | :--- | :--- | :--- | :--- |
| **Sessions actives / jour** | 1 300 | 13 000 | 65 000 | 130 000 |
| **Parties jouées / jour** | 4 160 | 41 600 | 208 000 | 416 000 |
| **Impressions pub / jour** | 1 768 | 17 680 | 88 400 | 176 800 |
| **Revenu pub estimé / jour** | 7,95 € | 79,56 € | 397,80 € | 795,60 € |
| **Revenu pub estimé / mois** | ~238 € | ~2 387 € | ~11 934 € | ~23 868 € |
| **Abonnés AgoraX Premium (1% conv. @ 2,99€)** | 10 (30 €/m) | 100 (299 €/m) | 500 (1 495 €/m) | 1 000 (2 990 €/m) |
| **Total Revenu Mensuel Estimé** | **~268 €** | **~2 686 €** | **~13 429 €** | **~26 858 €** |

---

## 4. Offre AgoraX Premium (Vision Produit)

L'offre Premium doit valoriser les créateurs de salons et joueurs réguliers sans jamais introduire de Pay-to-Win :
- **Prix cible** : 2,99 € / mois ou 19,99 € / an.
- **Avantages inclus** :
  - Zéro publicité pour l'hôte et tous les invités de son salon pendant la partie.
  - Statistiques de performance détaillées (catégories fortes/faibles, temps de réaction moyen).
  - Personnalisation de salon (thème visuel, nom d'équipe custom, sons de buzzer exclusifs).
  - Accès aux catalogues thématiques réservés (« Pop Culture 2000s », « Droit & Justice », « Soirées Blind-tests »).

---

## 5. Diversification B2B & Partenariats (« AgoraX Night »)

### Le concept « AgoraX Night » (Bars, Pubs, Restaurants, BDE)
- **Constat terrain** : Les gérants de bars cherchent des animations simples sans régie complexe pour les mardis et mercredis soirs.
- **Proposition AgoraX** :
  - Le bar projette l'écran hôte sur grand écran (TV/Projecteur).
  - Les clients rejoignent en flashant le QR code sur les tables ou au comptoir.
  - Classement du bar en temps réel, lots sponsorisés (une tournée offerte par l'établissement).
- **Modèle de revenus B2B** :
  - Pack Soirée Bar : 29 € à 49 € par événement ou licence mensuelle à 79 € / mois.
  - Sponsoring de manche par des marques de boissons ou événements locaux.

---

## 6. Protocole d'Expérimentation & Feature Flags

Avant tout déploiement définitif d'un palier publicitaire :
```
Étape 1 : Mesurer la baseline de rétention sans pub (D1, D7, games/session).
Étape 2 : Déployer le flag `ads_frequency = 2` sur 10% des cohortes.
Étape 3 : Suivre le Quit Rate post-pub et le taux de démarrage d'une 2e partie.
Étape 4 : Si la rétention baisse de plus de 8%, ajuster la fréquence (variante C : toutes les 3 parties).
```

### Registre des KPIs Business Clés
- **ARPU (Average Revenue Per User)** : Objectif initial > 0,05 € / MAU.
- **Parties par session** : Seuil d'alerte si chute < 2,5.
- **Taux de complétion de partie** : Objectif > 88 %.
