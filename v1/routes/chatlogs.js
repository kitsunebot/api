var app = require('express').Router();
var Promise = require('bluebird');

var db = require('../../db');

app.get('/:id', (req, res)=> {
    db.models.ChatLog.find({where: {id: req.params.id}}).then(log=> {
        if (log !== null && log !== undefined) {
            log.getChatLogMessages({order: [['timestamp', 'ASC']]}).then(msgs=> {
                Promise.join(log.getChannel(), log.getUser(), log.getGuild(), Promise.all(msgs.map(msg=>msg.getUser())), (channel, user, guild, msgusers)=> {
                    res.status(200).apijson({
                        id: log.id,
                        time: log.time,
                        messages: msgs.map(msg=> {
                            return {
                                id: msg.mid,
                                content: msg.content,
                                create_content: msg.create_content,
                                edited: msg.edited,
                                deleted: msg.deleted,
                                timestamp: msg.timestamp,
                                user: {
                                    id: msgusers[msgs.indexOf(msg)].uid,
                                    username: msgusers[msgs.indexOf(msg)].username,
                                    discriminator: msgusers[msgs.indexOf(msg)].discriminator
                                }
                            };
                        }),

                    });
                });
            });
        } else next(404);
    });
});

module.exports = app;