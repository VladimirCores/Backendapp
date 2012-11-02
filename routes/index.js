
/*
 * GET home page.
 */

exports.index = function(req, res){
  res.render('index', 
  { 
  		title: 'Registration', 
  		button_submit: "Submit",
  		button_view: "View",
  		user : { 
	  		name:"Vladimir",
	  		lastname:"Minkin", 
	  		country:"Russia", 
	  		city:"Saint-Peterburg", 
	  		email:"email", 
	  		isNew:true
	  	} 
  });
};