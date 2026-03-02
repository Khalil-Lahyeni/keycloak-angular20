1. Résumé pour le rapport de PFE
Titre : Conception et développement d’une application web de télé-surveillance et de maintenance prédictive pour une flotte ferroviaire.

Résumé :
Ce projet de fin d'études s'inscrit dans la transformation numérique du secteur ferroviaire, marquée par le passage d'une maintenance préventive systématique à une maintenance prédictive basée sur les données. L'objectif principal est de concevoir et développer une plateforme analytique capable de surveiller en temps réel l'état de santé des rames et d'anticiper les défaillances potentielles.

L'étude s'appuie sur une analyse comparative des solutions leaders du marché : HealthHub d'Alstom, reconnu pour sa maturité et ses portails de diagnostic automatique (TrainScanner), et HMAX de Hitachi Rail, qui se distingue par l'utilisation de l'intelligence artificielle à la périphérie (Edge AI) et sa collaboration avec NVIDIA et Google Cloud. Ces solutions valident la viabilité d'un système capable de réduire les coûts de maintenance jusqu'à 20 % et de diviser par deux le taux de pannes inopinées.

La solution développée repose sur une architecture Big Data structurée en trois couches : ingestion via Apache NiFi, stockage distribué (HDFS) pour l'exploitation des historiques, et une couche de service permettant la visualisation de statistiques détaillées et de graphiques décisionnels. L'application intègre des indicateurs clés de performance tels que le temps moyen entre pannes (MTBF) et la disponibilité opérationnelle, offrant ainsi un outil d'aide à la décision robuste pour les gestionnaires de flotte.

2. Structure de la Présentation (Slides)
Voici un plan de 10 diapositives pour votre soutenance, incluant la partie "Cas d'existence".

Slide 1 : Page de garde
Titre du projet, vos noms, encadrants et logos.

Slide 2 : Contexte et Problématique
Le défi : Coûts élevés de la maintenance systématique et immobilisation des rames.

Le besoin : Passer au "Data-driven maintenance" pour améliorer la sécurité et la disponibilité.

Slide 3 : Objectifs du Projet
Conception d'une plateforme analytique.

Exploitation des bases de données historiques.

Fourniture de statistiques et graphiques pour la prise de décision.

Slide 4 : Cas d'existence (Partie 1) - Alstom HealthHub
Concept : Surveillance prédictive éprouvée dans plus de 70 pays.

Innovation : Système TrainScanner pour une mesure automatique de l'usure (roues, freins) lors du passage du train.

Résultat : Remplacement des pièces "juste à temps", prolongeant leur cycle de vie.

Slide 5 : Cas d'existence (Partie 2) - Hitachi Rail HMAX
Concept : Plateforme "tout-en-un" hyper-connectée (Trains, Signalisation, Infrastructure).

Innovation : Collaboration NVIDIA pour le calcul IA ultra-rapide directement sur le train (Edge computing).

Résultat : Traitement immédiat des données sans attendre le retour au dépôt, et utilisation de l'IA générative pour optimiser les interventions.

Slide 6 : Analyse Comparative et Justification
Tableau comparatif montrant que ces géants valident le besoin du marché.

Justification de votre projet : Créer une solution web agile capable de traiter des flux de données similaires pour optimiser une flotte spécifique.

Slide 7 : Architecture Technique du Projet
Ingestion : Collecte des données capteurs et logs via Apache NiFi.

Stockage : Utilisation de HDFS et bases de données historiques.

Traitement : Algorithmes de détection d'anomalies (Machine Learning).

Slide 8 : Fonctionnalités de l'Application Web
Interface utilisateur : Tableaux de bord, filtres de recherche et périodes configurables.

Visualisation : Graphiques de tendances et alertes de criticité.

Slide 9 : Indicateurs de Performance (KPI)
Calcul du MTBF (Fiabilité) et du MTTR (Maintenabilité).

Impact attendu sur l'OEE (Efficacité Globale des Équipements).

Slide 10 : Conclusion et Perspectives
Synthèse du travail réalisé.

Perspectives : Intégration de l'IA agentique pour automatiser les bons de travail (modèle Hitachi).