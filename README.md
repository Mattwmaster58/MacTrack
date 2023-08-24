### MacTrack

After spending too much time scrolling through [mac.bid](https://mac.bid), I decided it would be a more effective use of my time to write a tool to more effectively use mac.bid.

This webapp aims to achieve 2 goals:
 - notify you when searches matching your criteria are met
 - provide historical data to help inform current purchase decisions

#### Roadmap

This is subject to change, I don't even have a working E2E prototype

Scraper
 - ~~ALL datetime in UTC~~ (unverified whether this is actually done)
 - sanity checks: how many lots were open before/after scrape
 - ~~CLI integration + async rewrite~~
 - queuing system (SAQ)?
   - see [here](https://github.com/litestar-org/litestar-pg-redis-docker/blob/0c3622f6c483117ed6638e49e82c3545e111573e/app/main.py#L46)

Filters
 - manual running
 - "term preview"
   - chips on the cards, + and -, single line only
 - queuing system (SAQ)?
 - node render process for notification emails
   - see: https://github.com/markfinger/python-react
 - quick view - view results of your filter
 - join auctionlot_idx with auctionlot for faster querying
   - the former is fast for fts, slow for everything else (nothing can be indexed besides text)

Auth
 - ~~make it so that auth actually works~~
   - ~~set current user if page reload~~
   - ~~direct to sign in page if logged out (when redirecting user, make sure we don't return them to /current-user)~~
 - load current user on page refresh regardless of auth required or not

General
 - deploy backend on GCP
   - get SSL certs (caddy)
   - see: https://github.com/dadatuputi/bitwarden_gcloud/tree/master/caddy
 - deploy frontend to netlify (or others)
 - logging infrastructure
 - PAGINATION


#### Architecture
##### Backend
 - SQLAlchemy for ORM
 - SQLite + FTS5 for DB
##### Frontend
 - React + MUI