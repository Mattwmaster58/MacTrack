### MacTrack

After spending too much time scrolling through [mac.bid](https://mac.bid), I decided it would be a more effective use of my time to write a tool to more effectively use mac.bid.

This webapp aims to achieve 2 goals:
 - notify you when searches matching your criteria are met
 - provide historical data to help inform current purchase decisions

#### Roadmap

This is subject to change, I don't even have a working E2E prototype

Scraper
 - CLI integration + async rewrite
 - queuing system (SAQ)?

Filters
 - manual running
 - queuing system (SAQ)?
 - node render process for notification emails
 - quick view - view results of your filter

Auth
 - make it so that auth actually works 
   - set current user if page reload
   - direct to sign in page if logged out (when redirecting user, make sure we don't return them to /current-user)

General
 - deploy backend on GCP
   - get SSL certs
 - deploy frontend to netlify or others
 - logging infrastructure


#### Architecture
##### Backend
 - SQLAlchemy for ORM
 - SQLite + FTS5 for DB
##### Frontend
 - React + MUI