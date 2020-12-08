require('dotenv').config();
const { Telegraf } = require('telegraf');
const client = new Telegraf(process.env.TOKEN);

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
			client.telegram.sendPoll(-1001398064062,  announcement["poll"]["header"] + announcement["poll"]["question"], announcement["poll"]["answers"]);
		} else {
			// Send our re-formatted string and our images (if any) to that channel
			client.telegram.sendMessage(-1001398064062, announcement["message"]);
		}
	}, undefined, true, timezone='America/New_York');
	// For some reason, the above method adds a bunch of null garbage to the list so we need to strip that out
	//		While we're at it, we will just add the real elements to a different list so we can start them all
	jobs.push(temp_jobs.filter(function (element) {
		return element != null;
	}));
})

// client.telegram.sendMessage(-1001398064062, 'Hello! This is an automated test');
// Debug messages here: https://api.telegram.org/bot<TOKEN>/getUpdates

// Connect the bot
client.launch();