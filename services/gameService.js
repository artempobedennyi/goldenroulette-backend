import Game from "../models/Game.js";
import * as SocketService from "../socket.js";
import gameConfig from "../config/game.js";

const startGame = async () => {
    const waitTime = gameConfig.waitTime;
    const runTime = gameConfig.runTime;
    let winner = null;

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
            timer_till_start: waitTime,    
        });

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
                    game: currentGame.amount
                });

                setTimeout(async () => {
                    currentGame.state = 'finished';     // setting game to finished
                    await currentGame.save();

                    if (currentGame.bets.length > 1) {
                        const game_rand = parseFloat(currentGame.koef) * currentGame.amount;

                        let forwardPoint = 0;                    
                        let winnerFound = false;

                        currentGame.bets.forEach(async bet => {
                            if (!bet.won && !winnerFound) {
                                if (forwardPoint + bet.amount >= game_rand) {
                                    winner = bet.user;

                                    bet.won = true;
                                    bet.user.balance += currentGame.amount;
                                    await bet.save();
                                    await bet.user.save();
                                    
                                    winnerFound = true;
                                } else {
                                    bet.won = false;
                                    await bet.save();
                                    forwardPoint += bet.amount;
                                }
                            }
                        });
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