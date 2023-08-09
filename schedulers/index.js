import schedule from "node-schedule";


// Node Schedule is a flexible cron-like and not-cron-like job scheduler for Node.js. It allows you to schedule jobs


// This jobs run every 15 minutes, uncomment following lines to run scheduler
const defaultScheduler = () => {
    schedule.scheduleJob('*/1 * * * *', async(req, res) => {
        console.log('The answer to life, the universe, and everything!');
    });
};

export default defaultScheduler;