import Game from "../models/Game.js";
import * as SocketService from "../socket.js";
import gameConfig from "../config/game.js";

const startGame = async () => {
    const waitTime = gameConfig.waitTime;
    const runTime = gameConfig.runTime;
    let winner = null;
    let datetime;

    try {
        const io = SocketService.socketGetIO();

        // check last game
        const lastGame = await Game.findOne().sort({ _id: -1 });
        if (lastGame && lastGame.state !== 'finished') {
            lastGame.state = 'finished';
            await lastGame.save();
        }
        
        const genKoef = Math.random();

        const game = await Game({
            koef: genKoef
        }).save();
        
        io.emit('game_starting', {
            game_id: game._id,
            game_duration: runTime,
            game_startdelay: waitTime,    
        });

        datetime = new Date();
        console.log(datetime.toISOString() + ' game_starting! ' + game._id);

        let waitingTimer = waitTime;
        const wcTicker = 100;

        const waitingInterVal = setInterval(async function () {
            if (waitingTimer <= 0) return;

            waitingTimer -= wcTicker;
            io.emit('game_waiting', {
                game_delay: waitingTimer,
            });
        }, wcTicker);

        setTimeout(async () => {
            let currentGame = await Game.findOne().sort({ _id: -1 }).populate({
                path: 'bets',
                options: {
                    sort: { amount: -1 }
                },
                populate: {
                    path: 'user',
                    model: 'User'
                }
            });

            if (currentGame) {
                currentGame.state = 'started';
                await currentGame.save();

                io.emit('game_started', {
                    game: {
                        id: currentGame._id,
                        amount: currentGame.amount,
                        bets: currentGame.bets.length
                    }
                });

                datetime = new Date();
                console.log(datetime.toISOString() + ' game_started! ' + game._id);

                let runningTimer = runTime;
                const tickTimer = 250;

                const tickInterVal = setInterval(async function () {
                    if (runningTimer <= 0) return;

                    runningTimer -= tickTimer;
                    io.emit('game_tick', {
                        game_duration: runTime,
                        game_pos: runTime - runningTimer
                    });
                }, tickTimer);

                setTimeout(async () => {
                    clearInterval(tickInterVal);

                    currentGame.state = 'finished';     // setting game to finished
                    await currentGame.save();

                    if (currentGame.bets.length > 1) {
                        const game_rand = parseFloat(currentGame.koef) * currentGame.amount;
                        let forwardPoint = 0;                    
                        let winnerFound = false;

                        currentGame.bets.forEach((bet) => {
                            if (!bet.won && !winnerFound) {
                                if ((forwardPoint + bet.amount) >= game_rand) {
                                    winner = bet.user;
                                    winnerFound = true;
                                } 

                                forwardPoint += bet.amount;
                            }
                        });

                        for await (const bet of currentGame.bets) {
                            if (winner.userName === bet.user.userName) {                                
                                bet.won = true;
                                bet.user.balance += currentGame.amount;
                                await bet.save();
                                await bet.user.save();
                            }
                        }
                    } else if (currentGame.bets.length === 1) {
                        currentGame.bets.forEach(async bet => {
                            bet.user.balance += currentGame.amount;
                            await bet.user.save();
                        });
                    }

                    await currentGame.save();
                    
                    io.emit('game_finished', {
                        winner: winner ? winner.userName : null,
                        amount: currentGame.amount
                    }); 

                    datetime = new Date();
                    let winnerText = winner ? winner.userName : "Null";
                    console.log(datetime.toISOString() + ' game_finished! winner => ' + winnerText);

                }, runTime);
            }
        }, waitTime);
    } catch (error) {
        console.log(error);
    }
}

export {
    startGame
};