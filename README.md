Inferno Emu - An emulator for A3 MMORPG
=======================================

Overview of A3
---------------
A3 - Art, Alive, Attraction is a Korean MMORPG released around 2003. English version of it was officially released in India in 2005 under the banner of Sify. Later due to some issues it was shut down. But the love for the game did not end there. Thanks to RaGEZONE Forum (http://forum.ragezone.com/f98/) some Indians were able to create A3 private server using the files released there. The released files were just executables compiled by the Chinese developers and the source of these executables were never released.

This is an effort to create an open source emulator for A3. If you are developer with a passion for MMORPG you are welcome to help in its development.

Requirements
------------
1. NodeJS
2. MySQL
3. Redis 2.4 or higher (Check https://github.com/rgl/redis/downloads for windows installation)

Running the Project
-------------------
1. Install dependencies using command ``npm install``
2. Create local configuration file named ``main-local.json`` inside config folder and override database connection settings
3. Import database schema from ``data/db.sql`` into your emulator database
4. Insert example test data from ``data/seed.sql``
5. Place all ``.n_ndt`` files found in ``a3server/7Zoneserver/ZoneData/map`` from A3 219 server files released in RaGEZONE inside ``data/map`` to show NPCs in game (Download link: http://www.mediafire.com/file/24jijiaiqa3aaxn/A3+Server+219.rar)
6. Place ``Teleport.txt`` file ``a3server/7Zoneserver/ZoneData`` inside ``data`` folder for warping character
7. Place item files (``IT0.bin`` etc) inside ``data/item`` folder to read A3 items
8. Run the command ``node main`` to start the server

Currently available features
----------------------------
1. Account login
2. Account reconnect and exit
3. Character listing
4. Character creation
5. Character deletion
6. Loading NPCs in each map and teleport list
7. Character entering game world
8. Character movement
9. Character HP and MP filling
10. Character-NPC interaction
11. Character teleportation
12. Showing of server announcement messages and shouts

Client
------
Emulator has been tested with A3 client version 562 (Check https://github.com/cyberinferno/InfernoEmu/tree/master/Important%20Files). Other client versions may not work!
