Backendapp
==========

Template Project for Back-End API development using Node.js and MongoDB or Redis.<br/>
<br/>
<br/>
API				: Node.js app with MongoDB | Redis <br/>
Node.js 		: Express (-session, -jade), MondoDB <br/>
WebServer		: Node.js <br/>
HTML5			: jQuery | jQueryUI | jQueryMobile <br/>
Mobile 			: Android and iOS <br/>
CloudPlatform	: CloudFoundry | Heroku | Cloudno | AppHarbor <br/>
<br/>
<strong>API</strong>

Supports the following methods. Throw errors for unsupported methods. <br/>
<br/>
GET 	db/locations		returns list of locations with users <br/>
POST 	db/locations		creates a location: { name, lastname, email, country, city, ip, date }; <br/>
<br/>
POST	/htmls/music	creates a favourite music album item <br/>
GET		/htmls/music	return all favourite music albums <br/>