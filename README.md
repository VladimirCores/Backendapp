Backendapp
==========

Template Project for Back-End API development using Node.js and MongoDB or Redis.

API				: Node.js app with MongoDB | Redis
WebServer		: Node.js
HTML5			: jQuery | jQueryUI | jQueryMobile
Mobile 			: Android and iOS
CloudPlatform	: CloudFoundry | Heroku | Cloudno | AppHarbor

API

Supports the following methods. Throw errors for unsupported methods.

GET 	db/locations		returns list of locations with users
POST 	db/locations		creates a location: { name, lastname, email, country, city, ip, date };

POST	/htmls/music	creates a favourite music album item
GET		/htmls/music	return all favourite music albums