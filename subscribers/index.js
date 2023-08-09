import userSubscriber from "./userSubscriber.js";

const defaultSubscriber = (app) => {
    // loading subscribers related to user events
    userSubscriber(app);
};

export default defaultSubscriber;
