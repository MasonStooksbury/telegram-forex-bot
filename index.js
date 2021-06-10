require('dotenv').config();
const { Telegraf } = require('telegraf');
const client = new Telegraf(process.env.BOT_TOKEN);

const fs = require('fs');
const cron = require('cron');

// If you change the name of the text file, you'll need to change it here too
const announcements_txt = './announcements.json';

// Read in all the announcements and parse them
let rawdata = fs.readFileSync(announcements_txt);
let announcements = JSON.parse(rawdata);

const temp_jobs = [];
const jobs = [];

// Let's create jobs for everything in the announcements file
announcements["announcements"].forEach(announcement => {
	// Generate a random number to act as the job variable name
	const job_id = Math.floor(Math.random() * 10000).toString();

	// Create a new Cron job inside a list so that we can use the RNG variable name
	temp_jobs[job_id] = new cron.CronJob(announcement["cron"], () =>{
		// If the message is a poll, do this instead
		if (announcement["message"] == "POLL") {
			client.telegram.sendPoll(announcement["channel"],  announcement["poll"]["header"] + announcement["poll"]["question"], announcement["poll"]["answers"]);
		} else {
			// Send our re-formatted string
			client.telegram.sendMessage(announcement["channel"], announcement["message"]);
			
			// If we have any images, send those as well
			if (announcement["images"] !== "") {
				announcement["images"].forEach(image => {
					client.telegram.sendPhoto(announcement["channel"], image);
				})
			}
		}
	}, undefined, true, timezone='America/New_York');
	// For some reason, the above method adds a bunch of null garbage to the list so we need to strip that out
	//		While we're at it, we will just add the real elements to a different list so we can start them all
	jobs.push(temp_jobs.filter(function (element) {
		return element != null;
	}));
})

// Message that shows up first 
// client.hears(/\/pay/i, function (message) {
// 	var iKeys = [];
// 	iKeys.push([{
// 		text: "This costs a lot of money: $1000.00",
// 		callback_data: "100000"
// 	}]);

// 	client.telegram.sendMessage(message.chat.id, "<b>FOREX STUFF WOO</b>\n\nHere is a brief description section\n\nPlease give me money:", {
// 		parse_mode: 'HTML',
// 		disable_web_page_preview: true,
// 		reply_markup: {
// 			inline_keyboard: iKeys
// 		}
// 	});
// });

// // Message that shows up after you click the first button and then sends the invoice
// client.on('callback_query', ctx => {
// 	const invoice = {
// 		'title': 'Moneymoney',
// 		'description': 'wooooo description',
// 		'payload': ctx.from.id + '---' + Date.now(),
// 		'provider_token': process.env.STRIPE_TOKEN,
// 		'start_parameter': 'pay',
// 		'currency': 'USD',
// 		'prices': [{'label': 'Money', "amount": 1099}]
// 	};
	
// 	client.telegram.sendInvoice(-1001398064062, invoice);
// });

// client.hears('test', (ctx) => console.log(ctx.chat.id));
// client.telegram.sendMessage(-1001398064062, 'Hello! This is an automated test');
// Debug messages here: https://api.telegram.org/bot<BOT_TOKEN>/getUpdates

// Connect the bot
client.launch();




// Notes:
// https://stackoverflow.com/questions/46736490/connect-stripe-connect-with-the-telegram-payment-api
// https://github.com/atipugin/telegram-bot-ruby/issues/128
// https://github.com/yagop/node-telegram-bot-api/issues/558