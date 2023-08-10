### mac-bid-utils

After spending too much time scrolling through [mac.bid](https://mac.bid), I decided to more effectively use my time to write a tool to more effectively use mac.bid.

This webapp aims to achieve 2 goals:
 - notify you when searches matching your criteria are met
 - provide historical data to help inform current purchase decisions


#### Architecture
##### Backend
 - SQLAlchemy for ORM
 - SQLite + FTS5 for DB
##### Frontend
 - React + MUI

## TODO
 - User endpoints + auth + React Routing
 - Async scraper + parallel (httpx does pooling nicely, could see a benefit there)
