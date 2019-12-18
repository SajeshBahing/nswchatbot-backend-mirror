function events()
{
    this.events = {};

    this.on = function (key, cb) {
        this.events[key] = cb;
    };

    this.trigger = function () {
        let parameters = Object.values(arguments);
        if (parameters.length > 0) {
            if (typeof this.events[parameters[0]]) {
                let event = parameters.splice(0, 1);
                this.events[event](...parameters);
            } else {
                throw ('noe such event registered');
            }
        } else {
            throw ('No parameters provided');
        }
    };

    return this;
}

event = new events();
event.on('test', (a, b) => {console.log( a+ b ) });

event.trigger('test', 1, 3);

