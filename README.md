Volleyball Scoreboard - README

1. Overview
   The Volleyball Scoreboard is a robust web application engineered to manage and display volleyball match scores in a dynamic and professional manner. Beyond scorekeeping, the system provides advanced player management capabilities and implements a "King of the Court" rotational logic that is designed to be flexible, equitable, and stable.

The application has been developed with a modern "LED scoreboard" user interface, prioritizing a mobile-first user experience and an architectural logic that mitigates data corruption anomalies while adapting to real-time rule modifications.

2. Functionalities
   Dynamic Scoreboard: The main scoreboard interface features an "LED" theme, displaying the competing teams, their respective scores, and the players currently on the court.

Player Management: A dedicated configuration page facilitates the addition, removal, and overall management of a participant roster.

Player Status Control: Each player is assigned two distinct states for granular control:

status ('active' | 'inactive'): This allows a user to designate which players are available for participation on a given day.

gameState ('playing' | 'waiting' | 'resting'): This is controlled by the system to manage the player's current situation within a game session.

"King of the Court" Logic:

Equitable Rotation: Winning players remain on the court, while losing players are moved to the end of the queue.

Intelligent Queuing: The challenger queue respects the order of waiting, ensuring that players who have been waiting the longest are prioritized for the next match.

Dynamic Rule Adaptation: The system automatically adapts to modifications in game rules, such as the number of players per team, even when these changes are made mid-session.

Persistent Sessions: The application state, including player rosters, teams, and scores, is saved to localStorage, enabling the continuation of a session even after the browser has been closed.

3. Usage Instructions
   Initial Configuration (config.html):

Navigate to the config.html file.

Add all potential participants to the roster.

For each player who will be participating, activate the status selector adjacent to their name. Only players marked as active will be considered for matches.

Define the "Maximum Score" and the "Players per Team."

Select "Save and Return."

Initiating a Session (index.html):

On the main page, select the "play" button (Start New Session).

This action will reset any previous game state, shuffle all active players, and form the initial teams based on the defined rules.

In-Game Operations:

Click on a team's score display to increment their score.

Utilize the subtract (-) button below the score to correct any errors.

A victory modal will appear when a team reaches the maximum score with at least a two-point lead.

Subsequent Matches:

Within the victory modal, select "New Match."

The system will automatically retain the winners, move the losers to the end of the queue, and select new challengers to form the next match.

Modifying Rules:

If it becomes necessary to alter the number of players per team or add new participants during a session, navigate to config.html, apply the desired changes, and save. The next match generated will automatically adapt to the new rules.

4. Project Files
   index.html: The main scoreboard page, which displays teams, players, scores, and game controls.

config.html: The configuration page for managing players and match rules.

style.css: The stylesheet containing all visual design elements for both pages, including the "LED scoreboard" aesthetic and responsive layout.

script.js: Contains all logic for the main scoreboard, including session initiation, new match generation, point tabulation, and game state management.

config.js: Contains the logic for the configuration page, including player addition, removal, and status management.

5. Logical Architecture
   The stability of the application is predicated on two primary concepts:

Dual-State Model: This model separates a player's availability (user-controlled) from their in-game state (system-controlled), thereby preventing logical conflicts.

"Temporary Array" Logic: When generating a new match, the system isolates winners and losers into temporary arrays. This allows it to select new challengers from an unadulterated pool of waiting players and subsequently reconstruct the main participant list in a secure and orderly fashion. This method is fundamental to preventing data duplication discrepancies, even when game rules are altered dynamically.

6. Credits
   This project was constructed and refined through an intensive collaborative process, with a focus on rigorous use-case testing and the continuous improvement of the programming logic.
