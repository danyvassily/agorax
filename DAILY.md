# AgoraX — Cadre Opérationnel Quotidien (DAILY)

> **Statut du document** : Guide d'Exécution Quotidienne & Rituels Équipe  
> **Dernière mise à jour** : Septembre 2026  

---

## 1. Ordre de Priorité Absolu Quotidien

Chaque jour, les ressources et l'attention de l'équipe doivent suivre cet ordre d'intervention strict :

```
1. BUGS CRITIQUES & DISPONIBILITÉ (Salons inaccessibles, crashes, fuite de données)
2. INCIDENTS RÉSEAU REALTIME (Désynchronisation des réponses, rupture WebSocket)
3. RÉGRESSIONS DE JEU (Chrono bloqué, fuite de réponse, problème de langue)
4. TÂCHES ENGAGÉES DU SPRINT (Priorités P0 en cours d'implémentation)
5. CROISSANCE & VIRALITÉ MESURABLE (Amélioration du funnel, QR code, partages)
6. CATALOGUE DE QUESTIONS (< 10 nouvelles questions / jour, vérifiées et sourcées)
7. REFACTORING & AMÉLIORATIONS COSMÉTIQUES
```

---

## 2. Invariants & Règles d'Or Opérationnelles

1. **Règle des 30 Secondes** : Jamais d'ajout qui complexifie le premier écran ou retarde le lancement de la première question.
2. **Anti-Pattern Révélation Asynchrone** : Zéro transmission de la bonne réponse avant la fin du temps ou la complétion par tous les joueurs.
3. **Zéro Humiliation** : Pas de mise au pilori du dernier joueur.
4. **Indépendance des Rôles** :
   - Le développeur ne valide jamais sa propre PR en QA.
   - Le marketeur ne déclare pas une campagne réussie sans données de rétention et conversion.
   - Le chercheur de questions ne valide pas ses propres faits.

---

## 3. Commandes Techniques Obligatoires avant toute Livraison

Aucun commit ni merge sur une branche principale ne doit être validé sans l'exécution réussie de :

```bash
# Vérification du typage
npm run typecheck

# Linting ESLint
npm run lint

# Suite de tests unitaires et d'intégration
npm run test

# Validation du catalogue de questions
npm run questions:validate

# Audit linguistique (Zéro fuite EN dans session FR)
npm run questions:audit:language
```

> **Règle de Preuve** : Une commande non exécutée dans le terminal est consignée comme `NOT VERIFIED`. Jamais de `PASS` présumé.

---

## 4. Pipeline Quotidien des Questions (Quality > Quantity)

- **Quota maximum** : 10 questions / jour.
- **Circuit d'approbation** :
  ```
  Recherche (Sources fiables, Wikidata) 
  ↳ Vérification factuelle indépendante 
  ↳ Traduction stricte FR/EN (même ordre de réponses) 
  ↳ Déduplication & Anti-répétition 
  ↳ Contrôle structurel automatisé
  ```
