const uuid = require('uuid/v1');

export class SessionManager {
    /**
     * Botkit Plugin name
     */
    constructor() {
        this.name = 'Botkit Session Manager';
    }

    init (botkit) {
        this.controller = botkit;
        botkit.addPluginExtension('manager', this);
    }

    session (user_id, session) {
        this.user_id = user_id;
        
        if ( this.controller.adapter.isConnected(this.user_id) && typeof this.controller.adapter.getConnection(this.user_id).session_id === 'undefined'){
            let session_id = !session ? uuid() : session;

            this.controller.adapter.getConnection(this.user_id)['session_id'] = session_id;
        }
         
        return this;
    }

    set(key, value) {
        this.controller.adapter.getConnection(this.user_id)[key] = value;
    }

    get(key) {
        if (this.controller.adapter.isConnected(this.user_id)) {
            if(typeof this.controller.adapter.getConnection(this.user_id)[key] === 'undefined')
                return '';
            
            return this.controller.adapter.getConnection(this.user_id)[key];
        } else
            return '';
    }

}