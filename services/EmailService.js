var nodeMailer = require("nodemailer");
const fs = require("fs");
const handlebars = require("handlebars");

var transporter = nodeMailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
  auth: {
    user: `${process.env.MAILER_USER}`,
    pass: `${process.env.MAILER_PASSWORD}`,
  },
});
let from = "no-reply <vagabond.co.usa>"

var readHTMLFile = function (path, callback) {
	fs.readFile(path, { encoding: "utf-8" }, function (err, html) {
	  if (err) {
	    callback(err);
	  } else {
	    callback(null, html);
	  }
	});
};

module.exports = {
	sendEmail: (tempateName, replacements, to, subject) => {
	//   const { sender, recipients, subject, html, text } = payload;
	  return new Promise((resolve, reject) => {
			readHTMLFile( tempateName, async function (err, html) {
		if (err) {
			console.log(err);
			return;
		}
   
	  	var template = await handlebars.compile(html);
	  	htmlToSend = template(replacements);
		  var mailOptions = {
			from: from,
			to: to,
			subject,
			html: htmlToSend
		  };
	  	transporter.sendMail(mailOptions, (error, info) => {
			if (error) {
			  return reject(error);
			}
			return resolve(info);
		  });
	});
	  });
	},
  };
  



